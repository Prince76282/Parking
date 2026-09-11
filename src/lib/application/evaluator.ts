/**
 * Evaluator port + implementations.
 *
 * Change Test B: Adding a HumanEvaluator, RuleBasedEvaluator, or a different
 * AI provider requires only implementing the Evaluator interface.
 * The practice flow (usePracticePlatform) does not change.
 */

import type { CriterionBlueprint } from "@/lib/domain/rubric";
import type {
  CriterionResult,
  Evaluation,
  EvaluatorKind,
  Problem,
  SubmissionContent
} from "@/lib/domain/types";
import { STANDARD_RUBRIC } from "@/lib/domain/types";

// ─── Port interface ────────────────────────────────────────────────────────────

export interface EvaluationInput {
  content: SubmissionContent;
  blueprints: CriterionBlueprint[];
  problem: Problem;
}

export interface Evaluator {
  readonly name: string;
  readonly kind: EvaluatorKind;
  evaluate(input: EvaluationInput): Promise<Evaluation>;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function displayName(word: string): string {
  const map: Record<string, string> = {
    parkingspot: "ParkingSpot",
    parkinglot: "ParkingLot",
    bookcopy: "BookCopy"
  };
  return map[word] ?? word;
}

function evaluateCriterion(
  content: SubmissionContent,
  blueprint: CriterionBlueprint
): CriterionResult {
  // Find the matching standard rubric entry for weight
  const rubricEntry = STANDARD_RUBRIC.find((r) => r.name === blueprint.criterionName);
  const maxScore = rubricEntry?.weight ?? 10;

  const text = blueprint.sections
    .map((s) => content[s])
    .join(" ")
    .toLowerCase();

  const mentioned = blueprint.keywords.filter((kw) => text.includes(kw));
  const sectionCoverage =
    blueprint.sections.filter((s) => content[s].trim().length >= 35).length /
    blueprint.sections.length;
  const keywordCoverage = mentioned.length / blueprint.keywords.length;

  // Score formula: base (40%) + section coverage (35%) + keyword coverage (25%)
  const rawScore = maxScore * (0.4 + sectionCoverage * 0.35 + keywordCoverage * 0.25);
  const score = Math.min(maxScore, Math.max(Math.round(maxScore * 0.3), Math.round(rawScore)));

  const evidence = mentioned.length
    ? `The submission explicitly addresses: ${mentioned.slice(0, 3).map(displayName).join(", ")}.`
    : text.length > 20
    ? "This area is discussed but supporting details are broad."
    : "No explicit evidence found in the submission.";

  const missing = blueprint.keywords.filter((kw) => !mentioned.includes(kw)).slice(0, 2);
  const concern = missing.length
    ? `Missing or unclear evidence for: ${missing.map(displayName).join(", ")}.`
    : "The main design choices are supported with concrete detail.";

  return {
    name: blueprint.criterionName,
    score,
    maxScore,
    evaluatorKind: "deterministic",
    evidence,
    concern,
    suggestion: score >= maxScore * 0.8 ? "Keep this concise when presenting the design." : blueprint.missingSuggestion,
    confidence: 1.0
  };
}

function buildEvaluation(
  criteria: CriterionResult[],
  kind: EvaluatorKind
): Evaluation {
  const overallScore = criteria.reduce((sum, c) => sum + c.score, 0);
  const strongest = [...criteria].sort((a, b) => b.score / b.maxScore - a.score / a.maxScore).slice(0, 2);
  const weakest = [...criteria].sort((a, b) => a.score / a.maxScore - b.score / b.maxScore).slice(0, 2);

  return {
    overallScore,
    evaluatorKind: kind,
    criteria,
    strengths: strongest.map((c) => `${c.name}: ${c.evidence}`),
    improvements: weakest.map((c) => `${c.name}: ${c.concern} — ${c.suggestion}`),
    nextAttemptFocus: weakest.slice(0, 3).map((c) => c.suggestion),
    evaluatedAt: new Date().toISOString()
  };
}

// ─── Rule-based (deterministic) evaluator ─────────────────────────────────────

export class RuleBasedEvaluator implements Evaluator {
  readonly name = "RuleBased";
  readonly kind: EvaluatorKind = "deterministic";

  async evaluate({ content, blueprints }: EvaluationInput): Promise<Evaluation> {
    const criteria = blueprints.map((bp) => evaluateCriterion(content, bp));
    return buildEvaluation(criteria, "deterministic");
  }
}

// ─── AI evaluator ─────────────────────────────────────────────────────────────

export class AIEvaluator implements Evaluator {
  readonly name = "AI";
  readonly kind: EvaluatorKind = "ai";

  async evaluate(input: EvaluationInput): Promise<Evaluation> {
    const response = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: input.content,
        blueprints: input.blueprints,
        problem: input.problem
      })
    });
    if (!response.ok) throw new Error(`AI evaluator returned HTTP ${response.status}`);
    return response.json() as Promise<Evaluation>;
  }
}

// ─── Composite evaluator (primary + fallback) ─────────────────────────────────

/**
 * Tries the primary evaluator first; falls back to the secondary on failure.
 * The submission is always stored before evaluate() is called, so failure
 * here cannot lose user data.
 */
export class CompositeEvaluator implements Evaluator {
  readonly name = "Composite";
  readonly kind: EvaluatorKind = "ai";

  constructor(
    private readonly primary: Evaluator = new AIEvaluator(),
    private readonly fallback: Evaluator = new RuleBasedEvaluator()
  ) {}

  async evaluate(input: EvaluationInput): Promise<Evaluation> {
    try {
      return await this.primary.evaluate(input);
    } catch {
      const result = await this.fallback.evaluate(input);
      return { ...result, evaluatorKind: "deterministic" };
    }
  }
}

export const defaultEvaluator: Evaluator = new CompositeEvaluator();
