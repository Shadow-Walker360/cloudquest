import { StatusChip } from '../../components/StatusChip.tsx'
import { contentPacks } from '../../content/registry.ts'
import { trackAvailability, trackCatalog } from '../../features/tracks/tracks.ts'

export function TracksPage() {
  return (
    <>
      <h1>Learning tracks</h1>
      <p className="lead">
        A track becomes available only when reviewed content exists for it. Tracks are descriptive
        labels: CloudQuest is not affiliated with any cloud provider.
      </p>

      <ul className="card-grid">
        {trackCatalog.map((track) => {
          const availability = trackAvailability(track.provider, contentPacks)
          const packs = contentPacks.filter((pack) => pack.provider === track.provider)
          return (
            <li key={track.provider} className="card">
              <h2>{track.title}</h2>
              <p>{track.description}</p>
              <StatusChip status={availability.state} />
              {availability.state === 'available' && <p>Reviewed content is ready to use.</p>}
              {availability.state === 'in-development' && (
                <p>
                  {availability.draftItems} draft items exist, but they have not been reviewed, so
                  this track cannot be started yet.
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
