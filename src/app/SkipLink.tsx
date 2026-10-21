import { MAIN_ID } from './Main.tsx'

/** A button, not an anchor: hash links would be read by the hash router as page navigation. */
export function SkipLink() {
  return (
    <button
      type="button"
      className="skip-link"
      onClick={() => document.getElementById(MAIN_ID)?.focus()}
    >
      Skip to main content
    </button>
  )
}
