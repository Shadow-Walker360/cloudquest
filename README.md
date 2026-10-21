# CloudQuest (working name)

**Learn cloud by solving real-world challenges.**

> **Unofficial educational project.** CloudQuest is not affiliated with Microsoft, AWS, or
> Google. It does not reproduce official certification exam questions. The name "CloudQuest" is
> provisional: domain, existing-product and trademark availability have not been checked.

## Current status: Phase 0 (scaffold)

The project has just been scaffolded. **No learner-facing features exist yet.** The running app
is a placeholder page that lists the loaded content packs.

| Capability                                                    | Status                                                                                               |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Vite + React + strict TypeScript scaffold                     | Implemented                                                                                          |
| Typed content model (`ContentPack`, `Scenario`) and validator | Implemented, unit-tested                                                                             |
| Legacy AZ-900 question set ported to a pack                   | Implemented as **draft, unreviewed**                                                                 |
| Landing page and guest sample                                 | Planned (Phase 1)                                                                                    |
| Scenario Lab, hints, feedback, transfer retry                 | Planned (Phase 2)                                                                                    |
| Attempts, revision scheduler, progress                        | Planned (Phase 3)                                                                                    |
| Architecture Canvas and simulation                            | Planned (Phase 4)                                                                                    |
| Track registry, second pack, demo auth                        | Planned (Phase 5)                                                                                    |
| Real authentication                                           | Not configured. Only clearly labelled demo screens will be built unless a trusted provider is set up |
| Accessibility and responsive audit                            | Planned (Phase 6)                                                                                    |

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

Lint, format check, typecheck, tests and build all passed at the end of Phase 0.
The page itself has been verified by a server-render test, not yet by manual browser testing.

## Project layout

```text
src/
  app/                 App shell (placeholder)
  content/
    packs/             Versioned content packs
    registry.ts        All packs the app knows about
  domain/              Pure types and rules (content model, pack validation)
  styles/              Design tokens and global styles
docs/
  spec/                Original product and engineering spec (target design, not current state)
  adr/                 Architecture decision records
legacy/cloudready/     Original vanilla dashboard, kept unchanged for reference only
```

Folders named in the spec for later phases (`features/`, `infrastructure/`, `components/`) are
created when the code that belongs in them exists.

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
- No persistence, auth, or analytics exist yet.

## Security and privacy

No secrets, cloud credentials, or provisioning are involved. Browser local storage (planned for
demo progress) is not secure account storage and can be cleared. Real accounts will require a
trusted auth provider with server-side ownership checks; this is not configured.

## Documentation

- `docs/spec/` — the original brief, requirements, flows, design system, architecture, domain
  model and build plan, plus the build prompt. Treat as the target, not the current state.
- `docs/adr/` — decisions made so far (stack and tooling; evaluators as typed data).
