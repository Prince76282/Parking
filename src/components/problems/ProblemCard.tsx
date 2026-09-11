import type { Attempt, Problem } from "@/lib/domain/types";

const difficultyStyle: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-rose-100 text-rose-700"
};

interface ProblemCardProps {
  problem: Problem;
  attempts: Attempt[];
  isActive: boolean;
  onSelect: (id: string) => void;
  onStart: (id: string) => void;
}

export function ProblemCard({ problem, attempts, isActive, onSelect, onStart }: ProblemCardProps) {
  const completedAttempts = attempts.filter((a) => a.status === "COMPLETED");
  const bestScore =
    completedAttempts.length > 0
      ? Math.max(...completedAttempts.map((a) => a.evaluation?.overallScore ?? 0))
      : null;
  const hasInProgress = attempts.some((a) => a.status === "DRAFT");

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        isActive ? "border-indigo-300 ring-2 ring-indigo-100 shadow-md" : "border-slate-200 shadow-sm"
      }`}
    >
      {/* Top accent bar */}
      <div
        className={`h-1.5 w-full transition-all duration-300 ${
          isActive
            ? "bg-gradient-to-r from-indigo-500 to-violet-500"
            : "bg-gradient-to-r from-slate-200 to-slate-100 group-hover:from-indigo-300 group-hover:to-violet-300"
        }`}
      />

      <div className="p-6">
        {/* Header */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${difficultyStyle[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
          <span className="text-xs text-slate-400">~{problem.estimatedMinutes} min</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
          {problem.title}
        </h3>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">{problem.description}</p>

        {/* Focus areas */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {problem.focusAreas.slice(0, 3).map((area) => (
            <span
              key={area}
              className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200/60"
            >
              {area}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between gap-3">
          {bestScore !== null ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400">Best</span>
              <span
                className={`text-base font-bold ${
                  bestScore >= 80 ? "text-emerald-600" : bestScore >= 60 ? "text-amber-600" : "text-rose-600"
                }`}
              >
                {Math.round(bestScore)}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Not attempted</span>
          )}

          <div className="flex gap-2">
            {isActive && attempts.length > 0 && (
              <button
                onClick={() => onSelect(problem.id)}
                id={`view-${problem.id}`}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                View
              </button>
            )}
            <button
              onClick={() => onStart(problem.id)}
              id={`start-${problem.id}`}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700"
            >
              {hasInProgress ? "Continue →" : attempts.length > 0 ? "Try again →" : "Start →"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
