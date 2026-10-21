import type { ID, Scenario } from '../../domain/content.ts'

export interface Evaluation {
  outcome: 'correct' | 'incorrect'
  selectedOptionId: ID
  /** Revealed only after a submission, so it is safe to include here. */
  correctOptionId: ID
  /** Why the selected option is right or wrong, when the content provides it. */
  rationale?: string
  /** The misconception behind a wrong choice; absent when the answer is correct. */
  misconceptionTag?: string
}

/**
 * Pure, allow-listed evaluation. Content selects an evaluator by id and supplies its
 * parameters as data; nothing from content is ever executed.
 *
 * Returns null when `optionId` is not one of the scenario's options.
 */
export function evaluateScenario(scenario: Scenario, optionId: ID): Evaluation | null {
  const selected = scenario.options.find((option) => option.id === optionId)
  if (!selected) return null

  switch (scenario.evaluator.id) {
    case 'single-choice-exact': {
      const correctOptionId = scenario.evaluator.correctOptionId
      const correct = selected.id === correctOptionId
      const evaluation: Evaluation = {
        outcome: correct ? 'correct' : 'incorrect',
        selectedOptionId: selected.id,
        correctOptionId,
      }
      const rationale = scenario.optionRationales?.[selected.id]
      if (rationale) evaluation.rationale = rationale
      if (!correct && selected.feedbackTag) evaluation.misconceptionTag = selected.feedbackTag
      return evaluation
    }
  }
}
