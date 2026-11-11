import type { LotStatus } from './store'

export type Tone = 'neutral' | 'ok' | 'warn' | 'bad' | 'done' | 'gold'
export const STATUS: Record<LotStatus, { label: string; tone: Tone }> = {
  registered: { label: 'Registered', tone: 'neutral' },
  verified: { label: 'Verified', tone: 'ok' },
  listed: { label: 'On marketplace', tone: 'ok' },
  sold: { label: 'Sold', tone: 'gold' },
  processed: { label: 'Processed', tone: 'ok' },
  shipped: { label: 'In export', tone: 'ok' },
  released: { label: 'Released', tone: 'done' },
}
/** Trigger a browser download of generated text. */
export function download(name: string, text: string, type = 'text/csv') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export const csv = (rows: (string | number)[][]) =>
  rows.map((r) => r.map((v) => (typeof v === 'string' && /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)).join(',')).join('\n')
