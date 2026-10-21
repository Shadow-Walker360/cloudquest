// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App.tsx'

const OUTAGE = '#/app/lab/azure-datacenter-outage'
const SALE_DAY = '#/app/lab/azure-sale-day-slowdown'

function renderAt(hash: string) {
  window.location.hash = hash
  return render(<App />)
}

async function choose(label: RegExp) {
  await userEvent.click(screen.getByRole('radio', { name: label }))
}

async function submit() {
  await userEvent.click(screen.getByRole('button', { name: 'Submit decision' }))
}

afterEach(() => {
  cleanup()
  window.location.hash = ''
})

describe('Scenario Lab list', () => {
  it('lists the authored scenario as a draft preview, hiding variants and knowledge checks', () => {
    renderAt('#/app/lab')
    expect(screen.getByRole('heading', { level: 1, name: 'Scenario Lab' })).toBeTruthy()
    expect(screen.getAllByText(/Draft preview/).length).toBeGreaterThan(0)
    expect(
      screen.getByRole('heading', { level: 2, name: 'The bakery site that went dark' }),
    ).toBeTruthy()
    expect(screen.queryByText('The ticket site that slows on sale days')).toBeNull()
    expect(screen.getByText(/Draft · unreviewed/)).toBeTruthy()
  })

  it('starts a scenario from its card and marks the lab current in the navigation', async () => {
    renderAt('#/app/lab')
    await userEvent.click(screen.getByRole('link', { name: /Start scenario/ }))
    expect(
      await screen.findByRole('heading', { level: 1, name: 'The bakery site that went dark' }),
    ).toBeTruthy()
    const nav = screen.getByRole('navigation', { name: 'Workspace' })
    expect(
      within(nav).getByRole('link', { name: 'Scenario Lab' }).getAttribute('aria-current'),
    ).toBe('page')
  })
})

