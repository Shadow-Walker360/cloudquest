import type { ReactNode } from 'react'
import { Disclaimer } from '../components/Disclaimer.tsx'
import { StatusChip } from '../components/StatusChip.tsx'
import { Main } from './Main.tsx'
import { features, isCurrent } from './navigation.ts'
import { hrefFor, type Route } from './routes.ts'

export function WorkspaceShell({ route, children }: { route: Route; children: ReactNode }) {
  return (
    <div className="workspace">
      <header className="topbar">
        <a className="brand" href={hrefFor({ name: 'landing' })}>
          Cloud<span>Quest</span>
        </a>
        <span className="guest-badge">Guest mode</span>
      </header>

      <nav className="sidenav" aria-label="Workspace">
        <ul>
          {features.map((feature) => (
            <li key={feature.id}>
              {feature.route ? (
                <a
                  className="nav-link"
                  href={hrefFor({ name: feature.route })}
                  aria-current={isCurrent(feature.route, route) ? 'page' : undefined}
                >
                  {feature.label}
                </a>
              ) : (
                <span className="nav-link nav-link-unavailable">
                  {feature.label} <StatusChip status={feature.status} />
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <Main className="workspace-main">{children}</Main>

      <footer className="site-footer">
        <Disclaimer />
      </footer>
    </div>
  )
}
