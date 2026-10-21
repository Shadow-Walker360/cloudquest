import type { ContentPack, ID, Scenario } from '../../domain/content.ts'

export interface Challenge {
  pack: ContentPack
  scenario: Scenario
}

function activePacks(packs: readonly ContentPack[]): ContentPack[] {
  return packs.filter((pack) => pack.status !== 'archived')
}

/**
 * Scenarios a learner can start from the Scenario Lab: scenario-format items that are not
 * archived and are not reached only as another scenario's transfer variant. Short
 * knowledge-check items are not surfaced here.
 */
export function listChallenges(packs: readonly ContentPack[]): Challenge[] {
  const active = activePacks(packs)
  const transferTargets = new Set(
    active.flatMap((pack) => pack.scenarios.map((s) => s.transferScenarioId).filter(Boolean)),
  )
  return active.flatMap((pack) =>
    pack.scenarios
      .filter(
        (scenario) =>
          scenario.format === 'scenario' &&
          scenario.status !== 'archived' &&
          !transferTargets.has(scenario.id),
      )
      .map((scenario) => ({ pack, scenario })),
  )
}

/** Finds any playable scenario by id, including transfer variants. */
export function findChallenge(
  packs: readonly ContentPack[],
  scenarioId: ID,
): Challenge | undefined {
  for (const pack of activePacks(packs)) {
    const scenario = pack.scenarios.find(
      (candidate) =>
        candidate.id === scenarioId &&
        candidate.format === 'scenario' &&
        candidate.status !== 'archived',
    )
    if (scenario) return { pack, scenario }
  }
  return undefined
}

/** The fresh-context variant offered after feedback, if the scenario defines one. */
export function transferFor(challenge: Challenge): Scenario | undefined {
  const { pack, scenario } = challenge
  if (!scenario.transferScenarioId) return undefined
  return pack.scenarios.find(
    (candidate) => candidate.id === scenario.transferScenarioId && candidate.status !== 'archived',
  )
}
