import type { Problem } from "@/lib/domain/types";

type ProblemBriefProps = {
  problem: Problem;
  onStart: () => void;
  hasActiveAttempt: boolean;
  hasInProgress: boolean;
};

const difficultyStyle: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-rose-100 text-rose-700"
};

export function ProblemBrief({ problem, onStart, hasActiveAttempt, hasInProgress }: ProblemBriefProps) {
  const ctaLabel = hasInProgress
    ? "Continue attempt →"
    : hasActiveAttempt
    ? "Start a new attempt →"
    : "Start attempt →";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel animate-fade-up">
      {/* Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-white to-white px-6 py-8 sm:px-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${difficultyStyle[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            ◷ {problem.estimatedMinutes} min
          </span>
          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
            OO design
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{problem.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{problem.description}</p>

        <button
          onClick={onStart}
          id={`brief-start-${problem.id}`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md active:scale-95"
        >
          {ctaLabel}
        </button>
      </div>

      {/* Requirements + What good looks like */}
      <div className="grid gap-8 p-6 sm:grid-cols-2 sm:p-8">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.13em] text-slate-400">
            Your design should cover
          </h2>
          <ol className="mt-4 space-y-4">
            {problem.requirements.map((req, i) => (
              <li key={req.id} className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
                  {i + 1}
                </span>
                <span>
                  <strong className="block text-sm font-semibold text-slate-800">{req.title}</strong>
                  <span className="text-sm leading-5 text-slate-500">{req.description}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <aside className="space-y-5">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-5">
            <h2 className="text-sm font-bold text-indigo-950">What good looks like</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              There is no single correct class diagram. We score your reasoning, trade-offs,
              boundaries, and how your design handles change.
            </p>
            <div className="mt-4 border-t border-indigo-100 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-600">Focus areas</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {problem.focusAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
            <h2 className="text-xs font-bold uppercase tracking-[0.13em] text-slate-400">Constraints</h2>
            <ul className="mt-3 space-y-2">
              {problem.constraints.map((constraint) => (
                <li key={constraint} className="flex gap-2 text-xs leading-5 text-slate-500">
                  <span className="text-slate-300">•</span>
                  {constraint}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
