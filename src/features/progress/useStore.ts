import { useContext } from 'react'
import { StoreContext, type StoreContextValue } from './store-context.ts'

export function useStore(): StoreContextValue {
  const value = useContext(StoreContext)
  if (!value) throw new Error('useStore must be used inside <StoreProvider>')
  return value
}
