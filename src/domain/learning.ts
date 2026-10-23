import type { ID, Provider } from './content.ts'

/**
 * What the learner has done, stored on their device. Everything here is validated on load
 * (`features/progress/schema.ts`) because localStorage can be edited, truncated or corrupted.
 */

export type IsoDateTime = string

export interface Attempt {
  id: string
  scenarioId: ID
  packId: ID
  objectiveIds: ID[]
  submittedOptionId: ID
  outcome: 'correct' | 'incorrect'
  /** The misconception behind a wrong choice. */
  misconceptionTag?: string
  hintsUsed: number
  submittedAt: IsoDateTime
}

export type ReviewGrade = 'again' | 'hard' | 'recalled'

export interface Schedule {
  dueAt: IsoDateTime
  intervalDays: number
  /** Consecutive successful recalls since the last lapse. */
  reps: number
  lapses: number
  lastReviewedAt?: IsoDateTime
}

export type CardColor = 'yellow' | 'pink' | 'blue' | 'green'

export const CARD_COLORS: readonly CardColor[] = ['yellow', 'pink', 'blue', 'green']

/** Something to revisit: either a mistake from the Scenario Lab or a card the student wrote. */
export interface RevisionItem {
  id: string
  source: 'mistake' | 'card'
  /** Short heading (a sticky note's title, or the scenario's title). */
  title: string
  /** What to recall: the front of the card. */
  prompt: string
  /** The back of the card. */
  answer: string
  objectiveIds: ID[]
  scenarioId?: ID
  packId?: ID
  misconceptionTag?: string
  /** Student cards only. */
  color?: CardColor
  createdAt: IsoDateTime
  schedule: Schedule
}

export interface StudentProfile {
  displayName: string
  goal: string
  preferredTrack: Provider | ''
  sessionsPerWeek: number
  about: string
}

export const PROFILE_LIMITS = { displayName: 40, goal: 80, about: 200 } as const
export const CARD_LIMITS = { title: 60, note: 280 } as const
export const MAX_ATTEMPTS = 1000
export const MAX_REVISION_ITEMS = 200

export const PROVIDERS: readonly Provider[] = ['azure', 'aws', 'gcp', 'neutral']

export interface StoreData {
  version: 1
  profile: StudentProfile
  attempts: Attempt[]
  revisionItems: RevisionItem[]
}

export const defaultProfile: StudentProfile = {
  displayName: '',
  goal: '',
  preferredTrack: '',
  sessionsPerWeek: 3,
  about: '',
}

export function emptyStore(): StoreData {
  return { version: 1, profile: { ...defaultProfile }, attempts: [], revisionItems: [] }
}
