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
