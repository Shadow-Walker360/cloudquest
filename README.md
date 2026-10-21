# CloudQuest (working name)

**Learn cloud by solving real-world challenges.**

> **Unofficial educational project.** CloudQuest is not affiliated with Microsoft, AWS, or
> Google. It does not reproduce official certification exam questions. The name "CloudQuest" is
> provisional: domain, existing-product and trademark availability have not been checked.

## Current status: Phase 2 (Scenario Lab slice)

A guest can open the Scenario Lab, work through an original scenario with progressive hints,
get reasoning-based feedback, and continue to a fresh variant that tests the idea in a changed
context. **All scenario content is draft and unreviewed**, and the app says so wherever it is
shown. Attempts are not saved yet.

| Capability                                                 | Status                                                                                               |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Vite + React + strict TypeScript, tests, CI workflow       | Implemented (CI workflow not yet run on GitHub)                                                      |
| Typed content model, pack validator, authoring rules       | Implemented, unit-tested                                                                             |
| Landing page, guest entry, responsive workspace shell      | Implemented                                                                                          |
| Learning tracks overview                                   | Implemented. Informational: no track is available because no content is reviewed                     |
| Scenario Lab: context, constraints, decision, hints        | Implemented as a **draft preview**: 1 scenario + 1 transfer variant, both unreviewed                 |
| Typed evaluator, per-option rationales, misconception tags | Implemented, unit-tested (`single-choice-exact` only)                                                |
| Fresh transfer variant after feedback                      | Implemented; validator enforces a changed context                                                    |
| Saving attempts, hint usage, scheduling revision, progress | Planned (Phase 3). Nothing is stored; "Guest mode" is only a label                                   |
| Architecture Canvas and simulation                         | Planned (Phase 4)                                                                                    |
| Second pack, track switching, demo auth                    | Planned (Phase 5)                                                                                    |
| Real authentication                                        | Not configured. Only clearly labelled demo screens will be built unless a trusted provider is set up |
| Loading states                                             | Not yet: nothing loads asynchronously                                                                |
| Full accessibility and responsive audit                    | Planned (Phase 6). Checks done so far are listed under "Accessibility so far"                        |

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

Format check, lint, typecheck, tests and build all passed at the end of Phase 2. The pages were
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
  features/scenarios/  Evaluator, attempt state machine, catalog, ScenarioRunner UI
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
An automated axe-core audit (WCAG 2.2 A/AA and best-practice rules) of the Scenario Lab list,
a scenario while answering, its feedback, the fresh variant, and the mobile feedback view found
no violations. Automated tools catch only part of what matters: screen-reader and
cross-browser testing have not been done.

In the Scenario Lab, feedback is delivered by moving focus to the result heading, hints are
announced politely as they appear, and the answer options are a native, keyboard-operable
radio group.

## Content policy

- Scenarios are original study prompts, never official exam items.
- Every pack and scenario carries a status (`draft`, `reviewed`, `archived`), sources, and a
  review date when reviewed. `validatePack` rejects a pack that claims to be reviewed without
  review metadata, and tests run it over every registered pack.
- **Draft content can be previewed, never presented as reviewed.** It is playable in the
  Scenario Lab under a visible "Draft preview" notice, and it does not make a track
  "available" (see `docs/adr/0004-draft-preview-policy.md`).
- Both packs (`azure-fundamentals-legacy`, `azure-fundamentals-scenarios`) are **draft**. Their
  objective set version is `unverified`, objective descriptions are domain labels rather than
  official wording, and the source links were carried over from the legacy dashboard and have not
  been re-checked.
- The scenarios were written from general knowledge and have **not** been checked against current
  Microsoft documentation. Review them with `docs/content-authoring.md` before marking anything
  `reviewed`.

## Known limitations

- The nine legacy questions are plain knowledge checks. They are validated and kept in the repo
  but deliberately **not shown** in the Scenario Lab, which is for scenario-style challenges.
- There is one scenario and one variant, so the lab is a vertical slice, not a curriculum.
- Hint usage and answers are not recorded anywhere yet (Phase 3).
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
- `docs/adr/` — decisions made so far (stack and tooling; evaluators as typed data; hash routing;
  draft-preview policy).
- `docs/content-authoring.md` — how scenarios are structured and how to review one.
