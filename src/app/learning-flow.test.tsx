// @vitest-environment jsdom
import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { STORE_KEY } from '../infrastructure/storage.ts'
import App from './App.tsx'

const OUTAGE = '#/app/lab/azure-datacenter-outage'
const SALE = '#/app/lab/azure-sale-day-slowdown'

function renderAt(hash: string) {
  window.location.hash = hash
  return render(<App />)
}

async function answer(label: RegExp, hints = 0) {
  for (let i = 0; i < hints; i++) {
    await userEvent.click(screen.getByRole('button', { name: /hint/i }))
  }
  await userEvent.click(screen.getByRole('radio', { name: label }))
  await userEvent.click(screen.getByRole('button', { name: 'Submit decision' }))
}

const stored = () => JSON.parse(window.localStorage.getItem(STORE_KEY) ?? 'null')

async function goTo(name: string) {
  const nav = screen.getByRole('navigation', { name: 'Workspace' })
  await userEvent.click(within(nav).getByRole('link', { name }))
}

describe('recording attempts', () => {
  it('saves one attempt per submitted decision, with outcome, misconception and hints', async () => {
    renderAt(OUTAGE)
    await answer(/larger size/, 2)
    const saved = stored()
    expect(saved.version).toBe(1)
    expect(saved.attempts).toHaveLength(1)
    expect(saved.attempts[0]).toMatchObject({
      scenarioId: 'azure-datacenter-outage',
      submittedOptionId: 'b',
      outcome: 'incorrect',
      misconceptionTag: 'scale-up-vs-availability',
      hintsUsed: 2,
    })
  })

  it('does not record anything before a decision is submitted', async () => {
    renderAt(OUTAGE)
    await userEvent.click(screen.getByRole('radio', { name: /larger size/ }))
    expect(stored()).toBeNull()
  })

  it('survives a refresh: the overview shows the saved attempt after remounting', async () => {
    const first = renderAt(OUTAGE)
    await answer(/Availability Zones/)
    first.unmount()
    renderAt('#/app')
    const card = screen.getByText('Attempts saved').closest('li') as HTMLElement
    expect(within(card).getByText('1')).toBeTruthy()
    expect(screen.getByText('The bakery site that went dark')).toBeTruthy()
    expect(screen.getByText('Correct')).toBeTruthy()
  })
})

describe('storage problems are never silent', () => {
  it('recovers from unreadable saved data, says so, and keeps a copy', async () => {
    window.localStorage.setItem(STORE_KEY, '{"version":1,"attempts":[')
    renderAt('#/app')
    expect(screen.getByRole('status').textContent).toMatch(/could not be read/)
    expect(window.localStorage.getItem('cloudquest.v1.unreadable-backup')).toBe(
      '{"version":1,"attempts":[',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByText(/could not be read/)).toBeNull()
  })

  it('skips only damaged entries and tells the learner', () => {
    window.localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        version: 1,
        profile: { displayName: 'Amina' },
        attempts: [
          {
            id: 'ok',
            scenarioId: 'azure-datacenter-outage',
            packId: 'azure-fundamentals-scenarios',
            objectiveIds: ['az900.cloud-concepts'],
            submittedOptionId: 'a',
            outcome: 'correct',
            hintsUsed: 0,
            submittedAt: new Date().toISOString(),
          },
          { id: 'bad' },
        ],
        revisionItems: [],
      }),
    )
    renderAt('#/app')
    expect(screen.getByRole('status').textContent).toMatch(/damaged/)
    const card = screen.getByText('Attempts saved').closest('li') as HTMLElement
    expect(within(card).getByText('1')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome back, Amina' })).toBeTruthy()
  })
})

