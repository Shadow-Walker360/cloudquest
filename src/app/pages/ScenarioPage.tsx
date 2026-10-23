import { ButtonLink } from '../../components/ButtonLink.tsx'
import { PageHeading } from '../../components/PageHeading.tsx'
import { contentPacks } from '../../content/registry.ts'
import { findChallenge, transferFor } from '../../features/scenarios/catalog.ts'
import { createAttempt, createMistakeItem } from '../../features/progress/attempts.ts'
import { useStore } from '../../features/progress/useStore.ts'
import { ScenarioRunner } from '../../features/scenarios/ScenarioRunner.tsx'
import { newId } from '../../infrastructure/ids.ts'
import { hrefFor } from '../routes.ts'

export function ScenarioPage({ scenarioId }: { scenarioId: string }) {
  const { data, actions } = useStore()
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
  const { pack, scenario } = challenge
  const added = data.revisionItems.some(
    (item) => item.source === 'mistake' && item.scenarioId === scenario.id,
  )
  return (
    <ScenarioRunner
      key={challenge.scenario.id}
      pack={challenge.pack}
      scenario={challenge.scenario}
      labHref={labHref}
      transferHref={transfer ? hrefFor({ name: 'scenario', scenarioId: transfer.id }) : undefined}
      onAttempt={({ evaluation, hintsUsed }) =>
        actions.recordAttempt(
          createAttempt({ scenario, pack, evaluation, hintsUsed, now: new Date(), id: newId() }),
        )
      }
      revision={{
        added,
        studioHref: hrefFor({ name: 'revision' }),
        onAdd: (evaluation) =>
          actions.addRevisionItem(
            createMistakeItem({ scenario, pack, evaluation, now: new Date(), id: newId() }),
          ),
      }}
    />
  )
}
