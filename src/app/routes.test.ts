import { describe, expect, it } from 'vitest'
import { hrefFor, parseHash, routeKey, routeTitle, type Route } from './routes.ts'

describe('parseHash', () => {
  it('treats an empty hash and #/ as the landing page', () => {
    expect(parseHash('')).toEqual({ name: 'landing' })
    expect(parseHash('#')).toEqual({ name: 'landing' })
    expect(parseHash('#/')).toEqual({ name: 'landing' })
  })

  it('parses workspace routes', () => {
    expect(parseHash('#/app')).toEqual({ name: 'overview' })
    expect(parseHash('#/app/tracks')).toEqual({ name: 'tracks' })
    expect(parseHash('#/app/lab')).toEqual({ name: 'lab' })
    expect(parseHash('#/app/revision')).toEqual({ name: 'revision' })
    expect(parseHash('#/app/profile')).toEqual({ name: 'profile' })
  })

  it('parses a scenario route and keeps its id', () => {
    expect(parseHash('#/app/lab/azure-datacenter-outage')).toEqual({
      name: 'scenario',
      scenarioId: 'azure-datacenter-outage',
    })
    expect(parseHash('#/app/lab/azure-datacenter-outage/')).toEqual({
      name: 'scenario',
      scenarioId: 'azure-datacenter-outage',
    })
  })

  it('rejects scenario ids that are not URL-safe lowercase slugs', () => {
    expect(parseHash('#/app/lab/Has%20Space')).toEqual({ name: 'not-found' })
    expect(parseHash('#/app/lab/UPPER')).toEqual({ name: 'not-found' })
    expect(parseHash('#/app/lab/a/b')).toEqual({ name: 'not-found' })
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
    for (const name of ['landing', 'overview', 'tracks', 'lab', 'revision', 'profile'] as const) {
      expect(parseHash(hrefFor({ name })).name).toBe(name)
    }
    const scenario: Route = { name: 'scenario', scenarioId: 'a-b-1' }
    expect(parseHash(hrefFor({ name: 'scenario', scenarioId: 'a-b-1' }))).toEqual(scenario)
  })
})

describe('routeTitle', () => {
  it('gives every route a distinct title', () => {
    const titles = (
      ['landing', 'overview', 'tracks', 'lab', 'revision', 'profile', 'not-found'] as const
    ).map((name) => routeTitle({ name }))
    expect(new Set(titles).size).toBe(titles.length)
  })
})

describe('routeKey', () => {
  it('distinguishes two scenarios so moving between them counts as navigation', () => {
    const a = routeKey({ name: 'scenario', scenarioId: 'one' })
    const b = routeKey({ name: 'scenario', scenarioId: 'two' })
    expect(a).not.toBe(b)
    expect(routeKey({ name: 'lab' })).toBe('lab')
  })
})
