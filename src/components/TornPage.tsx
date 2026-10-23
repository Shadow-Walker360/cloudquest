import type { ReactNode } from 'react'

interface TornPageProps {
  children: ReactNode
  /** Id of the heading inside, so the page is a labelled region. */
  labelledBy?: string
  className?: string
}

/**
 * A page torn out of an exercise book: ruled lines, a red margin and a ripped bottom edge.
 * Purely visual: the content keeps its normal semantics and contrast.
 */
export function TornPage({ children, labelledBy, className }: TornPageProps) {
  return (
    <section className="torn-wrap" aria-labelledby={labelledBy}>
      <div className={className ? `torn-page ${className}` : 'torn-page'}>{children}</div>
    </section>
  )
}
