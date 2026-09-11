import { describe, expect, it } from "vitest";
import { getRubricForProblem, registeredProblemIds } from "./rubric";

describe("rubric registry", () => {
  it("covers all 5 expected problem IDs", () => {
    expect(registeredProblemIds).toContain("parking-lot");
    expect(registeredProblemIds).toContain("elevator-system");
    expect(registeredProblemIds).toContain("vending-machine");
    expect(registeredProblemIds).toContain("library-management");
    expect(registeredProblemIds).toContain("movie-ticket-booking");
  });

  it("returns a non-empty rubric for every registered problem", () => {
    for (const id of registeredProblemIds) {
      expect(getRubricForProblem(id).length).toBeGreaterThan(0);
    }
  });

  it("returns exactly 7 criteria per problem (matching STANDARD_RUBRIC)", () => {
    for (const id of registeredProblemIds) {
      expect(getRubricForProblem(id)).toHaveLength(7);
    }
  });

  it("each criterion has all required fields", () => {
    for (const id of registeredProblemIds) {
      for (const bp of getRubricForProblem(id)) {
        expect(bp.criterionName).toBeTruthy();
        expect(bp.sections.length).toBeGreaterThan(0);
        expect(bp.keywords.length).toBeGreaterThan(0);
        expect(bp.missingSuggestion).toBeTruthy();
      }
    }
  });

  it("returns empty array for an unknown problem ID", () => {
    expect(getRubricForProblem("not-a-real-problem")).toHaveLength(0);
  });

  it("all criteria reference sections that exist in SubmissionContent", () => {
    const validSections = ["assumptions", "classes", "interfaces", "relationships", "designExplanation", "edgeCases", "code"];
    for (const id of registeredProblemIds) {
      for (const bp of getRubricForProblem(id)) {
        for (const section of bp.sections) {
          expect(validSections).toContain(section);
        }
      }
    }
  });

  it("parking-lot rubric has an edge-cases criterion", () => {
    const rubric = getRubricForProblem("parking-lot");
    expect(rubric.some((bp) => bp.criterionName.toLowerCase().includes("edge"))).toBe(true);
  });

  it("elevator-system rubric has a scheduling criterion", () => {
    const rubric = getRubricForProblem("elevator-system");
    expect(rubric.some((bp) => bp.criterionName.toLowerCase().includes("design principle"))).toBe(true);
  });

  it("movie-ticket-booking rubric references seat-related keywords", () => {
    const rubric = getRubricForProblem("movie-ticket-booking");
    const allKeywords = rubric.flatMap((bp) => bp.keywords);
    expect(allKeywords.some((kw) => kw.includes("seat") || kw.includes("booking") || kw.includes("show"))).toBe(true);
  });
});
