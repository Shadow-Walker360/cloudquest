import { useStore } from '../features/progress/useStore.ts'

/** Tells the learner, plainly, when their saved data is missing, damaged or cannot be saved. */
export function StorageNotice() {
  const { notice, saveFailed, dismissNotice } = useStore()
  if (!notice && !saveFailed) return null

  let message: string
  if (saveFailed) {
    message =
      'Your latest changes could not be saved. Your browser may be blocking storage or it may be full.'
  } else if (notice === 'unavailable') {
    message =
      'This browser is blocking storage, so your progress will be lost when you close this tab.'
  } else if (notice === 'recovered') {
    message =
      'Your saved data could not be read, so CloudQuest started fresh. A copy was kept in your browser.'
  } else {
    message = 'Some saved items were damaged and were skipped. The rest of your data is intact.'
  }

  return (
    <div className="banner" role="status">
      <span aria-hidden="true">⚠</span> {message}{' '}
      {notice && !saveFailed && (
        <button type="button" className="link-button" onClick={dismissNotice}>
          Dismiss
        </button>
      )}
    </div>
  )
}
