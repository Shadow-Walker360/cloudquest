import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState.tsx'
import { Icon } from '../../components/Icon.tsx'
import { StickyNote } from '../../components/StickyNote.tsx'
import { contentPacks } from '../../content/registry.ts'
import { downloadText } from '../../infrastructure/download.ts'
import { collectObjectives, summarize } from '../../features/progress/analytics.ts'
import { DataPanel } from '../../features/progress/DataPanel.tsx'
import { ProfileCard } from '../../features/progress/ProfileCard.tsx'
import { ProgressBoard } from '../../features/progress/ProgressBoard.tsx'
import { useStore } from '../../features/progress/useStore.ts'
import { describeDue } from '../../features/revision/scheduler.ts'
import { hrefFor } from '../routes.ts'

/** The student's notebook: profile, analytics board and sticky notes on one ruled page. */
export function ProfilePage() {
  const { data, actions } = useStore()
  const [now] = useState(() => new Date())
  const summary = useMemo(() => summarize(data, contentPacks, now), [data, now])
  const objectives = collectObjectives(contentPacks)
  const cards = data.revisionItems.filter((item) => item.source === 'card')
  const name = data.profile.displayName

  return (
    <div className="notebook">
      <div className="notebook-wrap">
        <div className="notebook-page">
          <header className="notebook-header">
            <p className="kicker">{name ? name : 'Guest'}</p>
            <h1 className="handwritten">My notebook</h1>
            <p className="subtitle">
              Everything here is written from your own activity, and stays on this device.
            </p>
          </header>

          <section aria-labelledby="about-heading" className="notebook-section">
            <h2 id="about-heading" className="handwritten">
              About me
            </h2>
            <ProfileCard profile={data.profile} onSave={actions.updateProfile} />
          </section>

          <section aria-labelledby="board-heading" className="notebook-section">
            <h2 id="board-heading" className="handwritten">
              My progress board
            </h2>
            <ProgressBoard summary={summary} sessionsPerWeek={data.profile.sessionsPerWeek} />
          </section>

          <section aria-labelledby="cards-heading" className="notebook-section">
            <h2 id="cards-heading" className="handwritten">
              My sticky notes
            </h2>
            {cards.length === 0 ? (
              <EmptyState title="No sticky notes yet">
                Write a card in the Revision Studio and it will be stuck here.
              </EmptyState>
            ) : (
              <ul className="sticky-board">
                {cards.slice(-4).map((item) => (
                  <StickyNote
                    key={item.id}
                    item={item}
                    dueLabel={describeDue(item.schedule.dueAt, now)}
                    objectiveTitle={objectives.find((o) => o.id === item.objectiveIds[0])?.title}
                  />
                ))}
              </ul>
            )}
            <p className="panel-foot">
              <a href={hrefFor({ name: 'revision' })}>
                <Icon name="note" size={16} /> Open the Revision Studio
              </a>
            </p>
          </section>

          <section aria-labelledby="data-heading" className="notebook-section">
            <h2 id="data-heading" className="handwritten">
              My data
            </h2>
            <DataPanel
              onExport={() =>
                downloadText(
                  `cloudquest-data-${new Date().toISOString().slice(0, 10)}.json`,
                  actions.exportJson(),
                )
              }
              onReset={actions.resetAll}
            />
          </section>
        </div>
      </div>
    </div>
  )
}
