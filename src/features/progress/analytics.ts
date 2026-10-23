import type { ContentPack, Objective } from '../../domain/content.ts'
import type { Attempt, StoreData } from '../../domain/learning.ts'
import { dueItems } from '../revision/scheduler.ts'
import { objectiveEvidence, type ObjectiveEvidence } from './evidence.ts'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Local calendar day, `YYYY-MM-DD`. Study days are the learner's days, not UTC days. */
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** For example "Oct 21", in the learner's local time. */
export function formatShortDate(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date.getTime())
  copy.setDate(copy.getDate() + days)
  return copy
}

export interface ActivityDay {
  day: string
  label: string
  attempts: number
}

/** Attempts per day for the last `days` days, oldest first, including empty days. */
export function activityByDay(attempts: readonly Attempt[], now: Date, days = 14): ActivityDay[] {
  const counts = new Map<string, number>()
  for (const attempt of attempts) {
    const key = dayKey(new Date(attempt.submittedAt))
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(now, i - (days - 1))
    const day = dayKey(date)
    return {
      day,
      label: `${MONTHS[date.getMonth()]} ${date.getDate()}`,
      attempts: counts.get(day) ?? 0,
    }
  })
}

/** Consecutive study days ending today, or ending yesterday if today has no activity yet. */
export function currentStreak(attempts: readonly Attempt[], now: Date): number {
  const days = new Set(attempts.map((a) => dayKey(new Date(a.submittedAt))))
  let cursor = days.has(dayKey(now)) ? now : addDays(now, -1)
  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function collectObjectives(packs: readonly ContentPack[]): Objective[] {
  const seen = new Map<string, Objective>()
  for (const pack of packs) {
    if (pack.status === 'archived') continue
    for (const objective of pack.objectives) {
      if (!seen.has(objective.id)) seen.set(objective.id, objective)
    }
  }
  return [...seen.values()]
}

/** Scenario ids (scenario format, not archived) that teach each objective. */
export function scenariosByObjective(packs: readonly ContentPack[]): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const pack of packs) {
    if (pack.status === 'archived') continue
    for (const scenario of pack.scenarios) {
      if (scenario.format !== 'scenario' || scenario.status === 'archived') continue
      for (const objectiveId of scenario.objectiveIds) {
        map.set(objectiveId, [...(map.get(objectiveId) ?? []), scenario.id])
      }
    }
  }
  return map
}

/** The plain-language name for a misconception tag, or a tidied tag if no label exists. */
export function misconceptionLabel(packs: readonly ContentPack[], tag: string): string {
  for (const pack of packs) {
    const label = pack.misconceptionLabels?.[tag]
    if (label) return label
  }
  return tag.replace(/-/g, ' ')
}

export interface Summary {
  totalAttempts: number
  correct: number
  /** 0 to 1, or null when there are no attempts. */
  accuracy: number | null
  averageHints: number | null
  scenariosAttempted: number
  studyDays: number
  currentStreak: number
  activeDaysThisWeek: number
  activity: ActivityDay[]
  misconceptions: Array<{ tag: string; label: string; count: number }>
  objectives: ObjectiveEvidence[]
  revision: { total: number; dueNow: number; cards: number; mistakes: number }
}

export function summarize(data: StoreData, packs: readonly ContentPack[], now: Date): Summary {
  const { attempts, revisionItems } = data
  const correct = attempts.filter((a) => a.outcome === 'correct').length
  const days = new Set(attempts.map((a) => dayKey(new Date(a.submittedAt))))
  const weekDays = activityByDay(attempts, now, 7).filter((d) => d.attempts > 0).length

  const tagCounts = new Map<string, number>()
  for (const attempt of attempts) {
    if (attempt.outcome === 'incorrect' && attempt.misconceptionTag) {
      tagCounts.set(attempt.misconceptionTag, (tagCounts.get(attempt.misconceptionTag) ?? 0) + 1)
    }
  }

  const available = scenariosByObjective(packs)
  return {
    totalAttempts: attempts.length,
    correct,
    accuracy: attempts.length ? correct / attempts.length : null,
    averageHints: attempts.length
      ? attempts.reduce((sum, a) => sum + a.hintsUsed, 0) / attempts.length
      : null,
    scenariosAttempted: new Set(attempts.map((a) => a.scenarioId)).size,
    studyDays: days.size,
    currentStreak: currentStreak(attempts, now),
    activeDaysThisWeek: weekDays,
    activity: activityByDay(attempts, now, 14),
    misconceptions: [...tagCounts.entries()]
      .map(([tag, count]) => ({ tag, label: misconceptionLabel(packs, tag), count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
    objectives: collectObjectives(packs).map((objective) =>
      objectiveEvidence(objective, attempts, available.get(objective.id) ?? []),
    ),
    revision: {
      total: revisionItems.length,
      dueNow: dueItems(revisionItems, now).length,
      cards: revisionItems.filter((item) => item.source === 'card').length,
      mistakes: revisionItems.filter((item) => item.source === 'mistake').length,
    },
  }
}
