/**
 * Core domain types for the DesignGym LLD Practice Platform.
 *
 * Dependencies: none (pure TypeScript — no React, Next.js, Prisma, or AI imports).
 */

// ─── Primitives ───────────────────────────────────────────────────────────────

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type AttemptStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "EVALUATING"
  | "COMPLETED"
  | "FAILED";

/**
 * Which evaluator produced a result.
 * "deterministic" = keyword/rule-based (offline, zero latency).
 * "ai"            = LLM evaluator via the /api/evaluate route.
 */
export type EvaluatorKind = "deterministic" | "ai";

// ─── Problem ─────────────────────────────────────────────────────────────────

export interface ProblemRequirement {
  id: string;
  title: string;
  description: string;
}

export interface DesignHint {
  /** Short triggering question shown in the Design Coach. */
  question: string;
  /** Why it matters — not the answer. */
  reason: string;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  description: string;
  requirements: ProblemRequirement[];
  constraints: string[];
  edgeCases: string[];
  focusAreas: string[];
  /** Hints shown in the Design Coach before submission. Never reveal the answer. */
  designHints: DesignHint[];
  learningObjectives: string[];
}

// ─── Submission ───────────────────────────────────────────────────────────────

/**
 * The submission sections a learner fills in.
 *
 * Change Test A: to support a DiagramSubmission or CodeSubmission, introduce
 * a discriminated union here (e.g. { kind: "text"; content: SubmissionContent }
 * | { kind: "diagram"; … }) without touching Attempt or Evaluation.
 */
export interface SubmissionContent {
  /** Requirements the learner chose to address and their scope assumptions. */
  assumptions: string;
  /** Class names, responsibilities, important methods. */
  classes: string;
  /** Interfaces and abstractions with their contracts. */
  interfaces: string;
  /** Containment, ownership, and dependency relationships. */
  relationships: string;
  /** End-to-end flow walkthrough and key design decisions. */
  designExplanation: string;
  /** Failure modes, invalid transitions, concurrency concerns. */
  edgeCases: string;
  /** Optional: illustrative code snippets (not executed). */
  code: string;
}

// ─── Submission sections metadata (used by the form) ─────────────────────────

export type SubmissionSection = keyof SubmissionContent;

export interface SectionMeta {
  key: SubmissionSection;
  title: string;
  prompt: string;
  placeholder: string;
  required: boolean;
  rows: number;
}

export const SUBMISSION_SECTIONS: SectionMeta[] = [
  {
    key: "assumptions",
    title: "Assumptions",
    prompt: "Requirements you scoped in/out and decisions left open by the spec.",
    placeholder:
      "• Partial hours are rounded up to the next full hour.\n• A car may use a large spot when compact spots are full.",
    required: true,
    rows: 4
  },
  {
    key: "classes",
    title: "Classes & responsibilities",
    prompt: "Name each class, its single responsibility, and key collaborators.",
    placeholder:
      "ParkingLot — coordinates entry/exit, delegates allocation.\nParkingSpot — owns occupancy state and spot-type compatibility.",
    required: true,
    rows: 5
  },
  {
    key: "interfaces",
    title: "Interfaces & abstractions",
    prompt: "Name each interface/abstract type and the contract it defines.",
    placeholder:
      "AllocationStrategy — findSpot(vehicle): ParkingSpot | null\nPricingStrategy — calculateFee(entry, exit, spotType): Money",
    required: true,
    rows: 4
  },
  {
    key: "relationships",
    title: "Relationships",
    prompt: "Show containment, ownership, and dependency direction.",
    placeholder:
      "ParkingLot *-- ParkingFloor\nParkingFloor *-- ParkingSpot\nParkingLot --> AllocationStrategy (injected)",
    required: true,
    rows: 4
  },
  {
    key: "designExplanation",
    title: "Design walkthrough",
    prompt: "Walk through the key flows end-to-end and justify your decisions.",
    placeholder:
      "On entry, the AllocationStrategy selects a compatible free spot. A Session is created linking Vehicle, Spot, and Ticket. On exit, PricingStrategy computes the fee…",
    required: true,
    rows: 7
  },
  {
    key: "edgeCases",
    title: "Edge cases",
    prompt: "Identify failures, invalid transitions, and concurrency concerns.",
    placeholder:
      "• Full lot — return error before issuing ticket.\n• Duplicate active session — reject second entry for same plate.\n• Failed payment — roll back session without freeing spot permanently.",
    required: true,
    rows: 4
  },
  {
    key: "code",
    title: "Code (optional)",
    prompt: "Illustrative code snippets, interface signatures, or key methods. Not executed.",
    placeholder:
      "interface AllocationStrategy {\n  findSpot(vehicle: Vehicle, floors: Floor[]): Spot | null;\n}",
    required: false,
    rows: 6
  }
];

