# Content authoring and review guide

Scenarios live in `src/content/packs/` as typed data. `npm test` validates every registered
pack, so most structural mistakes fail before they reach a learner.

## Anatomy of a scenario

| Field                            | Purpose                                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| `id`                             | Lowercase letters, digits and hyphens. Appears in the URL and must be unique across packs.   |
| `context`                        | The situation. Concrete, fictional, no real company names.                                   |
| `constraints`                    | What must stay true. Good constraints are what make the wrong options wrong.                 |
| `task`                           | The decision the learner must make, phrased as a question.                                   |
| `options`                        | Plausible choices. Each wrong option carries a `feedbackTag` naming the misconception.       |
| `hints`                          | Two or more, in increasing strength. They must not contain the correct option's wording.     |
| `evaluator`                      | `{ id: 'single-choice-exact', correctOptionId }`. Data only; content never runs code.        |
| `optionRationales`               | One reason per option, written so a learner who picked it learns something.                  |
| `explanation`                    | Why the best option is best, in terms of the underlying concept.                             |
| `transferScenarioId`             | A fresh scenario in the same pack that tests the idea in a **different** situation.          |
| `objectiveIds`, `sourceRefs`     | What it teaches and where to verify it.                                                      |
| `status`, `reviewedAt`           | `draft` until a person has reviewed it. Reviewed content also needs pack `reviewers`.        |

## What the tests already enforce

Unique ids, resolvable objectives and https sources, a rationale for every option, a misconception
tag on every wrong option and none on the right one, sequential hints, hints that do not contain
the answer text, a transfer variant that shares an objective but changes the task and the options,
and review metadata before anything can claim to be reviewed.

## What only a person can check (review checklist)

For each scenario, against the current official documentation:

- [ ] Every factual claim in the context, options, rationales and explanation is correct and
      still current.
- [ ] Exactly one option is best given the constraints, and each wrong option is wrong **because
      of** something stated in the scenario, not because of an unstated assumption.
- [ ] The rationales do not contradict each other or the explanation.
- [ ] Hints help reasoning without giving the answer away.
- [ ] The transfer variant genuinely needs the same idea applied differently, and a learner who
      memorised the first answer would get it wrong.
- [ ] The objective mapping matches the current published objectives (and `objectiveSetVersion`
      is set to the version you checked).
- [ ] Source links work and support the claims. Set `accessedAt` on each.
- [ ] The wording is original, not copied or closely paraphrased from any exam material.

## Marking content reviewed

1. Set `reviewedAt` (ISO date) and `status: 'reviewed'` on each scenario you checked.
2. Add yourself to the pack's `reviewers`, set the pack's `reviewedAt` and `status`.
3. Update `objectiveSetVersion` and each objective's description if you verified the wording.
4. Run `npm test`. The validator will refuse a reviewed pack that still contains drafts.

Once a pack is reviewed, the "Draft preview" notices disappear and the track becomes available
without UI changes.
