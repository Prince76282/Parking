/**
 * Backward-compatible synchronous evaluation wrapper.
 *
 * Used in tests and as the evaluation fallback path.
 * Production code uses the async Evaluator interface directly.
 */

import { getRubricForProblem } from "@/lib/domain/rubric";
import type { Evaluation, SubmissionContent } from "@/lib/domain/types";
import { RuleBasedEvaluator } from "./evaluator";

const evaluator = new RuleBasedEvaluator();

export function evaluateSubmission(
  content: SubmissionContent,
  problemId = "parking-lot"
): Evaluation {
  const blueprints = getRubricForProblem(problemId);
  const problem = { id: problemId, title: problemId, description: "", requirements: [] };

  let result: Evaluation | undefined;
  evaluator
    .evaluate({ content, blueprints, problem: problem as never })
    .then((e) => { result = e; });

  if (!result) throw new Error("RuleBasedEvaluator did not resolve synchronously");
  return result;
}
