import { useState } from 'react'
import PlatformShell, { PageHeader } from '../components/PlatformShell'
import { FishPhoto, Stat } from '../components/ui'
import { c, display } from '../tokens'

const LOTS = [
  { id: 'OM-DQM-26-11-0051', species: 'Yellowfin tuna', kg: 412, grade: 'A', site: 'Duqm', gear: 'Handline', time: '09:30', bid: 1.95, ends: '04:12' },
  { id: 'OM-SUR-26-11-0118', species: 'Kingfish', kg: 96.4, grade: 'A', site: 'Sur', gear: 'Handline', time: '08:55', bid: 2.4, ends: '07:40' },
  { id: 'OM-MSR-26-11-0033', species: 'Lobster', kg: 31.6, grade: 'A', site: 'Masirah', gear: 'Trap', time: '07:20', bid: 9.8, ends: '11:05' },
  { id: 'OM-DQM-26-11-0055', species: 'Squid', kg: 238, grade: 'B', site: 'Duqm', gear: 'Jig', time: '10:10', bid: 1.3, ends: '15:30' },
  { id: 'OM-SUR-26-11-0121', species: 'Yellowfin tuna', kg: 186, grade: 'B', site: 'Sur', gear: 'Handline', time: '10:40', bid: 1.65, ends: '18:20' },
  { id: 'OM-MSR-26-11-0036', species: 'Kingfish', kg: 140, grade: 'B', site: 'Masirah', gear: 'Gillnet', time: '11:15', bid: 2.15, ends: '22:45' },
]
const FILTERS = ['All', 'Yellowfin tuna', 'Kingfish', 'Squid', 'Lobster']
const BID_STEP = 0.05

const money = (x: number) => x.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })

export default function Marketplace() {
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(0)
  /** My leading bids, keyed by lot index. */
  const [bids, setBids] = useState<Record<number, number>>({})

  const price = (i: number) => bids[i] ?? LOTS[i].bid
  const bidLabel = (i: number) => (i in bids ? 'Your leading bid' : 'Current bid')
  const sel = LOTS[selected]
  const selPrice = price(selected)
  const value = sel.kg * selPrice
  const nextBid = Math.round((selPrice + BID_STEP) * 1000) / 1000

  return (
    <PlatformShell workspace="Gulf Blue Buyers (demo)">
      <PageHeader
        eyebrow="P3 · M6 MARKETPLACE · M7 PAYMENTS"
        title="First-sale marketplace"
        lead="Remote bidding on STH-verified lots. Buyers pay every fee; fishers are paid the same day."
        action={<span className="pill pill--card" style={{ fontSize: 13, padding: '6px 12px' }}>Demo data · Al Wusta and South Al Sharqiyah</span>}
      />

      <div className="grid-auto" style={{ ['--min' as string]: '170px', gap: 12 }}>
        <Stat label="Lots live" value="24" valueSize={28} />
        <Stat label="Volume today" value="6.8 t" valueSize={28} />
        <Stat label="Grade A share" value="31%" valueSize={28} />
        <Stat dark label="Settled to fishers today" value="RO 9,412" valueSize={28} />
      </div>

      <div role="group" aria-label="Filter by species" className="row" style={{ gap: 8 }}>
        {FILTERS.map((f) => (
          <button key={f} type="button" className="toggle" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <div className="stack" style={{ flex: '999 1 460px', minWidth: 0, gap: 10 }}>
          {LOTS.map((l, i) =>
            filter !== 'All' && l.species !== filter ? null : (
              <button
                key={l.id}
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={i === selected}
                className="row"
                style={{ textAlign: 'left', width: '100%', background: c.card, border: `2px solid ${i === selected ? c.ocean : c.line}`, borderRadius: 16, padding: '14px 16px', gap: '10px 18px', alignItems: 'center', color: c.ocean, fontSize: 'inherit' }}
              >
                <span className="stack" style={{ flex: '1 1 200px', minWidth: 0, gap: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: 16 }}>{l.species} · {l.kg.toLocaleString('en-US')} kg</span>
                  <span className="muted" style={{ fontSize: 13 }}>{l.id} · {l.site} · {l.gear}</span>
                </span>
                <span style={{ ...display, fontWeight: 700, fontSize: 13, padding: '4px 10px', borderRadius: 999, background: l.grade === 'A' ? c.amber : c.sand }}>Grade {l.grade}</span>
                <span className="stack" style={{ alignItems: 'flex-end', minWidth: 120 }}>
                  <span className="muted" style={{ fontSize: 12 }}>{bidLabel(i)}</span>
                  <span style={{ ...display, fontWeight: 700, fontSize: 17 }}>RO {price(i).toFixed(3)}/kg</span>
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: c.link, minWidth: 64, textAlign: 'right' }}>{l.ends}</span>
              </button>
            ),
          )}
        </div>

        <section aria-label="Selected lot" className="panel stack" style={{ flex: '1 1 320px', minWidth: 0, gap: 14 }}>
          <FishPhoto height={140} label="Quality photo · placeholder" />
          <div>
            <div style={{ ...display, fontWeight: 600, fontSize: 20 }}>{sel.species} · {sel.kg.toLocaleString('en-US')} kg</div>
            <div className="muted" style={{ fontSize: 13 }}>{sel.id}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, fontSize: 13 }}>
            {[
              ['Landed', `${sel.site} · ${sel.time}`],
              ['Gear', sel.gear],
              ['Licence', 'Checked'],
              ['Status', 'STH Verified'],
            ].map(([k, v]) => (
              <div key={k} style={{ background: c.sand, borderRadius: 10, padding: '8px 10px' }}>
                <div className="muted">{k}</div>
                <div style={{ fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>

          <div className="stack" style={{ borderTop: `1px solid ${c.line}`, paddingTop: 14, gap: 10 }}>
            <div className="kv" style={{ alignItems: 'baseline' }}>
              <span className="muted">{bidLabel(selected)}</span>
              <span style={{ ...display, fontWeight: 700, fontSize: 26, color: c.accent }}>RO {selPrice.toFixed(3)}/kg</span>
            </div>
            {selected in bids && (
              <div role="status" className="slab" style={{ borderRadius: 12, padding: '10px 12px', fontSize: 14, fontWeight: 500 }}>You lead this lot. Settlement runs the same day through the partner bank.</div>
            )}
            <button type="button" className="btn btn--amber" style={{ minHeight: 52, fontWeight: 700, fontSize: 16 }} onClick={() => setBids({ ...bids, [selected]: nextBid })}>
              Bid RO {nextBid.toFixed(3)}/kg
            </button>
            <div className="stack" style={{ gap: 6, fontSize: 14 }}>
              <div className="kv"><span className="muted">Lot value</span><span style={{ fontWeight: 600 }}>RO {money(value)}</span></div>
              <div className="kv"><span className="muted">Marketplace fee 1.0% · buyer</span><span style={{ fontWeight: 600 }}>RO {money(value * 0.01)}</span></div>
              <div className="kv"><span className="muted">Payment fee 0.25% · buyer</span><span style={{ fontWeight: 600 }}>RO {money(value * 0.0025)}</span></div>
              <div className="kv" style={{ borderTop: `1px solid ${c.line}`, paddingTop: 6 }}>
                <span style={{ fontWeight: 600 }}>Fisher receives today</span>
                <span style={{ fontWeight: 700, color: c.link }}>RO {money(value)} · 100%</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PlatformShell>
  )
}
