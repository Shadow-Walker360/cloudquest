import { describe, expect, it } from 'vitest'
import type { ContentPack, Scenario } from './content.ts'
import { validatePack } from './content-validation.ts'

const source = { title: 'Example source', url: 'https://example.com/learn' }

function makeScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    id: 's1',
    packId: 'p1',
    version: '1.0.0',
    title: 'Pick the right option',
    summary: 'A short summary',
    difficulty: 'intro',
    estimatedMinutes: 2,
    objectiveIds: ['o1'],
    format: 'scenario',
    context: 'A small team needs to choose.',
    task: 'Choose the best option.',
    constraints: ['Keep it simple'],
    interactionType: 'single-choice',
    options: [
      { id: 'a', label: 'Option A' },
      { id: 'b', label: 'Option B' },
    ],
    hints: [{ order: 1, text: 'Think about the constraint.' }],
    evaluator: { id: 'single-choice-exact', correctOptionId: 'a' },
    explanation: 'A fits because of the constraint.',
    misconceptionTags: [],
    sourceRefs: [source],
    status: 'draft',
    ...overrides,
  }
}

function makePack(overrides: Partial<ContentPack> = {}): ContentPack {
  return {
    id: 'p1',
    version: '1.0.0',
    provider: 'neutral',
    title: 'Test pack',
    goalLabel: 'Unofficial preparation',
    objectiveSetVersion: 'unverified',
    status: 'draft',
    authors: ['Tester'],
    reviewers: [],
    objectives: [{ id: 'o1', title: 'Objective', description: 'Desc', sourceRefs: [source] }],
    scenarios: [makeScenario()],
    ...overrides,
  }
}

const codes = (pack: ContentPack) => validatePack(pack).map((issue) => issue.code)

describe('validatePack', () => {
  it('accepts a well-formed pack', () => {
    expect(validatePack(makePack())).toEqual([])
  })

  it('flags empty required pack fields', () => {
    expect(codes(makePack({ title: '  ' }))).toContain('empty-field')
  })

  it('flags duplicate objective and scenario ids', () => {
    const objective = { id: 'o1', title: 'T', description: 'D', sourceRefs: [source] }
    expect(codes(makePack({ objectives: [objective, objective] }))).toContain('duplicate-id')
    expect(codes(makePack({ scenarios: [makeScenario(), makeScenario()] }))).toContain(
      'duplicate-id',
    )
  })

  it('flags scenarios that reference unknown objectives or have none', () => {
    expect(codes(makePack({ scenarios: [makeScenario({ objectiveIds: ['missing'] })] }))).toContain(
      'unresolved-objective',
    )
    expect(codes(makePack({ scenarios: [makeScenario({ objectiveIds: [] })] }))).toContain(
      'unresolved-objective',
    )
  })

  it('flags a scenario whose packId does not match the pack', () => {
    expect(codes(makePack({ scenarios: [makeScenario({ packId: 'other' })] }))).toContain(
      'unresolved-objective',
    )
  })

  it('requires sources and https URLs on scenarios and objectives', () => {
    expect(codes(makePack({ scenarios: [makeScenario({ sourceRefs: [] })] }))).toContain(
      'missing-sources',
    )
    const http = { title: 'Insecure', url: 'http://example.com' }
    expect(codes(makePack({ scenarios: [makeScenario({ sourceRefs: [http] })] }))).toContain(
      'invalid-url',
    )
    const bad = {
      id: 'o1',
      title: 'T',
      description: 'D',
      sourceRefs: [{ title: 'x', url: 'nope' }],
    }
    expect(codes(makePack({ objectives: [bad] }))).toContain('invalid-url')
    expect(codes(makePack({ objectives: [{ ...bad, sourceRefs: [] }] }))).toContain(
      'missing-sources',
    )
  })

  it('requires context and constraints for the scenario format only', () => {
    expect(codes(makePack({ scenarios: [makeScenario({ context: '' })] }))).toContain('empty-field')
    expect(codes(makePack({ scenarios: [makeScenario({ constraints: [] })] }))).toContain(
      'empty-field',
    )
    const check = makeScenario({ format: 'knowledge-check', context: '', constraints: [] })
    expect(validatePack(makePack({ scenarios: [check] }))).toEqual([])
  })

  it('validates options and the evaluator answer key', () => {
    const one = makeScenario({ options: [{ id: 'a', label: 'Only' }] })
    expect(codes(makePack({ scenarios: [one] }))).toContain('invalid-options')

    const dup = makeScenario({
      options: [
        { id: 'a', label: 'A' },
        { id: 'a', label: 'Also A' },
      ],
    })
    expect(codes(makePack({ scenarios: [dup] }))).toContain('duplicate-id')

    const badKey = makeScenario({ evaluator: { id: 'single-choice-exact', correctOptionId: 'z' } })
    expect(codes(makePack({ scenarios: [badKey] }))).toContain('invalid-evaluator')
  })

  it('flags rationales for unknown options', () => {
    const scenario = makeScenario({ optionRationales: { z: 'No such option' } })
    expect(codes(makePack({ scenarios: [scenario] }))).toContain('invalid-rationale')
  })

  it('requires hints to be sequential from 1 and non-empty', () => {
    const skipped = makeScenario({ hints: [{ order: 2, text: 'Late' }] })
    expect(codes(makePack({ scenarios: [skipped] }))).toContain('invalid-hints')
    const blank = makeScenario({ hints: [{ order: 1, text: ' ' }] })
    expect(codes(makePack({ scenarios: [blank] }))).toContain('empty-field')
  })

  it('requires review metadata before content may claim to be reviewed', () => {
    const unreviewedScenario = makeScenario({ status: 'reviewed' })
    expect(codes(makePack({ scenarios: [unreviewedScenario] }))).toContain('review-status')

    expect(codes(makePack({ status: 'reviewed' }))).toContain('review-status')

    const reviewedScenario = makeScenario({ status: 'reviewed', reviewedAt: '2026-10-21' })
    const reviewedPack = makePack({
      status: 'reviewed',
      reviewedAt: '2026-10-21',
      reviewers: ['Reviewer'],
      scenarios: [reviewedScenario],
    })
    expect(validatePack(reviewedPack)).toEqual([])
  })

  it('rejects malformed dates', () => {
    const scenario = makeScenario({ reviewedAt: 'last tuesday' })
    expect(codes(makePack({ scenarios: [scenario] }))).toContain('invalid-date')
  })

  it('reports paths so authors can find the problem', () => {
    const issues = validatePack(makePack({ scenarios: [makeScenario({ sourceRefs: [] })] }))
    expect(issues[0]?.path).toBe('scenarios[0].sourceRefs')
  })
})
