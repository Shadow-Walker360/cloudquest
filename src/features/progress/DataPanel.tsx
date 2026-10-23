import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/Icon.tsx'

/** Export and deletion: the learner owns the data, so they can take it or erase it. */
export function DataPanel({ onExport, onReset }: { onExport: () => void; onReset: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState('')
  const keepButton = useRef<HTMLButtonElement>(null)
  const deleteButton = useRef<HTMLButtonElement>(null)
  const wasConfirming = useRef(false)

  // Land on the safe choice when the confirmation opens; return to the trigger when it closes.
  useEffect(() => {
    if (confirming) keepButton.current?.focus()
    else if (wasConfirming.current) deleteButton.current?.focus()
    wasConfirming.current = confirming
  }, [confirming])

  return (
    <div>
      <p>
        Your notebook lives only in this browser, on this device. CloudQuest has no account system
        and no server that receives your data, so nobody else can see it, and clearing your browser
        data will remove it.
      </p>
      <div className="runner-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={() => {
            onExport()
            setMessage('Your data was downloaded as a JSON file.')
          }}
        >
          <Icon name="download" size={16} /> Download my data
        </button>
        <button
          ref={deleteButton}
          type="button"
          className="button button-secondary"
          aria-expanded={confirming}
          onClick={() => setConfirming(true)}
        >
          <Icon name="trash" size={16} /> Delete all my data
        </button>
      </div>

      {confirming && (
        <div role="group" aria-labelledby="delete-heading" className="confirm">
          <h3 id="delete-heading">Delete everything?</h3>
          <p>
            This removes your profile, attempts, revision queue and sticky notes from this browser.
            It cannot be undone. You may want to download your data first.
          </p>
          <div className="runner-actions">
            <button
              type="button"
              className="button button-danger"
              onClick={() => {
                onReset()
                setConfirming(false)
                setMessage('All of your data was deleted from this browser.')
              }}
            >
              Yes, delete everything
            </button>
            <button
              ref={keepButton}
              type="button"
              className="button button-secondary"
              onClick={() => setConfirming(false)}
            >
              Keep my data
            </button>
          </div>
        </div>
      )}
      <p className="hint" role="status">
        {message}
      </p>
    </div>
  )
}
