"use client";

import { useState } from "react";
import type { Attempt, CriterionResult } from "@/lib/domain/types";
import { STANDARD_RUBRIC } from "@/lib/domain/types";

// ─── Criterion card ────────────────────────────────────────────────────────────

function percentColor(pct: number) {
  if (pct >= 0.8) return { bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700", ring: "ring-emerald-200" };
  if (pct >= 0.6) return { bar: "bg-amber-400", badge: "bg-amber-50 text-amber-700", ring: "ring-amber-200" };
  return { bar: "bg-rose-400", badge: "bg-rose-50 text-rose-700", ring: "ring-rose-200" };
}

function CriterionCard({ criterion }: { criterion: CriterionResult }) {
  const [open, setOpen] = useState(false);
  const pct = criterion.score / criterion.maxScore;
  const colors = percentColor(pct);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        id={`criterion-${criterion.name.replace(/\s+/g, "-").toLowerCase()}`}
      >
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-slate-800">{criterion.name}</span>
            <div className="flex items-center gap-2">
              {criterion.evaluatorKind === "ai" && criterion.confidence < 0.7 && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">
                  ~{Math.round(criterion.confidence * 100)}% conf
                </span>
              )}
              <span className={`rounded-md px-2 py-0.5 text-xs font-extrabold ring-1 ring-inset ${colors.badge} ${colors.ring}`}>
                {criterion.score}/{criterion.maxScore}
              </span>
            </div>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
              style={{ width: `${pct * 100}%` }}
            />
          </div>
        </div>
        <span className="shrink-0 text-xs text-slate-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="grid gap-3 border-t border-slate-100 px-4 pb-4 pt-3 text-xs leading-5">
          {criterion.evaluatorKind === "ai" && (
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-600 ring-1 ring-violet-100">
              ✦ AI evaluated · {Math.round(criterion.confidence * 100)}% confidence
            </span>
          )}
          <div>
            <p className="font-bold uppercase tracking-wide text-emerald-600">Evidence</p>
            <p className="mt-0.5 text-slate-600">{criterion.evidence || "No specific evidence cited."}</p>
          </div>
          <div>
            <p className="font-bold uppercase tracking-wide text-amber-600">Concern</p>
            <p className="mt-0.5 text-slate-600">{criterion.concern}</p>
          </div>
          <div>
            <p className="font-bold uppercase tracking-wide text-indigo-600">Suggestion</p>
            <p className="mt-0.5 text-slate-600">{criterion.suggestion}</p>
          </div>
        </div>
      )}
    </article>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function FeedbackPanel({ attempt }: { attempt: Attempt | null }) {
  if (!attempt || attempt.status === "DRAFT") {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-lg text-violet-600">
          ✦
        </span>
        <h2 className="mt-3 text-sm font-bold text-slate-900">Evidence-based feedback</h2>
        <p className="mt-1.5 text-xs leading-5 text-slate-500">
          When you submit, each of the 7 rubric criteria is scored out of its weight
          (total 100 pts), with evidence from your design, a concern, and one concrete
          suggestion.
        </p>
        <ul className="mt-3 space-y-1">
          {STANDARD_RUBRIC.map((r) => (
            <li key={r.name} className="flex items-center justify-between gap-2 text-xs text-slate-400">
              <span>{r.name}</span>
              <span className="font-semibold">{r.weight} pts</span>
            </li>
          ))}
        </ul>
      </aside>
    );
  }

  if (attempt.status === "EVALUATING") {
    return (
      <aside className="overflow-hidden rounded-2xl border border-violet-100 bg-violet-50 p-5 shadow-panel">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-violet-500" />
          <p className="text-sm font-bold text-violet-800">Review in progress</p>
        </div>
        <p className="mt-1.5 text-xs leading-5 text-violet-600">
          Checking responsibilities, abstractions, extensibility, and edge cases…
        </p>
      </aside>
    );
  }

  if (attempt.status === "FAILED") {
    return (
      <aside className="rounded-2xl border border-rose-100 bg-rose-50 p-5 shadow-panel">
        <p className="text-sm font-bold text-rose-800">Evaluation failed</p>
        <p className="mt-1 text-xs leading-5 text-rose-600">
          Your submission is saved safely. Try submitting again — the evaluator may have timed out.
        </p>
      </aside>
    );
  }

  const evaluation = attempt.evaluation;
  if (!evaluation) return null;

  const overallPct = evaluation.overallScore / 100;
  const isAi = evaluation.evaluatorKind === "ai";

  const scoreLabel =
    overallPct >= 0.85
      ? "Excellent foundation"
      : overallPct >= 0.7
      ? "Good foundation"
      : overallPct >= 0.55
      ? "Developing — keep iterating"
      : "Needs significant work";

  return (
    <section className="space-y-4">
      {/* Score card */}
      <aside className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-panel">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white">
          <div className="flex items-start justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-100">
              Overall design score
            </p>
            {isAi && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
                ✦ AI
              </span>
            )}
          </div>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-5xl font-bold tracking-tight">{evaluation.overallScore}</span>
            <div className="mb-1.5">
              <span className="block text-sm font-semibold text-indigo-100">/ 100</span>
              <span className="block text-xs text-indigo-200">{scoreLabel}</span>
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{ width: `${evaluation.overallScore}%` }}
            />
          </div>
        </div>

        {/* Strengths + Improvements */}
        <div className="p-5 space-y-4">
          {evaluation.strengths.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-emerald-600">Strengths</p>
              <ul className="mt-2 space-y-1.5">
                {evaluation.strengths.map((s) => (
                  <li key={s} className="flex gap-2 text-xs leading-5 text-slate-600">
                    <span className="text-emerald-500 shrink-0">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.improvements.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-amber-600">Improvements</p>
              <ul className="mt-2 space-y-1.5">
                {evaluation.improvements.map((imp) => (
                  <li key={imp} className="flex gap-2 text-xs leading-5 text-slate-600">
                    <span className="text-amber-500 shrink-0">↗</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.nextAttemptFocus.length > 0 && (
            <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3">
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-indigo-600">
                Before your next attempt
              </p>
              <ol className="mt-2 space-y-1.5 list-decimal list-inside">
                {evaluation.nextAttemptFocus.map((focus) => (
                  <li key={focus} className="text-xs leading-5 text-indigo-800">
                    {focus}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </aside>

      {/* Criterion breakdown */}
      <div className="space-y-2">
        <h2 className="px-1 text-sm font-bold text-slate-900">Rubric breakdown</h2>
        {evaluation.criteria.map((criterion) => (
          <CriterionCard key={criterion.name} criterion={criterion} />
        ))}
      </div>
    </section>
  );
}
