import type { Problem } from "@/lib/domain/types";

export const ALL_PROBLEMS: Problem[] = [
  {
    id: "parking-lot",
    slug: "parking-lot",
    title: "Parking Lot",
    difficulty: "Intermediate",
    estimatedMinutes: 45,
    description:
      "Design a multi-floor parking facility that assigns a compatible spot, issues a ticket, calculates fees, processes payment, and preserves completed-session history.",
    focusAreas: ["Responsibility assignment", "Strategy pattern", "State management"],
    learningObjectives: [
      "Separate allocation from orchestration",
      "Model spot-vehicle compatibility cleanly",
      "Make pricing and payment policies replaceable"
    ],
    requirements: [
      { id: "r1", title: "Multi-floor availability", description: "Model floors, spots, and available/occupied capacity." },
      { id: "r2", title: "Compatible allocation", description: "Support motorcycle, car, and truck with compatible spot types." },
      { id: "r3", title: "Entry and ticketing", description: "Allocate a spot and create one active ticket per vehicle." },
      { id: "r4", title: "Exit and payment", description: "Calculate the fee, process payment, free the spot, and retain history." },
      { id: "r5", title: "Change-friendly design", description: "Make allocation, pricing, and payment methods replaceable." }
    ],
    constraints: [
      "No authentication, hardware sensors, or distributed systems are needed.",
      "Judge the design by evidence, not by matching one reference architecture.",
      "Completed tickets must remain available in history."
    ],
    edgeCases: [
      "Lot is full — no compatible spot available.",
      "Duplicate active session for the same vehicle plate.",
      "Payment fails mid-exit.",
      "Invalid or already-used ticket presented at exit.",
      "Concurrent entry requests for the last available spot."
    ],
    designHints: [
      { question: "Who owns the decision of which spot a vehicle gets?", reason: "If ParkingLot decides directly, it becomes hard to change the allocation algorithm later." },
      { question: "Can pricing rules change independently of spot assignment?", reason: "Hourly, flat-rate, and premium pricing have different logic — they should be isolated." },
      { question: "What happens when a new vehicle type (e.g. EV) is introduced?", reason: "If compatibility is hardcoded, you need to touch ParkingSpot every time." },
      { question: "Where does the session live between entry and exit?", reason: "A Session (or Ticket) captures the transient state — clarify who creates and owns it." }
    ]
  },

  {
    id: "elevator-system",
    slug: "elevator-system",
    title: "Elevator System",
    difficulty: "Intermediate",
    estimatedMinutes: 45,
    description:
      "Design a multi-elevator control system for a building. The system should dispatch cars efficiently, manage floor requests, track door state, and handle concurrent button presses.",
    focusAreas: ["State machine", "Scheduling strategy", "Concurrency safety"],
    learningObjectives: [
      "Model elevator state explicitly (idle/moving/stopped)",
      "Isolate the dispatch algorithm behind a Strategy interface",
      "Handle concurrent requests safely without implementing thread primitives"
    ],
    requirements: [
      { id: "r1", title: "Request handling", description: "Accept internal (in-car) and external (hall) button presses." },
      { id: "r2", title: "Car dispatch", description: "Assign the best available car to each pending request." },
      { id: "r3", title: "Door management", description: "Open, hold, and close doors safely; handle obstruction." },
      { id: "r4", title: "State tracking", description: "Track each car's direction, current floor, and load status." },
      { id: "r5", title: "Swappable scheduler", description: "Make the dispatch algorithm replaceable (SCAN, FCFS, priority)." }
    ],
    constraints: [
      "Assume the building has at most 50 floors and 8 cars.",
      "Do not design hardware drivers or a physical control panel.",
      "Model concurrent requests but do not implement threading primitives."
    ],
    edgeCases: [
      "All elevators are occupied — new request must queue.",
      "Emergency stop button pressed inside car.",
      "Door obstruction detected — door must re-open.",
      "Invalid floor number (negative or > building height).",
      "Power failure — cars should land at nearest floor."
    ],
    designHints: [
      { question: "What state transitions does an elevator car go through?", reason: "Idle → Moving → Stopped → Idle is the happy path; Emergency is a side transition." },
      { question: "Who decides which car responds to a hall button press?", reason: "The dispatch algorithm is the most likely thing to change — it belongs behind a strategy." },
      { question: "Can two simultaneous hall presses cause the same car to be assigned twice?", reason: "This is the classic concurrency scenario — clarify how requests are queued." }
    ]
  },

  {
    id: "vending-machine",
    slug: "vending-machine",
    title: "Vending Machine",
    difficulty: "Beginner",
    estimatedMinutes: 30,
    description:
      "Design a vending machine that manages product inventory, accepts payment, dispenses the selected item, and returns correct change. The machine must express its own state clearly.",
    focusAreas: ["State machine", "Payment abstraction", "Encapsulation"],
    learningObjectives: [
      "Model explicit machine states and valid transitions",
      "Hide payment method behind an abstraction",
      "Ensure inventory mutation is private to the machine"
    ],
    requirements: [
      { id: "r1", title: "Product inventory", description: "Track products, quantities, and prices per slot." },
      { id: "r2", title: "Payment acceptance", description: "Accept coins/notes and validate the amount against the item price." },
      { id: "r3", title: "Dispensing", description: "Release the item and compute correct change." },
      { id: "r4", title: "State machine", description: "Enforce valid transitions: Idle → ItemSelected → PaymentInserted → Dispensing." },
      { id: "r5", title: "Extensibility", description: "Make payment method and product type replaceable without rewriting the core." }
    ],
    constraints: [
      "No network connectivity or remote management is required.",
      "Assume a single concurrent user at a time.",
      "Cancelled transactions must refund all inserted money."
    ],
    edgeCases: [
      "Item out of stock.",
      "Insufficient funds inserted.",
      "Transaction cancelled mid-flow.",
      "Dispenser jams — item not released.",
      "Exact change not available for return."
    ],
    designHints: [
      { question: "What states can the machine be in at any given moment?", reason: "An explicit state prevents invalid operations like dispensing before payment." },
      { question: "Should the machine know whether payment is by card or coin?", reason: "Hardcoding payment type makes adding contactless payment a large refactor." },
      { question: "Who is responsible for knowing that a slot is empty?", reason: "Inventory mutation should be private — external code shouldn't decrement stock directly." }
    ]
  },

  {
    id: "library-management",
    slug: "library-management",
    title: "Library Management",
    difficulty: "Advanced",
    estimatedMinutes: 60,
    description:
      "Design a library system that manages book copies, member accounts, borrowing and returns, due-date tracking, fine calculation, and optional reservations.",
    focusAreas: ["Aggregate design", "Policy isolation", "Domain invariants"],
    learningObjectives: [
      "Distinguish Book (title) from BookCopy (physical item)",
      "Isolate fine policy so it can change independently",
      "Enforce loan limit as a domain invariant"
    ],
    requirements: [
      { id: "r1", title: "Catalog and copies", description: "Distinguish between a Book (title/ISBN) and a BookCopy (loanable item)." },
      { id: "r2", title: "Borrowing flow", description: "Check member eligibility, reserve a copy, record the loan and due date." },
      { id: "r3", title: "Return and fines", description: "Accept returns, calculate overdue fines, and update copy availability." },
      { id: "r4", title: "Member accounts", description: "Track active loans, accumulated fines, and borrowing limits per member." },
      { id: "r5", title: "Reservations", description: "Allow members to reserve a title; notify when a copy becomes available." }
    ],
    constraints: [
      "No UI, authentication, or external notification system is required.",
      "Fine policy and loan limits must be changeable without modifying the Loan entity.",
      "Assume single-threaded access; skip distributed concurrency concerns."
    ],
    edgeCases: [
      "Member attempts to borrow with unpaid fines.",
      "Last copy of a title is returned — trigger reservation notification.",
      "Member reaches borrowing limit — reject new loan.",
      "Book reported lost — handle separately from return.",
      "Expired reservation — release hold and notify next in queue."
    ],
    designHints: [
      { question: "Is a 'book' the same as a 'copy of a book'?", reason: "A library has one record for 'Clean Code' but multiple physical copies — they have different lifecycles." },
      { question: "Who owns the rule that a member can borrow at most 5 books?", reason: "If this limit is hardcoded inside Loan, changing it to 3 or 10 requires touching core entities." },
      { question: "Should Loan know how to calculate fines?", reason: "Fine calculation is a policy that can change — isolating it makes the Loan entity stable." }
    ]
  },

  {
    id: "movie-ticket-booking",
    slug: "movie-ticket-booking",
    title: "Movie Ticket Booking",
    difficulty: "Intermediate",
    estimatedMinutes: 45,
    description:
      "Design an online movie ticket booking system. Learners should handle movie listings, show schedules, seat selection, booking, payment, and ticket generation for a multiplex cinema.",
    focusAreas: ["Seat locking", "Concurrency handling", "Pricing strategy"],
    learningObjectives: [
      "Model Movie, Show, Screen, and Seat as distinct entities",
      "Handle concurrent seat selection safely",
      "Separate dynamic pricing from booking flow"
    ],
    requirements: [
      { id: "r1", title: "Movie and show listing", description: "Display available movies, their showtimes, and the theater/screen they run in." },
      { id: "r2", title: "Seat selection", description: "Allow users to browse available seats and hold selected seats temporarily." },
      { id: "r3", title: "Booking and payment", description: "Confirm booking after successful payment; release held seats if payment fails." },
      { id: "r4", title: "Ticket generation", description: "Generate a unique ticket per confirmed seat with show and seat details." },
      { id: "r5", title: "Cancellation", description: "Allow users to cancel bookings and define a refund policy." }
    ],
    constraints: [
      "Do not design a physical kiosk or hardware integration.",
      "Assume payment is handled by an external payment gateway.",
      "No recommendation engine or content management is required."
    ],
    edgeCases: [
      "Two users select the same seat simultaneously.",
      "Payment fails after seats are held — seats must be released.",
      "Show is cancelled — all bookings must be refunded.",
      "User attempts to book a seat in a past show.",
      "Seat hold expires before payment completes."
    ],
    designHints: [
      { question: "What happens between 'seat selected' and 'payment confirmed'?", reason: "A seat hold (temporary lock) prevents double-booking — who owns and expires this hold?" },
      { question: "Are two seats in the same row always the same price?", reason: "Premium seats, VIP rows, and matinee pricing suggest pricing is a separate concern." },
      { question: "What makes a 'Show' different from a 'Movie'?", reason: "A movie runs multiple times — each Show is a scheduled instance with its own seats and availability." },
      { question: "What should happen to a booking when payment fails?", reason: "Held seats must be released so other users can book them — this is a compensating transaction." }
    ]
  }
];

export function getProblemById(id: string): Problem | undefined {
  return ALL_PROBLEMS.find((p) => p.id === id);
}

export function getProblemBySlug(slug: string): Problem | undefined {
  return ALL_PROBLEMS.find((p) => p.slug === slug);
}
