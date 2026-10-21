/** WCAG 2.x contrast helpers. Pure; used to check design tokens in tests. */

function channelToLinear(channel: number): number {
  const c = channel / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match?.[1]) throw new Error(`Expected a #rrggbb colour, got "${hex}"`)
  const value = match[1]
  const [r, g, b] = [0, 2, 4].map((i) => channelToLinear(parseInt(value.slice(i, i + 2), 16)))
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0)
}

export function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (a, b) => b - a,
  )
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05)
}
