import { useState } from 'react'
import { Icon } from '../../components/Icon.tsx'
import { PageHeading } from '../../components/PageHeading.tsx'
import { Panel } from '../../components/Panel.tsx'
import { StatCard } from '../../components/StatCard.tsx'
import { StickyNote } from '../../components/StickyNote.tsx'
import { TornPage } from '../../components/TornPage.tsx'
import { EmptyState } from '../../components/EmptyState.tsx'
import { contentPacks } from '../../content/registry.ts'
import { NewCardForm } from '../../features/revision/NewCardForm.tsx'
import { ReviewSession } from '../../features/revision/ReviewSession.tsx'
import { describeDue, dueItems } from '../../features/revision/scheduler.ts'
import { collectObjectives, misconceptionLabel } from '../../features/progress/analytics.ts'
import { useStore } from '../../features/progress/useStore.ts'
import { hrefFor } from '../routes.ts'

export function RevisionPage() {
  const { data, actions } = useStore()
  const [now, setNow] = useState(() => new Date())
  const objectives = collectObjectives(contentPacks)
  const objectiveTitle = (id?: string) => objectives.find((o) => o.id === id)?.title

  const items = data.revisionItems
  const due = dueItems(items, now)
  const later = items
    .filter((item) => !due.includes(item))
    .sort((a, b) => Date.parse(a.schedule.dueAt) - Date.parse(b.schedule.dueAt))
  const cards = items.filter((item) => item.source === 'card')
  const mistakes = items.filter((item) => item.source === 'mistake')

  return (
    <>
      <PageHeading kicker="Spaced revision" title="Revision Studio">
        Revisit what you missed, and the cards you wrote yourself, just before you would forget
        them. Grade yourself honestly: the schedule only works if you do.
      </PageHeading>

      <ul className="stat-grid">
        <StatCard
          icon="revision"
          tone="amber"
          label="Due now"
          value={due.length}
          foot="Ready to review"
        />
        <StatCard
          icon="clock"
          tone="blue"
          label="Scheduled later"
          value={later.length}
          foot="Already reviewed"
        />
        <StatCard
          icon="note"
          tone="violet"
          label="Sticky cards"
          value={cards.length}
          foot="Written by you"
        />
        <StatCard
          icon="lab"
          tone="teal"
          label="From mistakes"
          value={mistakes.length}
          foot="Added from the Scenario Lab"
        />
      </ul>

      <ReviewSession
        due={due}
        now={now}
        nextDueAt={later[0]?.schedule.dueAt}
        onGrade={(id, grade) => {
          actions.reviewItem(id, grade)
          setNow(new Date())
        }}
      />

      <div className="two-col two-col-even">
        <Panel icon="note" kicker="Write it yourself" title="New sticky card">
          <NewCardForm
            itemCount={items.length}
            onCreate={(item) => {
              actions.createCard(item)
              // A new card is due immediately, so refresh "now" or it would look scheduled for later.
              setNow(new Date())
            }}
          />
        </Panel>

        <Panel icon="notebook" kicker="Your board" title="My sticky notes">
          {cards.length === 0 ? (
            <EmptyState title="No cards yet">
              Write a card on the left and it will be stuck here.
            </EmptyState>
          ) : (
            <ul className="sticky-board">
              {cards.map((item) => (
                <StickyNote
                  key={item.id}
                  item={item}
                  dueLabel={describeDue(item.schedule.dueAt, now)}
                  objectiveTitle={objectiveTitle(item.objectiveIds[0])}
                  onDelete={actions.deleteItem}
                />
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <TornPage labelledBy="mistakes-heading">
        <h2 id="mistakes-heading">From your mistakes</h2>
        {mistakes.length === 0 ? (
          <p className="hint">
            After a Scenario Lab attempt, choose “Add to revision” to keep the concept here.
          </p>
        ) : (
          <ul className="row-list">
            {mistakes.map((item) => (
              <li key={item.id}>
                <div>
                  <p className="row-title">{item.title}</p>
                  <p className="row-sub">
                    {item.misconceptionTag
                      ? misconceptionLabel(contentPacks, item.misconceptionTag)
                      : 'Added from a correct answer'}
                    {' · '}
                    {describeDue(item.schedule.dueAt, now)}
                  </p>
                  {item.scenarioId && (
                    <a href={hrefFor({ name: 'scenario', scenarioId: item.scenarioId })}>
                      Try the scenario again
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  className="button button-secondary"
                  aria-label={`Remove from revision: ${item.title}`}
                  onClick={() => actions.deleteItem(item.id)}
                >
                  <Icon name="trash" size={16} /> Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </TornPage>
    </>
  )
}
