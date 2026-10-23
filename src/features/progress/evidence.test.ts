import { describe, expect, it } from 'vitest'
import type { Attempt } from '../../domain/learning.ts'
import { objectiveEvidence } from './evidence.ts'

const objective = { id: 'o1', title: 'Cloud concepts' }
let counter = 0

function attempt(over: Partial<Attempt> & { minute: number }): Attempt {
  const { minute, ...rest } = over
  counter += 1
  return {
    id: `a${counter}`,
    scenarioId: 's1',
    packId: 'p',
    objectiveIds: ['o1'],
    submittedOptionId: 'a',
    outcome: 'correct',
    hintsUsed: 0,
    submittedAt: new Date(Date.UTC(2026, 9, 21, 9, minute)).toISOString(),
    ...rest,
  }
}

const evidence = (attempts: Attempt[], available = ['s1', 's2']) =>
  objectiveEvidence(objective, attempts, available)

describe('objectiveEvidence', () => {
  it('is not-assessed, not weak, when there are no attempts', () => {
    expect(evidence([])).toMatchObject({ status: 'not-assessed', attempts: 0, correct: 0 })
  })

  it('ignores attempts on other objectives', () => {
    const other = attempt({ minute: 1, objectiveIds: ['o2'] })
    expect(evidence([other]).status).toBe('not-assessed')
  })

  it('needs attention when the latest attempt was wrong, even after earlier successes', () => {
    const result = evidence([
      attempt({ minute: 1 }),
      attempt({ minute: 2, scenarioId: 's2' }),
      attempt({ minute: 3, outcome: 'incorrect' }),
    ])
    expect(result.status).toBe('needs-attention')
  })

  it('is developing after one independent success', () => {
    expect(evidence([attempt({ minute: 1 })])).toMatchObject({
      status: 'developing',
      independentScenarios: 1,
    })
  })

  it('becomes secure only with two different scenarios answered correctly without hints', () => {
    const twoSame = [attempt({ minute: 1 }), attempt({ minute: 2 })]
    expect(evidence(twoSame).status).toBe('developing')
    const twoDifferent = [attempt({ minute: 1 }), attempt({ minute: 2, scenarioId: 's2' })]
    expect(evidence(twoDifferent)).toMatchObject({ status: 'secure', independentScenarios: 2 })
  })

  it('does not count a success that needed hints as independent', () => {
    const result = evidence([
      attempt({ minute: 1 }),
      attempt({ minute: 2, scenarioId: 's2', hintsUsed: 1 }),
    ])
    expect(result).toMatchObject({ status: 'developing', independentScenarios: 1, correct: 2 })
  })

  it('uses the latest attempt per scenario: a later mistake removes that scenario from the count', () => {
    const result = evidence([
      attempt({ minute: 1 }),
      attempt({ minute: 2, scenarioId: 's2' }),
      attempt({ minute: 3, scenarioId: 's2', outcome: 'incorrect' }),
      attempt({ minute: 4 }),
    ])
    expect(result.independentScenarios).toBe(1)
    expect(result.status).toBe('developing')
  })

  it('orders attempts by time, not by position in the list', () => {
    const late = attempt({ minute: 10, outcome: 'incorrect' })
    const early = attempt({ minute: 1 })
    expect(evidence([late, early]).status).toBe('needs-attention')
    expect(evidence([early, late]).status).toBe('needs-attention')
  })

  it('flags limited content: one scenario can never prove an objective secure', () => {
    const result = evidence([attempt({ minute: 1 })], ['s1'])
    expect(result).toMatchObject({
      limitedContent: true,
      status: 'developing',
      availableScenarios: 1,
    })
    expect(evidence([], ['s1', 's2']).limitedContent).toBe(false)
  })

  it('reports the most recent attempt time', () => {
    const result = evidence([attempt({ minute: 5 }), attempt({ minute: 2 })])
    expect(result.lastAttemptAt).toBe(new Date(Date.UTC(2026, 9, 21, 9, 5)).toISOString())
  })
})
