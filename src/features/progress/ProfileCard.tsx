import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Icon } from '../../components/Icon.tsx'
import type { Provider } from '../../domain/content.ts'
import { PROFILE_LIMITS, PROVIDERS, type StudentProfile } from '../../domain/learning.ts'
import { trackCatalog } from '../tracks/tracks.ts'

const trackTitle = (provider: Provider | '') =>
  trackCatalog.find((track) => track.provider === provider)?.title ?? 'No preference yet'

/** The student's profile, written like lines in a notebook. Edit it in place. */
export function ProfileCard({
  profile,
  onSave,
}: {
  profile: StudentProfile
  onSave: (profile: StudentProfile) => void
}) {
  const ids = useId()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(profile)
  const [saved, setSaved] = useState(false)
  const editButton = useRef<HTMLButtonElement>(null)
  const firstField = useRef<HTMLInputElement>(null)
  const wasEditing = useRef(false)

  // Keep focus where the learner is: into the form when it opens, back to "Edit" when it closes.
  useEffect(() => {
    if (editing) firstField.current?.focus()
    else if (wasEditing.current) editButton.current?.focus()
    wasEditing.current = editing
  }, [editing])

  const startEditing = () => {
    setDraft(profile)
    setSaved(false)
    setEditing(true)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSave({
      ...draft,
      displayName: draft.displayName.trim(),
      goal: draft.goal.trim(),
      about: draft.about.trim(),
    })
    setSaved(true)
    setEditing(false)
  }

  if (!editing) {
    return (
      <div>
        <dl className="profile-lines">
          <div>
            <dt>Name</dt>
            <dd>{profile.displayName || 'Not added yet'}</dd>
          </div>
          <div>
            <dt>Studying for</dt>
            <dd>{profile.goal || 'Not added yet'}</dd>
          </div>
          <div>
            <dt>Preferred track</dt>
            <dd>{trackTitle(profile.preferredTrack)}</dd>
          </div>
          <div>
            <dt>Weekly goal</dt>
            <dd>
              {profile.sessionsPerWeek} study {profile.sessionsPerWeek === 1 ? 'day' : 'days'} a
              week
            </dd>
          </div>
          <div>
            <dt>About me</dt>
            <dd>{profile.about || 'Not added yet'}</dd>
          </div>
        </dl>
        <div className="runner-actions">
          <button
            ref={editButton}
            type="button"
            className="button button-secondary"
            onClick={startEditing}
          >
            <Icon name="edit" size={16} /> Edit profile
          </button>
        </div>
        <p className="hint" role="status">
          {saved ? 'Profile saved on this device.' : ''}
        </p>
      </div>
    )
  }

  return (
    <form className="card-form" onSubmit={submit}>
      <div className="field">
        <label htmlFor={`${ids}-name`}>Name</label>
        <input
          ref={firstField}
          id={`${ids}-name`}
          type="text"
          autoComplete="nickname"
          maxLength={PROFILE_LIMITS.displayName}
          value={draft.displayName}
          onChange={(event) => setDraft({ ...draft, displayName: event.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor={`${ids}-goal`}>Studying for</label>
        <input
          id={`${ids}-goal`}
          type="text"
          maxLength={PROFILE_LIMITS.goal}
          placeholder="For example: cloud fundamentals this term"
          value={draft.goal}
          onChange={(event) => setDraft({ ...draft, goal: event.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor={`${ids}-track`}>Preferred track</label>
        <select
          id={`${ids}-track`}
          value={draft.preferredTrack}
          onChange={(event) =>
            setDraft({
              ...draft,
              preferredTrack: event.target.value as StudentProfile['preferredTrack'],
            })
          }
        >
          <option value="">No preference yet</option>
          {PROVIDERS.map((provider) => (
            <option key={provider} value={provider}>
              {trackTitle(provider)}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`${ids}-goal-days`}>Weekly goal</label>
        <select
          id={`${ids}-goal-days`}
          value={draft.sessionsPerWeek}
          onChange={(event) => setDraft({ ...draft, sessionsPerWeek: Number(event.target.value) })}
        >
          {[1, 2, 3, 4, 5, 6, 7].map((days) => (
            <option key={days} value={days}>
              {days} study {days === 1 ? 'day' : 'days'} a week
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`${ids}-about`}>
          About me{' '}
          <span className="hint">
            ({draft.about.length}/{PROFILE_LIMITS.about})
          </span>
        </label>
        <textarea
          id={`${ids}-about`}
          rows={3}
          maxLength={PROFILE_LIMITS.about}
          value={draft.about}
          onChange={(event) => setDraft({ ...draft, about: event.target.value })}
        />
      </div>
      <p className="hint">Kept only in this browser. Please do not add anything sensitive.</p>
      <div className="runner-actions">
        <button type="submit" className="button button-primary">
          Save profile
        </button>
        <button type="button" className="button button-secondary" onClick={() => setEditing(false)}>
          Cancel
        </button>
      </div>
    </form>
  )
}
