import { describe, expect, it } from 'vitest'
import { plural } from './format.ts'

describe('plural', () => {
  it('uses the singular only for exactly one', () => {
    expect(plural(1, 'day')).toBe('1 day')
    expect(plural(0, 'day')).toBe('0 days')
    expect(plural(2, 'attempt')).toBe('2 attempts')
  })

  it('accepts an irregular plural', () => {
    expect(plural(1, 'study day', 'study days')).toBe('1 study day')
    expect(plural(3, 'category', 'categories')).toBe('3 categories')
  })
})
