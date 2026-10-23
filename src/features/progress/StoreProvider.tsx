import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  STORE_KEY,
  clearStore,
  getBrowserStorage,
  keepUnreadableCopy,
  loadStore,
  saveStore,
  type StorageLike,
  type StoreNotice,
} from '../../infrastructure/storage.ts'
import { emptyStore, type StoreData } from '../../domain/learning.ts'
import { parseStoreText } from './schema.ts'
import { StoreContext, type StoreActions, type StoreContextValue } from './store-context.ts'
import { storeReducer, type StoreAction } from './store-reducer.ts'

/**
 * Holds the learner's data and writes it to the device as soon as it changes. Saving happens in
 * the action itself, not in an effect, so two quick actions can never overwrite each other.
 * `storage` is injectable for tests; by default it is the browser's localStorage if usable.
 */
export function StoreProvider({
  children,
  storage: injected,
}: {
  children: ReactNode
  storage?: StorageLike | null
}) {
  const [storage] = useState<StorageLike | null>(() =>
    injected === undefined ? getBrowserStorage() : injected,
  )
  const [initial] = useState(() => loadStore(storage))
  const dataRef = useRef<StoreData>(initial.data)
  const [data, setData] = useState<StoreData>(initial.data)
  const [notice, setNotice] = useState<StoreNotice | null>(initial.notice)
  const [saveFailed, setSaveFailed] = useState(false)

  // Keep a copy of data we could not read, instead of silently destroying it.
  useEffect(() => {
    if (initial.unreadableRaw) keepUnreadableCopy(storage, initial.unreadableRaw)
  }, [initial.unreadableRaw, storage])

  // Another tab changed the data: adopt it.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== STORE_KEY) return
      const next = event.newValue === null ? emptyStore() : parseStoreText(event.newValue).data
      dataRef.current = next
      setData(next)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const apply = useCallback(
    (action: StoreAction) => {
      const next = storeReducer(dataRef.current, action)
      if (next === dataRef.current) return
      dataRef.current = next
      setData(next)
      setSaveFailed(!saveStore(storage, next))
    },
    [storage],
  )

  const actions = useMemo<StoreActions>(
    () => ({
      recordAttempt: (attempt) => apply({ type: 'attempt-recorded', attempt }),
      addRevisionItem: (item) => apply({ type: 'revision-added', item }),
      createCard: (item) => apply({ type: 'card-created', item }),
      reviewItem: (id, grade) => apply({ type: 'revision-reviewed', id, grade, now: new Date() }),
      deleteItem: (id) => apply({ type: 'item-deleted', id }),
      updateProfile: (profile) => apply({ type: 'profile-updated', profile }),
      resetAll: () => {
        clearStore(storage)
        dataRef.current = emptyStore()
        setData(dataRef.current)
        setSaveFailed(false)
        setNotice(null)
      },
      exportJson: () =>
        JSON.stringify(
          { app: 'CloudQuest', exportedAt: new Date().toISOString(), data: dataRef.current },
          null,
          2,
        ),
    }),
    [apply, storage],
  )

  const value = useMemo<StoreContextValue>(
    () => ({ data, notice, saveFailed, dismissNotice: () => setNotice(null), actions }),
    [data, notice, saveFailed, actions],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
