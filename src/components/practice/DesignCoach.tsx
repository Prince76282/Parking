"use client";

import { useState } from "react";
import type { DesignHint } from "@/lib/domain/types";

interface DesignCoachProps {
  hints: DesignHint[];
  problemTitle: string;
}

export function DesignCoach({ hints, problemTitle }: DesignCoachProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());

  function toggleHint(index: number) {
    setRevealedHints((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <aside className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/60 shadow-panel">
      {/* Header — always visible */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-amber-50 transition"
        aria-expanded={isOpen}
        id="design-coach-toggle"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-400 text-sm text-white">
            💡
          </span>
          <div>
            <p className="text-sm font-bold text-amber-900">Design Coach</p>
            <p className="text-xs text-amber-700">
              Questions to think about before submitting
            </p>
          </div>
        </div>
        <span className="text-amber-500 text-sm">{isOpen ? "▲" : "▼"}</span>
      </button>

      {/* Hint list */}
      {isOpen && (
        <div className="border-t border-amber-200 px-5 pb-5 pt-3">
          <p className="mb-3 text-xs font-semibold text-amber-700">
            For <strong>{problemTitle}</strong> — click a question to see why it matters.
            These hints point you toward important design decisions without revealing the answer.
          </p>
          <ol className="space-y-2">
            {hints.map((hint, i) => (
              <li key={i}>
                <button
                  onClick={() => toggleHint(i)}
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-left transition hover:border-amber-300 hover:bg-amber-50"
                  id={`hint-${i}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{hint.question}</p>
                      {revealedHints.has(i) && (
                        <p className="mt-1.5 text-xs leading-5 text-slate-500 border-t border-amber-100 pt-1.5">
                          <span className="font-semibold text-amber-700">Why it matters: </span>
                          {hint.reason}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[10px] text-amber-600 italic">
            The coach encourages thinking — it does not reveal the reference solution.
          </p>
        </div>
      )}
    </aside>
  );
}
