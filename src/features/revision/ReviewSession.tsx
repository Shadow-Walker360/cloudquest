import { useEffect, useRef, useState } from 'react'
import { EmptyState } from '../../components/EmptyState.tsx'
import { TornPage } from '../../components/TornPage.tsx'
import type { ReviewGrade, RevisionItem } from '../../domain/learning.ts'
import { describeDue, previewOutcomes } from './scheduler.ts'

const GRADES: Array<{ grade: ReviewGrade; label: string; help: string }> = [
  { grade: 'again', label: 'Again', help: 'I forgot it' },
  { grade: 'hard', label: 'Hard', help: 'I got it with effort' },
  { grade: 'recalled', label: 'Recalled', help: 'I knew it' },
]

interface ReviewSessionProps {
  /** Items that are due now, most overdue first. */
  due: RevisionItem[]
  now: Date
  /** The soonest item that is not yet due, for the "all caught up" message. */
  nextDueAt?: string
  onGrade: (id: string, grade: ReviewGrade) => void
}

/** Shows one due item at a time: recall it, reveal the answer, then grade yourself honestly. */
export function ReviewSession({ due, now, nextDueAt, onGrade }: ReviewSessionProps) {
  const current = due[0]
  const [revealedFor, setRevealedFor] = useState<string | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const previousId = useRef<string | null>(null)

  // After grading, the next card replaces this one: move focus to it so keyboard and
  // screen-reader users are not left on a button that no longer exists.
  useEffect(() => {
    if (current && previousId.current !== null && previousId.current !== current.id) {
      headingRef.current?.focus()
    }
    previousId.current = current?.id ?? null
  }, [current])

  if (!current) {
    return (
      <TornPage labelledBy="review-heading">
        <h2 id="review-heading">All caught up</h2>
        <EmptyState title="Nothing to review right now">
          {nextDueAt
            ? `Your next review is coming up. ${describeDue(nextDueAt, now)}.`
            : 'Add a sticky-note card below, or add a concept to revision after a Scenario Lab attempt.'}
        </EmptyState>
      </TornPage>
    )
  }

  const revealed = revealedFor === current.id
  const outcomes = previewOutcomes(current.schedule, now)

  return (
    <TornPage labelledBy="review-heading">
      <p className="kicker">
        {due.length} due · {current.source === 'card' ? 'Your card' : 'From a mistake'}
      </p>
      <h2 id="review-heading" tabIndex={-1} ref={headingRef}>
        {current.title}
      </h2>
      {current.prompt !== current.title && <p className="review-prompt">{current.prompt}</p>}
      <p className="hint">Try to recall the answer before you reveal it.</p>

      {!revealed ? (
        <div className="runner-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={() => setRevealedFor(current.id)}
          >
            Show answer
          </button>
        </div>
      ) : (
        <>
          <div className="review-answer">
            <h3>Answer</h3>
            <p>{current.answer}</p>
          </div>
          <div role="group" aria-labelledby="grade-heading" className="grade-group">
            <h3 id="grade-heading">How well did you recall it?</h3>
            <div className="grade-buttons">
              {GRADES.map(({ grade, label, help }) => (
                <button
                  key={grade}
                  type="button"
                  className={`button ${grade === 'recalled' ? 'button-primary' : 'button-secondary'}`}
                  onClick={() => onGrade(current.id, grade)}
                >
                  <span>{label}</span>
                  <span className="grade-sub">
                    {help} · {outcomes[grade]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </TornPage>
  )
}