export const blankSubmission = (): SubmissionContent => ({
  assumptions: "",
  classes: "",
  interfaces: "",
  relationships: "",
  designExplanation: "",
  edgeCases: "",
  code: ""
});

// ─── Evaluation ───────────────────────────────────────────────────────────────

/**
 * Rubric criterion definition — the static configuration per problem.
 */
export interface RubricCriterion {
  name: string;
  /** Maximum score for this criterion (all weights sum to 100). */
  weight: number;
  description: string;
}

/** The standard 100-point rubric used across all problems. */
export const STANDARD_RUBRIC: RubricCriterion[] = [
  { name: "Requirement Understanding",    weight: 15, description: "Addresses the stated requirements; clear scope and assumptions." },
  { name: "Class Responsibilities",       weight: 20, description: "Each class has one clear responsibility; no god classes." },
  { name: "Encapsulation & Abstraction",  weight: 15, description: "State and behavior are properly hidden; useful interfaces defined." },
  { name: "Coupling & Cohesion",          weight: 15, description: "Low coupling between components; high cohesion within each class." },
  { name: "Extensibility",               weight: 15, description: "Design accommodates likely changes without structural rewrites." },
  { name: "Design Principles & Patterns", weight: 10, description: "SOLID and patterns used where they genuinely improve the design." },
  { name: "Edge Cases & Testability",     weight: 10, description: "Failure modes identified; components are independently testable." }
];

export interface CriterionResult {
  name: string;
  /** Points scored (0 – weight). */
  score: number;
  /** Maximum available (from RubricCriterion.weight). */
  maxScore: number;
  /** Which evaluator produced this result. */
  evaluatorKind: EvaluatorKind;
  /** Quote or observation from the submission. */
  evidence: string;
  /** Specific gap or concern. */
  concern: string;
  /** One concrete, actionable improvement. */
  suggestion: string;
  /**
   * Evaluator confidence (0–1).
   * Deterministic = always 1.0; AI may vary.
   */
  confidence: number;
}

export interface Evaluation {
  /** Sum of all criterion scores (0–100). */
  overallScore: number;
  /** Primary evaluator used. */
  evaluatorKind: EvaluatorKind;
  criteria: CriterionResult[];
  strengths: string[];
  improvements: string[];
  /** 2–3 specific focus points for the next attempt. */
  nextAttemptFocus: string[];
  evaluatedAt: string;
}

// ─── Attempt ──────────────────────────────────────────────────────────────────

/**
 * Central aggregate for one practice session.
 *
 * State machine: DRAFT → SUBMITTED → EVALUATING → COMPLETED | FAILED
 *
 * Previous attempts are immutable — a retry creates a new Attempt with
 * sequence incremented.
 */
export interface Attempt {
  id: string;
  problemId: string;
  /** 1-based attempt number for display (per problem). */
  sequence: number;
  status: AttemptStatus;
  content: SubmissionContent;
  savedAt: string;
  submittedAt?: string;
  evaluation?: Evaluation;
}

// ─── Deterministic pre-submission checks ─────────────────────────────────────

export interface DeterministicCheck {
  label: string;
  passed: boolean;
  hint: string;
}
