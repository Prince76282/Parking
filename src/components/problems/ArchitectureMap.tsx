const layers = [
  {
    name: "Presentation",
    detail: "ProblemCard · ProblemBrief · SubmissionForm · FeedbackPanel · AttemptHistory",
    tone: "border-indigo-200 bg-indigo-50 text-indigo-700"
  },
  {
    name: "Application",
    detail: "usePracticePlatform · CompositeEvaluator · /api/evaluate route",
    tone: "border-violet-200 bg-violet-50 text-violet-700"
  },
  {
    name: "Domain",
    detail: "Problem · Attempt · Submission · Evaluation · Rubric registry",
    tone: "border-sky-200 bg-sky-50 text-sky-700"
  },
  {
    name: "Infrastructure",
    detail: "LocalAttemptStore · OpenAI adapter (DeterministicEvaluator fallback)",
    tone: "border-slate-200 bg-slate-50 text-slate-600"
  }
];

export function ArchitectureMap() {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-panel sm:p-7 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">Component boundaries</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Built to evolve beyond one problem</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
          Prototype · localStorage adapters
        </span>
      </div>
      <div className="mt-5 grid gap-2 md:grid-cols-4">
        {layers.map((layer, index) => (
          <div key={layer.name} className="relative">
            <div className={`h-full rounded-xl border p-4 ${layer.tone}`}>
              <p className="text-sm font-bold">{layer.name}</p>
              <p className="mt-2 text-xs leading-5 opacity-80">{layer.detail}</p>
            </div>
            {index < layers.length - 1 && (
              <span className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-lg font-bold text-slate-300 md:block">
                →
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-500">
        UI components depend on application contracts, not on a database or model provider.
        The evaluator, persistence store, and problem types are all replaceable adapters.
        Adding a new problem needs only a rubric entry — the practice flow is unchanged.
      </p>
    </section>
  );
}
