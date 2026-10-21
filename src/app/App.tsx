import { useEffect, useRef } from 'react'
import { ErrorBoundary } from '../components/ErrorBoundary.tsx'
import { OfflineBanner } from '../components/OfflineBanner.tsx'
import { MAIN_ID } from './Main.tsx'
import { LandingPage } from './pages/LandingPage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
import { OverviewPage } from './pages/OverviewPage.tsx'
import { TracksPage } from './pages/TracksPage.tsx'
import { routeTitle, type Route } from './routes.ts'
import { SkipLink } from './SkipLink.tsx'
import { useRoute } from './useRoute.ts'
import { WorkspaceShell } from './WorkspaceShell.tsx'
import './app.css'

/** Keeps the tab title current and moves focus to the page after in-app navigation. */
function useRouteEffects(route: Route) {
  const previous = useRef<Route['name'] | null>(null)
  useEffect(() => {
    document.title = routeTitle(route)
    if (previous.current !== null && previous.current !== route.name) {
      document.getElementById(MAIN_ID)?.focus()
      document.documentElement.scrollTop = 0
    }
    previous.current = route.name
  }, [route])
}

function RouteView({ route }: { route: Route }) {
  switch (route.name) {
    case 'landing':
      return <LandingPage />
    case 'overview':
      return (
        <WorkspaceShell route={route}>
          <OverviewPage />
        </WorkspaceShell>
      )
    case 'tracks':
      return (
        <WorkspaceShell route={route}>
          <TracksPage />
        </WorkspaceShell>
      )
    case 'not-found':
      return <NotFoundPage />
  }
}

export default function App() {
  const route = useRoute()
  useRouteEffects(route)
  return (
    <ErrorBoundary>
      <SkipLink />
      <OfflineBanner />
      <RouteView route={route} />
    </ErrorBoundary>
  )
}
