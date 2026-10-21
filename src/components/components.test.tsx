// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary.tsx'
import { OfflineBanner } from './OfflineBanner.tsx'
import { StatusChip } from './StatusChip.tsx'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('OfflineBanner', () => {
  it('stays hidden while online', () => {
    vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(true)
    render(<OfflineBanner />)
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('appears when the browser goes offline and disappears when it returns', () => {
    const onLine = vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(true)
    render(<OfflineBanner />)

    onLine.mockReturnValue(false)
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(screen.getByRole('status').textContent).toMatch(/offline/i)

    onLine.mockReturnValue(true)
    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(screen.queryByRole('status')).toBeNull()
  })
})

describe('ErrorBoundary', () => {
  function Broken(): never {
    throw new Error('boom')
  }

  it('renders children when nothing fails', () => {
    render(
      <ErrorBoundary>
        <p>fine</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('fine')).toBeTruthy()
  })

  it('replaces a crashed tree with an accessible message and a reload action', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert').textContent).toMatch(/Something went wrong/)
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeTruthy()
  })
})

describe('StatusChip', () => {
  it('always carries a text label, not just a colour or icon', () => {
    render(
      <>
        <StatusChip status="available" />
        <StatusChip status="in-development" />
        <StatusChip status="planned" />
      </>,
    )
    expect(screen.getByText(/Available/)).toBeTruthy()
    expect(screen.getByText(/In development/)).toBeTruthy()
    expect(screen.getByText(/Planned/)).toBeTruthy()
  })
})
