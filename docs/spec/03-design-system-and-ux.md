# UI/UX Design Brief

## Experience goals
Create a welcoming, polished technical-learning workspace. Do not imitate an official provider exam UI or use provider logos.

Prioritize clarity, one primary action per screen, feedback close to the decision, progressive disclosure, and accessible responsive behavior.

## Suggested design tokens
- Background: `#071426`
- Surface: `#0E2038`
- Raised surface: `#142B47`
- Primary text: `#F4F7FB`
- Muted text: `#AAB9CC`
- Primary blue: `#3288FF`
- Accent cyan: `#42D6E8`

Validate contrast. Never use color alone for correctness or warnings.

## Page patterns
### Overview
Active track, continue learning, revision due, objective overview, next recommendation, useful recent activity.

### Scenario Lab
Readable context/task; constraints/evidence panel; accessible answer interaction; progressive hints; feedback with outcome, rationale, alternatives, objective, source, retry/revision.

### Architecture Canvas
Header with challenge/save/undo/redo/run; component palette; workspace; node inspector; simulation findings/assumptions; structured accessible node/edge list.

### Revision Studio
Due count and estimated time; recall-first prompt; reveal answer; review rating; calm, non-punitive tone.

### Progress
Objective mastery backed by evidence count and recency. Distinguish “not assessed” from “needs practice.” Explain metrics. Do not show pass probability.

## Component inventory
App shell/navigation, track selector, objective chip, scenario card/stepper, hint disclosure, decision control, feedback panel, source link, revision card, progress display, canvas node/edge/inspector, simulation result, toast/status, loading/empty/error/offline states.

## Accessibility and interaction
- Semantic controls, labels, visible focus.
- Keyboard operation for every core action.
- Canvas connection alternative: select a node, then choose a target.
- Undo/redo; confirm destructive reset.
- Announce feedback and simulation results to assistive tech.
- Reduced motion and responsive narrow-screen layout.
