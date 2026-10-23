# CloudQuest (working name)

**Learn cloud by solving real-world challenges.**

> **Unofficial educational project.** CloudQuest is not affiliated with Microsoft, AWS, or
> Google. It does not reproduce official certification exam questions. The name "CloudQuest" is
> provisional: domain, existing-product and trademark availability have not been checked.

## Current status

A guest can learn, practise and track progress end to end: answer scenarios with hints and
reasoning feedback, move to a fresh variant, keep missed concepts and their own sticky-note cards
in a spaced revision queue, and see an analytics board built only from their real attempts, all
saved on their own device. **The Architecture Canvas, track selection and a second content pack
are not built yet.** All scenario content is draft and unreviewed, and the app says so.

| Capability                                                         | Status                                                                      |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Vite + React + strict TypeScript, tests, CI workflow               | Implemented (CI workflow not yet run on GitHub)                             |
| Typed content model, pack validator, authoring rules               | Implemented, unit-tested                                                    |
| CloudReady visual design, responsive shell, mobile drawer          | Implemented, token-driven (ADR 0005)                                        |
| Landing page and guest entry (no sign-up)                          | Implemented                                                                 |
| Scenario Lab: context, constraints, hints, feedback, fresh variant | Implemented as a **draft preview**: 1 scenario + 1 variant, both unreviewed |
| Attempts saved on the device, validated on load                    | Implemented (ADR 0006)                                                      |
| Revision Studio: add mistakes, review, Again/Hard/Recalled         | Implemented; deterministic scheduler, unit-tested                           |
| Sticky-note cards the student writes                               | Implemented                                                                 |
| Student notebook: editable profile and progress board              | Implemented; every figure derived from real attempts                        |
| Export and deletion of all data                                    | Implemented, documented in `docs/privacy-and-data.md`                       |
| Learning tracks overview                                           | Implemented, informational: no track can be selected yet                    |
| Track selection, second content pack, demo auth                    | Planned                                                                     |
| Architecture Canvas, simulation, keyboard alternative              | Planned                                                                     |
| Real authentication                                                | Not configured. There are no accounts; the app says so                      |
| Loading states                                                     | Not needed yet: nothing loads asynchronously                                |
| Full accessibility and responsive audit                            | Planned. Checks done so far are listed under "Accessibility so far"         |

## Hackathon checklist

The acceptance criteria from `docs/spec/01-requirements.md` and `docs/spec/06-build-plan-and-demo.md`,
with their real status. "Open" means not done.

| Criterion                                                           | Status  | Notes                                                                                   |
| ------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| Guest completes a sample scenario                                   | Done    | No sign-up needed                                                                       |
| Track selection and objective view work                             | Partial | Objectives are shown with evidence in the notebook. Tracks cannot be selected: **open** |
| Evaluation, feedback, hints and transfer retry work                 | Done    |                                                                                         |
| Mistakes can enter revision; review outcomes reschedule             | Done    |                                                                                         |
| Progress is computed from actual evidence                           | Done    | Rules in `features/progress/evidence.ts`; not an exam prediction                        |
| Guided canvas supports documented nodes, edges and simulation       | Open    | Phase 4                                                                                 |
| Canvas has keyboard / non-drag alternatives                         | Open    | Phase 4                                                                                 |
| Tests cover evaluators, scheduler, graph validation and simulation  | Partial | Evaluators, scheduler, storage, evidence: done. Graph and simulation: open              |
| Lint / typecheck / tests / build pass                               | Done    | Run before every release                                                                |
| README reflects the actual implementation and limitations           | Done    | This file                                                                               |
| Setup commands in the README are verified against the real scripts  | Done    | Every script listed was run                                                             |
| No dead primary buttons or fake integrations                        | Done    | Unbuilt features are labelled "Planned" and are not links                               |
| Guest flow works                                                    | Done    |                                                                                         |
| Auth state is honestly represented                                  | Done    | There are no accounts; the UI and docs say so                                           |
| Responsive and keyboard flows work                                  | Partial | Implemented screens audited (axe, keyboard-only). No screen-reader testing              |
| Simulation is deterministic and scoped                              | Open    | Phase 4                                                                                 |
| Content maps to objectives and sources                              | Partial | Mapped and linked, but the content is **draft** and sources are unverified              |
| Persistence and privacy limitations are documented                  | Done    | `docs/privacy-and-data.md`                                                              |
| No real cloud credentials or resources used                         | Done    | None are used or requested                                                              |
| README distinguishes implemented, partial, planned and known issues | Done    | See the tables above and "Known limitations"                                            |

