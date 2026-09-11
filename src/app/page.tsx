"use client";

import { useState } from "react";
import { DesignCoach } from "@/components/practice/DesignCoach";
import { FeedbackPanel } from "@/components/evaluation/FeedbackPanel";
import { AttemptHistory } from "@/components/history/AttemptHistory";
import { AppShell } from "@/components/layout/AppShell";
import { ArchitectureMap } from "@/components/problems/ArchitectureMap";
import { ProblemBrief } from "@/components/problems/ProblemBrief";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { SubmissionChecks } from "@/components/practice/SubmissionChecks";
import { SubmissionForm } from "@/components/practice/SubmissionForm";
import { useProblemLibrary } from "@/hooks/useProblemLibrary";
import { usePracticePlatform } from "@/hooks/usePracticePlatform";

type Area = "Library" | "Practice" | "History";

export default function HomePage() {
  const [activeArea, setActiveArea] = useState<Area>("Library");
  const { problems, activeProblem, selectProblem } = useProblemLibrary();
  const platform = usePracticePlatform(activeProblem);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleSelectProblem(problemId: string) {
    selectProblem(problemId);
    setActiveArea("Library");
  }

  function handleStartFromLibrary(problemId: string) {
    selectProblem(problemId);
    setActiveArea("Practice");
    const problemAttempts = platform.attempts.filter(
      (a) => a.problemId === problemId && a.status === "DRAFT"
    );
    if (problemAttempts.length === 0) {
      setTimeout(() => platform.startAttempt(), 0);
    }
  }

  function handleStartFromBrief() {
    platform.startAttempt();
    setActiveArea("Practice");
  }

  function handleRetry() {
    platform.retryAttempt();
    setActiveArea("Practice");
  }

  function handleSelectAttempt(id: string) {
    platform.selectAttempt(id);
    setActiveArea("Practice");
  }

  // ── Derived ───────────────────────────────────────────────────────────────────

  const hasDraft = platform.attempts.some((a) => a.status === "DRAFT");
  const isCompleted = platform.activeAttempt?.status === "COMPLETED";
  const isFailed = platform.activeAttempt?.status === "FAILED";

  return (
    <AppShell activeArea={activeArea} onAreaChange={setActiveArea}>
      <main className="mx-auto max-w-7xl px-5 py-8 sm:py-10">

        {/* ── Library ─────────────────────────────────────────────────────────── */}
        {activeArea === "Library" && (
          <div className="space-y-8">
            <div className="animate-fade-up">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-500">
                Problem library
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Practice Low-Level Design
              </h1>
              <p className="mt-2 max-w-2xl text-base text-slate-500">
                Choose a problem, write a structured design across 7 sections, and receive
                an evidence-based rubric review on your responsibilities, abstractions, and
                extensibility.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {problems.map((problem) => {
                const problemAttempts = platform.allAttempts.filter(
                  (a) => a.problemId === problem.id
                );
                return (
                  <ProblemCard
                    key={problem.id}
                    problem={problem}
                    attempts={problemAttempts}
                    isActive={activeProblem.id === problem.id}
                    onSelect={handleSelectProblem}
                    onStart={handleStartFromLibrary}
                  />
                );
              })}
            </div>

            <ProblemBrief
              problem={activeProblem}
              onStart={handleStartFromBrief}
              hasActiveAttempt={platform.attempts.length > 0}
              hasInProgress={hasDraft}
            />

            <ArchitectureMap />
          </div>
        )}

        {/* ── Practice ────────────────────────────────────────────────────────── */}
        {activeArea === "Practice" && (
          <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3 animate-fade-up">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                  {activeProblem.title} · practice workspace
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  Design with evidence in mind
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Make every decision explicit — the rubric scores what you explain.
                </p>
              </div>
              <div className="flex gap-2">
                {!platform.activeAttempt && (
                  <button
                    onClick={platform.startAttempt}
                    id="start-attempt-practice"
                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
                  >
                    Start attempt →
                  </button>
                )}
                {(isCompleted || isFailed) && (
                  <button
                    onClick={handleRetry}
                    id="try-again"
                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
                  >
                    Try again →
                  </button>
                )}
              </div>
            </div>

            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <SubmissionForm
                attempt={platform.activeAttempt}
                checks={platform.checks}
                notice={platform.notice}
                onChange={platform.updateContent}
                onSave={platform.saveDraft}
                onSubmit={platform.submitAttempt}
                onDismissNotice={platform.dismissNotice}
              />

              <div className="space-y-5 xl:sticky xl:top-24">
                {/* Design Coach — visible while drafting */}
                {platform.activeAttempt?.status === "DRAFT" && (
                  <DesignCoach
                    hints={activeProblem.designHints}
                    problemTitle={activeProblem.title}
                  />
                )}
                <SubmissionChecks checks={platform.checks} />
                <FeedbackPanel attempt={platform.activeAttempt} />
              </div>
            </div>
          </div>
        )}

        {/* ── History ─────────────────────────────────────────────────────────── */}
        {activeArea === "History" && (
          <div>
            <div className="mb-6 animate-fade-up">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                Learning history
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                See your design evolve
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Each attempt is preserved. Compare your thinking across iterations.
              </p>
            </div>

            {problems.map((problem) => {
              const problemAttempts = platform.attempts
                .filter((a) => a.problemId === problem.id)
                .sort((a, b) => b.sequence - a.sequence);
              if (problemAttempts.length === 0) return null;
              return (
                <div key={problem.id} className="mb-8">
                  <h2 className="mb-3 text-sm font-bold text-slate-700">{problem.title}</h2>
                  <AttemptHistory
                    attempts={problemAttempts}
                    activeAttemptId={platform.activeAttempt?.id ?? null}
                    onSelect={handleSelectAttempt}
                  />
                </div>
              );
            })}

            {platform.attempts.length === 0 && (
              <AttemptHistory
                attempts={[]}
                activeAttemptId={null}
                onSelect={handleSelectAttempt}
              />
            )}
          </div>
        )}
      </main>
    </AppShell>
  );
}
