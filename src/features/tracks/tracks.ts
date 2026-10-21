import type { ContentPack, Provider } from '../../domain/content.ts'

export interface TrackInfo {
  provider: Provider
  title: string
  description: string
}

/**
 * The tracks CloudQuest intends to offer. Names are descriptive only: no provider
 * logos, no implied endorsement. Provider-specific facts belong in content packs.
 */
export const trackCatalog: readonly TrackInfo[] = [
  {
    provider: 'azure',
    title: 'Microsoft Azure',
    description: 'Cloud fundamentals taught with Azure services and terminology.',
  },
  {
    provider: 'aws',
    title: 'Amazon Web Services',
    description: 'Cloud fundamentals taught with AWS services and terminology.',
  },
  {
    provider: 'gcp',
    title: 'Google Cloud',
    description: 'Cloud fundamentals taught with Google Cloud services and terminology.',
  },
  {
    provider: 'neutral',
    title: 'Provider-neutral foundations',
    description: 'Core cloud ideas (scaling, availability, identity, cost) without a vendor.',
  },
]

export type TrackAvailability =
  { state: 'available' } | { state: 'in-development'; draftItems: number } | { state: 'planned' }

/**
 * A track is `available` only when a reviewed pack with content exists for its provider.
 * A draft pack makes it `in-development`; archived packs are ignored.
 */
export function trackAvailability(
  provider: Provider,
  packs: readonly ContentPack[],
): TrackAvailability {
  const forProvider = packs.filter((p) => p.provider === provider && p.status !== 'archived')
  if (forProvider.some((p) => p.status === 'reviewed' && p.scenarios.length > 0)) {
    return { state: 'available' }
  }
  const draftItems = forProvider
    .filter((p) => p.status === 'draft')
    .reduce((total, p) => total + p.scenarios.length, 0)
  if (draftItems > 0) return { state: 'in-development', draftItems }
  return { state: 'planned' }
}
