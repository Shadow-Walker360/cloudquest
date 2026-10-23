import { useEffect, useRef } from 'react'
import { ErrorBoundary } from '../components/ErrorBoundary.tsx'
import { OfflineBanner } from '../components/OfflineBanner.tsx'
import { StorageNotice } from '../components/StorageNotice.tsx'
import { StoreProvider } from '../features/progress/StoreProvider.tsx'
import { MAIN_ID } from './Main.tsx'
import { LabPage } from './pages/LabPage.tsx'
import { LandingPage } from './pages/LandingPage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
import { OverviewPage } from './pages/OverviewPage.tsx'
import { ProfilePage } from './pages/ProfilePage.tsx'
import { RevisionPage } from './pages/RevisionPage.tsx'
import { ScenarioPage } from './pages/ScenarioPage.tsx'
import { TracksPage } from './pages/TracksPage.tsx'
import { routeKey, routeTitle, type Route } from './routes.ts'
import { SkipLink } from './SkipLink.tsx'
import { useRoute } from './useRoute.ts'
import { WorkspaceShell } from './WorkspaceShell.tsx'
import './app.css'

/** Keeps the tab title current and moves focus to the page after in-app navigation. */
function useRouteEffects(route: Route) {
  const previous = useRef<string | null>(null)
  useEffect(() => {
    document.title = routeTitle(route)
    const key = routeKey(route)
    if (previous.current !== null && previous.current !== key) {
      document.getElementById(MAIN_ID)?.focus()
      document.documentElement.scrollTop = 0
    }
    previous.current = key
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
    case 'lab':
      return (
        <WorkspaceShell route={route}>
          <LabPage />
        </WorkspaceShell>
      )
    case 'revision':
      return (
        <WorkspaceShell route={route}>
          <RevisionPage />
        </WorkspaceShell>
      )
    case 'profile':
      return (
        <WorkspaceShell route={route}>
          <ProfilePage />
        </WorkspaceShell>
      )
    case 'scenario':
      return (
        <WorkspaceShell route={route}>
          <ScenarioPage scenarioId={route.scenarioId} />
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
      <StoreProvider>
        <SkipLink />
        <OfflineBanner />
        <StorageNotice />
        <RouteView route={route} />
      </StoreProvider>
    </ErrorBoundary>
  )
}
