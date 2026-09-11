# DesignGym — LLD Practice Platform

A focused practice platform for Low-Level Design. Choose a problem, write a structured design, and receive evidence-based rubric feedback on your responsibilities, abstractions, and extensibility.

---

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional: AI evaluation

Set an OpenAI API key for AI-powered criterion feedback:

```bash
# Windows
$env:OPENAI_API_KEY="sk-..."

# .env.local
OPENAI_API_KEY=sk-...
```

Without the key, the platform evaluates with the deterministic rubric evaluator and shows a clear "demo mode" notice. Every feature works offline.

---

## Run tests

```bash
npm test
```

31 tests across 4 test files — all pass with no network calls.

---

## Architecture

```
src/
  app/
    api/evaluate/route.ts    Next.js API route (OpenAI + deterministic fallback)
    layout.tsx               Root layout with Inter font
    page.tsx                 Multi-problem main page
    globals.css              Design system tokens, animations
  components/
    evaluation/FeedbackPanel.tsx     Score summary + expandable criterion cards
    history/AttemptHistory.tsx       Attempt list with score trend sparkline
    history/ScoreTrend.tsx           Pure-SVG sparkline chart
    layout/AppShell.tsx              Header, nav, mobile nav
    practice/SubmissionChecks.tsx    Live pre-submission gate
    practice/SubmissionForm.tsx      5-section structured form
    problems/ArchitectureMap.tsx     Layer diagram
    problems/ProblemBrief.tsx        Problem detail + constraints
    problems/ProblemCard.tsx         Problem library card
  hooks/
    usePracticePlatform.ts   Multi-problem practice state (persistence, evaluation)
    useProblemLibrary.ts     Problem selection state
  lib/
    application/
      evaluateSubmission.ts  Backward-compatible sync wrapper
      evaluator.ts           Evaluator interface + Deterministic / AI / Composite impls
      persistence.ts         AttemptStore interface + LocalAttemptStore
    data/
      problems.ts            4 LLD problems (Parking Lot, Elevator, Vending Machine, Library)
      parkingLotProblem.ts   Re-exported for backward compatibility
    domain/
      rubric.ts              Per-problem rubric registry (CriterionBlueprint[])
      types.ts               Domain types (Problem, Attempt, Evaluation, etc.)
      validation.ts          Deterministic pre-submission checks
```

### Layer dependencies (strict, no loops)

```
Presentation → Application → Domain ← Infrastructure
```

UI components import only hook return types. They have no dependency on localStorage, OpenAI, or the rubric registry directly.

---

## Key design decisions

### 1. Structured text submission (not code or diagrams)
Five sections — assumptions, classes, relationships, design walkthrough, edge cases — give enough signal for rubric scoring without requiring a diagram editor or a runnable environment. The format forces explicit reasoning: the learner must articulate *why* they made each choice.

### 2. Rubric-based feedback (not reference-solution comparison)
A rubric evaluates design principles — encapsulation, responsibility assignment, extensibility — which are stable across structurally different but equally valid designs. Reference solutions penalise valid alternatives.

### 3. Evaluator as a port (Change Test B)
```typescript
interface Evaluator {
  evaluate(content, rubric, problem): Promise<Evaluation>;
}
```
`DeterministicEvaluator`, `AiEvaluator`, and `CompositeEvaluator` implement this interface. Adding a human reviewer or a different model requires only a new implementation — the practice flow is unchanged.

### 4. Per-problem rubric registry (Change Test A)
```typescript
getRubricForProblem(problemId: string): CriterionBlueprint[]
```
Adding a 5th problem requires a new `Problem` entry and a new `RUBRICS` entry. No evaluator or UI code changes.

### 5. Submission stored before evaluation
The attempt transitions to `EVALUATING` and is persisted **before** the API call. If evaluation fails, the submission is not lost — the attempt transitions to `FAILED` with the content intact.

### 6. localStorage with a clean interface
`AttemptStore` has two methods: `load()` and `save()`. Replacing it with a remote API adapter requires zero hook changes.

---

## Problems

| Problem | Difficulty | Est. time | Focus |
|---|---|---|---|
| Parking Lot | Intermediate | 45 min | Responsibility assignment, Strategy |
| Elevator System | Intermediate | 45 min | State machine, Scheduling strategy |
| Vending Machine | Beginner | 30 min | State machine, Payment abstraction |
| Library Management | Advanced | 60 min | Aggregate design, Policy isolation |

---

## Limitations

- **No user accounts**: all data is in browser localStorage, cleared when you clear browser data.
- **In-memory idempotency cache**: resets on server restart — the same submission may be re-evaluated after a restart.
- **Deterministic evaluator is keyword-based**: it cannot reason about design quality the way a human reviewer can. It is most useful as a pre-submission gate, not as a final grade.
- **4 problems**: the system is designed for easy extension, but only 4 problems are seeded.
- **No code execution**: text-based submissions cannot surface concurrency bugs or compilation errors.

---

## Deliverables

| File | Purpose |
|---|---|
| `RESEARCH_NOTE.md` | Learner problem, existing tools, gaps, product direction |
| `DESIGN_NOTE.md` | MVP scope, domain model, evaluation approach, trade-offs |
| `AI_USAGE.md` | 5 AI-assisted decisions with accept/reject reasoning |
| `src/` | Working Next.js prototype |
| `src/**/*.test.ts` | 31 tests (4 test files) |