describe('scenario page', () => {
  it('shows the situation, constraints and task, with a draft warning', () => {
    renderAt(OUTAGE)
    expect(screen.getByText(/Crumb & Co\./)).toBeTruthy()
    expect(screen.getByText(/Customer data must stay in the current Azure region/)).toBeTruthy()
    expect(
      screen.getByRole('group', { name: /Which change would best keep the ordering site online/ }),
    ).toBeTruthy()
    expect(screen.getByRole('note').textContent).toMatch(/Draft preview/)
    expect(screen.getAllByRole('radio')).toHaveLength(4)
  })

  it('does not reveal the answer or any feedback before a decision is submitted', () => {
    renderAt(OUTAGE)
    expect(screen.queryByText('Best fit')).toBeNull()
    expect(screen.queryByText(/Why$/)).toBeNull()
    expect(screen.queryByRole('heading', { name: /Correct|Not quite/ })).toBeNull()
  })

  it('keeps submit disabled until an option is chosen', async () => {
    renderAt(OUTAGE)
    const submitButton = screen.getByRole('button', {
      name: 'Submit decision',
    }) as HTMLButtonElement
    expect(submitButton.disabled).toBe(true)
    expect(screen.getByText('Choose an option to continue.')).toBeTruthy()
    await choose(/larger size/)
    expect(submitButton.disabled).toBe(false)
  })

  it('reveals hints one at a time and stops at the last one', async () => {
    renderAt(OUTAGE)
    const button = () => screen.getByRole('button', { name: /hint/i }) as HTMLButtonElement
    expect(screen.getByText('0 of 3 hints shown')).toBeTruthy()
    expect(button().textContent).toBe('Show a hint')

    await userEvent.click(button())
    expect(screen.getByText('1 of 3 hints shown')).toBeTruthy()
    expect(screen.getByText(/one datacenter lost power/)).toBeTruthy()
    expect(screen.queryByText(/second, separate location/)).toBeNull()

    await userEvent.click(button())
    await userEvent.click(button())
    expect(screen.getByText('3 of 3 hints shown')).toBeTruthy()
    expect(button().textContent).toBe('No more hints')
    expect(button().disabled).toBe(true)
  })

  it('explains a wrong answer: misconception, best fit, why, other options, sources', async () => {
    renderAt(OUTAGE)
    await choose(/larger size/)
    await submit()

    const heading = screen.getByRole('heading', { level: 2, name: /Not quite/ })
    expect(document.activeElement).toBe(heading)
    expect(
      screen.getByText(/Making a machine bigger improves capacity, not availability/),
    ).toBeTruthy()
    expect(
      screen.getByText(
        /Run copies of the site in two or more Availability Zones in the same region/,
        {
          selector: 'p',
        },
      ),
    ).toBeTruthy()
    expect(screen.getByText(/Copies in separate zones keep running/)).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Why' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Other options' })).toBeTruthy()
    expect(screen.getByText(/this outage hit one datacenter/)).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Objectives and sources' })).toBeTruthy()
    expect(screen.getAllByRole('link', { name: /Microsoft Learn/ }).length).toBeGreaterThan(0)
  })

  it('locks the decision after submitting and removes the submit and hint controls', async () => {
    renderAt(OUTAGE)
    await choose(/daily backup/)
    await submit()
    for (const radio of screen.getAllByRole('radio')) expect(radio.matches(':disabled')).toBe(true)
    expect(screen.queryByRole('button', { name: 'Submit decision' })).toBeNull()
    expect(screen.queryByRole('button', { name: /hint/i })).toBeNull()
  })

  it('keeps the hints visible after review only if some were used, never an empty heading', async () => {
    renderAt(OUTAGE)
    await choose(/daily backup/)
    await submit()
    expect(screen.queryByRole('heading', { name: 'Hints' })).toBeNull()
    cleanup()

    renderAt(OUTAGE)
    await userEvent.click(screen.getByRole('button', { name: 'Show a hint' }))
    await choose(/daily backup/)
    await submit()
    expect(screen.getByRole('heading', { name: 'Hints' })).toBeTruthy()
    expect(screen.getByText(/one datacenter lost power/)).toBeTruthy()
  })

  it('does not repeat "Best fit" inside the explanation of the best option', async () => {
    renderAt(OUTAGE)
    await choose(/larger size/)
    await submit()
    expect(screen.getAllByText(/Best fit/)).toHaveLength(2) // the option tag and the label
  })

  it('confirms a correct answer without a "best fit" correction block', async () => {
    renderAt(OUTAGE)
    await choose(/Availability Zones/)
    await submit()
    expect(screen.getByRole('heading', { level: 2, name: /Correct/ })).toBeTruthy()
    expect(screen.queryByText('Best fit:')).toBeNull()
    expect(screen.getByRole('link', { name: 'Try a related challenge' })).toBeTruthy()
  })

  it('offers a fresh variant after a mistake and loads it with a clean slate', async () => {
    renderAt(OUTAGE)
    await choose(/different Azure region/)
    await submit()
    await userEvent.click(screen.getByRole('link', { name: 'Try a fresh variant' }))

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'The ticket site that slows on sale days',
      }),
    ).toBeTruthy()
    expect(screen.queryByRole('heading', { name: /Not quite|Correct/ })).toBeNull()
    for (const radio of screen.getAllByRole('radio')) {
      expect((radio as HTMLInputElement).checked).toBe(false)
      expect(radio.matches(':disabled')).toBe(false)
    }
    expect(document.activeElement?.id).toBe('main-content')
  })

  it('tests the idea in a changed context: the variant needs a different kind of answer', async () => {
    renderAt(SALE_DAY)
    // The pattern-matched answer from the first scenario is wrong here.
    await choose(/more than one Availability Zone/)
    await submit()
    expect(screen.getByRole('heading', { level: 2, name: /Not quite/ })).toBeTruthy()
    expect(screen.getByText(/Nothing failed here: the site is overloaded/)).toBeTruthy()
  })

  it('ends the chain at the variant: it only offers a way back to the lab', async () => {
    renderAt(SALE_DAY)
    await choose(/Add more instances/)
    await submit()
    expect(screen.getByRole('heading', { level: 2, name: /Correct/ })).toBeTruthy()
    expect(screen.queryByRole('link', { name: /fresh variant|related challenge/ })).toBeNull()
    const links = screen.getAllByRole('link', { name: 'Back to Scenario Lab' })
    expect(links.some((link) => link.getAttribute('href') === '#/app/lab')).toBe(true)
  })

  it('shows a helpful message for an unknown scenario, and for a knowledge-check id', () => {
    renderAt('#/app/lab/does-not-exist')
    expect(screen.getByRole('heading', { level: 1, name: 'Scenario not found' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Back to Scenario Lab' }).getAttribute('href')).toBe(
      '#/app/lab',
    )
    cleanup()
    renderAt('#/app/lab/legacy-q1')
    expect(screen.getByRole('heading', { level: 1, name: 'Scenario not found' })).toBeTruthy()
  })
})
