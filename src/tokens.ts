import type { CSSProperties } from 'react'

/** Colour tokens for inline styles and SVG; values live in index.css. */
export const c = {
  ocean: 'var(--ocean)',
  amber: 'var(--amber)',
  harbour: 'var(--harbour)',
  harbourLight: 'var(--harbour-light)',
  sand: 'var(--sand)',
  slab: 'var(--slab)',
  mist: 'var(--mist)',
  mistDeep: 'var(--mist-deep)',
  card: 'var(--card)',
  line: 'var(--line)',
  lineDark: 'var(--line-dark)',
  body: 'var(--ink-body)',
  muted: 'var(--ink-muted)',
  onOcean: 'var(--on-ocean)',
  accent: 'var(--accent-text)',
  link: 'var(--link)',
} as const

export const display: CSSProperties = { fontFamily: 'var(--font-display)' }
