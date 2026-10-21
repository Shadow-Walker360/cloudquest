import { contentPacks } from '../content/registry.ts'
import './app.css'

export default function App() {
  return (
    <main className="shell">
      <p className="eyebrow">Unofficial educational project</p>
      <h1>CloudQuest</h1>
      <p className="tagline">Learn cloud by solving real-world challenges.</p>

      <section className="panel" aria-labelledby="packs-heading">
        <h2 id="packs-heading">Content loaded</h2>
        <ul>
          {contentPacks.map((pack) => (
            <li key={pack.id}>
              <strong>{pack.title}</strong>: {pack.scenarios.length} items, {pack.objectives.length}{' '}
              objectives, status <em>{pack.status}</em>
              {pack.status === 'draft' && ' (not yet reviewed)'}
            </li>
          ))}
        </ul>
        <p className="note">
          Project scaffold only. Learning features are not built yet; see the README for status.
        </p>
      </section>

      <footer>
        CloudQuest is not affiliated with Microsoft, AWS, or Google. It does not reproduce official
        exam questions.
      </footer>
    </main>
  )
}