## Setup

Requires Node.js 22.22.2 or newer (see `.nvmrc`) and npm. Dependencies are locked in `package-lock.json`.

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

Format check, lint, typecheck, tests and build all passed at the end of this milestone. The pages were
also loaded in headless Chromium at desktop and mobile widths, with no console errors and no
horizontal overflow. That is a smoke check, not a cross-browser or assistive-technology audit.

## Deploying

The build is a static site (`npm run build` writes `dist/`), so any static host works. Asset paths
are relative and routing uses the URL hash, so it runs from a domain root or a sub-path with no
server configuration.

**GitHub Pages (automatic).** `.github/workflows/deploy.yml` lints, typechecks, tests, builds and
publishes on every push to `main`. One-time setup: repository **Settings → Pages → Build and
deployment → Source: GitHub Actions**. The site is then at
`https://<your-user>.github.io/<repo>/`.

**Any other static host** (Netlify, Vercel, Cloudflare Pages): build command `npm run build`,
publish directory `dist`. Netlify also accepts the `dist` folder dragged onto its deploy page.

The deployed site contains no secrets and makes no network requests to other services: all fonts
are bundled and all data stays in the visitor's browser.

## Project layout

```text
src/
  app/                 Routing (hash-based), workspace shell, navigation, pages
  components/          Reusable UI: status chip, empty state, offline banner, error boundary
  content/
    packs/             Versioned content packs
    registry.ts        All packs the app knows about
  domain/              Pure types and rules (content model, pack validation, learner data)
  infrastructure/      Storage, ids, file download
  features/progress/   Store, validation, evidence rules, analytics, profile and board UI
  features/revision/   Scheduler, review session, sticky-card form
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

## Visual design

The look is adapted from the original CloudReady dashboard (kept in `legacy/cloudready/`): light
canvas, white sidebar, gradient hero, tinted icon tiles, soft panels and a lettered quiz card, in
Inter (self-hosted, no external font requests). It is driven by tokens in
`src/styles/tokens.css`. Two deliberate departures, for legibility: text and buttons use a slightly
deeper blue than the original, and muted greys are darker. The original's invented sample numbers
were not carried over: every number on screen is derived from real state. See
`docs/adr/0005-cloudready-visual-design.md`.

## Accessibility so far

Skip link, one `main` landmark, labelled navigation with `aria-current`, a breadcrumb, visible focus ring,
reduced-motion support, 44px minimum touch targets, and status shown by icon plus text rather
than colour alone. Focus moves to the page and the tab title updates on navigation. Colour
contrast for text, focus ring and interactive borders is asserted in `src/styles/tokens.test.ts`.
An automated axe-core audit (WCAG 2.2 A/AA and best-practice rules, including colour contrast)
of the landing page, overview, Scenario Lab list, tracks, a scenario while answering and in
feedback, the mobile views and the open mobile menu found no violations. On mobile, the
navigation drawer is hidden from the tab order when closed, makes the page behind it inert when
open, and closes with Escape. Automated tools catch only part of what matters: screen-reader and
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
- Progress is stored only in this browser: it is not synced, not backed up, and is lost if the
  browser data is cleared. Export it from My notebook if it matters.
- The legacy dashboard's sample metrics and seeded revision items were deliberately **not**
  carried over, because they were not derived from real activity.
- There are no accounts, server or analytics. "Guest mode" means no sign-in: the optional profile a
  student writes is saved only on their own device.
- The offline notice relies on the browser's online/offline signal, which can be wrong. There is
  no service worker, so reloading while offline fails.
- The CI workflow has not been run on GitHub yet; it mirrors the local scripts.

## Security and privacy

No secrets, cloud credentials, or provisioning are involved, and no data leaves the device. The
learner's profile, attempts and cards are kept in the browser's local storage, which is validated
on every load, can be exported or deleted from My notebook, and is **not** secure account storage:
anyone with access to the browser profile can read it. Real accounts would require a trusted auth
provider with server-side ownership checks; this is not configured. Details and failure
behaviour: `docs/privacy-and-data.md`.

## Documentation

- `docs/spec/` — the original brief, requirements, flows, design system, architecture, domain
  model and build plan, plus the build prompt. Treat as the target, not the current state.
- `docs/adr/` — decisions made so far (stack and tooling; evaluators as typed data; hash routing;
  draft-preview policy; CloudReady design; local-first persistence).
- `docs/content-authoring.md` — how scenarios are structured and how to review one.
- `docs/privacy-and-data.md` — exactly what is stored, where, and how to export or delete it.
