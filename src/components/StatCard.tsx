import { Icon, type IconName } from './Icon.tsx'

export type Tone = 'blue' | 'violet' | 'teal' | 'amber'

interface StatCardProps {
  icon: IconName
  tone: Tone
  label: string
  value: string | number
  unit?: string
  foot: string
}

/** A single real number with its label. Never show a value that is not derived from real state. */
export function StatCard({ icon, tone, label, value, unit, foot }: StatCardProps) {
  return (
    <li className="stat-card">
      <div className="stat-top">
        <span className={`icon-tile icon-tile-${tone}`}>
          <Icon name={icon} />
        </span>
        <p className="stat-label">{label}</p>
      </div>
      <p className="stat-value">
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </p>
      <p className="stat-foot">{foot}</p>
    </li>
  )
}
