import { ButtonLink } from '../../components/ButtonLink.tsx'
import { EmptyState } from '../../components/EmptyState.tsx'
import { Icon } from '../../components/Icon.tsx'
import { PageHeading } from '../../components/PageHeading.tsx'
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
      <PageHeading kicker="Hands-on practice" title="Scenario Lab">
        Work through realistic cloud situations: read the context, weigh the constraints, make a
        decision, then see why it works or fails.
      </PageHeading>

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
              <span className="icon-tile icon-tile-blue">
                <Icon name="lab" />
              </span>
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
