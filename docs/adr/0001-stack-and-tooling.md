# ADR 0001: Stack and tooling

- Status: accepted (2026-10-21)

## Context

The starting repository was a vanilla HTML/CSS/JS quiz dashboard with no package manifest,
build, tests or linting. The CloudQuest spec (`docs/spec/`) calls for typed content schemas,
pure and unit-tested domain logic, and an interactive Architecture Canvas with accessible
alternatives. The spec says to prefer existing conventions and not introduce a framework
without clear need; there were no framework conventions to preserve.

## Decision

- Vite + React 19 + TypeScript (strict, `noUncheckedIndexedAccess`) as a client-only app.
- Vitest for unit tests; oxlint (the Vite template default) for linting; Prettier for formatting.
- npm, with `package-lock.json` committed.
- Plain CSS with design tokens as custom properties. No UI or styling library yet.
- The legacy dashboard is archived under `legacy/` for reference, not extended.

## Why a framework is justified

The canvas needs stateful interactive components, the content model benefits from strict types
shared across UI and pure logic, and typed validation of content and persisted data is easier
to keep honest with a compiler. A modular monolith in one Vite app avoids premature
microservices.

## Consequences

- Dependencies are few (React, React DOM; dev tooling only otherwise).
- The canvas library decision is deferred to Phase 4 and gets its own ADR.
- Auth and persistence decisions are deferred to Phases 3 and 5.

## Alternatives considered

- Keep vanilla JS: lowest setup cost, but weak support for typed schemas and the canvas.
- Next.js: no server-side requirement yet; adds deployment and complexity without need.
