# User Flows and Navigation

## Main navigation
- Overview: active track, continue action, due reviews, next recommendation.
- Scenario Lab: browse/resume challenges.
- Architecture Canvas: guided design challenges and saved diagrams.
- Revision Studio: due concepts and recall review.
- Progress: objective evidence and activity.
- Learning Tracks: select provider/goal and inspect availability.
- Profile/Settings: account, preferences, privacy/data controls.

Keep navigation labels simple. Use responsive navigation on mobile and a clear active state.

## Guest-to-account journey
```mermaid
flowchart TD
  A[Landing] --> B[Try sample challenge]
  B --> C[Complete challenge]
  C --> D[Feedback and explanation]
  D --> E{Save progress?}
  E -->|Later| F[Continue as guest]
  E -->|Yes| G[Sign up or sign in]
  G --> H[Choose track]
  H --> I[Set study preferences]
  I --> J[Personalized overview]
```
Guest progress migration is optional; if implemented, explain what transfers and request consent.

## Scenario journey
```mermaid
flowchart TD
  A[Choose scenario] --> B[Read context and goal]
  B --> C[Inspect evidence and constraints]
  C --> D{Need hint?}
  D -->|Yes| E[Reveal next hint]
  E --> C
  D -->|No| F[Submit decision]
  F --> G[Consequence and rationale]
  G --> H[Objective and source]
  H --> I{Next action}
  I -->|Transfer practice| J[Fresh related scenario]
  I -->|Review| K[Add to revision]
  I -->|Continue| L[Next challenge]
```

## Canvas journey
1. Explain task and constraints.
2. Introduce palette.
3. Add components and connections.
4. Validate structural issues helpfully.
5. Select a simulation event.
6. Run deterministic rules.
7. Display findings, assumptions, and explanation.
8. Offer reflection, retry, or related scenario.
9. Save locally or to account depending on persistence.

## Revision journey
Due list → recall prompt → reveal explanation/source → Again/Hard/Recalled → update schedule and evidence.

## UX edge cases
- New learner: offer a diagnostic, not an empty dashboard.
- No reviews due: recommend a new challenge without guilt messaging.
- Track has no reviewed content: say so plainly.
- AI unavailable: curated lessons remain usable.
- Auth failure: provide recovery guidance without exposing account details.
- Unsupported simulation: explain scope; do not imply complete validation.
- Mobile canvas: zoom/select/list controls; never require precise dragging.
