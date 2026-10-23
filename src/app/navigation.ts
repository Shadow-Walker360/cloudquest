import type { IconName } from '../components/Icon.tsx'
import type { ChipStatus } from '../components/StatusChip.tsx'
import type { Route } from './routes.ts'

export interface FeatureItem {
  id: string
  label: string
  icon: IconName
  description: string
  status: ChipStatus
  /** Present only for features that have a page today. */
  route?: 'overview' | 'tracks' | 'lab'
}

/** A feature's nav entry is current on its own page and on pages that live under it. */
export function isCurrent(featureRoute: NonNullable<FeatureItem['route']>, route: Route): boolean {
  return route.name === featureRoute || (featureRoute === 'lab' && route.name === 'scenario')
}

/** The feature whose page the learner is on, for breadcrumbs. */
export function currentFeature(route: Route): FeatureItem | undefined {
  return features.find((feature) => feature.route && isCurrent(feature.route, route))
}

/**
 * Single source of truth for what the workspace offers and how far along each part is.
 * Update `status` only when the feature genuinely works; the README table must match.
 */
export const features: readonly FeatureItem[] = [
  {
    id: 'overview',
    icon: 'home',
    label: 'Overview',
    description: 'Your starting point in the workspace.',
    status: 'available',
    route: 'overview',
  },
  {
    id: 'tracks',
    icon: 'tracks',
    label: 'Learning tracks',
    description: 'See which tracks exist and how much content each one has.',
    status: 'available',
    route: 'tracks',
  },
  {
    id: 'scenario-lab',
    icon: 'lab',
    label: 'Scenario Lab',
    description:
      'Original cloud situations with hints, reasoning feedback and a fresh retry. One draft scenario so far.',
    status: 'in-development',
    route: 'lab',
  },
  {
    id: 'architecture-canvas',
    icon: 'canvas',
    label: 'Architecture Canvas',
    description: 'Build a conceptual diagram and run a simple what-if simulation.',
    status: 'planned',
  },
  {
    id: 'revision',
    icon: 'revision',
    label: 'Revision Studio',
    description: 'Revisit concepts you missed on a transparent schedule.',
    status: 'planned',
  },
  {
    id: 'progress',
    icon: 'progress',
    label: 'Progress',
    description: 'Objective-level evidence of what you have and have not practised.',
    status: 'planned',
  },
]
