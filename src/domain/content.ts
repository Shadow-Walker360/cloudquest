/**
 * Content contracts for CloudQuest packs.
 *
 * Phase 0 scope: only what the current content needs. Attempt, revision and
 * architecture-diagram types are added in the phases that implement them.
 */

export type ID = string

export type Provider = 'azure' | 'aws' | 'gcp' | 'neutral'

/** `draft` content is never presented as reviewed or current. */
export type ContentStatus = 'draft' | 'reviewed' | 'archived'

export interface SourceReference {
  title: string
  /** Must be an absolute https URL. */
  url: string
  /** ISO date the source was last checked; omit if it has not been verified. */
  accessedAt?: string
}

export interface Objective {
  id: ID
  title: string
  description: string
  sourceRefs: SourceReference[]
}

/** Only single-choice exists today; other interactions arrive with their evaluators. */
export type InteractionType = 'single-choice'

export interface ScenarioOption {
  id: ID
  label: string
  /** For a wrong option: the misconception it signals. Must appear in `Scenario.misconceptionTags`. */
  feedbackTag?: string
}

export interface Hint {
  /** 1-based, sequential. */
  order: number
  text: string
}

/**
 * Evaluators are data, never code: a closed union of allow-listed rules.
 * Content cannot introduce new evaluator ids without a code change.
 */
export type EvaluatorSpec = { id: 'single-choice-exact'; correctOptionId: ID }

/**
 * `knowledge-check` is a short concept question; `scenario` is a situation
 * with context and constraints and must provide both.
 */
export type ScenarioFormat = 'knowledge-check' | 'scenario'

export interface Scenario {
  /** Lowercase letters, digits and hyphens only: it is used in URLs. */
  id: ID
  packId: ID
  version: string
  title: string
  summary: string
  difficulty: 'intro' | 'intermediate' | 'stretch'
  estimatedMinutes: number
  objectiveIds: ID[]
  format: ScenarioFormat
  context: string
  task: string
  constraints: string[]
  interactionType: InteractionType
  options: ScenarioOption[]
  hints: Hint[]
  evaluator: EvaluatorSpec
  explanation: string
  /** Why each option is right or wrong. Required for the `scenario` format. */
  optionRationales?: Record<ID, string>
  misconceptionTags: string[]
  /**
   * A fresh scenario in the same pack that tests an overlapping objective in a changed
   * context. Offered after feedback; never the same item with shuffled options.
   */
  transferScenarioId?: ID
  sourceRefs: SourceReference[]
  status: ContentStatus
  /** ISO date; required when status is `reviewed`. */
  reviewedAt?: string
}

export interface ContentPack {
  id: ID
  version: string
  provider: Provider
  title: string
  /** Must read as unofficial preparation, never as an official credential. */
  goalLabel: string
  /** Version of the public objective set the pack maps to; "unverified" if not checked. */
  objectiveSetVersion: string
  status: ContentStatus
  authors: string[]
  reviewers: string[]
  /** ISO date; required when status is `reviewed`. */
  reviewedAt?: string
  objectives: Objective[]
  scenarios: Scenario[]
}
