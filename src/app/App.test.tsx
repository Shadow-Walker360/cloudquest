// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App.tsx'

function renderAt(hash: string) {
  window.location.hash = hash
  return render(<App />)
}

afterEach(() => {
  cleanup()
  window.location.hash = ''
})

describe('landing page', () => {
  it('states the proposition and the unofficial disclaimer', () => {
    renderAt('')
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Learn cloud by solving real-world challenges.',
      }),
    ).toBeTruthy()
    expect(screen.getByText(/not affiliated with Microsoft, AWS, or Google/)).toBeTruthy()
  })

  it('offers exactly one primary action, a guest entry that needs no sign-up', () => {
    renderAt('')
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]?.textContent).toBe('Enter as guest')
    expect(links[0]?.getAttribute('href')).toBe('#/app')
  })

  it('shows each learning activity at its real status rather than implying it all works', () => {
    renderAt('')
    const section = screen.getByRole('region', { name: 'What CloudQuest is building' })
    expect(within(section).getAllByText(/In development/)).toHaveLength(1)
    expect(within(section).getAllByText(/Planned/)).toHaveLength(1)
    expect(within(section).getAllByText(/Available/)).toHaveLength(1)
  })

  it('lets a guest enter the workspace, updating the title and moving focus', async () => {
    renderAt('')
    await userEvent.click(screen.getByRole('link', { name: 'Enter as guest' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Your workspace' })).toBeTruthy()
    expect(document.title).toBe('Overview · CloudQuest')
    expect(document.activeElement?.id).toBe('main-content')
  })
})

describe('workspace', () => {
  it('shows guest mode and marks the current page in the navigation', () => {
    renderAt('#/app')
    expect(screen.getByText('Guest mode')).toBeTruthy()
    const nav = screen.getByRole('navigation', { name: 'Workspace' })
    expect(within(nav).getByRole('link', { name: 'Overview' }).getAttribute('aria-current')).toBe(
      'page',
    )
    expect(
      within(nav).getByRole('link', { name: 'Learning tracks' }).getAttribute('aria-current'),
    ).toBeNull()
  })

  it('links to features that exist and not to the one that does not yet', () => {
    renderAt('#/app')
    const nav = screen.getByRole('navigation', { name: 'Workspace' })
    const hrefs: Record<string, string> = {
      'Scenario Lab': '#/app/lab',
      'Revision Studio': '#/app/revision',
      'My notebook': '#/app/profile',
    }
    for (const [name, href] of Object.entries(hrefs)) {
      expect(within(nav).getByRole('link', { name }).getAttribute('href')).toBe(href)
    }
    expect(within(nav).queryByRole('link', { name: /Architecture Canvas/ })).toBeNull()
    expect(within(nav).getByText(/Architecture Canvas/)).toBeTruthy()
    expect(within(nav).getAllByText(/Planned/)).toHaveLength(1)
  })

  it('shows an honest empty state and labels draft content as unreviewed', () => {
    renderAt('#/app')
    expect(screen.getByText('No activity yet')).toBeTruthy()
    expect(screen.getAllByText(/not yet reviewed/i).length).toBeGreaterThan(0)
  })

  it('opens the Scenario Lab from the overview call to action', async () => {
    renderAt('#/app')
    await userEvent.click(screen.getByRole('link', { name: 'Open the Scenario Lab' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Scenario Lab' })).toBeTruthy()
    expect(document.title).toBe('Scenario Lab · CloudQuest')
  })

  it('navigates to the tracks page from the navigation', async () => {
    renderAt('#/app')
    const nav = screen.getByRole('navigation', { name: 'Workspace' })
    await userEvent.click(within(nav).getByRole('link', { name: 'Learning tracks' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Learning tracks' })).toBeTruthy()
    expect(document.title).toBe('Learning tracks · CloudQuest')
  })

  it('moves focus to the main content from the skip link', async () => {
    renderAt('#/app')
    await userEvent.click(screen.getByRole('button', { name: 'Skip to main content' }))
    expect(document.activeElement?.id).toBe('main-content')
  })
})

describe('learning tracks page', () => {
  it('lists every track and does not mark any as available while content is draft', () => {
    renderAt('#/app/tracks')
    for (const name of [
      'Microsoft Azure',
      'Amazon Web Services',
      'Google Cloud',
      'Provider-neutral foundations',
    ]) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeTruthy()
    }
    expect(screen.queryByText('Reviewed content is ready to use.')).toBeNull()
  })

  it('explains why Azure cannot be started yet and shows the others as planned', () => {
    renderAt('#/app/tracks')
    const azure = screen.getByRole('heading', { name: 'Microsoft Azure' }).closest('li')
    expect(azure).not.toBeNull()
    expect(within(azure as HTMLElement).getByText(/In development/)).toBeTruthy()
    expect(within(azure as HTMLElement).getByText(/have not been reviewed/)).toBeTruthy()
    const aws = screen.getByRole('heading', { name: 'Amazon Web Services' }).closest('li')
    expect(within(aws as HTMLElement).getByText(/Planned/)).toBeTruthy()
  })
})

describe('unknown routes', () => {
  it('shows a not-found page with a way home', () => {
    renderAt('#/does-not-exist')
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Go to the CloudQuest home page' }).getAttribute('href'),
    ).toBe('#/')
    expect(document.title).toBe('Page not found · CloudQuest')
  })
})
