import { describe, expect, it } from 'vitest'
import { contentPacks } from '../../content/registry.ts'
import type { Scenario } from '../../domain/content.ts'
import { initialRunnerState, runnerReducer, type RunnerAction, type RunnerState } from './runner.ts'

const scenario = contentPacks
  .flatMap((pack) => pack.scenarios)
  .find((s) => s.id === 'azure-datacenter-outage') as Scenario

function run(...actions: RunnerAction[]): RunnerState {
  return actions.reduce(
    (state, action) => runnerReducer(scenario, state, action),
    initialRunnerState,
  )
}

describe('runnerReducer', () => {
  it('starts with nothing chosen and no hints shown', () => {
    expect(initialRunnerState).toEqual({
      phase: 'answering',
      selectedOptionId: null,
      hintsRevealed: 0,
    })
  })

  it('lets the learner change their selection before submitting', () => {
    const state = run({ type: 'select', optionId: 'b' }, { type: 'select', optionId: 'c' })
    expect(state).toMatchObject({ phase: 'answering', selectedOptionId: 'c' })
  })

  it('ignores a selection that is not an option of the scenario', () => {
    const state = run({ type: 'select', optionId: 'a' }, { type: 'select', optionId: 'zzz' })
    expect(state).toMatchObject({ selectedOptionId: 'a' })
  })

  it('reveals hints one at a time, in order, and stops at the last one', () => {
    const total = scenario.hints.length
    let state = initialRunnerState
    for (let i = 1; i <= total + 2; i++) {
      state = runnerReducer(scenario, state, { type: 'reveal-hint' })
      expect(state.hintsRevealed).toBe(Math.min(i, total))
    }
  })

  it('does nothing when submitting without a choice', () => {
    expect(run({ type: 'submit' })).toBe(initialRunnerState)
  })

  it('moves to review with an evaluation, keeping the hints that were used', () => {
    const state = run(
      { type: 'reveal-hint' },
      { type: 'reveal-hint' },
      { type: 'select', optionId: 'b' },
      { type: 'submit' },
    )
    expect(state.phase).toBe('reviewed')
    if (state.phase !== 'reviewed') return
    expect(state.hintsRevealed).toBe(2)
    expect(state.evaluation).toMatchObject({
      outcome: 'incorrect',
      misconceptionTag: 'scale-up-vs-availability',
    })
  })

  it('records a correct answer as correct', () => {
    const state = run({ type: 'select', optionId: 'a' }, { type: 'submit' })
    expect(state.phase === 'reviewed' && state.evaluation.outcome).toBe('correct')
  })

  it('freezes the attempt once reviewed: no changing the answer or revealing more hints', () => {
    const reviewed = run({ type: 'select', optionId: 'b' }, { type: 'submit' })
    const after = [
      { type: 'select', optionId: 'a' },
      { type: 'reveal-hint' },
      { type: 'submit' },
    ] as const
    for (const action of after) {
      expect(runnerReducer(scenario, reviewed, action)).toBe(reviewed)
    }
  })
})
