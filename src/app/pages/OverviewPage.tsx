import { ButtonLink } from '../../components/ButtonLink.tsx'
import { EmptyState } from '../../components/EmptyState.tsx'
import { StatusChip } from '../../components/StatusChip.tsx'
import { contentPacks } from '../../content/registry.ts'
import { features } from '../navigation.ts'
import { hrefFor } from '../routes.ts'

export function OverviewPage() {
  return (
    <>
      <h1>Your workspace</h1>
      <p className="lead">
        You are exploring as a guest. Accounts are not available in this prototype, and nothing you
        do is saved yet.
      </p>
      <div className="page-actions">
        <ButtonLink href={hrefFor({ name: 'lab' })}>Open the Scenario Lab</ButtonLink>
      </div>

      <section className="panel" aria-labelledby="activity-title">
        <h2 id="activity-title">Your activity</h2>
        <EmptyState title="No activity yet">
          Nothing is recorded yet. Saving attempts and showing progress are planned features.
        </EmptyState>
      </section>

      <section className="panel" aria-labelledby="status-title">
        <h2 id="status-title">What is available</h2>
        <ul className="status-list">
          {features
            .filter((feature) => feature.id !== 'overview')
            .map((feature) => (
              <li key={feature.id}>
                <div>
                  <strong>{feature.label}</strong>
                  <p>{feature.description}</p>
                </div>
                <StatusChip status={feature.status} />
              </li>
            ))}
        </ul>
      </section>

      <section className="panel" aria-labelledby="content-title">
        <h2 id="content-title">Content loaded</h2>
        <ul className="plain-list">
          {contentPacks.map((pack) => (
            <li key={pack.id}>
              <strong>{pack.title}</strong>: {pack.scenarios.length} items across{' '}
              {pack.objectives.length} objectives, status <em>{pack.status}</em>
              {pack.status === 'draft' && ' (not yet reviewed)'}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
