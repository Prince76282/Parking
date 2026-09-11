import type { Attempt } from "@/lib/domain/types";
import { ScoreTrend } from "./ScoreTrend";

const statusStyle: Record<Attempt["status"], string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  EVALUATING: "bg-violet-100 text-violet-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-rose-100 text-rose-700"
};

const statusLabel: Record<Attempt["status"], string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  EVALUATING: "Evaluating",
  COMPLETED: "Completed",
  FAILED: "Failed"
};

const fmt = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

interface AttemptHistoryProps {
  attempts: Attempt[];
  activeAttemptId: string | null;
  onSelect: (id: string) => void;
}

export function AttemptHistory({ attempts, activeAttemptId, onSelect }: AttemptHistoryProps) {
  if (attempts.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-50 text-2xl">📋</span>
        <p className="mt-4 text-sm font-bold text-slate-700">No attempts yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Your submitted designs will appear here. Each attempt is stored so you can compare your thinking over time.
        </p>
      </section>
    );
  }

  const completedScores = attempts
    .filter((a) => a.status === "COMPLETED" && a.evaluation)
    .map((a) => a.evaluation!.overallScore);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your attempts</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {attempts.length} attempt{attempts.length !== 1 ? "s" : ""} · select any to review or continue
            </p>
          </div>
          {completedScores.length >= 2 && (
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-semibold text-slate-400">Score trend</span>
              <ScoreTrend scores={completedScores} />
            </div>
          )}
        </div>
      </div>

      {/* Attempt list */}
      <div className="divide-y divide-slate-100">
        {attempts.map((attempt) => {
          const isActive = attempt.id === activeAttemptId;
          const evalKind = attempt.evaluation?.evaluatorKind;
          return (
            <button
              key={attempt.id}
              id={`attempt-${attempt.id}`}
              onClick={() => onSelect(attempt.id)}
              className={`flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-slate-50 ${
                isActive ? "bg-indigo-50/60" : ""
              }`}
            >
              {/* Left: sequence + date */}
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="block text-sm font-bold text-slate-800">
                    Attempt {attempt.sequence}
                  </span>
                  {isActive && (
                    <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                      current
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block truncate text-xs text-slate-400">
                  {fmt.format(new Date(attempt.savedAt))}
                </span>
              </span>

              {/* Right: status + score + evaluator badge */}
              <span className="flex shrink-0 items-center gap-2.5">
                {evalKind && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                      evalKind === "ai"
                        ? "bg-violet-100 text-violet-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {evalKind === "ai" ? "AI" : "Auto"}
                  </span>
                )}
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyle[attempt.status]}`}
                >
                  {statusLabel[attempt.status]}
                </span>
                {attempt.evaluation && (
                  <span className="w-8 text-right text-sm font-bold text-indigo-700">
                    {attempt.evaluation.overallScore.toFixed(1)}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
