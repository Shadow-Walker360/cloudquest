import type { ChipStatus } from '../components/StatusChip.tsx'

export interface FeatureItem {
  id: string
  label: string
  description: string
  status: ChipStatus
  /** Present only for features that have a page today. */
  route?: 'overview' | 'tracks'
}

/**
 * Single source of truth for what the workspace offers and how far along each part is.
 * Update `status` only when the feature genuinely works; the README table must match.
 */
export const features: readonly FeatureItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Your starting point in the workspace.',
    status: 'available',
    route: 'overview',
  },
  {
    id: 'tracks',
    label: 'Learning tracks',
    description: 'See which tracks exist and how much content each one has.',
    status: 'available',
    route: 'tracks',
  },
  {
    id: 'scenario-lab',
    label: 'Scenario Lab',
    description: 'Original cloud situations with hints, reasoning feedback and a fresh retry.',
    status: 'planned',
  },
  {
    id: 'architecture-canvas',
    label: 'Architecture Canvas',
    description: 'Build a conceptual diagram and run a simple what-if simulation.',
    status: 'planned',
  },
  {
    id: 'revision',
    label: 'Revision Studio',
    description: 'Revisit concepts you missed on a transparent schedule.',
    status: 'planned',
  },
  {
    id: 'progress',
    label: 'Progress',
    description: 'Objective-level evidence of what you have and have not practised.',
    status: 'planned',
  },
]
