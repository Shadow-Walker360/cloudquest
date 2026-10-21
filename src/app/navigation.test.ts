import { describe, expect, it } from 'vitest'
import { features, isCurrent } from './navigation.ts'

describe('features', () => {
  it('gives a page to every feature that is not merely planned, and none to planned ones', () => {
    for (const feature of features) {
      expect(Boolean(feature.route)).toBe(feature.status !== 'planned')
    }
  })

  it('uses unique ids and labels', () => {
    expect(new Set(features.map((f) => f.id)).size).toBe(features.length)
    expect(new Set(features.map((f) => f.label)).size).toBe(features.length)
  })
})

describe('isCurrent', () => {
  it('marks the lab current on its own page and on scenario pages only', () => {
    expect(isCurrent('lab', { name: 'lab' })).toBe(true)
    expect(isCurrent('lab', { name: 'scenario', scenarioId: 'x' })).toBe(true)
    expect(isCurrent('lab', { name: 'tracks' })).toBe(false)
    expect(isCurrent('tracks', { name: 'scenario', scenarioId: 'x' })).toBe(false)
  })
})
