# CloudQuest (working name)

**Learn cloud by solving real-world challenges.**

> **Unofficial educational project.** CloudQuest is not affiliated with Microsoft, AWS, or
> Google. It does not reproduce official certification exam questions. The name "CloudQuest" is
> provisional: domain, existing-product and trademark availability have not been checked.

## Current status: Phase 1 (app shell)

The landing page, guest entry and workspace shell work. **The learning activities themselves are
not built yet**: the workspace is honest about this and labels them as planned.

| Capability                                                 | Status                                                                                               |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Vite + React + strict TypeScript, tests, CI workflow       | Implemented (CI workflow not yet run on GitHub)                                                      |
| Typed content model and pack validator                     | Implemented, unit-tested                                                                             |
| Legacy AZ-900 question set as a pack                       | Implemented as **draft, unreviewed**                                                                 |
| Landing page and guest entry (no sign-up)                  | Implemented                                                                                          |
| Responsive workspace shell and navigation                  | Implemented                                                                                          |
| Learning tracks overview (availability from content state) | Implemented. Informational only: no track is available yet, so none can be started or switched to    |
| Design tokens with tested contrast                         | Implemented                                                                                          |
| Offline notice, error fallback, not-found, empty state     | Implemented                                                                                          |
| Loading states                                             | Not yet: nothing loads asynchronously. Added with the first feature that needs one                   |
| Scenario Lab, hints, feedback, transfer retry              | Planned (Phase 2)                                                                                    |
| Attempts, revision scheduler, progress                     | Planned (Phase 3)                                                                                    |
| Architecture Canvas and simulation                         | Planned (Phase 4)                                                                                    |
| Track registry for multiple packs, second pack, demo auth  | Planned (Phase 5)                                                                                    |
| Real authentication                                        | Not configured. Only clearly labelled demo screens will be built unless a trusted provider is set up |
| Full accessibility and responsive audit                    | Planned (Phase 6). Phase 1 checks are listed under "Accessibility so far"                            |

## Setup

Requires Node.js (developed on v22) and npm. Dependencies are locked in `package-lock.json`.

```bash
npm install
npm run dev          # start the dev server
npm run lint         # oxlint
npm run typecheck    # tsc -b (strict)
npm test             # vitest run
npm run test:watch   # vitest in watch mode
npm run build        # typecheck + production build into dist/
npm run preview      # serve the production build
npm run format       # prettier --write
npm run format:check # prettier --check
```

Format check, lint, typecheck, tests and build all passed at the end of Phase 1. The pages were
also loaded in headless Chromium at desktop and mobile widths, with no console errors and no
horizontal overflow. That is a smoke check, not a cross-browser or assistive-technology audit.

## Project layout

```text
src/
  app/                 Routing (hash-based), workspace shell, navigation, pages
  components/          Reusable UI: status chip, empty state, offline banner, error boundary
  content/
    packs/             Versioned content packs
    registry.ts        All packs the app knows about
  domain/              Pure types and rules (content model, pack validation)
  features/tracks/     Track catalog and availability rules
  styles/              Design tokens, contrast helpers, global and component styles
.github/workflows/     CI: format, lint, typecheck, test, build
docs/
  spec/                Original product and engineering spec (target design, not current state)
  adr/                 Architecture decision records
legacy/cloudready/     Original vanilla dashboard, kept unchanged for reference only
```

Folders named in the spec for later phases (`infrastructure/` and the other `features/*`) are
created when the code that belongs in them exists.

## Accessibility so far

Skip link, one `main` landmark, labelled navigation with `aria-current`, visible focus ring,
reduced-motion support, 44px minimum touch targets, and status shown by icon plus text rather
than colour alone. Focus moves to the page and the tab title updates on navigation. Colour
contrast for text, focus ring and interactive borders is asserted in `src/styles/tokens.test.ts`.
Screen-reader and cross-browser testing have not been done.

## Content policy

- Scenarios and questions are original study prompts, never official exam items.
- Every pack and scenario carries a status (`draft`, `reviewed`, `archived`), sources, and a
  review date when reviewed. `validatePack` rejects a pack that claims to be reviewed without
  review metadata, and tests run it over every registered pack.
- The only pack today (`azure-fundamentals-legacy`) is **draft**. Its objective set version is
  `unverified`, objective descriptions are domain labels rather than official wording, and the
  source links were carried over from the legacy dashboard and have not been re-checked.

## Known limitations

- The legacy questions are plain knowledge checks, not the scenario-style challenges the
  product aims for.
- The legacy dashboard's sample metrics and seeded revision items were deliberately **not**
  carried over, because they were not derived from real activity.
- No persistence, auth, or analytics exist yet. Guest mode is simply the default: nothing is
  stored, and "Guest mode" in the header does not represent a saved identity.
- The offline notice relies on the browser's online/offline signal, which can be wrong. There is
  no service worker, so reloading while offline fails.
- The CI workflow has not been run on GitHub yet; it mirrors the local scripts.

## Security and privacy

No secrets, cloud credentials, or provisioning are involved. Browser local storage (planned for
demo progress) is not secure account storage and can be cleared. Real accounts will require a
trusted auth provider with server-side ownership checks; this is not configured.

## Documentation

- `docs/spec/` — the original brief, requirements, flows, design system, architecture, domain
  model and build plan, plus the build prompt. Treat as the target, not the current state.
- `docs/adr/` — decisions made so far (stack and tooling; evaluators as typed data; hash routing).
