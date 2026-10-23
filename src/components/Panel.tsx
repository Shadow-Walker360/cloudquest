import { useId, type ReactNode } from 'react'
import { Icon, type IconName } from './Icon.tsx'

interface PanelProps {
  icon: IconName
  kicker: string
  title: string
  children: ReactNode
}

export function Panel({ icon, kicker, title, children }: PanelProps) {
  const headingId = useId()
  return (
    <section className="panel" aria-labelledby={headingId}>
      <div className="panel-heading">
        <span className="icon-tile icon-tile-blue">
          <Icon name={icon} />
        </span>
        <div>
          <p className="kicker">{kicker}</p>
          <h2 id={headingId}>{title}</h2>
        </div>
      </div>
      {children}
    </section>
  )
}
