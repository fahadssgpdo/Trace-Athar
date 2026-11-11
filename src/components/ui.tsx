import type { CSSProperties, ReactNode } from 'react'
import { c } from '../tokens'

type StatProps = {
  label: ReactNode
  value: ReactNode
  note?: ReactNode
  dark?: boolean
  valueSize?: number
  valueColor?: string
  style?: CSSProperties
}

/** Label / big number / note tile used across dashboards. */
export function Stat({ label, value, note, dark, valueSize, valueColor, style }: StatProps) {
  return (
    <div
      className={dark ? 'slab stat' : 'card stat'}
      style={{ borderRadius: 16, ...style }}
    >
      <div className="stat__label">{label}</div>
      <div className="stat__value" style={{ fontSize: valueSize, color: valueColor }}>
        {value}
      </div>
      {note && <div className="stat__note">{note}</div>}
    </div>
  )
}

type BarRowProps = {
  label: ReactNode
  value: ReactNode
  /** 0–100 */
  pct: number
  color?: string
  labelWidth?: number
  valueWidth?: number
  height?: number
}

/** Horizontal bar with a label on the left and the value on the right. */
export function BarRow({
  label,
  value,
  pct,
  color,
  labelWidth = 220,
  valueWidth = 48,
  height = 14,
}: BarRowProps) {
  return (
    <div
      className="bar-row"
      style={{
        gridTemplateColumns: `minmax(0, ${labelWidth}px) minmax(0, 1fr) ${valueWidth}px`,
      }}
    >
      <span>{label}</span>
      <span className="bar-track" style={{ height }}>
        <span className="bar-fill" style={{ width: `${pct}%`, background: color }} />
      </span>
      <span style={{ fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

export function Check({ size = 16, stroke = c.card, width = 3 }: { size?: number; stroke?: string; width?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  )
}

export function ChevronLeft() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

/** Placeholder for a catch photo: sea, horizon and a fish silhouette. */
export function FishPhoto({ height, label }: { height: number; label: string }) {
  return (
    <div
      style={{
        height,
        borderRadius: 16,
        background: c.mist,
        display: 'flex',
        alignItems: 'flex-end',
        padding: 12,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 350 180"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <path d="M0 130 C 80 110, 160 150, 350 120 L350 180 L0 180 Z" fill={c.harbourLight} />
        <path d="M70 92 C 120 60, 210 60, 260 92 C 210 118, 120 118, 70 92 Z" fill={c.ocean} opacity="0.85" />
        <path d="M258 92 L290 72 L290 112 Z" fill={c.ocean} opacity="0.85" />
      </svg>
      <span className="pill pill--card" style={{ position: 'relative', border: 'none', padding: '5px 10px' }}>
        {label}
      </span>
    </div>
  )
}
