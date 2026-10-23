import { emptyStore, type StoreData } from '../domain/learning.ts'
import { parseStoreText } from '../features/progress/schema.ts'

export const STORE_KEY = 'cloudquest.v1'
export const BACKUP_KEY = 'cloudquest.v1.unreadable-backup'

/** The subset of the Web Storage API we use, so tests can pass a fake. */
export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export type StoreNotice = 'recovered' | 'partial' | 'unavailable'

export interface LoadResult {
  data: StoreData
  notice: StoreNotice | null
  /** Raw text that could not be read, so the caller can keep a copy instead of destroying it. */
  unreadableRaw?: string
}

/**
 * Returns localStorage if it genuinely works. Browsers can throw on access (blocked cookies)
 * or on write (private mode, full quota), so we probe before trusting it.
 */
export function getBrowserStorage(): StorageLike | null {
  try {
    const storage = window.localStorage
    const probe = '__cloudquest_probe__'
    storage.setItem(probe, '1')
    storage.removeItem(probe)
    return storage
  } catch {
    return null
  }
}

export function loadStore(storage: StorageLike | null): LoadResult {
  if (!storage) return { data: emptyStore(), notice: 'unavailable' }
  let raw: string | null
  try {
    raw = storage.getItem(STORE_KEY)
  } catch {
    return { data: emptyStore(), notice: 'unavailable' }
  }
  if (raw === null) return { data: emptyStore(), notice: null }

  const result = parseStoreText(raw)
  if (result.resetReason) {
    return { data: result.data, notice: 'recovered', unreadableRaw: raw }
  }
  return { data: result.data, notice: result.dropped > 0 ? 'partial' : null }
}

/** Returns false, never throws, if the data could not be saved. */
export function saveStore(storage: StorageLike | null, data: StoreData): boolean {
  if (!storage) return false
  try {
    storage.setItem(STORE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

export function keepUnreadableCopy(storage: StorageLike | null, raw: string): void {
  try {
    storage?.setItem(BACKUP_KEY, raw)
  } catch {
    // Best effort: a full quota must not turn a recoverable problem into a crash.
  }
}

export function clearStore(storage: StorageLike | null): void {
  try {
    storage?.removeItem(STORE_KEY)
    storage?.removeItem(BACKUP_KEY)
  } catch {
    // Nothing more can be done.
  }
}
