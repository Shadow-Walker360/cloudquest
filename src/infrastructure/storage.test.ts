import { describe, expect, it } from 'vitest'
import { emptyStore, type StoreData } from '../domain/learning.ts'
import {
  BACKUP_KEY,
  STORE_KEY,
  clearStore,
  keepUnreadableCopy,
  loadStore,
  saveStore,
  type StorageLike,
} from './storage.ts'

function fakeStorage(
  initial: Record<string, string> = {},
): StorageLike & { map: Map<string, string> } {
  const map = new Map(Object.entries(initial))
  return {
    map,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  }
}

const throwing: StorageLike = {
  getItem() {
    throw new Error('blocked')
  },
  setItem() {
    throw new Error('quota')
  },
  removeItem() {
    throw new Error('blocked')
  },
}

function dataWithAttempt(): StoreData {
  const data = emptyStore()
  data.attempts.push({
    id: 'a1',
    scenarioId: 's',
    packId: 'p',
    objectiveIds: [],
    submittedOptionId: 'a',
    outcome: 'correct',
    hintsUsed: 0,
    submittedAt: '2026-10-21T09:00:00.000Z',
  })
  return data
}

describe('loadStore', () => {
  it('starts empty with no notice on a first visit', () => {
    expect(loadStore(fakeStorage())).toEqual({ data: emptyStore(), notice: null })
  })

  it('survives a refresh: what was saved is what loads', () => {
    const storage = fakeStorage()
    const data = dataWithAttempt()
    expect(saveStore(storage, data)).toBe(true)
    expect(loadStore(storage)).toEqual({ data, notice: null })
  })

  it('reports unavailable storage instead of pretending to save', () => {
    expect(loadStore(null).notice).toBe('unavailable')
    expect(loadStore(throwing).notice).toBe('unavailable')
  })

  it('recovers from unreadable text and hands the raw text back for safekeeping', () => {
    const result = loadStore(fakeStorage({ [STORE_KEY]: '{"version":1,' }))
    expect(result.data).toEqual(emptyStore())
    expect(result.notice).toBe('recovered')
    expect(result.unreadableRaw).toBe('{"version":1,')
  })

  it('recovers from a store written by an unknown future version', () => {
    const result = loadStore(fakeStorage({ [STORE_KEY]: JSON.stringify({ version: 9 }) }))
    expect(result.notice).toBe('recovered')
  })

  it('keeps intact entries and flags partial damage', () => {
    const good = dataWithAttempt()
    const raw = JSON.stringify({ ...good, attempts: [...good.attempts, { broken: true }] })
    const result = loadStore(fakeStorage({ [STORE_KEY]: raw }))
    expect(result.notice).toBe('partial')
    expect(result.data.attempts).toHaveLength(1)
  })
})

describe('saveStore', () => {
  it('returns false rather than throwing when the quota is exceeded or storage is missing', () => {
    expect(saveStore(throwing, emptyStore())).toBe(false)
    expect(saveStore(null, emptyStore())).toBe(false)
  })
})

describe('keepUnreadableCopy and clearStore', () => {
  it('keeps a copy of unreadable data, and clearStore removes both the store and the copy', () => {
    const storage = fakeStorage({ [STORE_KEY]: 'x' })
    keepUnreadableCopy(storage, 'bad data')
    expect(storage.map.get(BACKUP_KEY)).toBe('bad data')
    clearStore(storage)
    expect(storage.map.size).toBe(0)
  })

  it('never throws when storage misbehaves', () => {
    expect(() => keepUnreadableCopy(throwing, 'x')).not.toThrow()
    expect(() => clearStore(throwing)).not.toThrow()
    expect(() => clearStore(null)).not.toThrow()
  })
})
