import { ButtonLink } from '../../components/ButtonLink.tsx'
import { Disclaimer } from '../../components/Disclaimer.tsx'
import { Hero } from '../../components/Hero.tsx'
import { Icon, type IconName } from '../../components/Icon.tsx'
import { StatusChip } from '../../components/StatusChip.tsx'
import { Main } from '../Main.tsx'
import { features } from '../navigation.ts'
import { hrefFor } from '../routes.ts'

const pillars: { id: string; icon: IconName; tone: string; title: string; text: string }[] = [
  {
    id: 'scenario-lab',
    icon: 'lab',
    tone: 'blue',
    title: 'Scenario Lab',
    text: 'Investigate a realistic situation, make a decision, and see why it works or fails.',
  },
  {
    id: 'architecture-canvas',
    icon: 'canvas',
    tone: 'violet',
    title: 'Architecture Canvas',
    text: 'Build a simple conceptual diagram and run a what-if event to see what breaks.',
  },
  {
    id: 'revision',
    icon: 'revision',
    tone: 'teal',
    title: 'Revision Studio',
    text: 'Come back to the ideas you missed, on a schedule you can understand.',
  },
]

const promises = [
  'Original scenarios, never copied exam questions.',
  'Practice progress is evidence of what you have practised, not a promise you will pass.',
  'Simulations are simplified teaching aids. They never touch a real cloud account.',
]

export function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-top">
        <span className="brand">
          <span className="brand-mark">
            <Icon name="cloud" />
          </span>
          <span className="brand-name">
            Cloud<span>Quest</span>
          </span>
        </span>
      </header>

      <Main className="landing-main">
        <Hero
          as="h1"
          kicker="Unofficial educational project"
          title="Learn cloud by solving real-world challenges."
          action={
            <>
              <ButtonLink href={hrefFor({ name: 'overview' })} variant="light">
                Enter as guest
              </ButtonLink>
              <span className="hero-hint">No sign-up required.</span>
            </>
          }
        >
          Investigate a situation, make a decision, see the consequence, then apply the idea in a
          new context. CloudQuest teaches cloud fundamentals through original scenarios, a guided
          architecture canvas, and spaced revision.
        </Hero>

        <section aria-labelledby="pillars-title" className="landing-section">
          <h2 id="pillars-title">What CloudQuest is building</h2>
          <p className="subtitle">
            The workspace is open now. The learning activities below are still in progress.
          </p>
          <ul className="card-grid">
            {pillars.map((pillar) => (
              <li key={pillar.title} className="card">
                <span className={`icon-tile icon-tile-${pillar.tone}`}>
                  <Icon name={pillar.icon} />
                </span>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
                <StatusChip
                  status={features.find((f) => f.id === pillar.id)?.status ?? 'planned'}
                />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="honest-title" className="panel">
          <h2 id="honest-title">Honest by design</h2>
          <ul className="promises">
            {promises.map((promise) => (
              <li key={promise}>
                <Icon name="check" size={18} />
                <span>{promise}</span>
              </li>
            ))}
          </ul>
        </section>
      </Main>

      <footer className="page-footer">
        <Disclaimer />
      </footer>
    </div>
  )
}
