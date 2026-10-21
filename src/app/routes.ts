/**
 * Hash-based routes (see docs/adr/0003-hash-routing.md). Pure and framework-free.
 * `#/` is the public landing page; everything under `#/app` is the guest-accessible workspace.
 */

export type Route =
  { name: 'landing' } | { name: 'overview' } | { name: 'tracks' } | { name: 'not-found' }

const PATHS = {
  landing: '/',
  overview: '/app',
  tracks: '/app/tracks',
} as const

export function parseHash(hash: string): Route {
  const withoutHash = hash.startsWith('#') ? hash.slice(1) : hash
  const path = (withoutHash.split('?')[0] ?? '').replace(/\/+$/, '') || '/'
  switch (path) {
    case PATHS.landing:
      return { name: 'landing' }
    case PATHS.overview:
      return { name: 'overview' }
    case PATHS.tracks:
      return { name: 'tracks' }
    default:
      return { name: 'not-found' }
  }
}

export function hrefFor(route: Exclude<Route, { name: 'not-found' }>): string {
  return `#${PATHS[route.name]}`
}

export function routeTitle(route: Route): string {
  switch (route.name) {
    case 'landing':
      return 'CloudQuest'
    case 'overview':
      return 'Overview · CloudQuest'
    case 'tracks':
      return 'Learning tracks · CloudQuest'
    case 'not-found':
      return 'Page not found · CloudQuest'
  }
}
