/**
 * Rubric registry — maps each problem to per-problem CriterionBlueprints used
 * by the deterministic evaluator.
 *
 * Change Test A: Adding a new problem requires only a new entry in BLUEPRINTS.
 * Change Test B: Any Evaluator implementation receives these blueprints as input;
 *               swapping evaluators doesn't touch this registry.
 *
 * The scoring model is a 100-point weighted rubric (STANDARD_RUBRIC in types.ts).
 * Blueprints provide the keyword guidance; the weight comes from STANDARD_RUBRIC.
 */

import type { SubmissionSection } from "./types";

export interface CriterionBlueprint {
  /** Must exactly match a RubricCriterion name in STANDARD_RUBRIC. */
  criterionName: string;
  /** Submission sections that are relevant to this criterion. */
  sections: SubmissionSection[];
  /**
   * Domain-specific keywords the deterministic evaluator looks for (lowercased).
   * The AI evaluator receives these as rubric guidance, not hard constraints.
   */
  keywords: string[];
  /** Shown when the criterion scores poorly. */
  missingSuggestion: string;
}

/** All blueprints keyed by problem ID. */
const BLUEPRINTS: Record<string, CriterionBlueprint[]> = {
  "parking-lot": [
    {
      criterionName: "Requirement Understanding",
      sections: ["assumptions", "designExplanation"],
      keywords: ["ticket", "spot", "vehicle", "floor", "availability", "session"],
      missingSuggestion: "Trace the complete entry-to-exit flow including when availability changes."
    },
    {
      criterionName: "Class Responsibilities",
      sections: ["classes"],
      keywords: ["parkinglot", "parkingspot", "session", "ticket", "vehicle"],
      missingSuggestion: "Give every major class one focused responsibility and name its collaborators."
    },
    {
      criterionName: "Encapsulation & Abstraction",
      sections: ["classes", "interfaces"],
      keywords: ["interface", "abstract", "encapsul", "private", "protect"],
      missingSuggestion: "Define interfaces for the policies that can change (pricing, allocation, payment)."
    },
    {
      criterionName: "Coupling & Cohesion",
      sections: ["classes", "interfaces", "relationships"],
      keywords: ["strategy", "interface", "inject", "decouple", "depend"],
      missingSuggestion: "Separate allocation, pricing, and payment behaviour from ParkingLot orchestration."
    },
    {
      criterionName: "Extensibility",
      sections: ["assumptions", "classes", "interfaces", "designExplanation"],
      keywords: ["extend", "new", "strategy", "vehicle", "payment", "replac"],
      missingSuggestion: "Explain how a new vehicle type, payment method, or pricing rule is added."
    },
    {
      criterionName: "Design Principles & Patterns",
      sections: ["classes", "interfaces", "designExplanation"],
      keywords: ["solid", "srp", "ocp", "pattern", "factory", "strategy", "observer"],
      missingSuggestion: "Name the patterns that improve the design and explain why they help."
    },
    {
      criterionName: "Edge Cases & Testability",
      sections: ["edgeCases"],
      keywords: ["full", "duplicate", "invalid", "fail", "concurrent", "unavailable"],
      missingSuggestion: "Cover: full lot, duplicate active session, payment failure, invalid ticket, concurrency."
    }
  ],

  "elevator-system": [
    {
      criterionName: "Requirement Understanding",
      sections: ["assumptions", "designExplanation"],
      keywords: ["floor", "request", "direction", "door", "capacity", "dispatch"],
      missingSuggestion: "Trace a full cycle: button press → dispatch → arrival → door open/close."
    },
    {
      criterionName: "Class Responsibilities",
      sections: ["classes"],
      keywords: ["elevator", "controller", "request", "button", "door", "scheduler"],
      missingSuggestion: "Separate the car (hardware state) from controller (dispatch) and button (input)."
    },
    {
      criterionName: "Encapsulation & Abstraction",
      sections: ["classes", "interfaces"],
      keywords: ["interface", "abstract", "encapsul", "strategy", "state"],
      missingSuggestion: "Hide the scheduling algorithm behind a SchedulerStrategy interface."
    },
    {
      criterionName: "Coupling & Cohesion",
      sections: ["classes", "interfaces", "relationships"],
      keywords: ["decouple", "inject", "interface", "depend", "cohes"],
      missingSuggestion: "Ensure Controller does not directly instantiate concrete schedulers."
    },
    {
      criterionName: "Extensibility",
      sections: ["assumptions", "classes", "interfaces", "designExplanation"],
      keywords: ["extend", "new", "algorithm", "priority", "express", "replac"],
      missingSuggestion: "Show how SCAN can be replaced with FCFS or a priority algorithm."
    },
    {
      criterionName: "Design Principles & Patterns",
      sections: ["classes", "interfaces", "designExplanation"],
      keywords: ["state", "strategy", "observer", "command", "pattern", "solid"],
      missingSuggestion: "Consider State pattern for elevator lifecycle and Strategy for scheduling."
    },
    {
      criterionName: "Edge Cases & Testability",
      sections: ["edgeCases"],
      keywords: ["overload", "power", "stuck", "emergency", "concurrent", "invalid"],
      missingSuggestion: "Cover: overload, power failure, door obstruction, concurrent requests, invalid floor."
    }
  ],

  "vending-machine": [
    {
      criterionName: "Requirement Understanding",
      sections: ["assumptions", "designExplanation"],
      keywords: ["product", "coin", "payment", "dispense", "change", "slot"],
      missingSuggestion: "Walk through: selection → payment → validation → dispense → change return."
    },
    {
      criterionName: "Class Responsibilities",
      sections: ["classes"],
      keywords: ["machine", "slot", "product", "payment", "inventory", "display"],
      missingSuggestion: "Separate machine orchestrator from slot inventory, payment, and dispenser."
    },
    {
      criterionName: "Encapsulation & Abstraction",
      sections: ["classes", "interfaces"],
      keywords: ["interface", "state", "abstract", "encapsul", "private"],
      missingSuggestion: "Model machine states explicitly and hide payment methods behind an interface."
    },
    {
      criterionName: "Coupling & Cohesion",
      sections: ["classes", "interfaces", "relationships"],
      keywords: ["decouple", "interface", "inject", "strategy", "depend"],
      missingSuggestion: "Payment method should not be hardcoded — inject it via an interface."
    },
    {
      criterionName: "Extensibility",
      sections: ["assumptions", "classes", "interfaces", "designExplanation"],
      keywords: ["new", "extend", "refill", "category", "discount", "payment", "replac"],
      missingSuggestion: "Show how a new payment method or product category is added."
    },
    {
      criterionName: "Design Principles & Patterns",
      sections: ["classes", "interfaces", "designExplanation"],
      keywords: ["state", "strategy", "pattern", "solid", "srp", "ocp"],
      missingSuggestion: "State pattern for machine lifecycle; Strategy for payment method."
    },
    {
      criterionName: "Edge Cases & Testability",
      sections: ["edgeCases"],
      keywords: ["out of stock", "insufficient", "cancel", "refund", "timeout", "jam"],
      missingSuggestion: "Handle: out-of-stock, insufficient funds, cancelled transaction, dispenser jam."
    }
  ],

  "library-management": [
    {
      criterionName: "Requirement Understanding",
      sections: ["assumptions", "designExplanation"],
      keywords: ["book", "member", "borrow", "return", "catalog", "loan", "due"],
      missingSuggestion: "Trace: search → check availability → borrow → due date → return → fine."
    },
    {
      criterionName: "Class Responsibilities",
      sections: ["classes"],
      keywords: ["library", "catalog", "member", "loan", "reservation", "bookcopy"],
      missingSuggestion: "Separate catalog search from loan management, member accounts, and notification."
    },
    {
      criterionName: "Encapsulation & Abstraction",
      sections: ["classes", "interfaces"],
      keywords: ["interface", "abstract", "policy", "encapsul", "private", "invariant"],
      missingSuggestion: "Fine calculation policy should be behind an interface, not inside Loan."
    },
    {
      criterionName: "Coupling & Cohesion",
      sections: ["classes", "interfaces", "relationships"],
      keywords: ["decouple", "inject", "interface", "cohes", "depend", "aggregate"],
      missingSuggestion: "Book (title/ISBN) and BookCopy (loanable instance) should be separate entities."
    },
    {
      criterionName: "Extensibility",
      sections: ["assumptions", "classes", "interfaces", "designExplanation"],
      keywords: ["extend", "new", "reserv", "digital", "notification", "replac"],
      missingSuggestion: "Show how reservations, digital copies, or email notifications are added."
    },
    {
      criterionName: "Design Principles & Patterns",
      sections: ["classes", "interfaces", "designExplanation"],
      keywords: ["solid", "pattern", "observer", "strategy", "repository", "srp"],
      missingSuggestion: "Observer for notifications, Strategy for fine policy, Repository for persistence."
    },
    {
      criterionName: "Edge Cases & Testability",
      sections: ["edgeCases"],
      keywords: ["lost", "damaged", "overdue", "duplicate", "expired", "limit"],
      missingSuggestion: "Handle: lost/damaged books, overdue returns, duplicate loans, loan limit, expired reservations."
    }
  ],

  "movie-ticket-booking": [
    {
      criterionName: "Requirement Understanding",
      sections: ["assumptions", "designExplanation"],
      keywords: ["movie", "show", "seat", "booking", "ticket", "screen", "payment"],
      missingSuggestion: "Trace: search movie → select show → pick seats → pay → confirm ticket."
    },
    {
      criterionName: "Class Responsibilities",
      sections: ["classes"],
      keywords: ["movie", "show", "screen", "seat", "booking", "theater", "ticket"],
      missingSuggestion: "Separate Movie (metadata), Show (scheduled screening), Screen (physical venue), and Booking."
    },
    {
      criterionName: "Encapsulation & Abstraction",
      sections: ["classes", "interfaces"],
      keywords: ["interface", "abstract", "payment", "pricing", "seat", "encapsul"],
      missingSuggestion: "Seat lock/reservation and payment processing should be behind interfaces."
    },
    {
      criterionName: "Coupling & Cohesion",
      sections: ["classes", "interfaces", "relationships"],
      keywords: ["decouple", "inject", "interface", "depend", "cohes", "aggregate"],
      missingSuggestion: "Booking should not directly depend on a specific payment gateway — use an interface."
    },
    {
      criterionName: "Extensibility",
      sections: ["assumptions", "classes", "interfaces", "designExplanation"],
      keywords: ["extend", "new", "payment", "concession", "loyalty", "replac", "pricing"],
      missingSuggestion: "Show how dynamic pricing, loyalty discounts, or concession bundles are added."
    },
    {
      criterionName: "Design Principles & Patterns",
      sections: ["classes", "interfaces", "designExplanation"],
      keywords: ["solid", "pattern", "strategy", "factory", "observer", "lock", "saga"],
      missingSuggestion: "Consider Strategy for pricing tiers, Observer for notification, optimistic locking for seat concurrency."
    },
    {
      criterionName: "Edge Cases & Testability",
      sections: ["edgeCases"],
      keywords: ["sold out", "concurrent", "payment fail", "cancel", "double booking", "expired"],
      missingSuggestion: "Cover: sold-out show, concurrent seat selection, payment failure, cancellation, expired hold."
    }
  ]
};

export function getRubricForProblem(problemId: string): CriterionBlueprint[] {
  return BLUEPRINTS[problemId] ?? [];
}

export const registeredProblemIds = Object.keys(BLUEPRINTS);
