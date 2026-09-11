"use client";

import { useState } from "react";
import { ALL_PROBLEMS } from "@/lib/data/problems";
import type { Problem } from "@/lib/domain/types";

export function useProblemLibrary() {
  const [activeProblemId, setActiveProblemId] = useState<string>(ALL_PROBLEMS[0].id);

  const activeProblem: Problem =
    ALL_PROBLEMS.find((p) => p.id === activeProblemId) ?? ALL_PROBLEMS[0];

  return {
    problems: ALL_PROBLEMS,
    activeProblem,
    activeProblemId,
    selectProblem: setActiveProblemId
  };
}
