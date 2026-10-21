import { useOnlineStatus } from './useOnlineStatus.ts'

export function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div className="banner" role="status">
      <span aria-hidden="true">⚠</span> You appear to be offline. Content that has already loaded
      keeps working, but reloading the page may fail until you reconnect.
    </div>
  )
}
