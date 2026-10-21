import { describe, expect, it } from 'vitest'
import { hrefFor, parseHash, routeTitle } from './routes.ts'

describe('parseHash', () => {
  it('treats an empty hash and #/ as the landing page', () => {
    expect(parseHash('')).toEqual({ name: 'landing' })
    expect(parseHash('#')).toEqual({ name: 'landing' })
    expect(parseHash('#/')).toEqual({ name: 'landing' })
  })

  it('parses workspace routes', () => {
    expect(parseHash('#/app')).toEqual({ name: 'overview' })
    expect(parseHash('#/app/tracks')).toEqual({ name: 'tracks' })
  })

  it('ignores trailing slashes and query strings', () => {
    expect(parseHash('#/app/')).toEqual({ name: 'overview' })
    expect(parseHash('#/app/tracks/?ref=x')).toEqual({ name: 'tracks' })
  })

  it('returns not-found for unknown paths', () => {
    expect(parseHash('#/nope')).toEqual({ name: 'not-found' })
    expect(parseHash('#/app/unknown')).toEqual({ name: 'not-found' })
  })
})

describe('hrefFor', () => {
  it('round-trips with parseHash', () => {
    for (const name of ['landing', 'overview', 'tracks'] as const) {
      expect(parseHash(hrefFor({ name })).name).toBe(name)
    }
  })
})

describe('routeTitle', () => {
  it('gives every route a distinct title', () => {
    const titles = (['landing', 'overview', 'tracks', 'not-found'] as const).map((name) =>
      routeTitle({ name }),
    )
    expect(new Set(titles).size).toBe(titles.length)
  })
})
