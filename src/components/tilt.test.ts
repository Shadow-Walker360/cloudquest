import { describe, expect, it } from 'vitest'
import { tiltFor } from './tilt.ts'

describe('tiltFor', () => {
  it('is stable for an id and always a gentle angle', () => {
    for (const id of ['a', 'card-1', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '']) {
      const tilt = tiltFor(id)
      expect(tilt).toBe(tiltFor(id))
      expect(Math.abs(tilt)).toBeLessThanOrEqual(2)
    }
  })

  it('varies between notes so a board does not look gridded', () => {
    const tilts = new Set(Array.from({ length: 30 }, (_, i) => tiltFor(`note-${i}`)))
    expect(tilts.size).toBeGreaterThan(3)
  })
})
