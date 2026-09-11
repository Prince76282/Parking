import type { Attempt, DeterministicCheck, SubmissionContent } from "@/lib/domain/types";
import { SUBMISSION_SECTIONS } from "@/lib/domain/types";

type SubmissionFormProps = {
  attempt: Attempt | null;
  checks: DeterministicCheck[];
  notice: string | null;
  onChange: (key: keyof SubmissionContent, value: string) => void;
  onSave: () => void;
  onSubmit: () => void;
  onDismissNotice?: () => void;
};

const statusStyle = {
  DRAFT: "bg-slate-50 text-slate-600 ring-slate-200",
  SUBMITTED: "bg-blue-50 text-blue-700 ring-blue-200",
  EVALUATING: "bg-violet-50 text-violet-700 ring-violet-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  FAILED: "bg-rose-50 text-rose-700 ring-rose-200"
} as const;

const statusLabel = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  EVALUATING: "Evaluating…",
  COMPLETED: "Completed",
  FAILED: "Failed"
} as const;

export function SubmissionForm({
  attempt,
  checks,
  notice,
  onChange,
  onSave,
  onSubmit,
  onDismissNotice
}: SubmissionFormProps) {
  if (!attempt) {
    return (
      <section className="grid min-h-[480px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-panel">
        <div className="max-w-sm">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-2xl text-indigo-600">
            ✦
          </span>
          <h2 className="mt-5 text-xl font-bold text-slate-900">Ready to design?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Start an attempt from the problem library. You will get a focused workspace and
            an evidence-based review when you submit.
          </p>
        </div>
      </section>
    );
  }

  const isEditable = attempt.status === "DRAFT";
  const isReady = checks.every((check) => check.passed);
  const totalCharacters = Object.values(attempt.content).join("").length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-panel animate-fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Attempt {attempt.sequence}
            </h2>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset ${statusStyle[attempt.status]}`}
            >
              {statusLabel[attempt.status]}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Structured submission · {totalCharacters.toLocaleString()} characters
          </p>
        </div>
        {isEditable && (
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              id="save-draft"
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Save draft
            </button>
            <button
              onClick={onSubmit}
              disabled={!isReady}
              id="submit-design"
              className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Submit design →
            </button>
          </div>
        )}
      </div>

      {/* Notice */}
      {notice && (
        <div className="mx-5 mt-4 flex items-start justify-between gap-3 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800 sm:mx-6">
          <span>{notice}</span>
          {onDismissNotice && (
            <button
              onClick={onDismissNotice}
              className="shrink-0 text-indigo-400 hover:text-indigo-600 text-base leading-none"
              aria-label="Dismiss notice"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Sections */}
      <div className="divide-y divide-slate-100 px-5 sm:px-6">
        {SUBMISSION_SECTIONS.map((section, index) => (
          <div key={section.key} className="py-5">
            <div className="mb-3 flex items-start gap-3">
              <span
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                  section.required
                    ? "bg-indigo-50 text-indigo-600"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {index + 1}
              </span>
              <div>
                <label htmlFor={section.key} className="block text-sm font-bold text-slate-800">
                  {section.title}
                  {!section.required && (
                    <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                      optional
                    </span>
                  )}
                </label>
                <p className="mt-0.5 text-xs text-slate-500">{section.prompt}</p>
              </div>
            </div>
            <textarea
              id={section.key}
              value={attempt.content[section.key]}
              onChange={(e) => onChange(section.key, e.target.value)}
              placeholder={section.placeholder}
              disabled={!isEditable}
              rows={section.rows}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-300 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 disabled:cursor-default disabled:bg-slate-50 disabled:text-slate-500 transition font-mono"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
