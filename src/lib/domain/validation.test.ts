import { describe, expect, it } from "vitest";
import { blankSubmission, SUBMISSION_SECTIONS } from "./types";
import { getSubmissionLength, isSubmittable, runDeterministicChecks } from "./validation";

// ─── Happy path ───────────────────────────────────────────────────────────────

describe("validation — happy path", () => {
  it("accepts a complete, well-filled submission", () => {
    const content = {
      assumptions: "Partial hours rounded up. Car can use large spot.",
      classes:
        "ParkingLot — coordinates entry and exit.\nParkingFloor — contains spots.\nParkingSpot — owns occupancy and compatibility.\nVehicle — stores plate and type.",
      interfaces:
        "AllocationStrategy — findSpot(vehicle): Spot | null\nPricingStrategy — calculateFee(entry, exit, spotType): Money",
      relationships:
        "ParkingLot contains ParkingFloor[]. ParkingFloor contains ParkingSpot[]. Session connects vehicle, spot, ticket via interfaces.",
      designExplanation:
        "Entry: AllocationStrategy selects compatible spot, Session is created. Exit: PricingStrategy computes fee, PaymentProcessor handles payment, spot freed and session archived.",
      edgeCases:
        "Full lot: return error before issuing ticket. Duplicate active session: reject. Payment failure: roll back. Invalid ticket: error.",
      code: ""
    };

    const checks = runDeterministicChecks(content);
    expect(checks.filter((c) => !c.passed)).toHaveLength(0);
    expect(isSubmittable(content)).toBe(true);
  });
});

// ─── Blank submission ─────────────────────────────────────────────────────────

describe("validation — blank submission", () => {
  it("rejects an entirely blank submission", () => {
    expect(isSubmittable(blankSubmission())).toBe(false);
  });

  it("returns at least one failed check for a blank submission", () => {
    const failed = runDeterministicChecks(blankSubmission()).filter((c) => !c.passed);
    expect(failed.length).toBeGreaterThan(0);
  });

  it("calculates zero length for a blank submission", () => {
    expect(getSubmissionLength(blankSubmission())).toBe(0);
  });
});

// ─── Section length threshold ─────────────────────────────────────────────────

describe("validation — section length threshold", () => {
  it("rejects a required section that is 17 characters (below 18 threshold)", () => {
    const content = { ...blankSubmission(), assumptions: "Too short to pass" }; // 17 chars
    const checks = runDeterministicChecks(content);
    const check = checks.find((c) => c.label.toLowerCase().includes("assumption"));
    expect(check?.passed).toBe(false);
  });

  it("accepts a required section that is exactly 18 characters", () => {
    const content = { ...blankSubmission(), assumptions: "Meets the minimum." }; // 18 chars
    const checks = runDeterministicChecks(content);
    const check = checks.find((c) => c.label.toLowerCase().includes("assumption"));
    expect(check?.passed).toBe(true);
  });

  it("rejects whitespace-only content (18 spaces)", () => {
    const content = { ...blankSubmission(), assumptions: "                  " }; // 18 spaces
    const checks = runDeterministicChecks(content);
    const check = checks.find((c) => c.label.toLowerCase().includes("assumption"));
    expect(check?.passed).toBe(false);
  });
});

// ─── Duplicate class names ────────────────────────────────────────────────────

describe("validation — duplicate class detection", () => {
  it("flags duplicate class names in the classes section", () => {
    const content = {
      ...blankSubmission(),
      classes: "ParkingLot — orchestrator.\nParkingSpot — spot.\nParkingLot — duplicate."
    };
    const check = runDeterministicChecks(content).find((c) =>
      c.label.toLowerCase().includes("duplicate")
    );
    expect(check?.passed).toBe(false);
  });

  it("allows the same name to appear in relationships prose", () => {
    const content = {
      ...blankSubmission(),
      classes: "ParkingLot — orchestrator.\nParkingSpot — occupancy.",
      relationships: "ParkingLot contains ParkingSpot[]."
    };
    const check = runDeterministicChecks(content).find((c) =>
      c.label.toLowerCase().includes("duplicate")
    );
    expect(check?.passed).toBe(true);
  });
});

// ─── Interfaces check ─────────────────────────────────────────────────────────

describe("validation — interfaces check", () => {
  it("fails when interfaces section is blank", () => {
    const check = runDeterministicChecks(blankSubmission()).find((c) =>
      c.label.toLowerCase().includes("interface")
    );
    expect(check?.passed).toBe(false);
  });

  it("passes when interfaces section meets the minimum", () => {
    const content = {
      ...blankSubmission(),
      interfaces: "AllocationStrategy — findSpot(v): Spot"
    };
    const check = runDeterministicChecks(content).find((c) =>
      c.label.toLowerCase().includes("interface")
    );
    expect(check?.passed).toBe(true);
  });
});

// ─── Overall character count ──────────────────────────────────────────────────

describe("validation — overall character count", () => {
  const requiredKeys = SUBMISSION_SECTIONS.filter((s) => s.required).map((s) => s.key);

  it("rejects a submission just below the 300-character threshold", () => {
    // 5 chars per required section: 6 required sections * 5 = 30 — well below 300
    const small: Record<string, string> = {};
    for (const key of requiredKeys) small[key] = "xxxxx";
    const content = { ...blankSubmission(), ...small };
    const check = runDeterministicChecks(content).find((c) =>
      c.label.toLowerCase().includes("enough detail")
    );
    expect(check?.passed).toBe(false);
  });

  it("accepts a submission that meets the 300-character threshold", () => {
    // 60 chars per required section: 6 required * 60 = 360
    const big: Record<string, string> = {};
    for (const key of requiredKeys) big[key] = "a".repeat(60);
    const content = { ...blankSubmission(), ...big };
    const check = runDeterministicChecks(content).find((c) =>
      c.label.toLowerCase().includes("enough detail")
    );
    expect(check?.passed).toBe(true);
  });
});
