import type { ReactNode } from 'react'
import { Icon } from './Icon.tsx'

interface HeroProps {
  as?: 'h1' | 'h2'
  kicker: string
  title: string
  action: ReactNode
  children: ReactNode
}

/** The gradient banner from the original CloudReady dashboard. */
export function Hero({ as: Heading = 'h2', kicker, title, action, children }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-kicker">{kicker}</p>
        <Heading>{title}</Heading>
        <p className="hero-text">{children}</p>
        <div className="hero-action">{action}</div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <Icon name="cloud" size={72} />
      </div>
    </section>
  )
}
