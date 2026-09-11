import type { DeterministicCheck, SubmissionContent } from "./types";
import { SUBMISSION_SECTIONS } from "./types";

/** Total character count across all required sections. */
export function getSubmissionLength(content: SubmissionContent): number {
  const required = SUBMISSION_SECTIONS.filter((s) => s.required).map((s) => s.key);
  return required.map((k) => content[k]).join(" ").trim().length;
}

/**
 * Deterministic pre-submission checks.
 * These run client-side in real time as the learner types.
 * All checks must pass before submission is enabled.
 */
export function runDeterministicChecks(content: SubmissionContent): DeterministicCheck[] {
  const MIN_SECTION_LENGTH = 18;

  // ── Required section checks ─────────────────────────────────────────────────
  const sectionChecks: DeterministicCheck[] = SUBMISSION_SECTIONS.filter(
    (s) => s.required
  ).map((section) => ({
    label: `${section.title} is provided`,
    passed: content[section.key].trim().length >= MIN_SECTION_LENGTH,
    hint: `Add at least ${MIN_SECTION_LENGTH} characters to the "${section.title}" section.`
  }));

  // ── Overall length check ────────────────────────────────────────────────────
  const lengthCheck: DeterministicCheck = {
    label: "Submission has enough detail",
    passed: getSubmissionLength(content) >= 300,
    hint: "Aim for at least 300 characters across the required sections."
  };

  // ── Duplicate class names ───────────────────────────────────────────────────
  const classLines = content.classes
    .split(/\r?\n/)
    .map((line) => line.trim().match(/^(?:[-•]?\s*)?([A-Z][A-Za-z]+)/)?.[1])
    .filter((name): name is string => Boolean(name));
  const normalised = classLines.map((n) => n.toLowerCase());
  const duplicateClasses = normalised.some(
    (n, i) => normalised.indexOf(n) !== i
  );

  const duplicateCheck: DeterministicCheck = {
    label: "No duplicate class names",
    passed: !duplicateClasses,
    hint: "Each class name should appear once in the Classes section."
  };

  // ── Has at least one interface ──────────────────────────────────────────────
  const interfaceCheck: DeterministicCheck = {
    label: "At least one interface / abstraction defined",
    passed: content.interfaces.trim().length >= MIN_SECTION_LENGTH,
    hint: "Define at least one interface or abstract type."
  };

  return [...sectionChecks, lengthCheck, duplicateCheck, interfaceCheck];
}

export function isSubmittable(content: SubmissionContent): boolean {
  return runDeterministicChecks(content).every((check) => check.passed);
}
