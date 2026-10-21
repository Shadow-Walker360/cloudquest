/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from './contrast.ts'

// Read from disk: Vitest replaces CSS imports (even `?raw`) with an empty string.
const tokensCss = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8')

function readTokens(css: string): Record<string, string> {
  const tokens: Record<string, string> = {}
  for (const match of css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    if (match[1] && match[2]) tokens[match[1]] = match[2]
  }
  return tokens
}

const tokens = readTokens(tokensCss)

it('finds the colour tokens in tokens.css', () => {
  expect(Object.keys(tokens).length).toBeGreaterThan(8)
})
const color = (name: string): string => {
  const value = tokens[name]
  if (!value) throw new Error(`Missing colour token --${name}`)
  return value
}

describe('contrast helpers', () => {
  it('computes the WCAG reference values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
  })

  it('rejects malformed colours', () => {
    expect(() => contrastRatio('red', '#ffffff')).toThrow()
  })
})

describe('colour tokens', () => {
  const surfaces = ['color-bg', 'color-surface', 'color-surface-raised']
  const textColours = [
    'color-text',
    'color-text-muted',
    'color-accent',
    'color-success',
    'color-warning',
    'color-danger',
  ]

  it.each(surfaces.flatMap((s) => textColours.map((t) => [t, s] as const)))(
    '%s on %s meets AA for body text (4.5:1)',
    (text, surface) => {
      expect(contrastRatio(color(text), color(surface))).toBeGreaterThanOrEqual(4.5)
    },
  )

  it('keeps text readable on the primary button', () => {
    expect(contrastRatio(color('color-on-primary'), color('color-primary'))).toBeGreaterThanOrEqual(
      4.5,
    )
  })

  it('keeps primary-coloured links readable on surfaces', () => {
    for (const surface of ['color-bg', 'color-surface']) {
      expect(contrastRatio(color('color-primary'), color(surface))).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('makes interactive borders and the focus ring visible (3:1)', () => {
    for (const surface of surfaces) {
      expect(contrastRatio(color('color-border-strong'), color(surface))).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(color('color-accent'), color(surface))).toBeGreaterThanOrEqual(3)
    }
  })
})
