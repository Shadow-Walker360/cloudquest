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
const color = (name: string): string => {
  const value = tokens[name]
  if (!value) throw new Error(`Missing colour token --${name}`)
  return value
}
const ratio = (foreground: string, background: string) =>
  contrastRatio(color(foreground), color(background))

it('finds the colour tokens in tokens.css', () => {
  expect(Object.keys(tokens).length).toBeGreaterThan(20)
})

describe('contrast helpers', () => {
  it('computes the WCAG reference values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
  })

  it('rejects malformed colours', () => {
    expect(() => contrastRatio('red', '#ffffff')).toThrow()
  })
})

describe('text on neutral surfaces meets AA (4.5:1)', () => {
  const surfaces = ['color-canvas', 'color-surface', 'color-surface-tint', 'color-surface-neutral']
  const texts = ['color-text', 'color-text-muted', 'color-primary-strong']

  it.each(surfaces.flatMap((s) => texts.map((t) => [t, s] as const)))(
    '%s on %s',
    (text, surface) => {
      expect(ratio(text, surface)).toBeGreaterThanOrEqual(4.5)
    },
  )
})

describe('brand and status colours', () => {
  it.each([
    ['color-on-primary', 'color-primary-strong'],
    ['color-on-primary', 'color-primary-hover'],
    ['color-success', 'color-success-bg'],
    ['color-success', 'color-surface'],
    ['color-warning', 'color-warning-bg'],
    ['color-warning', 'color-surface'],
    ['color-danger', 'color-danger-bg'],
    ['color-danger', 'color-surface'],
    ['color-violet-text', 'color-surface-violet'],
    ['color-teal-text', 'color-surface-teal'],
    ['color-amber-text', 'color-surface-amber'],
    ['color-hero-button-text', 'color-surface'],
  ])('%s on %s meets AA', (text, background) => {
    expect(ratio(text, background)).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps white hero text readable across the whole gradient', () => {
    for (const stop of ['hero-start', 'hero-mid', 'hero-end']) {
      expect(ratio('color-on-primary', stop)).toBeGreaterThanOrEqual(4.5)
    }
  })
})

describe('non-text contrast (3:1)', () => {
  const surfaces = ['color-canvas', 'color-surface', 'color-surface-tint']

  it.each(surfaces)('interactive borders are visible on %s', (surface) => {
    expect(ratio('color-border-strong', surface)).toBeGreaterThanOrEqual(3)
  })

  it.each(surfaces)('the focus ring is visible on %s', (surface) => {
    expect(ratio('color-focus', surface)).toBeGreaterThanOrEqual(3)
  })

  it('shows the primary colour as an icon on its tint', () => {
    expect(ratio('color-primary-strong', 'color-surface-tint')).toBeGreaterThanOrEqual(3)
  })
})
