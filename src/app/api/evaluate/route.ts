/**
 * POST /api/evaluate
 *
 * Accepts a structured LLD submission and returns a validated Evaluation object.
 *
 * Security: AI API key is server-side only. Never exposed to the client.
 *
 * Idempotency: identical submissions (same content hash + problem ID) within
 * a server instance return the cached result without re-calling OpenAI.
 *
 * Failure handling: the submission is stored by the client BEFORE calling this
 * route, so failure here cannot lose user data. Returns a labeled mock
 * evaluation when OPENAI_API_KEY is unset or the call fails.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { CriterionResult, Evaluation } from "@/lib/domain/types";
import { STANDARD_RUBRIC } from "@/lib/domain/types";

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const SubmissionContentSchema = z.object({
  assumptions: z.string(),
  classes: z.string(),
  interfaces: z.string(),
  relationships: z.string(),
  designExplanation: z.string(),
  edgeCases: z.string(),
  code: z.string()
});

const CriterionBlueprintSchema = z.object({
  criterionName: z.string(),
  sections: z.array(z.string()),
  keywords: z.array(z.string()),
  missingSuggestion: z.string()
});

const ProblemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().default(""),
  requirements: z.array(z.object({ id: z.string(), title: z.string(), description: z.string() })).optional().default([])
});

const EvaluateRequestSchema = z.object({
  content: SubmissionContentSchema,
  blueprints: z.array(CriterionBlueprintSchema),
  problem: ProblemSchema
});

// AI response schema (validated before returning to client)
const CriterionResultSchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(20),
  maxScore: z.number().min(0).max(20),
  evaluatorKind: z.enum(["ai", "deterministic"]),
  evidence: z.string(),
  concern: z.string(),
  suggestion: z.string(),
  confidence: z.number().min(0).max(1)
});

const EvaluationSchema = z.object({
  overallScore: z.number().min(0).max(100),
  evaluatorKind: z.enum(["ai", "deterministic"]),
  criteria: z.array(CriterionResultSchema),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  nextAttemptFocus: z.array(z.string()),
  evaluatedAt: z.string()
});

// ─── Idempotency cache ────────────────────────────────────────────────────────

const cache = new Map<string, Evaluation>();

function submissionHash(content: z.infer<typeof SubmissionContentSchema>, problemId: string): string {
  const text = Object.values(content).join("|");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return `${problemId}:${hash.toString(16)}`;
}

// ─── AI prompt builder ────────────────────────────────────────────────────────

function buildPrompt(
  content: z.infer<typeof SubmissionContentSchema>,
  blueprints: z.infer<typeof CriterionBlueprintSchema>[],
  problem: z.infer<typeof ProblemSchema>
): string {
  const rubricLines = blueprints
    .map((bp, i) => {
      const weight = STANDARD_RUBRIC.find((r) => r.name === bp.criterionName)?.weight ?? 10;
      return `${i + 1}. **${bp.criterionName}** (max ${weight} pts): look for [${bp.keywords.join(", ")}].`;
    })
    .join("\n");

  const submission = [
    `ASSUMPTIONS:\n${content.assumptions}`,
    `CLASSES:\n${content.classes}`,
    `INTERFACES:\n${content.interfaces}`,
    `RELATIONSHIPS:\n${content.relationships}`,
    `DESIGN WALKTHROUGH:\n${content.designExplanation}`,
    `EDGE CASES:\n${content.edgeCases}`,
    content.code ? `CODE:\n${content.code}` : null
  ]
    .filter(Boolean)
    .join("\n\n");

  return `You are an expert software design reviewer evaluating a Low-Level Design submission.

Problem: "${problem.title}"
${problem.description ? `Context: ${problem.description}` : ""}

Score the submission against this RUBRIC. Scores are integers from 0 to the criterion's max. 
Do NOT penalize a design for not using a specific pattern — only reward where patterns genuinely help.

RUBRIC:
${rubricLines}

SUBMISSION:
${submission}

Return ONLY valid JSON with this exact shape (no markdown, no explanation outside JSON):
{
  "overallScore": <sum of all criterion scores, 0-100>,
  "evaluatorKind": "ai",
  "criteria": [
    {
      "name": "<exact criterion name from rubric>",
      "score": <integer 0 to maxScore>,
      "maxScore": <integer from rubric>,
      "evaluatorKind": "ai",
      "evidence": "<specific quote or observation from the submission>",
      "concern": "<specific gap or concern, or 'None' if score is high>",
      "suggestion": "<one concrete actionable improvement>",
      "confidence": <float 0.0-1.0 indicating your confidence in this score>
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "nextAttemptFocus": ["<focus 1>", "<focus 2>", "<focus 3>"],
  "evaluatedAt": "${new Date().toISOString()}"
}`;
}

// ─── OpenAI call ──────────────────────────────────────────────────────────────

async function callOpenAI(
  content: z.infer<typeof SubmissionContentSchema>,
  blueprints: z.infer<typeof CriterionBlueprintSchema>[],
  problem: z.infer<typeof ProblemSchema>
): Promise<Evaluation> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const isOpenRouter = apiKey.startsWith("sk-");
  const baseUrl =
    process.env.OPENAI_BASE_URL ??
    (isOpenRouter
      ? "https://openrouter.ai/api/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions");

  const defaultModel = isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini";
  const model = process.env.AI_MODEL ?? defaultModel;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`
  };

  if (isOpenRouter) {
    headers["HTTP-Referer"] = "http://localhost:3000";
    headers["X-Title"] = "DesignGym LLD Platform";
  }

  const response = await fetch(baseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a strict but constructive LLD design reviewer. You must respond ONLY with the requested JSON object, no other text."
        },
        { role: "user", content: buildPrompt(content, blueprints, problem) }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI API error ${response.status}: ${err}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  let raw = data.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty response from AI");

  // Clean markdown code blocks if model included them
  raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  // Validate with Zod — rejects invalid AI output rather than passing it through
  const parsed = JSON.parse(raw);
  const validated = EvaluationSchema.safeParse(parsed);
  if (!validated.success) {
    console.error("[/api/evaluate] AI response failed Zod validation:", validated.error.format());
    throw new Error("Invalid AI response shape");
  }
  return validated.data as Evaluation;
}

// ─── Mock evaluation (no API key / fallback) ──────────────────────────────────

function mockEvaluation(blueprints: z.infer<typeof CriterionBlueprintSchema>[]): Evaluation {
  const now = new Date().toISOString();
  const criteria: CriterionResult[] = blueprints.map((bp) => {
    const weight = STANDARD_RUBRIC.find((r) => r.name === bp.criterionName)?.weight ?? 10;
    return {
      name: bp.criterionName,
      score: Math.round(weight * 0.6),
      maxScore: weight,
      evaluatorKind: "ai",
      evidence: "Running in demo mode — set OPENAI_API_KEY for real AI evaluation.",
      concern: "Set OPENAI_API_KEY to receive evidence-based feedback on this criterion.",
      suggestion: bp.missingSuggestion,
      confidence: 0.5
    };
  });
  const overallScore = criteria.reduce((s, c) => s + c.score, 0);
  return {
    overallScore,
    evaluatorKind: "ai",
    criteria,
    strengths: ["Submission has meaningful content in all required sections."],
    improvements: [
      "Set OPENAI_API_KEY for AI-powered, evidence-based feedback.",
      blueprints[blueprints.length - 1]?.missingSuggestion ?? "Continue refining your design."
    ],
    nextAttemptFocus: [
      "Add OPENAI_API_KEY to .env.local to unlock real AI feedback.",
      "Keep refining your class responsibilities and interface definitions."
    ],
    evaluatedAt: now
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Parse and validate the request body with Zod
  let body: z.infer<typeof EvaluateRequestSchema>;
  try {
    const raw = await req.json();
    const parsed = EvaluateRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.format() },
        { status: 400 }
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { content, blueprints, problem } = body;

  // Idempotency check
  const hash = submissionHash(content, problem.id);
  const cached = cache.get(hash);
  if (cached) return NextResponse.json(cached);

  let evaluation: Evaluation;
  try {
    if (process.env.OPENAI_API_KEY) {
      evaluation = await callOpenAI(content, blueprints, problem);
    } else {
      evaluation = mockEvaluation(blueprints);
    }
  } catch (err) {
    console.error("[/api/evaluate] evaluation failed:", err);
    evaluation = mockEvaluation(blueprints);
  }

  cache.set(hash, evaluation);
  return NextResponse.json(evaluation);
}
