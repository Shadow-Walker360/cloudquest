# ADR 0002: Evaluators are a closed, typed union

- Status: accepted (2026-10-21)

## Context

The spec's sketch gives each scenario `evaluatorId: string` mapping to a safe evaluator, and
requires that content never executes arbitrary code.

## Decision

`Scenario.evaluator` is a discriminated union (`EvaluatorSpec`) that carries the evaluator id
and its parameters, for example `{ id: 'single-choice-exact', correctOptionId }`. Adding a new
evaluator requires a code change and a new union member. Content is plain data validated by
`validatePack`.

## Consequences

- The answer key lives in typed data beside the scenario and is checked against the options.
- This deviates slightly from the spec's `evaluatorId: string` while keeping its boundary
  (allow-listed, no executable content).
- Only `single-choice-exact` exists today. More arrive in Phase 2 with their tests.
