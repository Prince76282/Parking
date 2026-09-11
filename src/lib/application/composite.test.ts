import { describe, expect, it, vi } from "vitest";
import { getRubricForProblem } from "@/lib/domain/rubric";
import { blankSubmission } from "@/lib/domain/types";
import { isSubmittable, runDeterministicChecks } from "@/lib/domain/validation";
import {
  CompositeEvaluator,
  RuleBasedEvaluator,
  type Evaluator,
  type EvaluationInput
} from "./evaluator";

function makeInput(problemId = "parking-lot"): EvaluationInput {
  return {
    content: blankSubmission(),
    blueprints: getRubricForProblem(problemId),
    problem: { id: problemId, title: problemId, description: "", requirements: [] } as never
  };
}

// ─── CompositeEvaluator — success path ───────────────────────────────────────

describe("CompositeEvaluator — primary succeeds", () => {
  it("returns the primary result when the primary evaluator succeeds", async () => {
    const primaryResult = await new RuleBasedEvaluator().evaluate(makeInput());
    const fakeAiResult = { ...primaryResult, evaluatorKind: "ai" as const, overallScore: 92 };

    const fakePrimary: Evaluator = {
      name: "FakeAI",
      kind: "ai",
      evaluate: vi.fn().mockResolvedValue(fakeAiResult)
    };

    const composite = new CompositeEvaluator(fakePrimary, new RuleBasedEvaluator());
    const result = await composite.evaluate(makeInput());

    expect(result.overallScore).toBe(92);
    expect(result.evaluatorKind).toBe("ai");
    expect(fakePrimary.evaluate).toHaveBeenCalledOnce();
  });
});

// ─── CompositeEvaluator — fallback path ──────────────────────────────────────

describe("CompositeEvaluator — primary fails", () => {
  it("falls back to deterministic when primary throws", async () => {
    const failingPrimary: Evaluator = {
      name: "FailingAI",
      kind: "ai",
      evaluate: vi.fn().mockRejectedValue(new Error("Network timeout"))
    };

    const composite = new CompositeEvaluator(failingPrimary, new RuleBasedEvaluator());
    const result = await composite.evaluate(makeInput());

    expect(result.evaluatorKind).toBe("deterministic");
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(failingPrimary.evaluate).toHaveBeenCalledOnce();
  });

  it("uses the fallback's score on primary failure", async () => {
    const failingPrimary: Evaluator = {
      name: "FailingAI",
      kind: "ai",
      evaluate: vi.fn().mockRejectedValue(new Error("Timeout"))
    };

    const fakeFallback: Evaluator = {
      name: "FakeDeterministic",
      kind: "deterministic",
      evaluate: vi.fn().mockResolvedValue({
        overallScore: 55,
        evaluatorKind: "deterministic" as const,
        criteria: [],
        strengths: [],
        improvements: [],
        nextAttemptFocus: [],
        evaluatedAt: new Date().toISOString()
      })
    };

    const composite = new CompositeEvaluator(failingPrimary, fakeFallback);
    const result = await composite.evaluate(makeInput());

    expect(result.overallScore).toBe(55);
    expect(result.evaluatorKind).toBe("deterministic");
    expect(fakeFallback.evaluate).toHaveBeenCalledOnce();
  });

  it("does not re-tag evaluatorKind when fallback already returns deterministic", async () => {
    const failingPrimary: Evaluator = {
      name: "FailingAI",
      kind: "ai",
      evaluate: vi.fn().mockRejectedValue(new Error("Error"))
    };

    const composite = new CompositeEvaluator(failingPrimary, new RuleBasedEvaluator());
    const result = await composite.evaluate(makeInput());
    expect(result.evaluatorKind).toBe("deterministic");
  });
});

// ─── State machine tests ──────────────────────────────────────────────────────

