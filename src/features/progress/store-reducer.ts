import {
  MAX_ATTEMPTS,
  MAX_REVISION_ITEMS,
  emptyStore,
  type Attempt,
  type ReviewGrade,
  type RevisionItem,
  type StoreData,
  type StudentProfile,
} from '../../domain/learning.ts'
import { scheduleReview } from '../revision/scheduler.ts'

export type StoreAction =
  | { type: 'attempt-recorded'; attempt: Attempt }
  | { type: 'revision-added'; item: RevisionItem }
  | { type: 'card-created'; item: RevisionItem }
  | { type: 'revision-reviewed'; id: string; grade: ReviewGrade; now: Date }
  | { type: 'item-deleted'; id: string }
  | { type: 'profile-updated'; profile: StudentProfile }
  | { type: 'data-replaced'; data: StoreData }
  | { type: 'data-reset' }

/**
 * Pure. Returns the same object when an action changes nothing, so callers can skip saving.
 * Limits (attempts, items) are enforced here so storage can never grow without bound.
 */
export function storeReducer(state: StoreData, action: StoreAction): StoreData {
  switch (action.type) {
    case 'attempt-recorded': {
      if (state.attempts.some((a) => a.id === action.attempt.id)) return state
      const attempts = [...state.attempts, action.attempt].slice(-MAX_ATTEMPTS)
      return { ...state, attempts }
    }
    case 'revision-added': {
      const { item } = action
      const duplicate = state.revisionItems.some(
        (existing) =>
          existing.id === item.id ||
          (item.source === 'mistake' &&
            existing.source === 'mistake' &&
            existing.scenarioId === item.scenarioId),
      )
      if (duplicate || state.revisionItems.length >= MAX_REVISION_ITEMS) return state
      return { ...state, revisionItems: [...state.revisionItems, item] }
    }
    case 'card-created': {
      if (
        state.revisionItems.length >= MAX_REVISION_ITEMS ||
        state.revisionItems.some((existing) => existing.id === action.item.id)
      ) {
        return state
      }
      return { ...state, revisionItems: [...state.revisionItems, action.item] }
    }
    case 'revision-reviewed': {
      if (!state.revisionItems.some((item) => item.id === action.id)) return state
      return {
        ...state,
        revisionItems: state.revisionItems.map((item) =>
          item.id === action.id
            ? { ...item, schedule: scheduleReview(item.schedule, action.grade, action.now) }
            : item,
        ),
      }
    }
    case 'item-deleted': {
      if (!state.revisionItems.some((item) => item.id === action.id)) return state
      return {
        ...state,
        revisionItems: state.revisionItems.filter((item) => item.id !== action.id),
      }
    }
    case 'profile-updated':
      return { ...state, profile: action.profile }
    case 'data-replaced':
      return action.data
    case 'data-reset':
      return emptyStore()
  }
}
