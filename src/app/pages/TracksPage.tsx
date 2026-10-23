import { Icon, type IconName } from '../../components/Icon.tsx'
import { PageHeading } from '../../components/PageHeading.tsx'
import { StatusChip } from '../../components/StatusChip.tsx'
import { contentPacks } from '../../content/registry.ts'
import type { Provider } from '../../domain/content.ts'
import { trackAvailability, trackCatalog } from '../../features/tracks/tracks.ts'

const TILE: Record<Provider, { icon: IconName; tone: string }> = {
  azure: { icon: 'cloud', tone: 'blue' },
  aws: { icon: 'cloud', tone: 'amber' },
  gcp: { icon: 'cloud', tone: 'teal' },
  neutral: { icon: 'tracks', tone: 'violet' },
}

export function TracksPage() {
  return (
    <>
      <PageHeading kicker="Skill paths" title="Learning tracks">
        A track becomes available only when reviewed content exists for it. Tracks are descriptive
        labels: CloudQuest is not affiliated with any cloud provider.
      </PageHeading>

      <ul className="card-grid">
        {trackCatalog.map((track) => {
          const availability = trackAvailability(track.provider, contentPacks)
          const packs = contentPacks.filter((pack) => pack.provider === track.provider)
          const tile = TILE[track.provider]
          return (
            <li key={track.provider} className="card">
              <span className={`icon-tile icon-tile-${tile.tone}`}>
                <Icon name={tile.icon} />
              </span>
              <h2>{track.title}</h2>
              <p>{track.description}</p>
              <StatusChip status={availability.state} />
              {availability.state === 'available' && <p>Reviewed content is ready to use.</p>}
              {availability.state === 'in-development' && (
                <p>
                  {availability.draftItems} draft items exist, but they have not been reviewed, so
                  this track is not available yet. Draft scenarios can be tried as unreviewed
                  previews in the Scenario Lab.
                </p>
              )}
              {availability.state === 'planned' && <p>No content has been written yet.</p>}
              {packs.map((pack) => (
                <p key={pack.id} className="hint">
                  {pack.title} · {pack.goalLabel}
                </p>
              ))}
            </li>
          )
        })}
      </ul>
    </>
  )
}
