import type { CSSProperties } from 'react'
import type { RevisionItem } from '../domain/learning.ts'
import { Icon } from './Icon.tsx'
import { tiltFor } from './tilt.ts'

interface StickyNoteProps {
  item: RevisionItem
  /** For example "Due now" or "Due in 3 days". */
  dueLabel: string
  objectiveTitle?: string
  onDelete?: (id: string) => void
}

/** A card the student wrote, shown as a sticky note. */
export function StickyNote({ item, dueLabel, objectiveTitle, onDelete }: StickyNoteProps) {
  const style = { '--tilt': `${tiltFor(item.id)}deg` } as CSSProperties
  return (
    <li className={`sticky sticky-${item.color ?? 'yellow'}`} style={style}>
      <span className="sticky-tape" aria-hidden="true" />
      <h3 className="sticky-title">{item.title}</h3>
      <p className="sticky-text">{item.answer}</p>
      <p className="sticky-foot">
        <span>{dueLabel}</span>
        {objectiveTitle && <span>{objectiveTitle}</span>}
      </p>
      {onDelete && (
        <button
          type="button"
          className="sticky-delete"
          aria-label={`Delete card: ${item.title}`}
          onClick={() => onDelete(item.id)}
        >
          <Icon name="trash" size={16} />
        </button>
      )}
    </li>
  )
}
