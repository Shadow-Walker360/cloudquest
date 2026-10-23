import { useId, useRef, useState, type FormEvent } from 'react'
import { collectObjectives } from '../progress/analytics.ts'
import { contentPacks } from '../../content/registry.ts'
import { createCardItem } from '../progress/attempts.ts'
import { newId } from '../../infrastructure/ids.ts'
import {
  CARD_COLORS,
  CARD_LIMITS,
  MAX_REVISION_ITEMS,
  type CardColor,
  type RevisionItem,
} from '../../domain/learning.ts'

const COLOR_LABEL: Record<CardColor, string> = {
  yellow: 'Yellow',
  pink: 'Pink',
  blue: 'Blue',
  green: 'Green',
}

/** Writes a sticky-note card and adds it to the revision queue. */
export function NewCardForm({
  itemCount,
  onCreate,
}: {
  itemCount: number
  onCreate: (item: RevisionItem) => void
}) {
  const ids = useId()
  const titleRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [color, setColor] = useState<CardColor>('yellow')
  const [objectiveId, setObjectiveId] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const objectives = collectObjectives(contentPacks)
  const full = itemCount >= MAX_REVISION_ITEMS

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const result = createCardItem({
      title,
      note,
      color,
      ...(objectiveId ? { objectiveId } : {}),
      now: new Date(),
      id: newId(),
    })
    if (!result.ok) {
      setSaved('')
      setError(result.error)
      return
    }
    onCreate(result.item)
    setError('')
    setSaved(`Added “${result.item.title}” to your board and your revision queue.`)
    setTitle('')
    setNote('')
    titleRef.current?.focus()
  }

  return (
    <form className="card-form" onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor={`${ids}-title`}>Title</label>
        <input
          ref={titleRef}
          id={`${ids}-title`}
          type="text"
          value={title}
          maxLength={CARD_LIMITS.title}
          aria-describedby={error ? `${ids}-error` : undefined}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor={`${ids}-note`}>
          Note{' '}
          <span className="hint">
            ({note.length}/{CARD_LIMITS.note})
          </span>
        </label>
        <textarea
          id={`${ids}-note`}
          rows={4}
          value={note}
          maxLength={CARD_LIMITS.note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>

      <fieldset className="field colour-field">
        <legend>Colour</legend>
        <div className="colour-options">
          {CARD_COLORS.map((option) => (
            <label key={option} className={`swatch swatch-${option}`}>
              <input
                type="radio"
                name={`${ids}-colour`}
                value={option}
                checked={color === option}
                onChange={() => setColor(option)}
              />
              <span>{COLOR_LABEL[option]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor={`${ids}-objective`}>Link to an objective (optional)</label>
        <select
          id={`${ids}-objective`}
          value={objectiveId}
          onChange={(event) => setObjectiveId(event.target.value)}
        >
          <option value="">No objective</option>
          {objectives.map((objective) => (
            <option key={objective.id} value={objective.id}>
              {objective.title}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p id={`${ids}-error`} className="form-error" role="alert">
          {error}
        </p>
      )}
      {full && (
        <p className="form-error" role="alert">
          You have reached the limit of {MAX_REVISION_ITEMS} cards. Delete some to add more.
        </p>
      )}

      <div className="runner-actions">
        <button type="submit" className="button button-primary" disabled={full}>
          Stick it on the board
        </button>
      </div>
      <p className="hint" role="status">
        {saved}
      </p>
    </form>
  )
}
