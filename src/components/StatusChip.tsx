const CHIPS = {
  available: { icon: '✓', label: 'Available' },
  'in-development': { icon: '◐', label: 'In development' },
  planned: { icon: '○', label: 'Planned' },
  attention: { icon: '!', label: 'Needs attention' },
} as const

export type ChipStatus = keyof typeof CHIPS

/** Status is conveyed by an icon shape and a text label, never by colour alone. */
export function StatusChip({ status, label }: { status: ChipStatus; label?: string }) {
  const chip = CHIPS[status]
  return (
    <span className={`chip chip-${status}`}>
      <span aria-hidden="true">{chip.icon}</span> {label ?? chip.label}
    </span>
  )
}
