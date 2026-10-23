# ADR 0006: Local-first persistence with validated storage

- Status: accepted (2026-10-22)

## Context

The spec asks for guest-first learning, progress derived from evidence, revision that reschedules,
minimal personal data, and documented export and deletion. No trusted authentication provider or
backend is configured, and the spec forbids pretending otherwise.

## Decision

- Store learner data in the browser (`localStorage`), as one versioned JSON document.
- Treat storage as untrusted input: every entry is validated on load (`features/progress/schema.ts`).
  A damaged entry is skipped, not fatal; unreadable data is preserved in a backup key.
- Save inside each action (not in an effect), so rapid actions cannot overwrite each other.
- Keep all state changes in a pure reducer, and the review schedule in a pure, deterministic
  scheduler (again: 10 minutes; hard: x1.2; recalled: 1, 3, 7, 14, 30 day ladder, max 60 days).
- Derive progress only from recorded attempts. "Secure" needs two different scenarios answered
  correctly without hints; with fewer scenarios available it is reported as not yet possible.
- Provide export (JSON download) and deletion (with confirmation) in the product, and document
  the model in `docs/privacy-and-data.md`.

## Consequences

- No account, no server, no tracking: nothing leaves the device.
- Data is per browser and unbacked-up; the UI and docs say so.
- Adding real accounts later means replacing `infrastructure/storage.ts` and the provider, not the
  domain logic, because the store shape and reducer are independent of where data lives.
- A two-tab race is resolved last-write-wins via the `storage` event, which is acceptable for a
  single learner but would not be for shared data.
