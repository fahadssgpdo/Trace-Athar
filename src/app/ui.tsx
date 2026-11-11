import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { c } from '../tokens'
import { CORE, mod } from './nav'
import { STATUS, type Tone } from './format'
import type { LotStatus } from './store'

export function Page({ code, title, lead, actions, children }: { code?: string; title: string; lead?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  const m = code ? mod(code) : undefined
  return (
    <>
      <div className="row" style={{ gap: 16, alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div className="stack" style={{ gap: 6, minWidth: 0 }}>
          {m && <div className="eyebrow">{m.id} · {m.users.toUpperCase()}</div>}
          <h1 className="page-title">{title}</h1>
          {lead && <p className="muted" style={{ maxWidth: 780 }}>{lead}</p>}
        </div>
        {actions && <div className="row" style={{ gap: 8, alignItems: 'center' }}>{actions}</div>}
      </div>
      {children}
    </>
  )
}

export function Panel({ title, aside, children, style, dark }: { title?: ReactNode; aside?: ReactNode; children: ReactNode; style?: CSSProperties; dark?: boolean }) {
  return (
    <section className={dark ? 'slab stack' : 'panel stack'} style={{ gap: 14, minWidth: 0, ...(dark ? { borderRadius: 20, padding: 20 } : {}), ...style }}>
      {(title || aside) && (
        <div className="row" style={{ gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
          {title && <h2 className="h-panel">{title}</h2>}
          {aside}
        </div>
      )}
      {children}
    </section>
  )
}

export function Field({ label, hint, children, style }: { label: string; hint?: ReactNode; children: ReactNode; style?: CSSProperties }) {
  return (
    <label className="field" style={style}>
      <span className="field__label">{label}</span>
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  )
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

export const StatusBadge = ({ status }: { status: LotStatus }) => <Badge tone={STATUS[status].tone}>{STATUS[status].label}</Badge>

export const LotLink = ({ id }: { id: string }) => (
  <Link to={CORE.lot(id)} style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{id}</Link>
)

export function Empty({ children }: { children: ReactNode }) {
  return <div className="muted" style={{ fontSize: 14, padding: '14px 0' }}>{children}</div>
}

export function Kpi({ label, value, note, dark }: { label: string; value: ReactNode; note?: ReactNode; dark?: boolean }) {
  return (
    <div className={dark ? 'slab stat' : 'card stat'} style={{ borderRadius: 16 }}>
      <div className="stat__label">{label}</div>
      <div className="stat__value" style={{ fontSize: 26 }}>{value}</div>
      {note && <div className="stat__note">{note}</div>}
    </div>
  )
}

export function Notice({ tone = 'ok', children }: { tone?: 'ok' | 'warn' | 'bad'; children: ReactNode }) {
  return <div role="status" className={`notice notice--${tone}`}>{children}</div>
}

/** Deterministic QR-like label (21 × 21 with finder squares), varied by the value it encodes. */
export function QrCode({ value, cell = 6 }: { value: string; cell?: number }) {
  let h = 0
  for (const ch of value) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const finder = (r: number, col: number, r0: number, c0: number): boolean | null => {
    const y = r - r0
    const x = col - c0
    if (y < 0 || x < 0 || y > 6 || x > 6) return null
    return y === 0 || y === 6 || x === 0 || x === 6 || (y >= 2 && y <= 4 && x >= 2 && x <= 4)
  }
  const rects: ReactNode[] = []
  for (let r = 0; r < 21; r++) {
    for (let col = 0; col < 21; col++) {
      const f = finder(r, col, 0, 0) ?? finder(r, col, 0, 14) ?? finder(r, col, 14, 0)
      const quiet = (r === 7 || col === 7) && r < 8 && col < 8
      const on = f ?? (!quiet && (r * 7 + col * 13 + r * col + (h % 97)) % 5 < 2)
      if (on) rects.push(<rect key={r * 21 + col} x={col} y={r} width="1" height="1" />)
    }
  }
  return (
    <svg viewBox="-1 -1 23 23" width={23 * cell} height={23 * cell} role="img" aria-label={`QR label for ${value}`} style={{ background: c.card, flex: 'none' }} shapeRendering="crispEdges">
      <g fill={c.ocean}>{rects}</g>
    </svg>
  )
}

/** 24 h temperature line with the 4 °C limit. */
export function TempChart({ points, label, breachAt }: { points: number[]; label: string; breachAt?: number }) {
  const X = (k: number) => 40 + (590 * k) / 48
  const Y = (t: number) => 190 - (170 * t) / 8
  const d = points.map((t, k) => `${k ? 'L' : 'M'}${X(k).toFixed(1)} ${Y(t).toFixed(1)}`).join(' ')
  return (
    <svg viewBox="0 0 640 220" role="img" aria-label={label} style={{ width: '100%', height: 'auto', display: 'block', fontFamily: 'var(--font-text)' }}>
      <line x1="40" y1="20" x2="40" y2="190" stroke={c.line} />
      <line x1="40" y1="190" x2="630" y2="190" stroke={c.line} />
      <line x1="40" y1={Y(4)} x2="630" y2={Y(4)} stroke={c.accent} strokeDasharray="6 5" strokeWidth="1.5" />
      <text x="626" y={Y(4) - 6} fill={c.accent} fontSize="12" textAnchor="end">4 °C limit</text>
      <text x="34" y="194" fill={c.muted} fontSize="11" textAnchor="end">0</text>
      <text x="34" y="27" fill={c.muted} fontSize="11" textAnchor="end">8 °C</text>
      <text x="40" y="208" fill={c.muted} fontSize="11">−24 h</text>
      <text x="630" y="208" fill={c.muted} fontSize="11" textAnchor="end">now</text>
      <path d={d} fill="none" stroke={c.harbour} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {breachAt !== undefined && <circle cx={X(breachAt)} cy={Y(points[breachAt])} r="7" fill={c.amber} stroke={c.ocean} strokeWidth="2" />}
    </svg>
  )
}
