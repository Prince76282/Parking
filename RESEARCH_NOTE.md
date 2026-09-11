# Research Note — LLD Practice Platform

## 1. The Learner Problem

Low-level design practice has a specific failure mode that is different from most other programming disciplines: **the learner can finish an exercise and still not know whether the result is good.**

When a learner writes code for a competitive programming problem, the correctness of the solution is objective — tests pass or fail. When a learner reads a book chapter, they can quiz themselves. But when a learner designs a Parking Lot or an Elevator system:

- There is no single correct answer.
- Two valid designs can look structurally different and both be defensible.
- The learner has no standard rubric to self-assess against.
- Interview feedback, when it exists, is often vague ("think about extensibility more").

The result is that learners practice in a vacuum. They copy reference solutions from GitHub, memorise class diagrams without understanding the reasoning, and enter interviews unsure whether they have actually improved.

**The core gap is not a shortage of problems — it is a shortage of useful, evidence-backed feedback.**

---

## 2. Research: Existing Tools and Approaches

I surveyed five categories of tools and approaches:

### 2.1 Interview prep platforms (Hello Interview, LLDCoding, LLDCanvas)

**What they do well:**
- LLDCanvas offers 110+ problems with a UML editor and timed interview mode.
- LLDCoding provides an IDE workspace with Java/C++ problem sets.
- Hello Interview offers guided, step-by-step walkthroughs.

**Gaps:**
- Feedback is mostly reference-solution comparison, not design-principle analysis.
- Learners who submit a valid but structurally different design get a low score because it doesn't match the reference.
- No explicit rubric — learners cannot see *why* a design scored a certain way.
- Most tools are passive: read a reference, memorise a diagram. Few create an active attempt loop.

### 2.2 Machine coding / CodeZym

**What they do well:**
- Forces learners to write real runnable code under time pressure.
- Exposes concurrency issues that text-based designs cannot surface.

**Gaps:**
- Code quality is hard to evaluate automatically without running tests.
- The focus on code excludes learners at the "thinking through the design" stage.
- No score improvement loop — no way to see how much a learner has improved.

### 2.3 GitHub repos and blog articles

Many "Parking Lot in Java" repositories exist. They provide a completed design to read but:
- No interaction — learners passively consume.
- No comparison to their own design.
- Reference solutions vary widely in quality.

### 2.4 AI tools (ChatGPT / Claude used ad-hoc)

Learners increasingly paste their designs into ChatGPT and ask "is this good?" The problems are:
- Unconstrained prompts produce vague, flattering feedback.
- No rubric structure — feedback is prose, not actionable dimensions.
- No attempt history — the conversation is ephemeral.
- The model often validates poor designs because it lacks a specific rubric.

### 2.5 Human mentorship / code review

Genuinely useful but doesn't scale. Feedback is expert and contextual but:
- Asynchronous and slow (days, not minutes).
- Inconsistent — different reviewers weight different concerns.
- Not available to most learners.

---

## 3. Key Gaps

| Gap | Why it matters |
|---|---|
| No rubric-based feedback | Learners cannot identify *which* aspect of design needs work |
| Reference-solution comparison | Penalises valid designs that differ from the reference |
| No attempt history | Learners cannot track improvement across iterations |
| Passive consumption | Reading a reference solution ≠ practicing design thinking |
| All-or-nothing evaluation | Learners need partial credit and directional guidance |

---

## 4. Product Direction

**DesignGym** is a focused practice loop, not an LMS or an assessment system.

The core hypothesis: **if a learner can articulate their design in structured sections — assumptions, classes, relationships, walkthrough, edge cases — and receive rubric-based feedback on each section, they will improve faster than reading reference solutions.**

The MVP prioritises:
1. A small set of well-specified problems (4 problems, 3 difficulty levels)
2. A structured text submission format (5 sections, not a full class diagram)
3. An evidence-based rubric (7 dimensions per problem, tailored keywords)
4. Attempt history with score trend (visual improvement over time)
5. An AI evaluation path that gives richer qualitative feedback when available

The text-based structured format was chosen because:
- It gives enough signal for rubric scoring without requiring a diagram tool
- It forces explicit reasoning ("why did I choose this class?") rather than copying a UML diagram
- It is future-extensible — adding code or diagram submission is a new adapter, not a rewrite

The rubric format was chosen over a reference solution comparison because:
- It accommodates multiple valid designs
- It gives actionable, criterion-level feedback
- It can be computed deterministically (offline, always available) or enhanced with AI reasoning
