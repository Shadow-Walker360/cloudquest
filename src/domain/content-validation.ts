import type { ContentPack, Scenario } from './content.ts'

export type IssueCode =
  | 'empty-field'
  | 'duplicate-id'
  | 'unresolved-objective'
  | 'missing-sources'
  | 'invalid-url'
  | 'invalid-date'
  | 'invalid-options'
  | 'invalid-evaluator'
  | 'invalid-hints'
  | 'invalid-rationale'
  | 'review-status'

export interface ValidationIssue {
  /** Dot path to the offending value, e.g. `scenarios[2].options`. */
  path: string
  code: IssueCode
  message: string
}

function isBlank(value: string): boolean {
  return value.trim().length === 0
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}/.test(value) && !Number.isNaN(Date.parse(value))
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function findDuplicates(ids: string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id)
    seen.add(id)
  }
  return [...duplicates]
}

function validateScenario(
  scenario: Scenario,
  path: string,
  pack: ContentPack,
  objectiveIds: Set<string>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const add = (subpath: string, code: IssueCode, message: string) =>
    issues.push({ path: `${path}.${subpath}`, code, message })

  for (const field of ['id', 'version', 'title', 'summary', 'task', 'explanation'] as const) {
    if (isBlank(scenario[field])) add(field, 'empty-field', `${field} must not be empty.`)
  }
  if (scenario.packId !== pack.id) {
    add(
      'packId',
      'unresolved-objective',
      `packId "${scenario.packId}" does not match pack "${pack.id}".`,
    )
  }
  if (scenario.format === 'scenario') {
    if (isBlank(scenario.context)) add('context', 'empty-field', 'A scenario needs context.')
    if (scenario.constraints.length === 0)
      add('constraints', 'empty-field', 'A scenario needs constraints.')
  }

  if (scenario.objectiveIds.length === 0) {
    add('objectiveIds', 'unresolved-objective', 'At least one objective is required.')
  }
  for (const objectiveId of scenario.objectiveIds) {
    if (!objectiveIds.has(objectiveId)) {
      add(
        'objectiveIds',
        'unresolved-objective',
        `Objective "${objectiveId}" is not defined in this pack.`,
      )
    }
  }

  if (scenario.sourceRefs.length === 0) {
    add('sourceRefs', 'missing-sources', 'At least one source reference is required.')
  }
  scenario.sourceRefs.forEach((ref, i) => {
    if (!isHttpsUrl(ref.url))
      add(`sourceRefs[${i}].url`, 'invalid-url', `"${ref.url}" is not an https URL.`)
  })

  const optionIds = scenario.options.map((o) => o.id)
  if (scenario.options.length < 2)
    add('options', 'invalid-options', 'At least two options are required.')
  for (const duplicate of findDuplicates(optionIds)) {
    add('options', 'duplicate-id', `Option id "${duplicate}" is used more than once.`)
  }
  scenario.options.forEach((option, i) => {
    if (isBlank(option.id) || isBlank(option.label)) {
      add(`options[${i}]`, 'empty-field', 'Option id and label must not be empty.')
    }
  })

  if (scenario.evaluator.id === 'single-choice-exact') {
    if (!optionIds.includes(scenario.evaluator.correctOptionId)) {
      add(
        'evaluator.correctOptionId',
        'invalid-evaluator',
        'correctOptionId must match an option id.',
      )
    }
  }

  if (scenario.optionRationales) {
    for (const optionId of Object.keys(scenario.optionRationales)) {
      if (!optionIds.includes(optionId)) {
        add(
          'optionRationales',
          'invalid-rationale',
          `Rationale refers to unknown option "${optionId}".`,
        )
      }
    }
  }

  scenario.hints.forEach((hint, i) => {
    if (hint.order !== i + 1) {
      add(
        `hints[${i}].order`,
        'invalid-hints',
        `Hint order must be sequential from 1 (expected ${i + 1}).`,
      )
    }
    if (isBlank(hint.text)) add(`hints[${i}].text`, 'empty-field', 'Hint text must not be empty.')
  })

  if (scenario.status === 'reviewed') {
    if (!scenario.reviewedAt || !isIsoDate(scenario.reviewedAt)) {
      add('reviewedAt', 'review-status', 'A reviewed scenario needs a valid reviewedAt date.')
    }
  } else if (scenario.reviewedAt !== undefined && !isIsoDate(scenario.reviewedAt)) {
    add('reviewedAt', 'invalid-date', `"${scenario.reviewedAt}" is not a valid ISO date.`)
  }

  return issues
}

/**
 * Pure integrity check for a content pack. Returns every problem found;
 * an empty array means the pack is structurally sound. It does not judge
 * whether the content is correct; that is what review status is for.
 */
export function validatePack(pack: ContentPack): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const add = (path: string, code: IssueCode, message: string) =>
    issues.push({ path, code, message })

  for (const field of ['id', 'version', 'title', 'goalLabel', 'objectiveSetVersion'] as const) {
    if (isBlank(pack[field])) add(field, 'empty-field', `${field} must not be empty.`)
  }

  const objectiveIds = pack.objectives.map((o) => o.id)
  for (const duplicate of findDuplicates(objectiveIds)) {
    add('objectives', 'duplicate-id', `Objective id "${duplicate}" is used more than once.`)
  }
  pack.objectives.forEach((objective, i) => {
    if (objective.sourceRefs.length === 0) {
      add(
        `objectives[${i}].sourceRefs`,
        'missing-sources',
        `Objective "${objective.id}" needs a source reference.`,
      )
    }
    objective.sourceRefs.forEach((ref, j) => {
      if (!isHttpsUrl(ref.url)) {
        add(
          `objectives[${i}].sourceRefs[${j}].url`,
          'invalid-url',
          `"${ref.url}" is not an https URL.`,
        )
      }
    })
  })

  for (const duplicate of findDuplicates(pack.scenarios.map((s) => s.id))) {
    add('scenarios', 'duplicate-id', `Scenario id "${duplicate}" is used more than once.`)
  }
  const objectiveIdSet = new Set(objectiveIds)
  pack.scenarios.forEach((scenario, i) => {
    issues.push(...validateScenario(scenario, `scenarios[${i}]`, pack, objectiveIdSet))
  })

  if (pack.status === 'reviewed') {
    if (!pack.reviewedAt || !isIsoDate(pack.reviewedAt)) {
      add('reviewedAt', 'review-status', 'A reviewed pack needs a valid reviewedAt date.')
    }
    if (pack.reviewers.length === 0)
      add('reviewers', 'review-status', 'A reviewed pack needs at least one reviewer.')
    pack.scenarios.forEach((scenario, i) => {
      if (scenario.status !== 'reviewed') {
        add(`scenarios[${i}].status`, 'review-status', `Scenario "${scenario.id}" is not reviewed.`)
      }
    })
  }

  return issues
}
