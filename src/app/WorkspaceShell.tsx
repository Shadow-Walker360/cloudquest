import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Disclaimer } from '../components/Disclaimer.tsx'
import { Icon } from '../components/Icon.tsx'
import { StatusChip } from '../components/StatusChip.tsx'
import { Main, MAIN_ID } from './Main.tsx'
import { currentFeature, features, isCurrent } from './navigation.ts'
import { hrefFor, routeKey, type Route } from './routes.ts'

/** Below this width the sidebar becomes an off-canvas drawer. Keep in sync with app.css. */
const DESKTOP_QUERY = '(min-width: 46.3125rem)'

export function WorkspaceShell({ route, children }: { route: Route; children: ReactNode }) {
  // The drawer is "open for a page", so navigating to another page closes it without an effect.
  const [openForPage, setOpenForPage] = useState<string | null>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const pageKey = routeKey(route)
  const menuOpen = openForPage === pageKey
  const setMenuOpen = (open: boolean) => setOpenForPage(open ? pageKey : null)
  const pageLabel = currentFeature(route)?.label ?? 'Workspace'

  // While the drawer is open: focus moves into it, Escape closes it and returns focus to the
  // menu button, and growing to desktop width closes it.
  useEffect(() => {
    if (!menuOpen) return
    sidebarRef.current?.querySelector<HTMLElement>('a')?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpenForPage(null)
      toggleRef.current?.focus()
    }
    const media = window.matchMedia?.(DESKTOP_QUERY)
    const onMediaChange = () => {
      if (media?.matches) setOpenForPage(null)
    }
    document.addEventListener('keydown', onKeyDown)
    media?.addEventListener('change', onMediaChange)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      media?.removeEventListener('change', onMediaChange)
    }
  }, [menuOpen])

  // Choosing the page you are already on does not navigate, so close the drawer and move focus
  // to the content ourselves; otherwise focus would be lost inside the hidden drawer.
  const closeAfterChoosing = () => {
    setMenuOpen(false)
    document.getElementById(MAIN_ID)?.focus()
  }

  return (
    <div className="app-shell">
      <aside id="app-sidebar" ref={sidebarRef} className={menuOpen ? 'sidebar open' : 'sidebar'}>
        <a className="brand" href={hrefFor({ name: 'overview' })} onClick={closeAfterChoosing}>
          <span className="brand-mark">
            <Icon name="cloud" />
          </span>
          <span>
            <span className="brand-name">
              Cloud<span>Quest</span>
            </span>
            <span className="brand-sub">Learn by doing</span>
          </span>
        </a>

        <p className="kicker nav-label">Learning space</p>
        <nav aria-label="Workspace">
          <ul>
            {features.map((feature) => (
              <li key={feature.id}>
                {feature.route ? (
                  <a
                    className="nav-link"
                    href={hrefFor({ name: feature.route })}
                    aria-current={isCurrent(feature.route, route) ? 'page' : undefined}
                    onClick={closeAfterChoosing}
                  >
                    <Icon name={feature.icon} />
                    <span>{feature.label}</span>
                  </a>
                ) : (
                  <span className="nav-link nav-link-unavailable">
                    <Icon name={feature.icon} />
                    <span>{feature.label}</span>
                    <StatusChip status={feature.status} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="icon-tile icon-tile-blue">
              <Icon name="info" />
            </span>
            <p>
              <strong>Nothing is saved yet</strong>
              <span>Saving your progress is planned.</span>
            </p>
          </div>
          <div className="profile">
            <span className="avatar" aria-hidden="true">
              G
            </span>
            <p>
              <strong>Guest</strong>
              <span>Accounts are not available yet</span>
            </p>
          </div>
        </div>
      </aside>

      {menuOpen && <div className="scrim" aria-hidden="true" onClick={() => setMenuOpen(false)} />}

      <div className="app-main">
        <header className="topbar">
          <button
            ref={toggleRef}
            type="button"
            className="menu-button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="app-sidebar"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <ol>
              <li>Workspace</li>
              <li aria-current="page">{pageLabel}</li>
            </ol>
          </nav>
          <span className="status-pill">
            <span className="dot" aria-hidden="true" />
            Guest mode
          </span>
        </header>

        <div className="app-body" inert={menuOpen}>
          <Main className="main-content">{children}</Main>
          <footer className="page-footer">
            <Disclaimer />
          </footer>
        </div>
      </div>
    </div>
  )
}
