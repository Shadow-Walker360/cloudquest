import { describe, expect, it } from 'vitest'
import { contentPacks } from '../../content/registry.ts'
import type { ContentPack } from '../../domain/content.ts'
import { findChallenge, listChallenges, transferFor } from './catalog.ts'

const scenarioPack = contentPacks.find(
  (p) => p.id === 'azure-fundamentals-scenarios',
) as ContentPack

describe('listChallenges', () => {
  it('lists scenario-format items only, hiding knowledge checks and transfer variants', () => {
    const ids = listChallenges(contentPacks).map((c) => c.scenario.id)
    expect(ids).toEqual(['azure-datacenter-outage'])
  })

  it('skips archived packs and archived scenarios', () => {
    expect(listChallenges([{ ...scenarioPack, status: 'archived' }])).toEqual([])
    const archivedScenarios = scenarioPack.scenarios.map((s) => ({
      ...s,
      status: 'archived' as const,
    }))
    expect(listChallenges([{ ...scenarioPack, scenarios: archivedScenarios }])).toEqual([])
  })
})

describe('findChallenge', () => {
  it('finds a listed scenario and a transfer variant by id', () => {
    expect(findChallenge(contentPacks, 'azure-datacenter-outage')?.pack.id).toBe(scenarioPack.id)
    expect(findChallenge(contentPacks, 'azure-sale-day-slowdown')?.scenario.title).toMatch(
      /ticket/i,
    )
  })

  it('does not return knowledge checks or unknown ids', () => {
    expect(findChallenge(contentPacks, 'legacy-q1')).toBeUndefined()
    expect(findChallenge(contentPacks, 'nope')).toBeUndefined()
  })
})

describe('transferFor', () => {
  it('resolves the variant for a scenario that defines one', () => {
    const challenge = findChallenge(contentPacks, 'azure-datacenter-outage')
    expect(challenge && transferFor(challenge)?.id).toBe('azure-sale-day-slowdown')
  })

  it('returns undefined when there is no variant, or it is archived', () => {
    const variant = findChallenge(contentPacks, 'azure-sale-day-slowdown')
    expect(variant && transferFor(variant)).toBeUndefined()

    const scenarios = scenarioPack.scenarios.map((s) =>
      s.id === 'azure-sale-day-slowdown' ? { ...s, status: 'archived' as const } : s,
    )
    const challenge = findChallenge([{ ...scenarioPack, scenarios }], 'azure-datacenter-outage')
    expect(challenge && transferFor(challenge)).toBeUndefined()
  })
})
