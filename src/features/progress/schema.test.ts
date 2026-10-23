import { describe, expect, it } from 'vitest'
import {
  defaultProfile,
  emptyStore,
  type Attempt,
  type RevisionItem,
} from '../../domain/learning.ts'
import {
  parseAttempt,
  parseProfile,
  parseRevisionItem,
  parseStoreData,
  parseStoreText,
} from './schema.ts'

const attempt: Attempt = {
  id: 'a1',
  scenarioId: 'azure-datacenter-outage',
  packId: 'azure-fundamentals-scenarios',
  objectiveIds: ['az900.cloud-concepts'],
  submittedOptionId: 'b',
  outcome: 'incorrect',
  misconceptionTag: 'scale-up-vs-availability',
  hintsUsed: 2,
  submittedAt: '2026-10-21T09:30:00.000Z',
}

const item: RevisionItem = {
  id: 'r1',
  source: 'card',
  title: 'Zones vs regions',
  prompt: 'Zones vs regions',
  answer: 'A zone is a datacenter location inside a region.',
  objectiveIds: [],
  color: 'yellow',
  createdAt: '2026-10-21T09:30:00.000Z',
  schedule: { dueAt: '2026-10-21T09:30:00.000Z', intervalDays: 0, reps: 0, lapses: 0 },
}

const store = { version: 1, profile: defaultProfile, attempts: [attempt], revisionItems: [item] }

describe('parseAttempt', () => {
  it('accepts a well-formed attempt unchanged', () => {
    expect(parseAttempt(attempt)).toEqual(attempt)
  })

  it.each([
    ['a non-object', 'nope'],
    ['a missing id', { ...attempt, id: undefined }],
    ['an unknown outcome', { ...attempt, outcome: 'maybe' }],
    ['negative hints', { ...attempt, hintsUsed: -1 }],
    ['fractional hints', { ...attempt, hintsUsed: 1.5 }],
    ['a bad date', { ...attempt, submittedAt: 'yesterday' }],
    ['non-string objectives', { ...attempt, objectiveIds: [1, 2] }],
    ['an empty tag', { ...attempt, misconceptionTag: '' }],
  ])('rejects %s', (_name, value) => {
    expect(parseAttempt(value)).toBeNull()
  })
})

describe('parseRevisionItem', () => {
  it('accepts a well-formed card and a mistake item', () => {
    expect(parseRevisionItem(item)).toEqual(item)
    const mistake = { ...item, source: 'mistake', color: undefined, scenarioId: 's', packId: 'p' }
    expect(parseRevisionItem(mistake)?.scenarioId).toBe('s')
  })

  it.each([
    ['an unknown colour', { ...item, color: 'purple' }],
    ['an unknown source', { ...item, source: 'import' }],
    ['a broken schedule', { ...item, schedule: { ...item.schedule, reps: -1 } }],
    ['an interval beyond a year', { ...item, schedule: { ...item.schedule, intervalDays: 9999 } }],
    ['an empty prompt', { ...item, prompt: '   ' }],
    ['an oversized answer', { ...item, answer: 'x'.repeat(2001) }],
  ])('rejects %s', (_name, value) => {
    expect(parseRevisionItem(value)).toBeNull()
  })
})

describe('parseProfile', () => {
  it('keeps valid fields and repairs damaged ones one at a time', () => {
    const result = parseProfile({
      displayName: 'Amina',
      goal: 'x'.repeat(500),
      preferredTrack: 'oracle',
      sessionsPerWeek: 99,
      about: 42,
    })
    expect(result).toEqual({ ...defaultProfile, displayName: 'Amina' })
  })

  it('accepts every real provider and the empty choice', () => {
    for (const track of ['azure', 'aws', 'gcp', 'neutral', '']) {
      expect(parseProfile({ preferredTrack: track }).preferredTrack).toBe(track)
    }
  })

  it('falls back to defaults for non-objects', () => {
    expect(parseProfile(null)).toEqual(defaultProfile)
  })
})

describe('parseStoreData', () => {
  it('round-trips a valid store', () => {
    expect(parseStoreData(JSON.parse(JSON.stringify(store)))).toEqual({ data: store, dropped: 0 })
  })

  it('starts empty, with a reason, for non-objects and wrong versions', () => {
    expect(parseStoreData([])).toMatchObject({ data: emptyStore(), resetReason: 'not-an-object' })
    expect(parseStoreData(null).resetReason).toBe('not-an-object')
    expect(parseStoreData({ ...store, version: 2 }).resetReason).toBe('wrong-version')
  })

  it('skips only the damaged entries and reports how many', () => {
    const result = parseStoreData({
      ...store,
      attempts: [attempt, { nonsense: true }, { ...attempt, id: 'a2' }],
      revisionItems: [item, 'garbage'],
    })
    expect(result.data.attempts.map((a) => a.id)).toEqual(['a1', 'a2'])
    expect(result.data.revisionItems).toHaveLength(1)
    expect(result.dropped).toBe(2)
    expect(result.resetReason).toBeUndefined()
  })

  it('drops duplicate ids rather than showing the same entry twice', () => {
    const result = parseStoreData({ ...store, attempts: [attempt, attempt] })
    expect(result.data.attempts).toHaveLength(1)
    expect(result.dropped).toBe(1)
  })

  it('tolerates missing lists', () => {
    expect(parseStoreData({ version: 1 }).data).toEqual(emptyStore())
  })
})

describe('parseStoreText', () => {
  it('never throws on malformed text', () => {
    for (const raw of ['', '{', 'null', '[1,2', '<html>', '{"version":1']) {
      expect(() => parseStoreText(raw)).not.toThrow()
    }
    expect(parseStoreText('{').resetReason).toBe('not-json')
  })

  it('parses valid text', () => {
    expect(parseStoreText(JSON.stringify(store)).data.attempts).toHaveLength(1)
  })
})
