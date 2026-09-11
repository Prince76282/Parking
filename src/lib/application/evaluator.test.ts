import { describe, expect, it } from "vitest";
import { getRubricForProblem } from "@/lib/domain/rubric";
import { blankSubmission, STANDARD_RUBRIC } from "@/lib/domain/types";
import { RuleBasedEvaluator } from "./evaluator";

const evaluator = new RuleBasedEvaluator();

function makeInput(problemId: string, content = blankSubmission()) {
  return {
    content,
    blueprints: getRubricForProblem(problemId),
    problem: { id: problemId, title: problemId, description: "", requirements: [] } as never
  };
}

// ─── Score range ──────────────────────────────────────────────────────────────

describe("RuleBasedEvaluator — score range", () => {
  it("overall score does not exceed 100", async () => {
    const result = await evaluator.evaluate(makeInput("parking-lot"));
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });

  it("overall score is at least 0", async () => {
    const result = await evaluator.evaluate(makeInput("parking-lot"));
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
  });

  it("every criterion score is within [0, maxScore]", async () => {
    const result = await evaluator.evaluate(makeInput("parking-lot"));
    for (const c of result.criteria) {
      expect(c.score).toBeGreaterThanOrEqual(0);
      expect(c.score).toBeLessThanOrEqual(c.maxScore);
    }
  });

  it("criteria maxScore values sum to 100 (STANDARD_RUBRIC total)", async () => {
    const result = await evaluator.evaluate(makeInput("parking-lot"));
    const total = result.criteria.reduce((s, c) => s + c.maxScore, 0);
    expect(total).toBe(100);
  });

  it("scores a detailed submission higher than a blank submission", async () => {
    const detailed = {
      assumptions: "Partial hours rounded up. Car can use large spot.",
      classes:
        "ParkingLot — orchestrates entry exit allocation.\nParkingSpot — owns occupancy state.\nSession — connects vehicle spot ticket.\nAllocationStrategy — interface for spot selection.\nPricingStrategy — interface for fee calculation.",
      interfaces:
        "AllocationStrategy — findSpot(vehicle, floors): Spot | null\nPricingStrategy — calculateFee(entry, exit, type): Money",
      relationships:
        "ParkingLot contains ParkingFloor[]. ParkingFloor contains ParkingSpot[]. AllocationStrategy is an interface injected into ParkingLot. Session references Vehicle, Spot, Ticket.",
      designExplanation:
        "Entry: AllocationStrategy selects a compatible free spot. Session is created. Exit: PricingStrategy calculates fee. PaymentProcessor processes payment via interface. Spot is freed. History archived.",
      edgeCases:
        "Full lot: return error. Duplicate active session for same plate: reject. Payment failure: roll back. Invalid ticket: error. Concurrent entry: handled by allocation strategy.",
      code: ""
    };

    const blank = await evaluator.evaluate(makeInput("parking-lot"));
    const detail = await evaluator.evaluate(makeInput("parking-lot", detailed));

    expect(detail.overallScore).toBeGreaterThan(blank.overallScore);
  });
});

// ─── Weighted scoring ─────────────────────────────────────────────────────────

describe("RuleBasedEvaluator — weighted scoring", () => {
  it("each criterion maxScore matches STANDARD_RUBRIC weight", async () => {
    const result = await evaluator.evaluate(makeInput("parking-lot"));
    for (const criterion of result.criteria) {
      const rubricEntry = STANDARD_RUBRIC.find((r) => r.name === criterion.name);
      expect(rubricEntry).toBeDefined();
      expect(criterion.maxScore).toBe(rubricEntry!.weight);
    }
  });

  it("Class Responsibilities has weight 20 (highest weight criterion)", async () => {
    const result = await evaluator.evaluate(makeInput("parking-lot"));
    const classResp = result.criteria.find((c) => c.name === "Class Responsibilities");
    expect(classResp?.maxScore).toBe(20);
  });
});

// ─── Evaluator kind tagging ───────────────────────────────────────────────────

describe("RuleBasedEvaluator — kind tagging", () => {
  it("tags overall result as deterministic", async () => {
    const result = await evaluator.evaluate(makeInput("parking-lot"));
    expect(result.evaluatorKind).toBe("deterministic");
  });

  it("tags all criteria as deterministic", async () => {
    const result = await evaluator.evaluate(makeInput("parking-lot"));
    for (const c of result.criteria) {
      expect(c.evaluatorKind).toBe("deterministic");
    }
  });

  it("confidence is always 1.0 for deterministic evaluator", async () => {
    const result = await evaluator.evaluate(makeInput("parking-lot"));
    for (const c of result.criteria) {
      expect(c.confidence).toBe(1.0);
    }
  });
});

// ─── Output shape ─────────────────────────────────────────────────────────────

describe("RuleBasedEvaluator — output shape", () => {
  it("returns strengths, improvements, and nextAttemptFocus arrays", async () => {
    const result = await evaluator.evaluate(makeInput("parking-lot"));
    expect(Array.isArray(result.strengths)).toBe(true);
    expect(Array.isArray(result.improvements)).toBe(true);
    expect(Array.isArray(result.nextAttemptFocus)).toBe(true);
    expect(result.evaluatedAt).toBeTruthy();
  });

  it("each criterion has evidence, concern, and suggestion", async () => {
    const result = await evaluator.evaluate(makeInput("parking-lot"));
    for (const c of result.criteria) {
      expect(typeof c.evidence).toBe("string");
      expect(typeof c.concern).toBe("string");
      expect(typeof c.suggestion).toBe("string");
    }
  });

  it("uses correct criteria count for each problem", async () => {
    for (const id of ["parking-lot", "elevator-system", "vending-machine", "library-management", "movie-ticket-booking"]) {
      const blueprints = getRubricForProblem(id);
      const result = await evaluator.evaluate(makeInput(id));
      expect(result.criteria).toHaveLength(blueprints.length);
    }
  });
});

// ─── Idempotency ──────────────────────────────────────────────────────────────

describe("RuleBasedEvaluator — idempotency", () => {
  it("returns identical scores for identical input called twice", async () => {
    const input = makeInput("parking-lot");
    const r1 = await evaluator.evaluate(input);
    const r2 = await evaluator.evaluate(input);
    expect(r1.overallScore).toBe(r2.overallScore);
    expect(r1.criteria.map((c) => c.score)).toEqual(r2.criteria.map((c) => c.score));
  });
});
