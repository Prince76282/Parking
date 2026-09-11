# Design Note — DesignGym MVP

## 1. MVP Scope

DesignGym is a focused LLD practice loop:

```
Choose problem → Start attempt → Fill structured form → Submit → Get feedback → Review → Try again
```

The MVP includes:
- **4 problems**: Parking Lot (Intermediate), Elevator System (Intermediate), Vending Machine (Beginner), Library Management (Advanced)
- **One practice flow**: structured text submission with 5 sections
- **One submission format**: structured text (assumptions, classes, relationships, walkthrough, edge cases)
- **Two evaluation modes**: deterministic (always available) + AI via OpenAI (when API key is set)
- **Attempt history**: per-problem, with score trend sparkline
- **localStorage persistence**: attempts survive page refresh

---

## 2. User Flow

```
Library screen
  ↓ Select problem → ProblemCard highlights, ProblemBrief expands
  ↓ "Start attempt" → Practice screen, blank submission form

Practice screen
  ↓ Fill 5 sections (live deterministic checks update as you type)
  ↓ "Save draft" → savedAt timestamp updated
  ↓ All checks pass → "Submit design" enabled
  ↓ Submit → status: IN_PROGRESS → EVALUATING → COMPLETED (or FAILED)

Feedback (right panel, sticky)
  → Overall score (3–10)
  → Strengths
  → Priority improvements
  → 7 criterion cards (expandable): evidence | concern | next move
  → AI badge if evaluation came from OpenAI

History screen
  → Attempts grouped by problem
  → Score trend sparkline
  → Click any attempt → returns to Practice screen with that attempt loaded
```

---

## 3. Key Domain Classes

```
Problem
  id: string
  title, difficulty, estimatedMinutes
  requirements: ProblemRequirement[]
  constraints: string[]
  focusAreas: string[]
  ↳ Immutable seed data. Adding a new problem = adding a new Problem + RubricEntry.

Attempt
  id: string (UUID)
  problemId: string
  sequence: number (attempt number for display)
  status: IN_PROGRESS | SUBMITTED | EVALUATING | COMPLETED | FAILED
  content: SubmissionContent
  savedAt, submittedAt?: ISO timestamps
  evaluation?: Evaluation
  ↳ The central aggregate. Stores everything about one practice attempt.

SubmissionContent
  assumptions, classes, relationships, designExplanation, edgeCases: string
  ↳ Value object — no identity, no behaviour. 5 structured text sections.

Evaluation
  overallScore: number (3–10)
  evaluatorKind: "deterministic" | "ai"
  criteria: CriterionResult[]
  strengths, priorityImprovements: string[]
  evaluatedAt: ISO string
  ↳ Immutable result. Attached to an Attempt on completion.

CriterionResult
  name, score, evaluatorKind, evidence[], concerns[], suggestions[]
  ↳ One row of the rubric. Includes which evaluator produced it.

CriterionBlueprint  (domain/rubric.ts)
  name, sections, keywords[], missingSuggestion
  ↳ Rubric definition. Lives in the domain layer. Evaluators consume this.

DeterministicCheck  (domain/validation.ts)
  label, passed, hint
  ↳ Pre-submission gate. Computed live as the learner types.
```

---

## 4. Key Interfaces (Extension Points)

### Evaluator (application/evaluator.ts)
```typescript
interface Evaluator {
  name: string;
  kind: EvaluatorKind;
  evaluate(content, rubric, problem): Promise<Evaluation>;
}
```
Current implementations: `DeterministicEvaluator`, `AiEvaluator`, `CompositeEvaluator`.

**Change Test B**: Adding a `HumanEvaluator` or `RuleEvaluator` requires only implementing this interface. The practice flow (`usePracticePlatform`) does not change.

### AttemptStore (application/persistence.ts)
```typescript
interface AttemptStore {
  load(): Attempt[];
  save(attempts: Attempt[]): void;
}
```
Current implementation: `LocalAttemptStore` (localStorage).

Swapping to a remote API: implement `RemoteAttemptStore` that calls a backend. The hook does not change.

