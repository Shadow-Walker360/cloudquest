import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from './App.tsx'

describe('App', () => {
  const html = renderToStaticMarkup(<App />)

  it('shows the product name, tagline and unofficial disclaimer', () => {
    expect(html).toContain('CloudQuest')
    expect(html).toContain('Learn cloud by solving real-world challenges.')
    expect(html).toContain('not affiliated with Microsoft, AWS, or Google')
  })

  it('labels draft content as not yet reviewed', () => {
    expect(html).toContain('Azure fundamentals (legacy practice set)')
    expect(html).toContain('(not yet reviewed)')
  })
})
