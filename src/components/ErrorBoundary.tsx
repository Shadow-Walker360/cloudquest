import { Component, type ReactNode } from 'react'

interface ErrorBoundaryState {
  failed: boolean
}

/** Last-resort fallback so a rendering bug shows a message instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="fatal" role="alert">
        <h1>Something went wrong</h1>
        <p>CloudQuest hit an unexpected error. Reloading the page usually fixes it.</p>
        <button className="button button-primary" type="button" onClick={() => location.reload()}>
          Reload page
        </button>
      </main>
    )
  }
}