describe('add to revision and review', () => {
  it('adds a mistake to revision once, and offers the Revision Studio', async () => {
    renderAt(OUTAGE)
    await answer(/larger size/)
    await userEvent.click(screen.getByRole('button', { name: 'Add to revision' }))
    const added = screen.getByRole('button', { name: 'Added to revision' }) as HTMLButtonElement
    expect(added.disabled).toBe(true)
    expect(screen.getByRole('link', { name: 'Open the Revision Studio' })).toBeTruthy()
    expect(stored().revisionItems).toHaveLength(1)
    expect(stored().revisionItems[0]).toMatchObject({
      source: 'mistake',
      scenarioId: 'azure-datacenter-outage',
      misconceptionTag: 'scale-up-vs-availability',
    })
  })

  it('reviews it: recall, reveal, grade, and the schedule changes', async () => {
    renderAt(OUTAGE)
    await answer(/larger size/)
    await userEvent.click(screen.getByRole('button', { name: 'Add to revision' }))
    await userEvent.click(screen.getByRole('link', { name: 'Open the Revision Studio' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Revision Studio' })).toBeTruthy()
    expect(screen.queryByText('Answer')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Show answer' }))
    expect(screen.getByText(/Best fit: Run copies of the site/)).toBeTruthy()

    const group = screen.getByRole('group', { name: 'How well did you recall it?' })
    expect(within(group).getByText(/Back in 10 minutes/)).toBeTruthy()
    await userEvent.click(within(group).getByRole('button', { name: /Recalled/ }))

    expect(screen.getByRole('heading', { name: 'All caught up' })).toBeTruthy()
    const item = stored().revisionItems[0]
    expect(item.schedule).toMatchObject({ intervalDays: 1, reps: 1 })
    expect(Date.parse(item.schedule.dueAt)).toBeGreaterThan(Date.now())
  })

  it('"Again" brings it back soon and counts a lapse', async () => {
    renderAt(OUTAGE)
    await answer(/larger size/)
    await userEvent.click(screen.getByRole('button', { name: 'Add to revision' }))
    await goTo('Revision Studio')
    await userEvent.click(await screen.findByRole('button', { name: 'Show answer' }))
    await userEvent.click(screen.getByRole('button', { name: /Again/ }))
    expect(stored().revisionItems[0].schedule).toMatchObject({ lapses: 1, intervalDays: 0 })
  })
})

describe('sticky-note cards', () => {
  async function createCard(title: string, note: string, colour = 'Yellow') {
    await userEvent.type(screen.getByLabelText('Title'), title)
    await userEvent.type(screen.getByLabelText(/^Note/), note)
    await userEvent.click(screen.getByRole('radio', { name: colour }))
    await userEvent.click(screen.getByRole('button', { name: 'Stick it on the board' }))
  }

  it('turns a written card into a coloured sticky note and a due revision item', async () => {
    renderAt('#/app/revision')
    await createCard('Zones vs regions', 'A zone is a datacenter inside a region.', 'Pink')

    const note = screen.getByRole('heading', { level: 3, name: 'Zones vs regions' }).closest('li')
    expect(note?.className).toContain('sticky-pink')
    expect(within(note as HTMLElement).getByText(/A zone is a datacenter/)).toBeTruthy()
    expect(within(note as HTMLElement).getByText('Due now')).toBeTruthy()
    expect(stored().revisionItems[0]).toMatchObject({ source: 'card', color: 'pink' })
    expect(screen.getByRole('status', { name: '' }).textContent).toBeDefined()
  })

  it('lets the learner review their own card and shows its note as the answer', async () => {
    renderAt('#/app/revision')
    await createCard('CapEx vs OpEx', 'Capital spend is up front; operating spend is ongoing.')
    await userEvent.click(screen.getByRole('button', { name: 'Show answer' }))
    expect(screen.getAllByText(/Capital spend is up front/).length).toBeGreaterThan(1)
  })

  it('rejects an empty card with a clear message and saves nothing', async () => {
    renderAt('#/app/revision')
    await userEvent.click(screen.getByRole('button', { name: 'Stick it on the board' }))
    expect(screen.getByRole('alert').textContent).toMatch(/title/i)
    expect(stored()).toBeNull()
  })

  it('deletes a card', async () => {
    renderAt('#/app/revision')
    await createCard('Temp', 'To be removed')
    await userEvent.click(screen.getByRole('button', { name: 'Delete card: Temp' }))
    expect(screen.queryByRole('heading', { level: 3, name: 'Temp' })).toBeNull()
    expect(stored().revisionItems).toEqual([])
  })
})

describe('student notebook', () => {
  it('shows a real, empty board before any activity, with nothing invented', () => {
    renderAt('#/app/profile')
    expect(screen.getByRole('heading', { level: 1, name: 'My notebook' })).toBeTruthy()
    const accuracy = screen
      .getByText('Accuracy', { selector: '.index-label' })
      .closest('li') as HTMLElement
    expect(within(accuracy).getByText('–')).toBeTruthy()
    expect(screen.getByText('No mistakes recorded')).toBeTruthy()
    expect(screen.getAllByText('Not assessed')).toHaveLength(3)
  })

  it('edits and saves the profile, which persists and appears in the sidebar', async () => {
    renderAt('#/app/profile')
    await userEvent.click(screen.getByRole('button', { name: /Edit profile/ }))
    await userEvent.type(screen.getByLabelText('Name'), 'Amina')
    await userEvent.type(screen.getByLabelText('Studying for'), 'Cloud basics')
    await userEvent.selectOptions(screen.getByLabelText('Preferred track'), 'azure')
    await userEvent.selectOptions(screen.getByLabelText('Weekly goal'), '5')
    await userEvent.click(screen.getByRole('button', { name: 'Save profile' }))

    expect(stored().profile).toMatchObject({
      displayName: 'Amina',
      goal: 'Cloud basics',
      preferredTrack: 'azure',
      sessionsPerWeek: 5,
    })
    expect(screen.getByText('Microsoft Azure')).toBeTruthy()
    expect(screen.getByText('5 study days a week')).toBeTruthy()
    const sidebar = document.getElementById('app-sidebar') as HTMLElement
    expect(within(sidebar).getByText('Amina')).toBeTruthy()
    expect(document.activeElement?.textContent).toMatch(/Edit profile/)
  })

  it('builds the analytics board from real attempts: accuracy, evidence, misconceptions', async () => {
    const first = renderAt(OUTAGE)
    await answer(/larger size/, 1)
    first.unmount()
    const second = renderAt(SALE)
    await answer(/Add more instances/)
    second.unmount()
    renderAt('#/app/profile')

    const attempts = screen
      .getByText('Attempts', { selector: '.index-label' })
      .closest('li') as HTMLElement
    expect(within(attempts).getByText('2')).toBeTruthy()
    const accuracy = screen
      .getByText('Accuracy', { selector: '.index-label' })
      .closest('li') as HTMLElement
    expect(within(accuracy).getByText('50%')).toBeTruthy()
    expect(screen.getByText('A bigger machine is not a more available one')).toBeTruthy()

    // Cloud concepts: latest attempt was right, but only one scenario was solved without hints.
    const concepts = screen.getByText('Cloud concepts').closest('li') as HTMLElement
    expect(within(concepts).getByText('Developing')).toBeTruthy()
    // The architecture objective only has one scenario, so it is flagged as limited.
    const architecture = screen
      .getByText('Azure architecture and services')
      .closest('li') as HTMLElement
    expect(architecture.textContent).toMatch(/cannot be marked secure yet/)
    expect(within(architecture).getByText('Needs attention')).toBeTruthy()
    expect(screen.getByText(/not a prediction of an exam result/)).toBeTruthy()
  })

  it('offers the chart as a table for assistive technology', () => {
    renderAt('#/app/profile')
    expect(screen.getByRole('img', { name: /Attempts per day over the last 14 days/ })).toBeTruthy()
    expect(screen.getByText('View the numbers as a table')).toBeTruthy()
  })

  it('exports data and deletes everything only after confirmation', async () => {
    const first = renderAt(OUTAGE)
    await answer(/Availability Zones/)
    first.unmount()
    renderAt('#/app/profile')

    await userEvent.click(screen.getByRole('button', { name: 'Delete all my data' }))
    const group = screen.getByRole('group', { name: 'Delete everything?' })
    expect(document.activeElement).toBe(within(group).getByRole('button', { name: 'Keep my data' }))
    await userEvent.click(within(group).getByRole('button', { name: 'Keep my data' }))
    expect(stored().attempts).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: 'Delete all my data' }))
    await userEvent.click(screen.getByRole('button', { name: 'Yes, delete everything' }))
    expect(window.localStorage.getItem(STORE_KEY)).toBeNull()
    expect(screen.getByText(/deleted from this browser/)).toBeTruthy()
    const attempts = screen
      .getByText('Attempts', { selector: '.index-label' })
      .closest('li') as HTMLElement
    expect(within(attempts).getByText('0')).toBeTruthy()
  })

  it('states plainly where the data lives', () => {
    renderAt('#/app/profile')
    expect(screen.getByText(/lives only in this browser/)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Download my data/ })).toBeTruthy()
  })
})

describe('torn pages', () => {
  it('appear as labelled regions, so decoration never hides structure', async () => {
    renderAt(OUTAGE)
    await answer(/larger size/)
    expect(screen.getByRole('region', { name: 'Why' })).toBeTruthy()
    cleanup()
    await act(async () => {})
    renderAt('#/app/revision')
    expect(screen.getByRole('region', { name: 'All caught up' })).toBeTruthy()
  })
})
