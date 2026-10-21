import type { ReactNode } from 'react'

export const MAIN_ID = 'main-content'

/** The page's single main landmark. Focusable so navigation and the skip link can move focus. */
export function Main({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main id={MAIN_ID} tabIndex={-1} className={className}>
      {children}
    </main>
  )
}
