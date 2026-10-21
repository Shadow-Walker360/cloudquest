# Architecture and Technical Design

## Architectural approach
Use a modular monolith. Prefer the repository’s existing React + TypeScript + Vite setup if present. Avoid microservices for the hackathon.

Potential stack: React/TypeScript/Vite, one styling approach, a compatible diagram library, local persistence for demo, and optional managed auth/database if configured.

## Suggested module layout
```text
src/
  app/                 routes, shell
  features/
    auth/              auth UI/provider adapter
    tracks/            registry and selection
    scenarios/         runner, evaluators, feedback
    revision/          scheduling and review
    progress/          evidence aggregation
    architecture/      editor, graph validation, simulation
  content/packs/       versioned reviewed content
  domain/              types and pure rules
  infrastructure/      persistence adapters
  components/          reusable UI
  styles/              tokens/global styles
```
Adapt to existing conventions; inspect before restructuring.

## Content packs
Each pack declares stable ID/version, provider (`azure`, `aws`, `gcp`, `neutral`), goal label, objective IDs, source refs, author/reviewer metadata, review date, and status (`draft`, `reviewed`, `archived`). Provider-specific facts belong in content packs, not scattered UI conditionals.

## Scenario engine
Use data-driven scenario definitions: ID/version, pack, objective IDs, context/task/constraints, interaction type, options/steps, allow-listed evaluator ID, hints, feedback/rationales, misconception tags, sources, review status.

Never execute arbitrary JavaScript from content. Evaluators should be typed and allow-listed.

## Architecture Canvas
- Diagram: ID, title, schema version, nodes, edges, viewport.
- Node: ID, component type, label, position, typed configuration.
- Edge: ID, source/target node IDs, relationship type.
- Simulation event: allow-listed event, description, constraints.
- Result: findings, severity, explanations, affected nodes, assumptions, rule version.

Simulation rules are deterministic and local for MVP. Validate graph references and allowed types. Results are educational, not production validation.

## Persistence and identity
Create repository interfaces for profile, progress, revision, and diagrams. Local storage is fine for demo but is not secure account storage and can be cleared.

For remote data:
- use trusted auth;
- enforce user ownership server-side/database policies;
- never trust client-supplied user IDs alone;
- validate requests;
- keep secrets out of frontend environment variables.

Do not invent password storage or session cryptography.

## Progress and revision
Persist raw evidence (attempts, outcomes, timestamps, objective IDs, optional confidence). Derive summaries. Document mastery formula and sample-size caveats.

Use a simple deterministic review interval table, e.g. Again = short interval, Hard = modest interval, Recalled = longer interval. Choose actual values in implementation and unit-test pure scheduler functions.

## Security/privacy
No cloud credentials or actual resource provisioning. Minimize personal data. Clearly distinguish guest/demo identity from real auth. Document deletion/export before real user data collection. AI output must not become executable simulation logic.

## Testing
Unit tests: scenario evaluators, scheduler, mastery aggregation, graph validation, simulation rules.
Component tests: scenario flow, hints, review rating, accessible canvas actions.
E2E smoke: guest challenge → feedback → revision → progress; guided canvas simulation.
Manual: keyboard, mobile, refresh persistence, error/empty/offline states.

## Record ADRs for
Stack/styling, auth/persistence, canvas library, scenario model/evaluation, content review process.
