import { ButtonLink } from '../../components/ButtonLink.tsx'
import { EmptyState } from '../../components/EmptyState.tsx'
import { StatusChip } from '../../components/StatusChip.tsx'
import { contentPacks } from '../../content/registry.ts'
import { listChallenges } from '../../features/scenarios/catalog.ts'
import { hrefFor } from '../routes.ts'

const DIFFICULTY = {
  intro: 'Introductory',
  intermediate: 'Intermediate',
  stretch: 'Stretch',
} as const

export function LabPage() {
  const challenges = listChallenges(contentPacks)
  const anyDraft = challenges.some(({ scenario }) => scenario.status !== 'reviewed')

  return (
    <>
      <h1>Scenario Lab</h1>
      <p className="lead">
        Work through realistic cloud situations: read the context, weigh the constraints, make a
        decision, then see why it works or fails.
      </p>

      {anyDraft && (
        <p className="notice" role="note">
          <strong>Draft preview.</strong> These scenarios are new and have not been reviewed against
          official sources yet.
        </p>
      )}

      {challenges.length === 0 ? (
        <EmptyState title="No scenarios yet">
          Scenarios will be listed here once they exist.
        </EmptyState>
      ) : (
        <ul className="card-grid">
          {challenges.map(({ pack, scenario }) => (
            <li key={scenario.id} className="card">
              <h2>{scenario.title}</h2>
              <p>{scenario.summary}</p>
              <p className="hint">
                {DIFFICULTY[scenario.difficulty]} · about {scenario.estimatedMinutes} min ·{' '}
                {pack.title}
              </p>
              {scenario.status !== 'reviewed' && (
                <StatusChip status="in-development" label="Draft · unreviewed" />
              )}
              <ButtonLink
                href={hrefFor({ name: 'scenario', scenarioId: scenario.id })}
                variant="secondary"
              >
                Start scenario<span className="visually-hidden">: {scenario.title}</span>
              </ButtonLink>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
