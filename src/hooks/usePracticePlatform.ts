"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defaultStore } from "@/lib/application/persistence";
import { getRubricForProblem } from "@/lib/domain/rubric";
import { blankSubmission, type Attempt, type Problem, type SubmissionContent } from "@/lib/domain/types";
import { isSubmittable, runDeterministicChecks } from "@/lib/domain/validation";

const newAttempt = (problem: Problem, sequence: number): Attempt => ({
  id: `attempt-${crypto.randomUUID()}`,
  problemId: problem.id,
  sequence,
  status: "DRAFT",
  content: blankSubmission(),
  savedAt: new Date().toISOString()
});

export function usePracticePlatform(problem: Problem) {
  const [allAttempts, setAllAttempts] = useState<Attempt[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const problemRef = useRef(problem);
  useEffect(() => { problemRef.current = problem; }, [problem]);

  // Load from localStorage only on client mount to eliminate SSR hydration mismatch
  useEffect(() => {
    const loaded = defaultStore.load();
    setAllAttempts(loaded);
    setIsLoaded(true);
  }, []);

  // Persist only after initial client load
  useEffect(() => {
    if (isLoaded) {
      defaultStore.save(allAttempts);
    }
  }, [allAttempts, isLoaded]);

  const attempts = useMemo(
    () => allAttempts.filter((a) => a.problemId === problem.id),
    [allAttempts, problem.id]
  );

  const activeAttempt = attempts.find((a) => a.id === activeAttemptId) ?? null;

  const checks = useMemo(
    () => runDeterministicChecks(activeAttempt?.content ?? blankSubmission()),
    [activeAttempt?.content]
  );

  // ── Actions ─────────────────────────────────────────────────────────────────

  const startAttempt = useCallback(() => {
    const attempt = newAttempt(problemRef.current, attempts.length + 1);
    setAllAttempts((cur) => [attempt, ...cur]);
    setActiveAttemptId(attempt.id);
    setNotice("Attempt started as a draft. Fill in each section, then submit.");
  }, [attempts.length]);

  const updateContent = useCallback(
    (key: keyof SubmissionContent, value: string) => {
      setAllAttempts((cur) =>
        cur.map((a) =>
          a.id === activeAttemptId && a.status === "DRAFT"
            ? { ...a, content: { ...a.content, [key]: value } }
            : a
        )
      );
    },
    [activeAttemptId]
  );

  const saveDraft = useCallback(() => {
    setAllAttempts((cur) =>
      cur.map((a) =>
        a.id === activeAttemptId ? { ...a, savedAt: new Date().toISOString() } : a
      )
    );
    setNotice("Draft saved. Keep refining your design.");
  }, [activeAttemptId]);

  const submitAttempt = useCallback(async () => {
    const current = attempts.find((a) => a.id === activeAttemptId);
    if (!current || !isSubmittable(current.content)) {
      setNotice("Complete all submission checks before submitting.");
      return;
    }

    const submittedAt = new Date().toISOString();
    // Store as SUBMITTED before evaluation — submission is never lost on failure
    setAllAttempts((cur) =>
      cur.map((a) =>
        a.id === current.id ? { ...a, status: "EVALUATING", submittedAt } : a
      )
    );
    setNotice("Evaluating your design with AI rubric review — this takes a moment…");

    try {
      const blueprints = getRubricForProblem(problemRef.current.id);
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: current.content,
          blueprints,
          problem: problemRef.current
        })
      });

      if (!response.ok) throw new Error(`Evaluate API returned ${response.status}`);
      const evaluation = await response.json();

      setAllAttempts((cur) =>
        cur.map((a) =>
          a.id === current.id ? { ...a, status: "COMPLETED", evaluation } : a
        )
      );
      setNotice(`Evaluation complete — you scored ${evaluation.overallScore}/100. Review the feedback and try again.`);
    } catch {
      setAllAttempts((cur) =>
        cur.map((a) =>
          a.id === current.id ? { ...a, status: "FAILED" } : a
        )
      );
      setNotice("Evaluation failed. Your submission is saved — try submitting again.");
    }
  }, [attempts, activeAttemptId]);

  const selectAttempt = useCallback((attemptId: string) => {
    setActiveAttemptId(attemptId);
    setNotice(null);
  }, []);

  const dismissNotice = useCallback(() => setNotice(null), []);

  // ── Retry: previous attempt is immutable, new DRAFT is created ──────────────
  const retryAttempt = useCallback(() => {
    const attempt = newAttempt(problemRef.current, attempts.length + 1);
    setAllAttempts((cur) => [attempt, ...cur]);
    setActiveAttemptId(attempt.id);
    setNotice("New attempt started. Your previous attempt is preserved in History.");
  }, [attempts.length]);

  return {
    problem,
    attempts,
    allAttempts,
    isLoaded,
    activeAttempt,
    checks,
    notice,
    startAttempt,
    retryAttempt,
    updateContent,
    saveDraft,
    submitAttempt,
    selectAttempt,
    dismissNotice
  };
}
