import { useMemo, useSyncExternalStore } from 'react'
import { parseHash, type Route } from './routes.ts'

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => '',
  )
  return useMemo(() => parseHash(hash), [hash])
}
