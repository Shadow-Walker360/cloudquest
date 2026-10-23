import { ButtonLink } from '../../components/ButtonLink.tsx'
import { PageHeading } from '../../components/PageHeading.tsx'
import { contentPacks } from '../../content/registry.ts'
import { findChallenge, transferFor } from '../../features/scenarios/catalog.ts'
import { ScenarioRunner } from '../../features/scenarios/ScenarioRunner.tsx'
import { hrefFor } from '../routes.ts'

export function ScenarioPage({ scenarioId }: { scenarioId: string }) {
  const challenge = findChallenge(contentPacks, scenarioId)
  const labHref = hrefFor({ name: 'lab' })

  if (!challenge) {
    return (
      <>
        <PageHeading kicker="Scenario Lab" title="Scenario not found">
          That scenario does not exist, or it is no longer available.
        </PageHeading>
        <div className="page-actions">
          <ButtonLink href={labHref}>Back to Scenario Lab</ButtonLink>
        </div>
      </>
    )
  }

  const transfer = transferFor(challenge)
  return (
    <ScenarioRunner
      key={challenge.scenario.id}
      pack={challenge.pack}
      scenario={challenge.scenario}
      labHref={labHref}
      transferHref={transfer ? hrefFor({ name: 'scenario', scenarioId: transfer.id }) : undefined}
    />
  )
}
