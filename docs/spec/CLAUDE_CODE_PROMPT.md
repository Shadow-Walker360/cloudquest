# Claude Code Build Prompt — CloudQuest

Act as a senior product engineer, UX-minded frontend architect, and pragmatic technical lead. Build the CloudQuest hackathon prototype in the existing repository.

## Mission
CloudQuest is a multi-cloud learning platform teaching cloud fundamentals through original interactive scenarios, a guided Architecture Canvas, and spaced revision. It must feel like a distinctive learning product—not a clone of an official certification exam UI.

Working tagline: **Learn cloud by solving real-world challenges.**

CloudQuest is unofficial and unaffiliated with Microsoft, AWS, or Google. Do not copy exam questions, provider logos, proprietary exam screens, or imply endorsement. Use public learning objectives as topic guidance and link authoritative sources.

## First: repository reconnaissance
Before coding:
1. Inspect repository structure, package manifest/lockfile, existing framework/routes/components/styles/tests/deployment.
2. Identify the current working app; preserve useful code.
3. Report stack, baseline checks, and a phased plan.
4. Do not replace the project wholesale or introduce a framework without a clear need.
5. If docs conflict with repository reality, explain and adapt minimally.

## Requirements

### 1. Guest-first entry
Build a clear landing page and allow a visitor to complete one sample scenario without signup. Offer account creation after the learner experiences value.

### 2. Learning tracks
Provide track selection for Azure, AWS, Google Cloud, and provider-neutral foundations. Only mark tracks available when reviewed content exists. Store provider-specific facts in content packs; avoid provider conditionals spread through components. Switching tracks must preserve independent progress.

### 3. Scenario Lab
Implement one complete polished vertical slice:
- situation/context, objective, constraints, task;
- accessible interaction;
- progressive hints;
- typed allow-listed evaluator;
- consequence and specific reasoning feedback;
- alternatives/distractor rationale where appropriate;
- objective/source mapping;
- fresh transfer retry and revision action.

Do not make the entire product a generic multiple-choice quiz. Include at least one decision/diagnosis interaction that feels practical, while keeping scope realistic.

### 4. Architecture Canvas
Implement a guided visual learning activity:
- small palette: user, web client, compute, database, identity, network, monitoring (choose a feasible subset);
- add/select/move nodes and connect them;
- inspector with limited typed configuration;
- challenge task and constraints;
- deterministic local simulation such as component failure or access-boundary event;
- findings with affected nodes, assumptions, rule version, and explanation;
- undo/redo or safe reset if feasible;
- keyboard alternative to dragging, e.g. select node then choose target, plus a structured node/edge list.

The simulator must not provision cloud resources, connect to user cloud accounts, claim exact billing, or certify production architecture. State its educational simplifications. Never execute arbitrary code from content.

Choose a compatible diagram library after evaluating React compatibility, accessibility, and bundle impact. Prefer an existing dependency if suitable; do not build a full diagramming engine from scratch.

### 5. Revision and progress
Record attempts and objective evidence. Add revision items for mistakes or explicit save-for-review. Use documented deterministic Again/Hard/Recalled scheduling. Derive dashboard metrics from real activity. Distinguish not-assessed from weak. Never claim practice score guarantees passing.

### 6. Authentication
Inspect existing auth configuration. If a trusted provider is configured, integrate its supported SDK and backend authorization. If not, implement only clearly labelled demo auth screens; do not fake secure accounts or store plaintext passwords. Guest mode must work. Do not implement custom password cryptography. Keep secrets server-side and document production auth requirements.

### 7. UX and visual quality
Create a polished, coherent, responsive learning workspace:
- consistent tokens, typography, spacing, and component patterns;
- one clear primary action per screen;
- meaningful loading/empty/error/offline states;
- restrained gamification and motion;
- semantic controls, visible focus, adequate contrast, reduced motion;
- mobile canvas zoom/selection/list controls.
No dead buttons. Remove unimplemented actions or clearly disable them with explanation.

### 8. Architecture and code quality
Prefer existing React/TypeScript/Vite conventions. Keep domain logic pure and unit-testable. Separate content, evaluators, scheduler, progress aggregation, diagram model, simulation, persistence, and presentation. Use strict types and validate persisted/external data. Avoid premature microservices and unnecessary dependencies. Keep core product usable without AI.

Suggested logical boundaries (adapt to repo):
```text
app/              routes and shell
features/auth/    auth adapter and UI
features/tracks/  track registry
features/scenarios/ runner, evaluators, feedback
features/revision/ scheduler and review
features/progress/ evidence aggregation
features/architecture/ diagram editor and simulation
content/packs/    versioned reviewed content
domain/           shared types and pure rules
infrastructure/   persistence adapters
components/       reusable UI
```

### 9. Content rules
Write original illustrative scenarios. Do not label them official exam items. Map to objectives and source URLs; record version/review status. Verify current objective wording when possible. If facts cannot be verified, mark them for review rather than inventing.

### 10. Documentation
Update README and docs to match what is actually implemented. Include verified setup commands, architecture, feature status, content policy, auth/persistence limits, simulation scope, demo steps, and known issues.

## Implementation sequence
1. Inspect repo and run baseline checks.
2. App shell, landing, guest entry.
3. Typed content model and original scenario.
4. Scenario runner, hints, feedback, fresh retry, tests.
5. Attempt persistence, revision scheduler, progress, tests.
6. Guided canvas, graph validation, deterministic simulation, accessible alternative, tests.
7. Track registry and small second neutral/AWS pack.
8. Real auth only if configured; otherwise honest demo screens.
9. Responsive/accessibility polish, documentation, final verification.

At each phase, make small coherent changes, run relevant checks, fix regressions, and report changed files and verification. Do not claim completion without running checks.

## Definition of done
- Guest can complete a scenario.
- Feedback explains reasoning; retry checks transfer.
- Revision/progress reflect real actions.
- Canvas supports nodes, edges, deterministic simulation, assumptions, and keyboard alternative.
- Mobile and desktop core flows work.
- No fake secure auth, dead controls, exposed secrets, copied exam questions, or real cloud provisioning.
- Available lint/typecheck/tests/build pass.
- README/docs accurately distinguish implemented, partial, planned, and limited features.

## Communication
Begin with a concise repository assessment and plan. Implement incrementally. If blocked by credentials, package incompatibility, or deployment access, state the blocker and provide a safe fallback.
