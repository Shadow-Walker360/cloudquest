import type { ContentPack, Scenario } from '../../domain/content.ts'
import {
  CARD_LIMITS,
  type Attempt,
  type CardColor,
  type RevisionItem,
} from '../../domain/learning.ts'
import { initialSchedule } from '../revision/scheduler.ts'
import type { Evaluation } from '../scenarios/evaluate.ts'

export function createAttempt(input: {
  scenario: Scenario
  pack: ContentPack
  evaluation: Evaluation
  hintsUsed: number
  now: Date
  id: string
}): Attempt {
  const { scenario, pack, evaluation } = input
  const attempt: Attempt = {
    id: input.id,
    scenarioId: scenario.id,
    packId: pack.id,
    objectiveIds: [...scenario.objectiveIds],
    submittedOptionId: evaluation.selectedOptionId,
    outcome: evaluation.outcome,
    hintsUsed: input.hintsUsed,
    submittedAt: input.now.toISOString(),
  }
  if (evaluation.misconceptionTag) attempt.misconceptionTag = evaluation.misconceptionTag
  return attempt
}

/** A scenario worth revisiting, built from the scenario itself so it needs no typing. */
export function createMistakeItem(input: {
  scenario: Scenario
  pack: ContentPack
  evaluation: Evaluation
  now: Date
  id: string
}): RevisionItem {
  const { scenario, pack, evaluation } = input
  const best = scenario.options.find((option) => option.id === evaluation.correctOptionId)
  const item: RevisionItem = {
    id: input.id,
    source: 'mistake',
    title: scenario.title,
    prompt: scenario.task,
    answer: `Best fit: ${best?.label ?? 'see the scenario'}\n\n${scenario.explanation}`,
    objectiveIds: [...scenario.objectiveIds],
    scenarioId: scenario.id,
    packId: pack.id,
    createdAt: input.now.toISOString(),
    schedule: initialSchedule(input.now),
  }
  if (evaluation.misconceptionTag) item.misconceptionTag = evaluation.misconceptionTag
  return item
}

export type CardResult = { ok: true; item: RevisionItem } | { ok: false; error: string }

/** A card the student writes. It shows up as a sticky note and joins the revision queue. */
export function createCardItem(input: {
  title: string
  note: string
  color: CardColor
  objectiveId?: string
  now: Date
  id: string
}): CardResult {
  const title = input.title.trim()
  const note = input.note.trim()
  if (!title) return { ok: false, error: 'Give your card a title.' }
  if (title.length > CARD_LIMITS.title) {
    return { ok: false, error: `Keep the title under ${CARD_LIMITS.title} characters.` }
  }
  if (!note) return { ok: false, error: 'Write a note for the back of the card.' }
  if (note.length > CARD_LIMITS.note) {
    return { ok: false, error: `Keep the note under ${CARD_LIMITS.note} characters.` }
  }
  return {
    ok: true,
    item: {
      id: input.id,
      source: 'card',
      title,
      prompt: title,
      answer: note,
      objectiveIds: input.objectiveId ? [input.objectiveId] : [],
      color: input.color,
      createdAt: input.now.toISOString(),
      schedule: initialSchedule(input.now),
    },
  }
}
