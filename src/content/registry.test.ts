import { describe, expect, it } from 'vitest'
import { validatePack } from '../domain/content-validation.ts'
import { contentPacks } from './registry.ts'

describe('registered content packs', () => {
  it.each(contentPacks.map((pack) => [pack.id, pack] as const))(
    '%s passes integrity validation',
    (_id, pack) => {
      expect(validatePack(pack)).toEqual([])
    },
  )

  it('has unique pack ids', () => {
    const ids = contentPacks.map((pack) => pack.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('scenario content quality', () => {
  const scenarios = contentPacks.flatMap((pack) => pack.scenarios)
  const authored = scenarios.filter((scenario) => scenario.format === 'scenario')

  it('uses scenario ids that are unique across all packs (they appear in URLs)', () => {
    const ids = scenarios.map((scenario) => scenario.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has at least one authored scenario', () => {
    expect(authored.length).toBeGreaterThan(0)
  })

  it.each(authored.map((scenario) => [scenario.id, scenario] as const))(
    '%s offers progressive hints that do not hand over the answer',
    (_id, scenario) => {
      expect(scenario.hints.length).toBeGreaterThanOrEqual(2)
      const correct = scenario.options.find((o) => o.id === scenario.evaluator.correctOptionId)
      const answer = correct?.label.trim().toLowerCase() ?? ''
      expect(answer).not.toBe('')
      for (const hint of scenario.hints) {
        expect(hint.text.toLowerCase()).not.toContain(answer)
      }
    },
  )

  it('does not always put the correct answer in the same position', () => {
    const positions = authored.map((scenario) =>
      scenario.options.findIndex((o) => o.id === scenario.evaluator.correctOptionId),
    )
    expect(new Set(positions).size).toBeGreaterThan(1)
  })
})

describe('legacy Azure fundamentals pack', () => {
  const pack = contentPacks.find((p) => p.id === 'azure-fundamentals-legacy')

  it('is registered, draft, and carries all nine ported questions', () => {
    expect(pack).toBeDefined()
    expect(pack?.status).toBe('draft')
    expect(pack?.objectiveSetVersion).toBe('unverified')
    expect(pack?.scenarios).toHaveLength(9)
  })

  it('preserves the original answer key', () => {
    // Index of the correct option per legacy question q1..q9 (from legacy/cloudready/script.js).
    const legacyAnswers = [1, 2, 1, 1, 1, 0, 1, 1, 0]
    const letters = ['a', 'b', 'c', 'd']
    pack?.scenarios.forEach((scenario, i) => {
      expect(scenario.evaluator.correctOptionId).toBe(letters[legacyAnswers[i] ?? -1])
    })
  })
})
