import { describe, expect, it } from 'vitest'
import { contentPacks } from '../../content/registry.ts'
import { emptyStore, type Attempt, type StoreData } from '../../domain/learning.ts'
import { initialSchedule } from '../revision/scheduler.ts'
import {
  activityByDay,
  collectObjectives,
  currentStreak,
  dayKey,
  misconceptionLabel,
  scenariosByObjective,
  summarize,
} from './analytics.ts'

// Local-time constructors keep these tests independent of the machine's timezone.
const NOW = new Date(2026, 9, 21, 15, 0)
const at = (daysAgo: number, hour = 10) => new Date(2026, 9, 21 - daysAgo, hour, 0).toISOString()

let n = 0
function attempt(over: Partial<Attempt> = {}): Attempt {
  n += 1
  return {
    id: `a${n}`,
    scenarioId: 'azure-datacenter-outage',
    packId: 'azure-fundamentals-scenarios',
    objectiveIds: ['az900.cloud-concepts', 'az900.architecture-services'],
    submittedOptionId: 'a',
    outcome: 'correct',
    hintsUsed: 0,
    submittedAt: at(0),
    ...over,
  }
}

function store(attempts: Attempt[]): StoreData {
  return { ...emptyStore(), attempts }
}

describe('dayKey', () => {
  it('formats the local calendar day with padding', () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})

describe('activityByDay', () => {
  it('returns exactly the requested days, oldest first, with empty days included', () => {
    const days = activityByDay(
      [attempt({ submittedAt: at(1) }), attempt({ submittedAt: at(1, 18) })],
      NOW,
      14,
    )
    expect(days).toHaveLength(14)
    expect(days[13]).toMatchObject({ day: '2026-10-21', label: 'Oct 21', attempts: 0 })
    expect(days[12]).toMatchObject({ day: '2026-10-20', attempts: 2 })
    expect(days[0]?.day).toBe('2026-10-08')
  })

  it('ignores attempts older than the window', () => {
    const days = activityByDay([attempt({ submittedAt: at(40) })], NOW, 14)
    expect(days.every((d) => d.attempts === 0)).toBe(true)
  })
})

describe('currentStreak', () => {
  it('is zero with no activity', () => {
    expect(currentStreak([], NOW)).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    const attempts = [0, 1, 2].map((d) => attempt({ submittedAt: at(d) }))
    expect(currentStreak(attempts, NOW)).toBe(3)
  })

  it('keeps the streak alive through yesterday when today has no activity yet', () => {
    expect(
      currentStreak(
        [1, 2].map((d) => attempt({ submittedAt: at(d) })),
        NOW,
      ),
    ).toBe(2)
  })

  it('breaks after a missed day', () => {
    expect(
      currentStreak(
        [0, 1, 3].map((d) => attempt({ submittedAt: at(d) })),
        NOW,
      ),
    ).toBe(2)
    expect(
      currentStreak(
        [2, 3].map((d) => attempt({ submittedAt: at(d) })),
        NOW,
      ),
    ).toBe(0)
  })
})

describe('objective helpers', () => {
  it('collects each objective once across packs', () => {
    const ids = collectObjectives(contentPacks).map((o) => o.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toContain('az900.cloud-concepts')
  })

  it('maps objectives to scenario-format items only, not knowledge checks', () => {
    const map = scenariosByObjective(contentPacks)
    expect(map.get('az900.cloud-concepts')).toEqual(
      expect.arrayContaining(['azure-datacenter-outage', 'azure-sale-day-slowdown']),
    )
    expect(map.get('az900.management-governance')).toBeUndefined()
  })
})

describe('misconceptionLabel', () => {
  it('uses the pack label and falls back to a tidied tag', () => {
    expect(misconceptionLabel(contentPacks, 'backup-vs-availability')).toBe(
      'Backups are not the same as staying online',
    )
    expect(misconceptionLabel(contentPacks, 'some-unknown-tag')).toBe('some unknown tag')
  })
})

describe('summarize', () => {
  it('is honest about an empty history: nulls and zeros, nothing invented', () => {
    const s = summarize(emptyStore(), contentPacks, NOW)
    expect(s).toMatchObject({
      totalAttempts: 0,
      accuracy: null,
      averageHints: null,
      studyDays: 0,
      currentStreak: 0,
      revision: { total: 0, dueNow: 0 },
    })
    expect(s.objectives.every((o) => o.status === 'not-assessed')).toBe(true)
  })

  it('computes totals, accuracy and hint use from real attempts', () => {
    const s = summarize(
      store([
        attempt({ outcome: 'incorrect', misconceptionTag: 'backup-vs-availability', hintsUsed: 2 }),
        attempt({ scenarioId: 'azure-sale-day-slowdown', hintsUsed: 0 }),
        attempt({ submittedAt: at(1) }),
        attempt({
          submittedAt: at(2),
          outcome: 'incorrect',
          misconceptionTag: 'backup-vs-availability',
        }),
      ]),
      contentPacks,
      NOW,
    )
    expect(s.totalAttempts).toBe(4)
    expect(s.correct).toBe(2)
    expect(s.accuracy).toBe(0.5)
    expect(s.averageHints).toBe(0.5)
    expect(s.scenariosAttempted).toBe(2)
    expect(s.studyDays).toBe(3)
    expect(s.currentStreak).toBe(3)
    expect(s.activeDaysThisWeek).toBe(3)
  })

  it('ranks misconceptions by how often they were chosen, with readable labels', () => {
    const s = summarize(
      store([
        attempt({ outcome: 'incorrect', misconceptionTag: 'region-vs-zone' }),
        attempt({ outcome: 'incorrect', misconceptionTag: 'backup-vs-availability' }),
        attempt({ outcome: 'incorrect', misconceptionTag: 'backup-vs-availability' }),
        attempt({ outcome: 'correct' }),
      ]),
      contentPacks,
      NOW,
    )
    expect(s.misconceptions.map((m) => [m.tag, m.count])).toEqual([
      ['backup-vs-availability', 2],
      ['region-vs-zone', 1],
    ])
    expect(s.misconceptions[0]?.label).toMatch(/Backups/)
  })

  it('counts revision items and what is due now', () => {
    const data = store([])
    data.revisionItems = [
      {
        id: 'r1',
        source: 'mistake',
        title: 't',
        prompt: 'p',
        answer: 'a',
        objectiveIds: [],
        createdAt: at(0),
        schedule: initialSchedule(new Date(2026, 9, 21, 9)),
      },
      {
        id: 'r2',
        source: 'card',
        title: 't',
        prompt: 'p',
        answer: 'a',
        objectiveIds: [],
        createdAt: at(0),
        schedule: { ...initialSchedule(NOW), dueAt: new Date(2026, 9, 25).toISOString() },
      },
    ]
    expect(summarize(data, contentPacks, NOW).revision).toEqual({
      total: 2,
      dueNow: 1,
      cards: 1,
      mistakes: 1,
    })
  })
})
