import { describe, expect, it } from 'vitest'
import type { ContentPack } from '../../domain/content.ts'
import { contentPacks } from '../../content/registry.ts'
import { trackAvailability, trackCatalog } from './tracks.ts'

const legacy = contentPacks[0] as ContentPack

function packWith(overrides: Partial<ContentPack>): ContentPack {
  return { ...legacy, ...overrides }
}

describe('trackAvailability', () => {
  it('is planned when no pack exists for the provider', () => {
    expect(trackAvailability('aws', [legacy])).toEqual({ state: 'planned' })
  })

  it('is in-development when only draft content exists', () => {
    expect(trackAvailability('azure', [legacy])).toEqual({
      state: 'in-development',
      draftItems: legacy.scenarios.length,
    })
  })

  it('is available only for a reviewed pack that has content', () => {
    const reviewed = packWith({ status: 'reviewed' })
    expect(trackAvailability('azure', [reviewed])).toEqual({ state: 'available' })
    expect(trackAvailability('azure', [packWith({ status: 'reviewed', scenarios: [] })])).toEqual({
      state: 'planned',
    })
  })

  it('ignores archived packs', () => {
    expect(trackAvailability('azure', [packWith({ status: 'archived' })])).toEqual({
      state: 'planned',
    })
  })
})

describe('trackCatalog against real content', () => {
  it('lists every provider once', () => {
    expect(trackCatalog.map((t) => t.provider).sort()).toEqual(['aws', 'azure', 'gcp', 'neutral'])
  })

  it('does not mark any track available while all packs are draft', () => {
    for (const track of trackCatalog) {
      expect(trackAvailability(track.provider, contentPacks).state).not.toBe('available')
    }
  })
})
