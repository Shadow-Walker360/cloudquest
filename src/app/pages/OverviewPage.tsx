import { ButtonLink } from '../../components/ButtonLink.tsx'
import { EmptyState } from '../../components/EmptyState.tsx'
import { Hero } from '../../components/Hero.tsx'
import { Icon } from '../../components/Icon.tsx'
import { PageHeading } from '../../components/PageHeading.tsx'
import { Panel } from '../../components/Panel.tsx'
import { StatCard } from '../../components/StatCard.tsx'
import { StatusChip } from '../../components/StatusChip.tsx'
import { contentPacks } from '../../content/registry.ts'
import { listChallenges } from '../../features/scenarios/catalog.ts'
import { trackAvailability, trackCatalog } from '../../features/tracks/tracks.ts'
import { features } from '../navigation.ts'
import { hrefFor } from '../routes.ts'

export function OverviewPage() {
  const challenges = listChallenges(contentPacks)
  const tracks = trackCatalog.map((track) => ({
    track,
    availability: trackAvailability(track.provider, contentPacks),
  }))
  const availableTracks = tracks.filter(({ availability }) => availability.state === 'available')
  const allReviewed = contentPacks.every((pack) => pack.status === 'reviewed')

  return (
    <>
      <PageHeading kicker="Your learning space" title="Your workspace">
        You are exploring as a guest. Accounts are not available in this prototype, and nothing you
        do is saved yet.
      </PageHeading>

      <Hero
        kicker="Start here"
        title="Try the Scenario Lab"
        action={
          <ButtonLink href={hrefFor({ name: 'lab' })} variant="light">
            Open the Scenario Lab
          </ButtonLink>
        }
      >
        Work through a realistic cloud situation, ask for hints, and see why each option works or
        fails. The first scenarios are drafts, so treat them as previews.
      </Hero>

      <ul className="stat-grid">
        <StatCard
          icon="lab"
          tone="blue"
          label="Scenarios to try"
          value={challenges.length}
          foot={allReviewed ? 'Reviewed content' : 'Draft previews, not yet reviewed'}
        />
        <StatCard
          icon="tracks"
          tone="violet"
          label="Content packs"
          value={contentPacks.length}
          foot={allReviewed ? 'All reviewed' : 'Draft content, not yet reviewed'}
        />
        <StatCard
          icon="progress"
          tone="teal"
          label="Tracks available"
          value={availableTracks.length}
          unit={` of ${trackCatalog.length}`}
          foot="A track needs reviewed content"
        />
        <StatCard
          icon="clock"
          tone="amber"
          label="Attempts saved"
          value={0}
          foot="Saving progress is planned"
        />
      </ul>

      <div className="two-col">
        <Panel icon="tracks" kicker="Skill paths" title="Learning tracks">
          <ul className="row-list">
            {tracks.map(({ track, availability }) => (
              <li key={track.provider}>
                <div>
                  <p className="row-title">{track.title}</p>
                  <p className="row-sub">
                    {availability.state === 'in-development'
                      ? `${availability.draftItems} draft items, not yet reviewed`
                      : track.description}
                  </p>
                </div>
                <StatusChip status={availability.state} />
              </li>
            ))}
          </ul>
          <p className="panel-foot">
            <a href={hrefFor({ name: 'tracks' })}>View all tracks</a>
          </p>
        </Panel>

        <Panel icon="spark" kicker="Roadmap" title="What is available">
          <ul className="row-list">
            {features
              .filter((feature) => feature.id !== 'overview')
              .map((feature) => (
                <li key={feature.id}>
                  <div>
                    <p className="row-title">{feature.label}</p>
                    <p className="row-sub">{feature.description}</p>
                  </div>
                  <StatusChip status={feature.status} />
                </li>
              ))}
          </ul>
        </Panel>
      </div>

      <div className="two-col two-col-even">
        <Panel icon="clock" kicker="Recent activity" title="Your activity">
          <EmptyState title="No activity yet">
            Nothing is recorded yet. Saving attempts and showing progress are planned features.
          </EmptyState>
        </Panel>

        <section className="tip-card" aria-labelledby="tip-title">
          <p className="kicker">Study tip</p>
          <h2 id="tip-title">Understand the “why”, not just the answer.</h2>
          <p>
            After each decision, read why the best option fits and why the others do not. That
            reasoning is what carries over to new situations.
          </p>
          <a href={hrefFor({ name: 'lab' })}>
            <Icon name="lab" size={16} /> Practise with a scenario
          </a>
        </section>
      </div>
    </>
  )
}