### Rubric registry (domain/rubric.ts)
```typescript
getRubricForProblem(problemId: string): CriterionBlueprint[]
```
**Change Test A**: Adding a 5th problem requires one new `Problem` entry in `problems.ts` and one new entry in the `RUBRICS` map in `rubric.ts`. No evaluator or UI code changes.

---

## 5. Evaluation Approach

### Why rubric-based, not reference-solution?
Reference solutions penalise valid designs that differ structurally. A rubric evaluates *design principles* — encapsulation, responsibility assignment, extensibility — which are dimension-stable regardless of the specific class names a learner chooses.

### Deterministic evaluation
- Checks keyword coverage in the relevant submission sections.
- Checks section content length (minimum 35 chars per section for scoring).
- Computes a score per criterion: `4.5 + sectionCoverage * 2.6 + keywordCoverage * 2.9`, clamped to [3, 10].
- Always available, zero latency, no network dependency.

### AI evaluation (OpenAI)
- Sends the full submission + rubric as a structured prompt to GPT-4o-mini.
- Requires structured JSON output matching the `Evaluation` shape exactly.
- The prompt includes: problem name, rubric criteria with keywords, and the full submission.
- Falls back to deterministic if OpenAI is unavailable or returns an error.

### Which parts are deterministic vs AI?
| Deterministic | AI |
|---|---|
| Section presence / length | Quality of reasoning in explanations |
| Keyword coverage | Evidence of design trade-offs |
| Duplicate class name detection | SOLID principle analysis |
| Submission state transitions | Improvement suggestions |
| Overall pass/fail gate | Qualitative criterion feedback |

### Idempotency
The API route (`/api/evaluate`) hashes the submission content + problem ID and caches the result in memory. Identical submissions within the same server instance receive the cached result without re-calling OpenAI.

### Handling slow or failed evaluation
1. The attempt is stored as `SUBMITTED` (then `EVALUATING`) before the API call starts.
2. If evaluation succeeds → status transitions to `COMPLETED`.
3. If evaluation fails → status transitions to `FAILED`. The submission content is preserved.
4. The UI shows a clear `FAILED` state with a "try submitting again" message.

---

## 6. Layer Architecture

```
Presentation (React components)
  ProblemCard · ProblemBrief · SubmissionForm · FeedbackPanel · AttemptHistory
  ↑ depends on ↓

Application (hooks + use cases)
  usePracticePlatform · useProblemLibrary
  /api/evaluate (Next.js Route Handler)
  ↑ depends on ↓

Domain (pure business logic, no framework dependencies)
  Problem · Attempt · SubmissionContent · Evaluation · CriterionResult
  Rubric registry · DeterministicCheck · validation rules
  ↑ implemented by ↓

Infrastructure (adapters, replaceable)
  LocalAttemptStore · DeterministicEvaluator · AiEvaluator (OpenAI)
```

UI components depend only on application contracts (hook return types). They have no direct dependency on localStorage, OpenAI, or the rubric registry.

---

## 7. Key Trade-offs

| Decision | Trade-off accepted |
|---|---|
| Text-based submission (not code) | Simpler to evaluate; can't surface concurrency bugs; accepted for MVP |
| localStorage (not a database) | Data lost on clearing browser; no multi-device; trivial to swap to API calls |
| In-memory idempotency cache | Lost on server restart; acceptable for a prototype |
| CompositeEvaluator (AI first, deterministic fallback) | AI call adds latency (~2–5s); fallback ensures the platform always completes |
| 7-criterion rubric (not a reference solution) | Cannot catch every design smell; more robust to valid design variation |
| 4 problems at launch | Small enough to keep rubrics high quality; extensible by design |

---

## 8. Scaling Beyond the Prototype

The simplest first step when growing beyond a prototype:

1. **Persistence**: replace `LocalAttemptStore` with a Prisma/PostgreSQL adapter. No hook or UI changes.
2. **Evaluation speed**: the `/api/evaluate` route can be made non-blocking by returning `EVALUATING` immediately and completing via a webhook or polling endpoint.
3. **First problem to separate**: the AI evaluator would be the first candidate to extract to a separate service, as it has external latency and cost characteristics different from the rest of the monolith.
