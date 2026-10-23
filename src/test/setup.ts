import { afterEach } from 'vitest'

// Component tests run in jsdom, where storage and the URL hash outlive a single test.
// Resetting here keeps every test independent. In the Node environment this does nothing.
afterEach(async () => {
  if (typeof document === 'undefined') return
  const { cleanup } = await import('@testing-library/react')
  cleanup()
  window.localStorage.clear()
  window.location.hash = ''
})
