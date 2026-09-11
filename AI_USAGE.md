# AI Usage

This document covers 5 meaningful AI-assisted decisions made during the development of DesignGym.

---

## 1. Rubric structure and scoring formula

**What AI suggested:** When asked how to structure a keyword-based rubric for LLD evaluation, the AI recommended a linear combination of two coverage signals: section coverage (how many relevant sections have meaningful content) and keyword coverage (how many domain-specific terms are present). It suggested a formula like `base + (sectionCoverage * weight1) + (keywordCoverage * weight2)`.

**What I accepted:** The two-signal approach. Section coverage captures whether the learner engaged with each dimension; keyword coverage captures whether they addressed specific domain concepts. These are orthogonal signals that complement each other well.

**What I changed:** The AI suggested using a scale of 0–100. I changed it to 3–10 for two reasons: (1) it maps more naturally to an interview scoring rubric (3 = minimal, 7 = solid, 9–10 = excellent); (2) a hard floor of 3 avoids the demoralising "you scored 0" result for a partially complete submission. The formula was tuned manually by running several sample submissions and checking that the resulting scores matched expert intuition.

---

## 2. Evaluator interface design (Change Test B)

**What AI suggested:** When I described the need to swap evaluators (deterministic vs AI vs human), the AI recommended a Strategy pattern with an `Evaluator` interface. It proposed a simple interface: `evaluate(content, problem) => Evaluation`. It also suggested a `CompositeEvaluator` that runs the primary evaluator and falls back to a secondary on failure.

**What I accepted:** The Strategy pattern and the `CompositeEvaluator` concept. The fallback pattern is particularly good: storing the submission before evaluation starts means failure cannot lose user data, and the `CompositeEvaluator` encapsulates the retry logic without polluting the practice hook.

**What I changed:** The AI's initial interface didn't include `rubric` as a parameter — it assumed the evaluator would fetch its own rubric. I changed the signature to `evaluate(content, rubric, problem)` because passing the rubric as a parameter makes the evaluator stateless and makes problem-specific rubrics trivially injectable. This also makes the `DeterministicEvaluator` easier to test (you can pass any rubric, including test-specific ones).

---

## 3. OpenAI prompt structure

**What AI suggested:** The AI's initial prompt suggestion was open-ended: "Review this LLD submission and give a score from 1 to 10 with feedback." This is exactly what the assignment calls out as an anti-pattern ("avoid asking for a 100-point score").

**What I rejected and why:** An unconstrained prompt produces variable, often flattering feedback. Without a rubric, the model focuses on different things each time and doesn't give actionable criterion-level feedback.

**What I built instead:** A structured prompt that:
1. Passes the rubric criteria as numbered items with associated keywords
2. Requires JSON output matching the `Evaluation` shape exactly (using `response_format: { type: "json_object" }`)
3. Specifies the score range per criterion (3–10)
4. Requires evidence, concerns, and suggestions to be separate fields

This approach treats the AI as a rubric executor, not a free-form judge. The structured output is machine-readable and consistent across evaluations.

---

## 4. Per-problem rubric keywords

**What AI suggested:** When generating keywords for the elevator problem rubric, the AI produced a comprehensive list including: `elevator`, `floor`, `request`, `controller`, `dispatch`, `scheduler`, `strategy`, `scan`, `fcfs`, `queue`, `door`, `state`, `idle`, `moving`, `stopped`, `concurrent`, `thread`, `lock`, `algorithm`.

**What I accepted:** The domain-specific terms (`elevator`, `controller`, `scheduler`, `scan`, `state`, `idle`, `moving`) are well-chosen — they appear in any serious elevator design discussion.

**What I trimmed and why:** I removed `thread` and `lock` from the main rubric keywords (kept only `concurrent` and `safe`) because requiring threading primitives in a text-based design submission is too implementation-specific. The assignment explicitly says "do not implement threading primitives." A learner who mentions "concurrent requests are queued" is demonstrating the right design awareness without writing Java synchronized blocks. Overly implementation-specific keywords would penalise good conceptual designs.

---

## 5. localStorage persistence approach

**What AI suggested:** For client-side persistence, the AI suggested using React Context with a custom Provider that initialises from localStorage and syncs changes. It also suggested using `useReducer` instead of multiple `useState` calls to make state transitions more explicit.

**What I accepted in spirit:** The idea of isolating the storage concern behind an `AttemptStore` interface, so the hook doesn't directly call `localStorage`. This keeps the hook testable and makes it easy to swap the adapter.

**What I changed:** I did not implement `useReducer` — for a prototype with 5 state mutations, the cognitive overhead of action types outweighs the benefit. The more important decision was the `AttemptStore` interface: `load(): Attempt[]` and `save(attempts): void`. The interface is minimal, server-side safe (guarded against `typeof window === "undefined"`), and directly swappable with a remote API adapter. The AI suggested a more complex interface with `getById`, `update`, etc. — I reduced it to two methods because the hook re-derives everything from the full array, which avoids synchronisation bugs.
