import { useMemo, useState } from 'react'
import { ButtonLink } from '../../components/ButtonLink.tsx'
import { EmptyState } from '../../components/EmptyState.tsx'
import { Hero } from '../../components/Hero.tsx'
import { Icon } from '../../components/Icon.tsx'
import { PageHeading } from '../../components/PageHeading.tsx'
import { Panel } from '../../components/Panel.tsx'
import { StatCard } from '../../components/StatCard.tsx'
import { StatusChip } from '../../components/StatusChip.tsx'
import { TornPage } from '../../components/TornPage.tsx'
import { contentPacks } from '../../content/registry.ts'
import { formatShortDate, summarize } from '../../features/progress/analytics.ts'
import { useStore } from '../../features/progress/useStore.ts'
import { findChallenge, listChallenges } from '../../features/scenarios/catalog.ts'
import { trackAvailability, trackCatalog } from '../../features/tracks/tracks.ts'
import { features } from '../navigation.ts'
import { hrefFor } from '../routes.ts'

export function OverviewPage() {
  const { data } = useStore()
  const [now] = useState(() => new Date())
  const summary = useMemo(() => summarize(data, contentPacks, now), [data, now])
  const challenges = listChallenges(contentPacks)
  const allReviewed = contentPacks.every((pack) => pack.status === 'reviewed')
  const assessed = summary.objectives.filter((o) => o.status !== 'not-assessed').length
  const recent = [...data.attempts].reverse().slice(0, 4)
  const name = data.profile.displayName

  return (
    <>
      <PageHeading
        kicker="Your learning space"
        title={name ? `Welcome back, ${name}` : 'Your workspace'}
      >
        You are exploring as a guest. There are no accounts: your progress is saved only in this
        browser, and you can export or delete it from My notebook.
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
          icon="progress"
          tone="violet"
          label="Attempts saved"
          value={summary.totalAttempts}
          foot={summary.totalAttempts ? 'Saved on this device' : 'Try a scenario to begin'}
        />
        <StatCard
          icon="revision"
          tone="amber"
          label="Reviews due"
          value={summary.revision.dueNow}
          foot={
            summary.revision.total
              ? `${summary.revision.total} in your queue`
              : 'Nothing in your queue yet'
          }
        />
        <StatCard
          icon="tracks"
          tone="teal"
          label="Objectives assessed"
          value={assessed}
          unit={` of ${summary.objectives.length}`}
          foot="From your own attempts"
        />
      </ul>

      <div className="two-col">
        <Panel icon="clock" kicker="Recent activity" title="Your activity">
          {summary.revision.dueNow > 0 && (
            <p className="due-note">
              <a href={hrefFor({ name: 'revision' })}>
                {summary.revision.dueNow}{' '}
                {summary.revision.dueNow === 1 ? 'review is' : 'reviews are'} due
              </a>
            </p>
          )}
          {recent.length === 0 ? (
            <EmptyState title="No activity yet">
              Your attempts will be listed here once you answer a scenario.
            </EmptyState>
          ) : (
            <ul className="row-list">
              {recent.map((attempt) => {
                const title = findChallenge(contentPacks, attempt.scenarioId)?.scenario.title
                return (
                  <li key={attempt.id}>
                    <div>
                      <p className="row-title">
                        {title ?? 'A scenario that is no longer available'}
                      </p>
                      <p className="row-sub">
                        {formatShortDate(new Date(attempt.submittedAt))}
                        {attempt.hintsUsed > 0 &&
                          ` · ${attempt.hintsUsed} ${attempt.hintsUsed === 1 ? 'hint' : 'hints'}`}
                      </p>
                    </div>
                    <StatusChip
                      status={attempt.outcome === 'correct' ? 'available' : 'attention'}
                      label={attempt.outcome === 'correct' ? 'Correct' : 'Missed'}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>

        <Panel icon="tracks" kicker="Skill paths" title="Learning tracks">
          <ul className="row-list">
            {trackCatalog.map((track) => {
              const availability = trackAvailability(track.provider, contentPacks)
              return (
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
              )
            })}
          </ul>
          <p className="panel-foot">
            <a href={hrefFor({ name: 'tracks' })}>View all tracks</a>
          </p>
        </Panel>
      </div>

      <div className="two-col two-col-even">
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

        <TornPage labelledBy="tip-title" className="torn-tip">
          <p className="kicker">Study tip</p>
          <h2 id="tip-title" className="handwritten">
            Understand the “why”, not just the answer.
          </h2>
          <p>
            After each decision, read why the best option fits and why the others do not. Then stick
            the idea on a card in your own words: writing it down is what makes it stay.
          </p>
          <p className="panel-foot">
            <a href={hrefFor({ name: 'revision' })}>
              <Icon name="note" size={16} /> Write a sticky card
            </a>
          </p>
        </TornPage>
      </div>
    </>
  )
}
