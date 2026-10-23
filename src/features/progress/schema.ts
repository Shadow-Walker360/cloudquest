import {
  CARD_COLORS,
  CARD_LIMITS,
  MAX_ATTEMPTS,
  MAX_REVISION_ITEMS,
  PROFILE_LIMITS,
  PROVIDERS,
  defaultProfile,
  emptyStore,
  type Attempt,
  type CardColor,
  type RevisionItem,
  type Schedule,
  type StoreData,
  type StudentProfile,
} from '../../domain/learning.ts'

export type ResetReason = 'not-json' | 'not-an-object' | 'wrong-version'

export interface ParseResult {
  data: StoreData
  /** Entries that were damaged and skipped. */
  dropped: number
  /** Set when nothing usable could be read and the store started empty. */
  resetReason?: ResetReason
}

type Json = Record<string, unknown>

function isRecord(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isIsoDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T/.test(value) &&
    !Number.isNaN(Date.parse(value))
  )
}

function text(value: unknown, max: number): string | null {
  return typeof value === 'string' && value.length <= max ? value : null
}

function nonEmptyText(value: unknown, max: number): string | null {
  const result = text(value, max)
  return result !== null && result.trim().length > 0 ? result : null
}

function intInRange(value: unknown, min: number, max: number): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
    ? value
    : null
}

function numberInRange(value: unknown, min: number, max: number): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
    ? value
    : null
}

function stringList(value: unknown, maxItems: number, maxLength: number): string[] | null {
  if (!Array.isArray(value) || value.length > maxItems) return null
  const items: string[] = []
  for (const entry of value) {
    const item = nonEmptyText(entry, maxLength)
    if (item === null) return null
    items.push(item)
  }
  return items
}

export function parseAttempt(value: unknown): Attempt | null {
  if (!isRecord(value)) return null
  const id = nonEmptyText(value.id, 80)
  const scenarioId = nonEmptyText(value.scenarioId, 120)
  const packId = nonEmptyText(value.packId, 120)
  const objectiveIds = stringList(value.objectiveIds, 20, 120)
  const submittedOptionId = nonEmptyText(value.submittedOptionId, 80)
  const hintsUsed = intInRange(value.hintsUsed, 0, 20)
  const outcome = value.outcome
  if (
    id === null ||
    scenarioId === null ||
    packId === null ||
    objectiveIds === null ||
    submittedOptionId === null ||
    hintsUsed === null ||
    (outcome !== 'correct' && outcome !== 'incorrect') ||
    !isIsoDate(value.submittedAt)
  ) {
    return null
  }
  const attempt: Attempt = {
    id,
    scenarioId,
    packId,
    objectiveIds,
    submittedOptionId,
    outcome,
    hintsUsed,
    submittedAt: value.submittedAt,
  }
  if (value.misconceptionTag !== undefined) {
    const tag = nonEmptyText(value.misconceptionTag, 120)
    if (tag === null) return null
    attempt.misconceptionTag = tag
  }
  return attempt
}

function parseSchedule(value: unknown): Schedule | null {
  if (!isRecord(value)) return null
  const intervalDays = numberInRange(value.intervalDays, 0, 365)
  const reps = intInRange(value.reps, 0, 1000)
  const lapses = intInRange(value.lapses, 0, 1000)
  if (intervalDays === null || reps === null || lapses === null || !isIsoDate(value.dueAt)) {
    return null
  }
  const schedule: Schedule = { dueAt: value.dueAt, intervalDays, reps, lapses }
  if (value.lastReviewedAt !== undefined) {
    if (!isIsoDate(value.lastReviewedAt)) return null
    schedule.lastReviewedAt = value.lastReviewedAt
  }
  return schedule
}

export function parseRevisionItem(value: unknown): RevisionItem | null {
  if (!isRecord(value)) return null
  const id = nonEmptyText(value.id, 80)
  const title = nonEmptyText(value.title, 120)
  const prompt = nonEmptyText(value.prompt, 600)
  const answer = nonEmptyText(value.answer, 2000)
  const objectiveIds = stringList(value.objectiveIds, 20, 120)
  const schedule = parseSchedule(value.schedule)
  const source = value.source
  if (
    id === null ||
    title === null ||
    prompt === null ||
    answer === null ||
    objectiveIds === null ||
    schedule === null ||
    (source !== 'mistake' && source !== 'card') ||
    !isIsoDate(value.createdAt)
  ) {
    return null
  }
  const item: RevisionItem = {
    id,
    source,
    title,
    prompt,
    answer,
    objectiveIds,
    createdAt: value.createdAt,
    schedule,
  }
  for (const key of ['scenarioId', 'packId', 'misconceptionTag'] as const) {
    if (value[key] !== undefined) {
      const field = nonEmptyText(value[key], 120)
      if (field === null) return null
      item[key] = field
    }
  }
  if (value.color !== undefined) {
    if (!CARD_COLORS.includes(value.color as CardColor)) return null
    item.color = value.color as CardColor
  }
  return item
}

/** Profile fields that are damaged fall back to their defaults one by one. */
export function parseProfile(value: unknown): StudentProfile {
  if (!isRecord(value)) return { ...defaultProfile }
  const track = value.preferredTrack
  return {
    displayName: text(value.displayName, PROFILE_LIMITS.displayName) ?? defaultProfile.displayName,
    goal: text(value.goal, PROFILE_LIMITS.goal) ?? defaultProfile.goal,
    preferredTrack:
      track === '' || (typeof track === 'string' && PROVIDERS.includes(track as never))
        ? (track as StudentProfile['preferredTrack'])
        : defaultProfile.preferredTrack,
    sessionsPerWeek: intInRange(value.sessionsPerWeek, 1, 7) ?? defaultProfile.sessionsPerWeek,
    about: text(value.about, PROFILE_LIMITS.about) ?? defaultProfile.about,
  }
}

function parseList<T>(value: unknown, parse: (entry: unknown) => T | null, max: number) {
  if (!Array.isArray(value)) return { items: [] as T[], dropped: 0 }
  const items: T[] = []
  let dropped = 0
  const seen = new Set<string>()
  for (const entry of value.slice(0, max)) {
    const parsed = parse(entry)
    const id = isRecord(entry) ? String(entry.id) : ''
    if (parsed === null || seen.has(id)) {
      dropped += 1
      continue
    }
    seen.add(id)
    items.push(parsed)
  }
  dropped += Math.max(0, value.length - max)
  return { items, dropped }
}

/** Validates an already-parsed JSON value, keeping every entry that is intact. */
export function parseStoreData(value: unknown): ParseResult {
  if (!isRecord(value)) return { data: emptyStore(), dropped: 0, resetReason: 'not-an-object' }
  if (value.version !== 1) return { data: emptyStore(), dropped: 0, resetReason: 'wrong-version' }
  const attempts = parseList(value.attempts, parseAttempt, MAX_ATTEMPTS)
  const items = parseList(value.revisionItems, parseRevisionItem, MAX_REVISION_ITEMS)
  return {
    data: {
      version: 1,
      profile: parseProfile(value.profile),
      attempts: attempts.items,
      revisionItems: items.items,
    },
    dropped: attempts.dropped + items.dropped,
  }
}

/** Parses raw text from storage. Never throws. */
export function parseStoreText(raw: string): ParseResult {
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return { data: emptyStore(), dropped: 0, resetReason: 'not-json' }
  }
  return parseStoreData(value)
}

export { CARD_LIMITS }
