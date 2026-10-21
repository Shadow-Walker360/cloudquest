import { describe, expect, it } from 'vitest'
import { contentPacks } from '../../content/registry.ts'
import type { Scenario } from '../../domain/content.ts'
import { evaluateScenario } from './evaluate.ts'

const scenario = contentPacks
  .flatMap((pack) => pack.scenarios)
  .find((s) => s.id === 'azure-datacenter-outage') as Scenario

describe('evaluateScenario', () => {
  it('marks the keyed option correct and returns its rationale', () => {
    const result = evaluateScenario(scenario, 'a')
    expect(result).toMatchObject({
      outcome: 'correct',
      selectedOptionId: 'a',
      correctOptionId: 'a',
    })
    expect(result?.rationale).toBe(scenario.optionRationales?.a)
    expect(result?.misconceptionTag).toBeUndefined()
  })

  it.each([
    ['b', 'scale-up-vs-availability'],
    ['c', 'region-vs-zone'],
    ['d', 'backup-vs-availability'],
  ])('marks option %s incorrect and names the misconception %s', (optionId, tag) => {
    const result = evaluateScenario(scenario, optionId)
    expect(result).toMatchObject({
      outcome: 'incorrect',
      selectedOptionId: optionId,
      correctOptionId: 'a',
      misconceptionTag: tag,
    })
    expect(result?.rationale).toBe(scenario.optionRationales?.[optionId])
  })

  it('returns null for an option that does not exist', () => {
    expect(evaluateScenario(scenario, 'z')).toBeNull()
    expect(evaluateScenario(scenario, '')).toBeNull()
  })

  it('does not depend on option order', () => {
    const reversed: Scenario = { ...scenario, options: [...scenario.options].reverse() }
    expect(evaluateScenario(reversed, 'a')?.outcome).toBe('correct')
    expect(evaluateScenario(reversed, 'b')?.outcome).toBe('incorrect')
  })

  it('omits a rationale when the content has none, without failing', () => {
    const bare: Scenario = { ...scenario, optionRationales: undefined }
    const result = evaluateScenario(bare, 'b')
    expect(result?.outcome).toBe('incorrect')
    expect(result?.rationale).toBeUndefined()
  })
})
