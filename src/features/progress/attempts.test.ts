import { describe, expect, it } from 'vitest'
import { contentPacks } from '../../content/registry.ts'
import type { ContentPack, Scenario } from '../../domain/content.ts'
import { CARD_LIMITS } from '../../domain/learning.ts'
import { isDue } from '../revision/scheduler.ts'
import { evaluateScenario } from '../scenarios/evaluate.ts'
import { createAttempt, createCardItem, createMistakeItem } from './attempts.ts'

const NOW = new Date('2026-10-21T10:00:00.000Z')
const pack = contentPacks.find((p) => p.id === 'azure-fundamentals-scenarios') as ContentPack
const scenario = pack.scenarios.find((s) => s.id === 'azure-datacenter-outage') as Scenario
const wrong = evaluateScenario(scenario, 'b')!
const right = evaluateScenario(scenario, 'a')!

describe('createAttempt', () => {
  it('records the outcome, objectives, hints and misconception from a wrong answer', () => {
    expect(
      createAttempt({ scenario, pack, evaluation: wrong, hintsUsed: 2, now: NOW, id: 'x' }),
    ).toEqual({
      id: 'x',
      scenarioId: 'azure-datacenter-outage',
      packId: 'azure-fundamentals-scenarios',
      objectiveIds: ['az900.cloud-concepts', 'az900.architecture-services'],
      submittedOptionId: 'b',
      outcome: 'incorrect',
      misconceptionTag: 'scale-up-vs-availability',
      hintsUsed: 2,
      submittedAt: NOW.toISOString(),
    })
  })

  it('leaves out the misconception for a correct answer, and copies the objectives', () => {
    const attempt = createAttempt({
      scenario,
      pack,
      evaluation: right,
      hintsUsed: 0,
      now: NOW,
      id: 'y',
    })
    expect(attempt.outcome).toBe('correct')
    expect('misconceptionTag' in attempt).toBe(false)
    attempt.objectiveIds.push('mutated')
    expect(scenario.objectiveIds).not.toContain('mutated')
  })
})

describe('createMistakeItem', () => {
  it('builds a revision card from the scenario, due immediately', () => {
    const item = createMistakeItem({ scenario, pack, evaluation: wrong, now: NOW, id: 'r' })
    expect(item).toMatchObject({
      source: 'mistake',
      title: scenario.title,
      prompt: scenario.task,
      scenarioId: scenario.id,
      misconceptionTag: 'scale-up-vs-availability',
    })
    expect(item.answer).toContain('Availability Zones')
    expect(item.answer).toContain(scenario.explanation)
    expect(isDue(item.schedule, NOW)).toBe(true)
  })
})

describe('createCardItem', () => {
  const base = {
    title: ' Zones ',
    note: ' A zone is a datacenter. ',
    color: 'pink' as const,
    now: NOW,
    id: 'c',
  }

  it('creates a trimmed sticky-note card that joins the queue', () => {
    const result = createCardItem(base)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.item).toMatchObject({
      source: 'card',
      title: 'Zones',
      prompt: 'Zones',
      answer: 'A zone is a datacenter.',
      color: 'pink',
      objectiveIds: [],
    })
    expect(isDue(result.item.schedule, NOW)).toBe(true)
  })

  it('links an objective when one is chosen', () => {
    const result = createCardItem({ ...base, objectiveId: 'az900.cloud-concepts' })
    expect(result.ok && result.item.objectiveIds).toEqual(['az900.cloud-concepts'])
  })

  it.each([
    ['an empty title', { title: '   ' }, /title/i],
    ['an empty note', { note: '' }, /note/i],
    ['a title over the limit', { title: 'x'.repeat(CARD_LIMITS.title + 1) }, /title/i],
    ['a note over the limit', { note: 'x'.repeat(CARD_LIMITS.note + 1) }, /note/i],
  ])('rejects %s with a helpful message', (_name, over, message) => {
    const result = createCardItem({ ...base, ...over })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(message)
  })
})
