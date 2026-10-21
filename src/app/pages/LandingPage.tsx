import { ButtonLink } from '../../components/ButtonLink.tsx'
import { Disclaimer } from '../../components/Disclaimer.tsx'
import { StatusChip } from '../../components/StatusChip.tsx'
import { Main } from '../Main.tsx'
import { features } from '../navigation.ts'
import { hrefFor } from '../routes.ts'

const pillars = [
  {
    id: 'scenario-lab',
    title: 'Scenario Lab',
    text: 'Investigate a realistic situation, make a decision, and see why it works or fails.',
  },
  {
    id: 'architecture-canvas',
    title: 'Architecture Canvas',
    text: 'Build a simple conceptual diagram and run a what-if event to see what breaks.',
  },
  {
    id: 'revision',
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
      <header className="landing-header">
        <span className="brand">
          Cloud<span>Quest</span>
        </span>
      </header>

      <Main className="landing-main">
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">Unofficial educational project</p>
          <h1 id="hero-title">Learn cloud by solving real-world challenges.</h1>
          <p className="lead">
            Investigate a situation, make a decision, see the consequence, then apply the idea in a
            new context. CloudQuest teaches cloud fundamentals through original scenarios, a guided
            architecture canvas, and spaced revision.
          </p>
          <div className="hero-actions">
            <ButtonLink href={hrefFor({ name: 'overview' })}>Enter as guest</ButtonLink>
            <p className="hint">No sign-up required.</p>
          </div>
        </section>

        <section aria-labelledby="pillars-title" className="section">
          <h2 id="pillars-title">What CloudQuest is building</h2>
          <p className="section-intro">
            The workspace is open now. The learning activities below are still in progress.
          </p>
          <ul className="card-grid">
            {pillars.map((pillar) => (
              <li key={pillar.title} className="card">
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
                <StatusChip
                  status={features.find((f) => f.id === pillar.id)?.status ?? 'planned'}
                />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="honest-title" className="section">
          <h2 id="honest-title">Honest by design</h2>
          <ul className="promises">
            {promises.map((promise) => (
              <li key={promise}>{promise}</li>
            ))}
          </ul>
        </section>
      </Main>

      <footer className="site-footer">
        <Disclaimer />
      </footer>
    </div>
  )
}
