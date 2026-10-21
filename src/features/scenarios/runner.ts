import type { ID, Scenario } from '../../domain/content.ts'
import { evaluateScenario, type Evaluation } from './evaluate.ts'

/**
 * State of one attempt at one scenario. Pure data plus a reducer, so the whole flow
 * (choose, ask for hints, submit, review) is testable without a UI.
 */
export type RunnerState =
  | { phase: 'answering'; selectedOptionId: ID | null; hintsRevealed: number }
  | { phase: 'reviewed'; selectedOptionId: ID; hintsRevealed: number; evaluation: Evaluation }

export type RunnerAction =
  { type: 'select'; optionId: ID } | { type: 'reveal-hint' } | { type: 'submit' }

export const initialRunnerState: RunnerState = {
  phase: 'answering',
  selectedOptionId: null,
  hintsRevealed: 0,
}

/** Invalid or out-of-phase actions return the same state object, so they are safe no-ops. */
export function runnerReducer(
  scenario: Scenario,
  state: RunnerState,
  action: RunnerAction,
): RunnerState {
  if (state.phase === 'reviewed') return state

  switch (action.type) {
    case 'select': {
      const exists = scenario.options.some((option) => option.id === action.optionId)
      return exists ? { ...state, selectedOptionId: action.optionId } : state
    }
    case 'reveal-hint': {
      if (state.hintsRevealed >= scenario.hints.length) return state
      return { ...state, hintsRevealed: state.hintsRevealed + 1 }
    }
    case 'submit': {
      if (state.selectedOptionId === null) return state
      const evaluation = evaluateScenario(scenario, state.selectedOptionId)
      if (!evaluation) return state
      return {
        phase: 'reviewed',
        selectedOptionId: state.selectedOptionId,
        hintsRevealed: state.hintsRevealed,
        evaluation,
      }
    }
  }
}
