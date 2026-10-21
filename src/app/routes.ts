/**
 * Hash-based routes (see docs/adr/0003-hash-routing.md). Pure and framework-free.
 * `#/` is the public landing page; everything under `#/app` is the guest-accessible workspace.
 */

export type Route =
  | { name: 'landing' }
  | { name: 'overview' }
  | { name: 'tracks' }
  | { name: 'lab' }
  | { name: 'scenario'; scenarioId: string }
  | { name: 'not-found' }

const SCENARIO_PATH = /^\/app\/lab\/([a-z0-9-]+)$/

export function parseHash(hash: string): Route {
  const withoutHash = hash.startsWith('#') ? hash.slice(1) : hash
  const path = (withoutHash.split('?')[0] ?? '').replace(/\/+$/, '') || '/'
  switch (path) {
    case '/':
      return { name: 'landing' }
    case '/app':
      return { name: 'overview' }
    case '/app/tracks':
      return { name: 'tracks' }
    case '/app/lab':
      return { name: 'lab' }
  }
  const scenarioId = SCENARIO_PATH.exec(path)?.[1]
  return scenarioId ? { name: 'scenario', scenarioId } : { name: 'not-found' }
}

export function hrefFor(route: Exclude<Route, { name: 'not-found' }>): string {
  switch (route.name) {
    case 'landing':
      return '#/'
    case 'overview':
      return '#/app'
    case 'tracks':
      return '#/app/tracks'
    case 'lab':
      return '#/app/lab'
    case 'scenario':
      return `#/app/lab/${route.scenarioId}`
  }
}

/** Identifies a page, so moving between two scenarios counts as navigation. */
export function routeKey(route: Route): string {
  return route.name === 'scenario' ? `scenario:${route.scenarioId}` : route.name
}

export function routeTitle(route: Route): string {
  switch (route.name) {
    case 'landing':
      return 'CloudQuest'
    case 'overview':
      return 'Overview · CloudQuest'
    case 'tracks':
      return 'Learning tracks · CloudQuest'
    case 'lab':
    case 'scenario':
      return 'Scenario Lab · CloudQuest'
    case 'not-found':
      return 'Page not found · CloudQuest'
  }
}
