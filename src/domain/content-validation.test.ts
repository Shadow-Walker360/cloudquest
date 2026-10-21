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
      { id: 'b', label: 'Option B', feedbackTag: 'tag-b' },
    ],
    hints: [{ order: 1, text: 'Think about the constraint.' }],
    evaluator: { id: 'single-choice-exact', correctOptionId: 'a' },
    explanation: 'A fits because of the constraint.',
    optionRationales: { a: 'A satisfies the constraint.', b: 'B ignores the constraint.' },
    misconceptionTags: ['tag-b'],
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

  it('requires URL-safe scenario ids', () => {
    expect(codes(makePack({ scenarios: [makeScenario({ id: 'Bad Id' })] }))).toContain('invalid-id')
  })

  it('requires a rationale for every option in the scenario format', () => {
    const scenario = makeScenario({ optionRationales: { a: 'Only A is explained.' } })
    const issues = validatePack(makePack({ scenarios: [scenario] }))
    expect(issues.map((i) => i.path)).toContain('scenarios[0].optionRationales.b')
    const knowledgeCheck = makeScenario({ format: 'knowledge-check', optionRationales: undefined })
    expect(codes(makePack({ scenarios: [knowledgeCheck] }))).not.toContain('invalid-rationale')
  })

  it('ties misconception tags to wrong options', () => {
    const untagged = makeScenario({
      options: [
        { id: 'a', label: 'Option A' },
        { id: 'b', label: 'Option B' },
      ],
    })
    expect(codes(makePack({ scenarios: [untagged] }))).toContain('invalid-misconception')

    const unlisted = makeScenario({ misconceptionTags: [] })
    expect(codes(makePack({ scenarios: [unlisted] }))).toContain('invalid-misconception')

    const taggedCorrect = makeScenario({
      options: [
        { id: 'a', label: 'Option A', feedbackTag: 'tag-b' },
        { id: 'b', label: 'Option B', feedbackTag: 'tag-b' },
      ],
    })
    expect(codes(makePack({ scenarios: [taggedCorrect] }))).toContain('invalid-misconception')
  })

  describe('transfer scenarios', () => {
    const original = makeScenario({ transferScenarioId: 's2' })
    const variant = makeScenario({
      id: 's2',
      task: 'A different task in a different situation.',
      options: [
        { id: 'a', label: 'Fresh option A' },
        { id: 'b', label: 'Fresh option B', feedbackTag: 'tag-b' },
      ],
    })

    it('accepts a changed-context variant that shares an objective', () => {
      expect(validatePack(makePack({ scenarios: [original, variant] }))).toEqual([])
    })

    it('rejects a missing target, a self reference, and a different objective', () => {
      expect(codes(makePack({ scenarios: [original] }))).toContain('invalid-transfer')
      expect(
        codes(makePack({ scenarios: [makeScenario({ transferScenarioId: 's1' })] })),
      ).toContain('invalid-transfer')
      const elsewhere = { ...variant, objectiveIds: ['o2'] }
      const pack = makePack({
        objectives: [
          { id: 'o1', title: 'One', description: 'D', sourceRefs: [source] },
          { id: 'o2', title: 'Two', description: 'D', sourceRefs: [source] },
        ],
        scenarios: [original, elsewhere],
      })
      expect(codes(pack)).toContain('invalid-transfer')
    })

    it('rejects the same options in a new order, even with a different task', () => {
      const shuffled = { ...variant, options: [...original.options].reverse() }
      const issues = validatePack(makePack({ scenarios: [original, shuffled] }))
      expect(issues.map((i) => i.code)).toEqual(['invalid-transfer'])
      expect(issues[0]?.message).toMatch(/reshuffle/)
    })

    it('rejects a variant that reuses the task, even with different options', () => {
      const sameTask = { ...variant, task: original.task }
      const issues = validatePack(makePack({ scenarios: [original, sameTask] }))
      expect(issues.map((i) => i.code)).toEqual(['invalid-transfer'])
    })
  })

  it('reports paths so authors can find the problem', () => {
    const issues = validatePack(makePack({ scenarios: [makeScenario({ sourceRefs: [] })] }))
    expect(issues[0]?.path).toBe('scenarios[0].sourceRefs')
  })
})
