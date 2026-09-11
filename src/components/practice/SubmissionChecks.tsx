import type { DeterministicCheck } from "@/lib/domain/types";

export function SubmissionChecks({ checks }: { checks: DeterministicCheck[] }) {
  const passed = checks.filter((check) => check.passed).length;
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <div><h2 className="text-sm font-bold text-slate-900">Submission checks</h2><p className="mt-1 text-xs text-slate-500">Required before evaluation</p></div>
        <span className="text-sm font-bold text-indigo-600">{passed}/{checks.length}</span>
      </div>
      <ul className="mt-4 space-y-3">
        {checks.map((check) => (
          <li key={check.label} className="flex gap-2.5 text-xs leading-5">
            <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-bold ${check.passed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>{check.passed ? "✓" : "·"}</span>
            <span><span className={`block font-semibold ${check.passed ? "text-slate-700" : "text-slate-500"}`}>{check.label}</span>{!check.passed && <span className="block text-slate-400">{check.hint}</span>}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
