# Research Note — LLD Practice Platform

## 1. The Learner Problem

Low-level design practice has a failure mode unlike most other programming disciplines: **the learner can finish an exercise and still not know whether the result is good.**

When a learner solves a competitive programming problem, correctness is objective — tests pass or fail. When a learner studies a textbook chapter, they can quiz themselves. But when a learner designs a Parking Lot or Elevator system:

- There is no single correct answer.
- Two valid designs can look structurally different and both be defensible.
- The learner has no rubric to self-assess against.
- Interview feedback, when it exists, is vague ("think about extensibility more").

The result: learners practice in a vacuum. They copy reference solutions from GitHub, memorise class diagrams without understanding the reasoning, and enter interviews unsure whether they have actually improved.

**The core gap is not a shortage of problems — it is a shortage of useful, evidence-backed feedback.**

---

## 2. How Learners Currently Practice LLD

### GitHub repositories and blog articles

Hundreds of "Parking Lot in Java" and "Elevator System in Python" repositories exist. Examples include:
- [lldcoding/low-level-design](https://github.com/search?q=low+level+design) (>5,000 repos)
- NeetCode's system design content, GeeksForGeeks articles

**Problem:** These provide a completed design to read, not an active practice loop. Learners passively consume, not actively engage. Reference solutions vary significantly in quality and rarely explain *why* a design decision was made.

### Interview prep platforms

**Hello Interview** ([helloInterview.com](https://www.hellointerview.com)) offers guided, step-by-step walkthroughs with an AI reviewer.

**LLDCanvas** ([lldcanvas.com](https://www.lldcanvas.com)) provides 110+ problems with a UML editor and timed interview mode.

**LLDCoding** ([lldcoding.com](https://lldcoding.com)) offers 100+ problems with an IDE workspace.

**Findings:**
- Most platforms compare the learner's solution against a reference solution — this penalises valid designs that are structurally different.
- Feedback is sparse: "your design is missing a PricingStrategy" without explaining why that matters.
- No consistent rubric — learners can't identify *which dimension* needs improvement.
- No attempt history — learners can't track improvement over time.

### Machine coding platforms (CodeZym, similar)

Force learners to write runnable code under time pressure. Surfaces concurrency bugs. But:
- Excludes learners at the "thinking through the design" stage.
- Hard to evaluate automatically.
- No structural analysis of design decisions.

### AI tools (ChatGPT/Claude used ad-hoc)

Learners increasingly paste designs into LLMs for feedback. Problems:
- Unconstrained prompts produce vague, often flattering feedback.
- No rubric structure — feedback is prose, not actionable dimensions.
- No attempt history — ephemeral conversation context.
- The model validates poor designs because it lacks a specific rubric.

### Communities (r/cscareerquestions, Blind)

Learners share designs and ask "is this good?" Valuable but:
- Asynchronous and slow.
- Reviewer quality varies.
- No consistent rubric.

---

## 3. Where Reference Solutions Fail

Reference solution comparison has a fundamental flaw: it penalises valid variation.

**Example:** The Parking Lot problem has at least 3 structurally valid designs:

Design A: `ParkingLot → ParkingFloor → ParkingSpot`, with a separate `AllocationService`.
Design B: `ParkingManager` as the central aggregate with embedded allocation logic.
Design C: A `ParkingSystem` with dedicated `EntryGate` and `ExitGate` entities.

All three can be defensible depending on the stated constraints. A reference comparison would penalise two of them. A rubric — evaluating responsibility clarity, extensibility, and coupling — can score all three fairly.

---

## 4. Why Explainable Feedback Matters

A learner who sees `Score: 72/100` learns nothing.

A learner who sees:

> **Class Responsibilities: 14/20**  
> Evidence: ParkingLot handles both entry orchestration and fee calculation.  
> Concern: Fee calculation is a separate policy that can change independently.  
> Suggestion: Extract pricing behind a PricingStrategy interface.

...has a specific, actionable improvement for the next attempt.

Explainability is not a feature — it is the product. Without it, the platform is just another scoring engine.

---

## 5. Key Insights → Product Decisions

| Research insight | Product decision |
|---|---|
| Reference solutions penalise valid designs | Rubric-based evaluation scoring design principles, not reference matching |
| Learners can't identify which dimension to improve | 7-criterion rubric with per-criterion evidence and suggestions |
| No attempt history → no learning loop | Preserved attempt history with score trend and recurring weaknesses |
| Vague AI feedback without structure | Structured JSON prompt requiring evidence, concern, and suggestion per criterion |
| Passive consumption of reference solutions | Active structured submission forcing learners to articulate their reasoning |
| Design Coach gap (no hints before submission) | Design Coach with problem-specific guiding questions (not answers) |

---

## 6. Sources

- LLDCanvas: https://www.lldcanvas.com
- Hello Interview: https://www.hellointerview.com  
- LLDCoding: https://lldcoding.com
- GitHub: keyword search "low level design" (>5000 repositories as of 2026)
- r/cscareerquestions: recurring threads on LLD interview preparation
- NeetCode System Design: https://neetcode.io/courses/system-design-for-beginners
- GeeksForGeeks LLD series: https://www.geeksforgeeks.org/system-design-tutorial/#LLD
