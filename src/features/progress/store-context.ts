import { createContext } from 'react'
import type {
  Attempt,
  ReviewGrade,
  RevisionItem,
  StoreData,
  StudentProfile,
} from '../../domain/learning.ts'
import type { StoreNotice } from '../../infrastructure/storage.ts'

export interface StoreActions {
  recordAttempt: (attempt: Attempt) => void
  addRevisionItem: (item: RevisionItem) => void
  createCard: (item: RevisionItem) => void
  reviewItem: (id: string, grade: ReviewGrade) => void
  deleteItem: (id: string) => void
  updateProfile: (profile: StudentProfile) => void
  resetAll: () => void
  /** The whole store as formatted JSON, for the learner to download. */
  exportJson: () => string
}

export interface StoreContextValue {
  data: StoreData
  notice: StoreNotice | null
  /** True when the most recent save failed (storage full or blocked). */
  saveFailed: boolean
  dismissNotice: () => void
  actions: StoreActions
}

export const StoreContext = createContext<StoreContextValue | null>(null)
