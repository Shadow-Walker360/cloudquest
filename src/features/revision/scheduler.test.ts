import { describe, expect, it } from 'vitest'
import type { Schedule } from '../../domain/learning.ts'
import {
  AGAIN_DELAY_MINUTES,
  MAX_INTERVAL_DAYS,
  describeDue,
  dueItems,
  initialSchedule,
  isDue,
  previewOutcomes,
  scheduleReview,
} from './scheduler.ts'

const NOW = new Date('2026-10-21T10:00:00.000Z')
const DAY = 86_400_000
const daysFromNow = (iso: string) => (Date.parse(iso) - NOW.getTime()) / DAY

function after(schedule: Schedule, ...grades: Array<'again' | 'hard' | 'recalled'>): Schedule {
  return grades.reduce((current, grade) => scheduleReview(current, grade, NOW), schedule)
}

describe('initialSchedule', () => {
  it('is due immediately so a fresh mistake can be reviewed straight away', () => {
    const schedule = initialSchedule(NOW)
    expect(isDue(schedule, NOW)).toBe(true)
    expect(schedule).toMatchObject({ intervalDays: 0, reps: 0, lapses: 0 })
  })
})

describe('scheduleReview: again', () => {
  it('returns in 10 minutes, resets the streak and counts a lapse', () => {
    const grown = after(initialSchedule(NOW), 'recalled', 'recalled')
    const result = scheduleReview(grown, 'again', NOW)
    expect(Date.parse(result.dueAt) - NOW.getTime()).toBe(AGAIN_DELAY_MINUTES * 60_000)
    expect(result).toMatchObject({ reps: 0, intervalDays: 0, lapses: 1 })
    expect(result.lastReviewedAt).toBe(NOW.toISOString())
  })

  it('is not due again at the moment of review, so a session cannot loop on one item', () => {
    expect(isDue(scheduleReview(initialSchedule(NOW), 'again', NOW), NOW)).toBe(false)
  })
})

describe('scheduleReview: recalled', () => {
  it('climbs the 1, 3, 7, 14, 30 day ladder', () => {
    let schedule = initialSchedule(NOW)
    const seen: number[] = []
    for (let i = 0; i < 5; i++) {
      schedule = scheduleReview(schedule, 'recalled', NOW)
      seen.push(schedule.intervalDays)
    }
    expect(seen).toEqual([1, 3, 7, 14, 30])
    expect(schedule.reps).toBe(5)
  })

  it('keeps growing past the ladder but never beyond the cap', () => {
    const grown = after(
      initialSchedule(NOW),
      'recalled',
      'recalled',
      'recalled',
      'recalled',
      'recalled',
    )
    const next = scheduleReview(grown, 'recalled', NOW)
    expect(next.intervalDays).toBe(45)
    expect(scheduleReview(next, 'recalled', NOW).intervalDays).toBe(MAX_INTERVAL_DAYS)
    expect(MAX_INTERVAL_DAYS).toBe(60)
  })

  it('schedules the due date exactly intervalDays ahead', () => {
    const result = scheduleReview(initialSchedule(NOW), 'recalled', NOW)
    expect(daysFromNow(result.dueAt)).toBe(1)
  })
})

describe('scheduleReview: hard', () => {
  it('grows the interval by 20% (at least one day) without advancing the streak', () => {
    const first = scheduleReview(initialSchedule(NOW), 'hard', NOW)
    expect(first).toMatchObject({ intervalDays: 1, reps: 0 })
    const grown = after(initialSchedule(NOW), 'recalled', 'recalled', 'recalled') // 7 days, 3 reps
    const hard = scheduleReview(grown, 'hard', NOW)
    expect(hard.intervalDays).toBe(9) // ceil(7 * 1.2)
    expect(hard.reps).toBe(3)
  })
})

describe('grade ordering', () => {
  it('always gives again < hard < recalled for the same starting point', () => {
    for (const start of [
      initialSchedule(NOW),
      after(initialSchedule(NOW), 'recalled', 'recalled'),
    ]) {
      const [again, hard, recalled] = (['again', 'hard', 'recalled'] as const).map((g) =>
        Date.parse(scheduleReview(start, g, NOW).dueAt),
      ) as [number, number, number]
      expect(again).toBeLessThan(hard)
      expect(hard).toBeLessThanOrEqual(recalled)
    }
  })

  it('is deterministic and does not mutate its input', () => {
    const start = initialSchedule(NOW)
    const frozen = JSON.stringify(start)
    expect(scheduleReview(start, 'recalled', NOW)).toEqual(scheduleReview(start, 'recalled', NOW))
    expect(JSON.stringify(start)).toBe(frozen)
  })
})

describe('dueItems', () => {
  it('returns only due items, most overdue first', () => {
    const at = (offsetMinutes: number): { id: string; schedule: Schedule } => ({
      id: String(offsetMinutes),
      schedule: {
        dueAt: new Date(NOW.getTime() + offsetMinutes * 60_000).toISOString(),
        intervalDays: 0,
        reps: 0,
        lapses: 0,
      },
    })
    const items = [at(5), at(-5), at(-60), at(0)]
    expect(dueItems(items, NOW).map((i) => i.id)).toEqual(['-60', '-5', '0'])
  })
})

describe('describeDue and previewOutcomes', () => {
  it('describes delays in plain language', () => {
    const at = (ms: number) => new Date(NOW.getTime() + ms).toISOString()
    expect(describeDue(at(-1), NOW)).toBe('Due now')
    expect(describeDue(at(60_000), NOW)).toBe('Due in 1 minute')
    expect(describeDue(at(10 * 60_000), NOW)).toBe('Due in 10 minutes')
    expect(describeDue(at(3 * 3_600_000), NOW)).toBe('Due in 3 hours')
    expect(describeDue(at(DAY), NOW)).toBe('Due in 1 day')
    expect(describeDue(at(7 * DAY), NOW)).toBe('Due in 7 days')
  })

  it('previews the consequence of each grade', () => {
    expect(previewOutcomes(initialSchedule(NOW), NOW)).toEqual({
      again: 'Back in 10 minutes',
      hard: 'Back in 1 day',
      recalled: 'Back in 1 day',
    })
  })
})