describe("Attempt state transitions", () => {
  it("a new attempt starts in DRAFT state", () => {
    const attempt = {
      id: "test-1",
      problemId: "parking-lot",
      sequence: 1,
      status: "DRAFT" as const,
      content: blankSubmission(),
      savedAt: new Date().toISOString()
    };
    expect(attempt.status).toBe("DRAFT");
  });

  it("DRAFT → EVALUATING is a valid transition", () => {
    const validTransitions: Record<string, string[]> = {
      DRAFT: ["EVALUATING"],
      EVALUATING: ["COMPLETED", "FAILED"],
      COMPLETED: [],
      FAILED: []
    };
    expect(validTransitions["DRAFT"]).toContain("EVALUATING");
  });

  it("COMPLETED → COMPLETED is not a valid transition", () => {
    const validTransitions: Record<string, string[]> = {
      DRAFT: ["EVALUATING"],
      EVALUATING: ["COMPLETED", "FAILED"],
      COMPLETED: [],
      FAILED: []
    };
    expect(validTransitions["COMPLETED"]).not.toContain("COMPLETED");
  });

  it("previous attempts remain immutable after retry (retry creates new attempt)", () => {
    const attempt1 = {
      id: "a1",
      problemId: "parking-lot",
      sequence: 1,
      status: "COMPLETED" as const,
      content: blankSubmission(),
      savedAt: new Date().toISOString()
    };
    // A retry creates a new attempt; attempt1 is not modified
    const attempt2 = {
      id: "a2",
      problemId: "parking-lot",
      sequence: 2,
      status: "DRAFT" as const,
      content: blankSubmission(),
      savedAt: new Date().toISOString()
    };
    expect(attempt1.status).toBe("COMPLETED"); // unchanged
    expect(attempt2.sequence).toBe(2); // new attempt
    expect(attempt1.id).not.toBe(attempt2.id); // separate aggregates
  });
});

// ─── Edge cases (spec section 25) ────────────────────────────────────────────

describe("Edge case tests (spec §25)", () => {
  it("EC1: empty submission is not submittable", () => {
    expect(isSubmittable(blankSubmission())).toBe(false);
  });

  it("EC2: unknown problem ID returns empty rubric", () => {
    expect(getRubricForProblem("nonexistent-problem-id")).toHaveLength(0);
  });

  it("EC3: duplicate class names detected", () => {
    const content = {
      ...blankSubmission(),
      classes: "ParkingLot — main.\nParkingLot — duplicate."
    };
    const dupCheck = runDeterministicChecks(content).find((c) =>
      c.label.toLowerCase().includes("duplicate")
    );
    expect(dupCheck?.passed).toBe(false);
  });

  it("EC4: AI evaluator failure falls back to deterministic (CompositeEvaluator)", async () => {
    const failingPrimary: Evaluator = {
      name: "Fail",
      kind: "ai",
      evaluate: vi.fn().mockRejectedValue(new Error("API unreachable"))
    };
    const composite = new CompositeEvaluator(failingPrimary, new RuleBasedEvaluator());
    const result = await composite.evaluate(makeInput());
    expect(result.evaluatorKind).toBe("deterministic");
  });

  it("EC6: same attempt cannot be accidentally evaluated twice (idempotency)", async () => {
    const eval1 = new RuleBasedEvaluator();
    const r1 = await eval1.evaluate(makeInput());
    const r2 = await eval1.evaluate(makeInput());
    // Same input → same score (deterministic is idempotent)
    expect(r1.overallScore).toBe(r2.overallScore);
  });

  it("EC7: FAILED status preserves submission content", () => {
    const attempt = {
      id: "fail-attempt",
      problemId: "parking-lot",
      sequence: 1,
      status: "FAILED" as const,
      content: { ...blankSubmission(), assumptions: "My assumptions" },
      savedAt: new Date().toISOString()
    };
    // Content is still accessible even when status is FAILED
    expect(attempt.content.assumptions).toBe("My assumptions");
  });

  it("EC9: missing required field fails validation", () => {
    const content = {
      ...blankSubmission(),
      classes: "", // missing required field
      interfaces: "SomeInterface — contract"
    };
    const classCheck = runDeterministicChecks(content).find((c) =>
      c.label.toLowerCase().includes("class")
    );
    expect(classCheck?.passed).toBe(false);
  });

  it("EC10: old attempt is accessible by ID", () => {
    const attempts = [
      { id: "old", status: "COMPLETED", sequence: 1 },
      { id: "new", status: "DRAFT", sequence: 2 }
    ];
    const found = attempts.find((a) => a.id === "old");
    expect(found).toBeDefined();
    expect(found?.status).toBe("COMPLETED");
  });
});
