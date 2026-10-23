import { describe, expect, it } from 'vitest'
import {
  MAX_ATTEMPTS,
  MAX_REVISION_ITEMS,
  defaultProfile,
  emptyStore,
  type Attempt,
  type RevisionItem,
} from '../../domain/learning.ts'
import { initialSchedule, isDue } from '../revision/scheduler.ts'
import { storeReducer } from './store-reducer.ts'

const NOW = new Date('2026-10-21T10:00:00.000Z')

const attempt = (id: string): Attempt => ({
  id,
  scenarioId: 's',
  packId: 'p',
  objectiveIds: [],
  submittedOptionId: 'a',
  outcome: 'correct',
  hintsUsed: 0,
  submittedAt: NOW.toISOString(),
})

const item = (id: string, over: Partial<RevisionItem> = {}): RevisionItem => ({
  id,
  source: 'card',
  title: 't',
  prompt: 'p',
  answer: 'a',
  objectiveIds: [],
  createdAt: NOW.toISOString(),
  schedule: initialSchedule(NOW),
  ...over,
})

describe('attempts', () => {
  it('appends an attempt and ignores a repeat of the same id', () => {
    const once = storeReducer(emptyStore(), { type: 'attempt-recorded', attempt: attempt('a1') })
    expect(once.attempts).toHaveLength(1)
    expect(storeReducer(once, { type: 'attempt-recorded', attempt: attempt('a1') })).toBe(once)
  })

  it('keeps only the most recent attempts once the limit is reached', () => {
    let state = emptyStore()
    state.attempts = Array.from({ length: MAX_ATTEMPTS }, (_, i) => attempt(`old${i}`))
    state = storeReducer(state, { type: 'attempt-recorded', attempt: attempt('newest') })
    expect(state.attempts).toHaveLength(MAX_ATTEMPTS)
    expect(state.attempts[0]?.id).toBe('old1')
    expect(state.attempts.at(-1)?.id).toBe('newest')
  })
})

describe('revision items', () => {
  it('adds a mistake once per scenario, so pressing "add" twice cannot duplicate it', () => {
    const mistake = item('m1', { source: 'mistake', scenarioId: 's1' })
    const once = storeReducer(emptyStore(), { type: 'revision-added', item: mistake })
    expect(once.revisionItems).toHaveLength(1)
    const again = storeReducer(once, { type: 'revision-added', item: { ...mistake, id: 'm2' } })
    expect(again).toBe(once)
  })

  it('allows several cards, but refuses beyond the item limit', () => {
    let state = storeReducer(emptyStore(), { type: 'card-created', item: item('c1') })
    state = storeReducer(state, { type: 'card-created', item: item('c2') })
    expect(state.revisionItems).toHaveLength(2)
    const full = {
      ...emptyStore(),
      revisionItems: Array.from({ length: MAX_REVISION_ITEMS }, (_, i) => item(`x${i}`)),
    }
    expect(storeReducer(full, { type: 'card-created', item: item('extra') })).toBe(full)
    expect(
      storeReducer(full, {
        type: 'revision-added',
        item: item('extra2', { source: 'mistake', scenarioId: 'z' }),
      }),
    ).toBe(full)
  })

  it('reschedules only the reviewed item, according to the grade', () => {
    let state = storeReducer(emptyStore(), { type: 'card-created', item: item('c1') })
    state = storeReducer(state, { type: 'card-created', item: item('c2') })
    const later = new Date(NOW.getTime() + 60_000)
    state = storeReducer(state, {
      type: 'revision-reviewed',
      id: 'c1',
      grade: 'recalled',
      now: later,
    })
    const [first, second] = state.revisionItems
    expect(first?.schedule).toMatchObject({
      intervalDays: 1,
      reps: 1,
      lastReviewedAt: later.toISOString(),
    })
    expect(isDue(first!.schedule, later)).toBe(false)
    expect(second?.schedule).toEqual(initialSchedule(NOW))
  })

  it('a wrong recall brings the item back soon and counts a lapse', () => {
    let state = storeReducer(emptyStore(), { type: 'card-created', item: item('c1') })
    state = storeReducer(state, { type: 'revision-reviewed', id: 'c1', grade: 'again', now: NOW })
    expect(state.revisionItems[0]?.schedule).toMatchObject({ lapses: 1, intervalDays: 0 })
  })

  it('ignores reviews and deletes for unknown ids', () => {
    const state = storeReducer(emptyStore(), { type: 'card-created', item: item('c1') })
    expect(
      storeReducer(state, { type: 'revision-reviewed', id: 'nope', grade: 'hard', now: NOW }),
    ).toBe(state)
    expect(storeReducer(state, { type: 'item-deleted', id: 'nope' })).toBe(state)
  })

  it('deletes an item', () => {
    const state = storeReducer(emptyStore(), { type: 'card-created', item: item('c1') })
    expect(storeReducer(state, { type: 'item-deleted', id: 'c1' }).revisionItems).toEqual([])
  })
})

describe('profile, replace and reset', () => {
  it('updates the profile without touching progress', () => {
    const withAttempt = storeReducer(emptyStore(), {
      type: 'attempt-recorded',
      attempt: attempt('a1'),
    })
    const profile = { ...defaultProfile, displayName: 'Amina' }
    const next = storeReducer(withAttempt, { type: 'profile-updated', profile })
    expect(next.profile.displayName).toBe('Amina')
    expect(next.attempts).toHaveLength(1)
  })

  it('replaces data from another tab and resets everything on request', () => {
    const other = { ...emptyStore(), attempts: [attempt('z')] }
    expect(storeReducer(emptyStore(), { type: 'data-replaced', data: other })).toBe(other)
    expect(storeReducer(other, { type: 'data-reset' })).toEqual(emptyStore())
  })
})
