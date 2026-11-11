import type { CSSProperties } from 'react'
import mark from '../assets/mark.svg'
import { c } from '../tokens'

/** Horizontal lockup on light surfaces: the trace-line mark, "Trace" and أثر. */
export function BrandLogo({ height = 44, style }: { height?: number; style?: CSSProperties }) {
  return (
    <span
      role="img"
      aria-label="Trace أثر Seafood Traceability Hub"
      style={{ display: 'inline-flex', alignItems: 'center', gap: height * 0.2, height, color: c.ocean, lineHeight: 1, ...style }}
    >
      <img src={mark} alt="" style={{ height, width: height }} />
      <span className="display" style={{ fontWeight: 700, fontSize: height * 0.6, letterSpacing: '-0.01em' }}>Trace</span>
      <span aria-hidden="true" style={{ width: 2, height: height * 0.55, background: c.amber, borderRadius: 2 }} />
      <span lang="ar" className="arabic" style={{ fontWeight: 600, fontSize: height * 0.55 }}>أثر</span>
    </span>
  )
}

/** The "Traced" quality seal applied to verified lots. */
export function TracedSeal({ size, style }: { size: number; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 320 358" width={size} height={size} role="img" aria-label="Traced quality seal" style={{ flex: 'none', ...style }}>
      <rect width="320" height="358" rx="44.8" fill={c.ocean} />
      <rect x="16" y="16" width="288" height="326" rx="32" fill="none" stroke={c.amber} strokeWidth="3.84" />
      <g transform="translate(92.8 38.4) scale(1.344)">
        <path d="M16 76 C38 76 32 50 50 50 C68 50 62 24 84 24" fill="none" stroke={c.sand} strokeWidth="11" strokeLinecap="round" />
        <circle cx="16" cy="76" r="10" fill={c.ocean} stroke={c.harbourLight} strokeWidth="6" />
        <circle cx="50" cy="50" r="7.5" fill={c.harbourLight} />
        <circle cx="84" cy="24" r="12" fill={c.amber} />
      </g>
      <text x="160" y="224" textAnchor="middle" fill={c.sand} fontSize="30" fontWeight="600" letterSpacing="3.6" style={{ fontFamily: 'var(--font-display)' }}>TRACED</text>
      <text x="160" y="300" textAnchor="middle" fill={c.amber} fontSize="30" fontWeight="600" direction="rtl" style={{ fontFamily: 'var(--font-arabic)' }}>موثّق المصدر</text>
    </svg>
  )
}
