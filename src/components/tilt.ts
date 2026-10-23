/** A small, stable tilt per note (-2 to +2 degrees) so a board looks hand-stuck, not gridded. */
export function tiltFor(id: string): number {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 997
  return ((hash % 9) - 4) / 2
}
