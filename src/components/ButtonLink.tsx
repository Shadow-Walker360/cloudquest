import type { ReactNode } from 'react'

interface ButtonLinkProps {
  href: string
  variant?: 'primary' | 'secondary' | 'light'
  children: ReactNode
}

/** A navigation link styled as a button. Use for moving between pages, not for actions. */
export function ButtonLink({ href, variant = 'primary', children }: ButtonLinkProps) {
  return (
    <a className={`button button-${variant}`} href={href}>
      {children}
    </a>
  )
}
