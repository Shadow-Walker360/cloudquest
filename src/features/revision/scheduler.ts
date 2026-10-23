import type { ReviewGrade, Schedule } from '../../domain/learning.ts'

/**
 * Deterministic review scheduler. No hidden state, no randomness: the same schedule, grade and
 * time always give the same result, and the rules fit in a few lines.
 *
 * - again:    forgotten. Back in 10 minutes; streak (reps) resets; lapses +1.
 * - hard:     recalled with effort. Interval grows by 20%, at least 1 day; reps unchanged.
 * - recalled: interval is the larger of the next ladder step (1, 3, 7, 14, 30 days) and 1.5x the
 *             current interval; reps +1. Capped at 60 days.
 */

export const AGAIN_DELAY_MINUTES = 10
export const LADDER_DAYS = [1, 3, 7, 14, 30] as const
export const MAX_INTERVAL_DAYS = 60

const MINUTE = 60_000
const DAY = 86_400_000

/** A new item is due straight away, so a fresh mistake can be reviewed immediately. */
export function initialSchedule(now: Date): Schedule {
  return { dueAt: now.toISOString(), intervalDays: 0, reps: 0, lapses: 0 }
}

export function scheduleReview(schedule: Schedule, grade: ReviewGrade, now: Date): Schedule {
  const reviewed = { lastReviewedAt: now.toISOString() }
  switch (grade) {
    case 'again':
      return {
        dueAt: new Date(now.getTime() + AGAIN_DELAY_MINUTES * MINUTE).toISOString(),
        intervalDays: 0,
        reps: 0,
        lapses: schedule.lapses + 1,
        ...reviewed,
      }
    case 'hard': {
      const intervalDays = Math.min(
        MAX_INTERVAL_DAYS,
        Math.max(1, Math.ceil(schedule.intervalDays * 1.2)),
      )
      return {
        dueAt: new Date(now.getTime() + intervalDays * DAY).toISOString(),
        intervalDays,
        reps: schedule.reps,
        lapses: schedule.lapses,
        ...reviewed,
      }
    }
    case 'recalled': {
      const step = LADDER_DAYS[Math.min(schedule.reps, LADDER_DAYS.length - 1)] ?? LADDER_DAYS[0]
      const intervalDays = Math.min(
        MAX_INTERVAL_DAYS,
        Math.max(step, Math.ceil(schedule.intervalDays * 1.5)),
      )
      return {
        dueAt: new Date(now.getTime() + intervalDays * DAY).toISOString(),
        intervalDays,
        reps: schedule.reps + 1,
        lapses: schedule.lapses,
        ...reviewed,
      }
    }
  }
}

export function isDue(schedule: Schedule, now: Date): boolean {
  return Date.parse(schedule.dueAt) <= now.getTime()
}

/** Due items, most overdue first. */
export function dueItems<T extends { schedule: Schedule }>(items: readonly T[], now: Date): T[] {
  return items
    .filter((item) => isDue(item.schedule, now))
    .sort((a, b) => Date.parse(a.schedule.dueAt) - Date.parse(b.schedule.dueAt))
}

/** Plain-language delay until a due date, for buttons and lists. */
export function describeDue(dueAt: string, now: Date): string {
  const ms = Date.parse(dueAt) - now.getTime()
  if (ms <= 0) return 'Due now'
  const minutes = Math.ceil(ms / MINUTE)
  if (minutes < 60) return `Due in ${minutes} minute${minutes === 1 ? '' : 's'}`
  const hours = Math.ceil(ms / (60 * MINUTE))
  if (hours < 24) return `Due in ${hours} hour${hours === 1 ? '' : 's'}`
  const days = Math.ceil(ms / DAY)
  return `Due in ${days} day${days === 1 ? '' : 's'}`
}

/** What each grade would do, so the learner can see the consequence before choosing. */
export function previewOutcomes(schedule: Schedule, now: Date): Record<ReviewGrade, string> {
  const preview = (grade: ReviewGrade) =>
    describeDue(scheduleReview(schedule, grade, now).dueAt, now).replace('Due ', 'Back ')
  return { again: preview('again'), hard: preview('hard'), recalled: preview('recalled') }
}
