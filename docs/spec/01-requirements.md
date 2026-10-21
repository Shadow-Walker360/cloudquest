# Requirements and Acceptance Criteria

## Functional requirements

### FR-01 Guest trial
Visitors can complete at least one sample challenge without registering.
**Acceptance:** After completion, signup is offered as an optional way to save progress.

### FR-02 Identity and profile
Use a trusted authentication provider for real accounts. Support sign-out and recovery where provider supports it.
**Acceptance:** Backend authorization scopes private data to the authenticated learner. Demo-only auth is clearly labeled and never stores plaintext passwords.

### FR-03 Learning tracks
Learners choose a provider and learning goal. Tracks are available only when reviewed content exists.
**Acceptance:** Switching tracks does not overwrite progress in another track.

### FR-04 Scenario Lab
Scenarios contain context, task, constraints, interaction, evaluator, explanation, objective mapping, and source references.
**Acceptance:** Every published scenario is original, reviewed, and feedback explains reasoning—not just correctness.

### FR-05 Progressive hints
Learners can request sequential hints.
**Acceptance:** Hints help reason through the task without immediately revealing the answer.

### FR-06 Remediation
After a mistake, explain the misconception and offer a fresh transfer challenge.
**Acceptance:** The retry tests the concept in a changed context, not simply the same item with shuffled options.

### FR-07 Revision
Learners can save concepts for review. Review outcomes: Again, Hard, Recalled.
**Acceptance:** Scheduling is deterministic, documented, and unit-tested.

### FR-08 Progress
Show attempts, objective-level evidence, revision due count, and next recommended action.
**Acceptance:** Metrics derive from recorded activity; demo/seeded data is labeled.

### FR-09 Architecture Canvas
Learners place conceptual nodes, connect them, inspect them, and run supported simulations.
**Acceptance:** Simulation is deterministic for a diagram/event/rule version, states assumptions, and never provisions resources.

### FR-10 Accessible canvas alternative
Core canvas actions can be performed with keyboard and a structured node/edge list or equivalent.
**Acceptance:** Drag-and-drop is not the sole means of completing a challenge.

### FR-11 Content governance
Packs include provider, goal, objective-set version, source URLs, review status, and review date.
**Acceptance:** Draft or outdated content is not silently represented as current.

## Non-functional requirements
- Responsive, legible UX; clear loading, empty, error, and offline states.
- Semantic HTML, visible focus, keyboard support, adequate contrast, reduced-motion support.
- Minimize dependencies and preserve performance on modest devices.
- Keep curated learning usable without external AI.
- Validate persisted and external data.
- Keep secrets server-side and enforce ownership at the backend.
- Collect minimal personal data and document export/deletion.
- Keep domain logic pure and testable.

## MVP definition of done
- [ ] Guest completes sample scenario.
- [ ] Track selection and objective view work.
- [ ] Evaluation, feedback, hints, and transfer retry work.
- [ ] Mistakes can enter revision; review outcomes reschedule.
- [ ] Progress is computed from actual evidence.
- [ ] Guided canvas supports documented nodes, edges, and simulation.
- [ ] Canvas has keyboard/non-drag alternatives.
- [ ] Tests cover evaluators, scheduler, graph validation, and simulation.
- [ ] Lint/typecheck/tests/build pass where scripts exist.
- [ ] README reflects actual implementation and limitations.
