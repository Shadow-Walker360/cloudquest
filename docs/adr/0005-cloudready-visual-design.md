# ADR 0005: Adopt the CloudReady visual design

- Status: accepted (2026-10-22). Supersedes the dark navy palette suggested in
  `docs/spec/03-design-system-and-ux.md`.

## Context

Phase 0 and 1 followed the spec's suggested dark navy palette. The product owner preferred the
look of the original CloudReady dashboard (`legacy/cloudready/`): light canvas, white sidebar,
gradient hero banner, tinted icon tiles, soft panels and a lettered quiz card.

## Decision

Recreate the CloudReady design in the React app, driven entirely by design tokens
(`src/styles/tokens.css`) and a few small components (`Hero`, `StatCard`, `Panel`, `PageHeading`,
`Icon`), so the look can be adjusted in one place.

Kept: the layout, gradients, type (Inter), card and pill styling, off-canvas mobile menu, and the
lettered answer rows. Inter is self-hosted through `@fontsource-variable/inter`, so the app makes
no third-party font requests.

Changed, deliberately, for legibility and honesty:

- Text, links and buttons use `#1a68d6`, not the original `#287ff0` (3.9:1 on white). The original
  blue remains for decorative fills.
- Muted text is `#5b6779`, not `#929bad` (2.8:1). No text is below 12px (the original used 9-11px).
- The original's fabricated numbers (76/100 readiness, 78% accuracy, 42 questions, 3 reviews due)
  and its "Build your streak" card are not carried over. The same layout shows real values, and
  the sidebar card says nothing is saved yet.
- There is no dark theme.

## Consequences

- Every text/background pair is asserted in `src/styles/tokens.test.ts`, so a palette change that
  harms contrast fails the build.
- The answer options keep a native, visually hidden radio group, so the lettered-card look does
  not cost keyboard or screen-reader behaviour.
- Mobile navigation is a drawer: hidden from the tab order when closed, the page behind it is
  `inert` while open, Escape closes it, and the menu button stays visible as the close control.
- Adding a dark theme later means a second token set, not component changes.
