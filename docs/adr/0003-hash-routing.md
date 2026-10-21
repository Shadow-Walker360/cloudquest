# ADR 0003: Hash-based routing without a router dependency

- Status: accepted (2026-10-21)

## Context

Phase 1 needs a public landing page and a guest-accessible workspace with a handful of pages.
The prototype is a static client-side app with no server rewrites configured, and the spec asks
us to avoid unnecessary dependencies.

## Decision

Routes live in the URL hash (`#/`, `#/app`, `#/app/tracks`). Parsing is a small pure module
(`src/app/routes.ts`) with unit tests, and `useRoute` subscribes to `hashchange` through
`useSyncExternalStore`. No router library is added. On navigation the app updates the document
title and moves focus to the main landmark.

## Consequences

- Works on any static host with no rewrite rules, and deep links survive a refresh.
- Hash fragments cannot also be used for in-page anchors, so the skip link is a button.
- Routes are a closed union, so unknown paths render an explicit not-found page.
- If nested routes, data loading or route guards grow, revisit this and consider a router
  library. Real auth (Phase 5) may also prefer path-based URLs.
