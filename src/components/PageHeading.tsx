import type { ReactNode } from 'react'

interface PageHeadingProps {
  kicker: string
  title: string
  children?: ReactNode
}

export function PageHeading({ kicker, title, children }: PageHeadingProps) {
  return (
    <header className="page-heading">
      <p className="kicker">{kicker}</p>
      <h1>{title}</h1>
      {children && <p className="subtitle">{children}</p>}
    </header>
  )
}
