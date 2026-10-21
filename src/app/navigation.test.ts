import { describe, expect, it } from 'vitest'
import { features } from './navigation.ts'

describe('features', () => {
  it('gives a page to every available feature and none to the rest', () => {
    for (const feature of features) {
      expect(Boolean(feature.route)).toBe(feature.status === 'available')
    }
  })

  it('uses unique ids and labels', () => {
    expect(new Set(features.map((f) => f.id)).size).toBe(features.length)
    expect(new Set(features.map((f) => f.label)).size).toBe(features.length)
  })
})
