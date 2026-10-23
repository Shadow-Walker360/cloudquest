import type { Attempt } from '../../domain/learning.ts'

/**
 * Evidence of practice per objective, derived only from recorded attempts.
 *
 * This describes what the learner has done in CloudQuest. It is NOT a prediction of an exam
 * result or a pass guarantee, and the UI says so.
 *
 * - not-assessed:    no attempts yet.
 * - needs-attention: the most recent attempt on the objective was wrong.
 * - developing:      the latest attempt was right, but fewer than 2 different scenarios have been
 *                    answered correctly without hints.
 * - secure:          at least 2 different scenarios answered correctly without hints, as the most
 *                    recent attempt on each, and the latest attempt overall was right.
 */
export type EvidenceStatus = 'not-assessed' | 'needs-attention' | 'developing' | 'secure'

export const SECURE_SCENARIOS_REQUIRED = 2

export interface ObjectiveEvidence {
  objectiveId: string
  title: string
  status: EvidenceStatus
  attempts: number
  correct: number
  /** Scenarios whose latest attempt for this objective was right and needed no hints. */
  independentScenarios: number
  /** Scenarios in the app that teach this objective. */
  availableScenarios: number
  /** True when too few scenarios exist for the objective to ever count as secure. */
  limitedContent: boolean
  lastAttemptAt?: string
}

function byTime(a: Attempt, b: Attempt): number {
  return Date.parse(a.submittedAt) - Date.parse(b.submittedAt)
}

export function objectiveEvidence(
  objective: { id: string; title: string },
  attempts: readonly Attempt[],
  availableScenarioIds: readonly string[],
): ObjectiveEvidence {
  const relevant = attempts.filter((a) => a.objectiveIds.includes(objective.id)).sort(byTime)
  const latestByScenario = new Map<string, Attempt>()
  for (const attempt of relevant) latestByScenario.set(attempt.scenarioId, attempt)

  const independentScenarios = [...latestByScenario.values()].filter(
    (a) => a.outcome === 'correct' && a.hintsUsed === 0,
  ).length
  const latest = relevant[relevant.length - 1]
  const limitedContent = availableScenarioIds.length < SECURE_SCENARIOS_REQUIRED

  let status: EvidenceStatus
  if (!latest) status = 'not-assessed'
  else if (latest.outcome === 'incorrect') status = 'needs-attention'
  else if (independentScenarios >= SECURE_SCENARIOS_REQUIRED) status = 'secure'
  else status = 'developing'

  const evidence: ObjectiveEvidence = {
    objectiveId: objective.id,
    title: objective.title,
    status,
    attempts: relevant.length,
    correct: relevant.filter((a) => a.outcome === 'correct').length,
    independentScenarios,
    availableScenarios: availableScenarioIds.length,
    limitedContent,
  }
  if (latest) evidence.lastAttemptAt = latest.submittedAt
  return evidence
}
