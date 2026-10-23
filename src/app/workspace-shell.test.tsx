// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App.tsx'

function renderAt(hash: string) {
  window.location.hash = hash
  return render(<App />)
}

const toggle = () => screen.getByRole('button', { name: /navigation menu/i })

afterEach(() => {
  cleanup()
  window.location.hash = ''
})

describe('workspace chrome', () => {
  it('shows a breadcrumb for the current page and the guest status', () => {
    renderAt('#/app/lab')
    const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(crumbs).getByText('Workspace')).toBeTruthy()
    expect(within(crumbs).getByText('Scenario Lab').getAttribute('aria-current')).toBe('page')
    expect(screen.getByText('Guest mode')).toBeTruthy()
  })

  it('is honest in the sidebar: nothing is saved and accounts are unavailable', () => {
    renderAt('#/app')
    expect(screen.getByText('Nothing is saved yet')).toBeTruthy()
    expect(screen.getByText('Accounts are not available yet')).toBeTruthy()
  })

  it('shows real numbers on the overview, never invented ones', () => {
    renderAt('#/app')
    const stats = screen.getAllByText(
      /Scenarios to try|Content packs|Tracks available|Attempts saved/,
    )
    expect(stats).toHaveLength(4)
    const attempts = screen.getByText('Attempts saved').closest('li') as HTMLElement
    expect(within(attempts).getByText('0')).toBeTruthy()
    const tracks = screen.getByText('Tracks available').closest('li') as HTMLElement
    expect(tracks.textContent).toMatch(/0\s*of 4/)
    // The original dashboard's fake sample metrics must never come back.
    expect(screen.queryByText('76')).toBeNull()
    expect(screen.queryByText(/78/)).toBeNull()
  })
})

describe('mobile navigation drawer', () => {
  it('starts closed and labelled for assistive tech', () => {
    renderAt('#/app')
    expect(toggle().getAttribute('aria-expanded')).toBe('false')
    expect(toggle().getAttribute('aria-controls')).toBe('app-sidebar')
    expect(document.getElementById('app-sidebar')?.className).toBe('sidebar')
    expect(document.querySelector('.app-body')?.hasAttribute('inert')).toBe(false)
  })

  it('opens, moves focus into the drawer, and makes the page behind it inert', async () => {
    renderAt('#/app')
    await userEvent.click(toggle())
    expect(toggle().getAttribute('aria-expanded')).toBe('true')
    expect(toggle().getAttribute('aria-label')).toBe('Close navigation menu')
    expect(document.getElementById('app-sidebar')?.className).toContain('open')
    expect(document.activeElement?.closest('#app-sidebar')).not.toBeNull()
    expect(document.querySelector('.app-body')?.hasAttribute('inert')).toBe(true)
  })

  it('closes with Escape and returns focus to the menu button', async () => {
    renderAt('#/app')
    await userEvent.click(toggle())
    await userEvent.keyboard('{Escape}')
    expect(toggle().getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(toggle())
    expect(document.querySelector('.app-body')?.hasAttribute('inert')).toBe(false)
  })

  it('closes when the dimmed backdrop is clicked', async () => {
    renderAt('#/app')
    await userEvent.click(toggle())
    await userEvent.click(document.querySelector('.scrim') as HTMLElement)
    expect(toggle().getAttribute('aria-expanded')).toBe('false')
  })

  it('closes after choosing another page, which loads and takes focus', async () => {
    renderAt('#/app')
    await userEvent.click(toggle())
    const nav = screen.getByRole('navigation', { name: 'Workspace' })
    await userEvent.click(within(nav).getByRole('link', { name: 'Learning tracks' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Learning tracks' })).toBeTruthy()
    expect(toggle().getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement?.id).toBe('main-content')
  })

  it('closes and focuses the content when you choose the page you are already on', async () => {
    renderAt('#/app')
    await userEvent.click(toggle())
    const nav = screen.getByRole('navigation', { name: 'Workspace' })
    await userEvent.click(within(nav).getByRole('link', { name: 'Overview' }))
    expect(toggle().getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement?.id).toBe('main-content')
  })
})
