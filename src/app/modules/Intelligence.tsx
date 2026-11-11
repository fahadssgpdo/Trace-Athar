import { useState } from 'react'
import { BarRow } from '../../components/ui'
import { c, display } from '../../tokens'
import { csv, download } from '../format'
import { boatOf, kgFmt, ro, SITES, SPECIES, trailFor, type State, type Step } from '../store'
import { useStore } from '../StoreContext'
import { Badge, Empty, Kpi, LotLink, Page, Panel } from '../ui'

const HOUR = 3_600_000
const ORDER: Step[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']

/** Process mining over the event log: each lot's path, conformance, lead times and risks. */
function analyse(s: State, site: string) {
  const lots = s.lots.filter((l) => site === 'All' || l.site === site)
  const firstAt = (lotId: string, pred: (type: string) => boolean) => trailFor(s, lotId).find((e) => pred(e.type))?.t
  const variants = new Map<string, { n: number; ok: boolean }>()
  let conform = 0
  const deviations = { skipped: [] as string[], off: [] as string[], breach: [] as string[], weight: [] as string[] }
  for (const l of lots) {
    const steps = [...new Set(trailFor(s, l.id).map((e) => e.step))].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))
    const last = ORDER.indexOf(steps[steps.length - 1])
    const ok = ORDER.slice(0, last + 1).every((st) => steps.includes(st)) && l.saleMode !== 'off-platform'
    if (ok) conform++
    const key = steps.join(' → ') + (l.saleMode === 'off-platform' ? ' (off-platform sale)' : '')
    const v = variants.get(key) ?? { n: 0, ok }
    v.n++
    variants.set(key, v)
    if (!steps.includes('P2') && last > 1) deviations.skipped.push(l.id)
    if (l.saleMode === 'off-platform') deviations.off.push(l.id)
    const p = s.processed.find((x) => x.id === l.processedId)
    if (p?.haccp['Transport temperature'] === 'fail') deviations.breach.push(l.id)
    const sh = s.shipments.find((x) => x.id === p?.shipmentId)
    if (sh && sh.declaredKg > sh.kg + 0.5) deviations.weight.push(l.id)
  }
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
  const span = (from: (t: string) => boolean, to: (t: string) => boolean) =>
    avg(lots.map((l) => { const a = firstAt(l.id, from); const b = firstAt(l.id, to); return a && b && b > a ? (b - a) / HOUR : undefined }).filter((x): x is number => x !== undefined))
  const lead: [string, number][] = [
    ['Landing → quality check', span((t) => t.includes('commissioning'), (t) => t.includes('inspecting'))],
    ['Quality check → sale', span((t) => t.includes('inspecting'), (t) => t.includes('· sale'))],
    ['Sale → processing', span((t) => t.includes('· sale'), (t) => t.startsWith('TransformationEvent'))],
    ['Processing → pack request', span((t) => t.startsWith('TransformationEvent'), (t) => t.includes('shipping request'))],
    ['Pack request → MAFWR signature', span((t) => t.includes('shipping request'), (t) => t.includes('signature'))],
    ['Signature → customs release', span((t) => t.includes('signature'), (t) => t.includes('release'))],
  ]
  const procs = s.processed.filter((p) => p.sourceIds.some((id) => lots.some((l) => l.id === id)))
  const breakRate = procs.length ? procs.filter((p) => p.haccp['Transport temperature'] === 'fail').length / procs.length : 0
  return { lots, conform, variants: [...variants.entries()].sort((a, b) => b[1].n - a[1].n), deviations, lead, breakRate }
}

/* ------------------------------------------------------------------ M16 */
export function Analytics() {
  const { state } = useStore()
  const [site, setSite] = useState('All')
  const a = analyse(state, site)
  const max = Math.max(1, ...a.lead.map(([, h]) => h))
  const totalLead = a.lead.reduce((n, [, h]) => n + h, 0)
  const outZone = a.lots.filter((l) => !l.inZone)
  const noBycatch = a.lots.filter((l) => l.gear === 'Gillnet' && l.bycatch === 'No bycatch record')
  const sameDay = (() => {
    // Same boat landing at two different sites within 24 h: a possible IUU pattern.
    const out: string[] = []
    for (const l of a.lots) for (const m of a.lots) if (l.id < m.id && l.boatId === m.boatId && l.site !== m.site && Math.abs(l.landedAt - m.landedAt) < 24 * HOUR) out.push(`${l.id} / ${m.id}`)
    return out
  })()
  const risks = [
    { name: 'Outside permitted area', level: outZone.length ? 'High' : 'None', items: outZone.map((l) => l.id), text: 'Lots from boats that failed the MAFWR yes/no area check.' },
    { name: 'IUU pattern', level: sameDay.length ? 'Medium' : 'None', items: sameDay, text: 'One boat landing at two sites within a day.' },
    { name: 'Bycatch reporting gap', level: noBycatch.length ? 'Low' : 'None', items: noBycatch.map((l) => l.id), text: 'Gillnet lots without a bycatch record — needed for US MMPA evidence.' },
    { name: 'Weight gap vs Bayan', level: a.deviations.weight.length ? 'High' : 'None', items: a.deviations.weight, text: 'Declared export weight above what landed lots produced.' },
  ]

  return (
    <Page
      code="M16"
      title="Analytics and process intelligence"
      lead="Object-centric process mining over the EPCIS log: how lots really move, where they wait, where they leave the target process, and which records carry IUU or bycatch risk."
      actions={
        <div role="group" aria-label="Site" className="segmented">
          {['All', ...Object.keys(SITES)].map((x) => <button key={x} type="button" aria-pressed={site === x} onClick={() => setSite(x)}>{x}</button>)}
        </div>
      }
    >
      <div className="grid-auto" style={{ ['--min' as string]: '190px', gap: 12 }}>
        <Kpi label="Lots conforming to the target process" value={`${Math.round((a.conform / Math.max(1, a.lots.length)) * 100)}%`} note={`${a.conform} of ${a.lots.length} lots`} dark />
        <Kpi label="Landing to customs release" value={`${totalLead.toFixed(0)} h`} note="sum of average step times" />
        <Kpi label="Cold-chain break rate" value={`${Math.round(a.breakRate * 100)}%`} note="processed lots with a breach" />
        <Kpi label="Landed volume" value={kgFmt(a.lots.reduce((n, l) => n + l.kg, 0))} note={`${a.lots.length} lots`} />
      </div>
      <Panel title="Discovered paths" aside={<span className="muted" style={{ fontSize: 13 }}>From the event log · {site === 'All' ? 'all pilot sites' : site}</span>}>
        <div className="row" style={{ gap: 8, alignItems: 'center' }}>
          {['Landing', 'Quality check', 'First sale', 'Processing', 'Export documents', 'Release'].map((n, i, arr) => (
            <span key={n} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <span className="slab" style={{ borderRadius: 10, padding: '8px 12px', fontWeight: 600, fontSize: 13 }}>{n}</span>
              {i < arr.length - 1 && <span aria-hidden="true" style={{ color: c.link }}>→</span>}
            </span>
          ))}
        </div>
        <div className="table-scroll">
          <table className="table">
            <thead><tr><th scope="col">Variant</th><th scope="col">Lots</th><th scope="col">Target process</th></tr></thead>
            <tbody>{a.variants.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v.n}</td><td>{v.ok ? <Badge tone="ok">Conforms</Badge> : <Badge tone="warn">Deviates</Badge>}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="grid-auto" style={{ ['--min' as string]: '220px', gap: 10 }}>
          {([['Skipped the quality check', a.deviations.skipped], ['Sold off-platform', a.deviations.off], ['Cold-chain breach', a.deviations.breach], ['Weight gap vs Bayan', a.deviations.weight]] as const).map(([name, ids]) => (
            <div key={name} className="stack" style={{ border: `2px dashed ${c.mist}`, borderRadius: 14, padding: '12px 14px', gap: 4 }}>
              <span className="kv"><b>{name}</b><span style={{ ...display, fontWeight: 700, color: c.accent }}>{ids.length}</span></span>
              <span className="row" style={{ gap: 6, fontSize: 13 }}>{ids.length ? ids.map((id) => <LotLink key={id} id={id} />) : <span className="muted">None</span>}</span>
            </div>
          ))}
        </div>
      </Panel>
      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <Panel title="Average lead time per step" style={{ flex: '999 1 460px' }}>
          {a.lead.map(([name, h]) => <BarRow key={name} label={name} value={`${h.toFixed(1)} h`} pct={Math.round((h / max) * 100)} color={h === max ? c.amber : c.harbour} labelWidth={210} valueWidth={64} height={16} />)}
          <div className="muted" style={{ fontSize: 13 }}>The longest step is highlighted: that is where pre-filled packs and the online exchange save most time.</div>
        </Panel>
        <Panel title="Risk flags" dark style={{ flex: '1 1 320px' }}>
          {risks.map((r) => (
            <div key={r.name} className="stack" style={{ background: c.slab, borderRadius: 12, padding: '12px 14px', gap: 4 }}>
              <span className="kv"><b>{r.name}</b><span className="badge" style={{ background: r.level === 'None' ? c.mist : c.amber, borderColor: 'transparent', color: c.ocean }}>{r.level}</span></span>
              <span style={{ fontSize: 13, color: c.onOcean }}>{r.text}</span>
              {r.items.length > 0 && <span style={{ fontSize: 12, color: c.mist }}>{r.items.join(', ')}</span>}
            </div>
          ))}
          <div style={{ fontSize: 12, color: c.mist }}>Scores are commercial assurance, not enforcement. Authorities see them only on request.</div>
        </Panel>
      </div>
    </Page>
  )
}

/* ------------------------------------------------------------------ M17 */
const MIN_OPERATORS = 5

export function DataProducts() {
  const { state } = useStore()
  const sold = state.lots.filter((l) => l.price)
  const rows = SPECIES.map((sp) => {
    const xs = sold.filter((l) => l.species === sp)
    const ops = new Set(xs.map((l) => l.fisherId)).size
    const kg = xs.reduce((n, l) => n + l.kg, 0)
    return { sp, ops, kg, n: xs.length, price: kg ? xs.reduce((n, l) => n + l.price! * l.kg, 0) / kg : 0 }
  })
  const allOps = new Set(sold.map((l) => l.fisherId)).size
  const allKg = sold.reduce((n, l) => n + l.kg, 0)
  const allPrice = allKg ? sold.reduce((n, l) => n + l.price! * l.kg, 0) / allKg : 0
  const em = state.boats.map((b) => {
    const trips = state.trips.filter((t) => t.boatId === b.id)
    const lots = state.lots.filter((l) => l.boatId === b.id)
    const events = [...trips.map((t) => t.bycatch), ...lots.map((l) => l.bycatch)].filter((x) => !/^None/.test(x))
    return { b, trips: trips.length, lots: lots.length, events }
  })
  const exportReport = () => download('trace-price-volume-report.csv', csv([
    ['species', 'operators', 'lots', 'volume_kg', 'avg_price_ro_per_kg'],
    ...rows.map((r) => (r.ops >= MIN_OPERATORS ? [r.sp, r.ops, r.n, r.kg, r.price.toFixed(3)] : [r.sp, `<${MIN_OPERATORS}`, 'suppressed', 'suppressed', 'suppressed'])),
    ['All species', allOps, sold.length, allKg, allPrice.toFixed(3)],
  ]))

  return (
    <Page code="M17" title="Data products and electronic monitoring reports" lead="Anonymised price, volume and lead-time reports for exporters, banks and insurers, and vessel bycatch reports for US importers. No figure is published for fewer than five operators; an individual's data is shared only with their consent.">
      <div className="grid-auto" style={{ ['--min' as string]: '190px', gap: 12 }}>
        <Kpi label="Operators in the data" value={allOps} note="fishers with recorded sales" />
        <Kpi label="Traded volume" value={kgFmt(allKg)} />
        <Kpi label="Volume-weighted price" value={`${ro(allPrice)}/kg`} dark />
      </div>
      <Panel title="Price and volume report" aside={<button type="button" className="btn btn--ghost btn--sm" onClick={exportReport}>Download CSV</button>}>
        <div className="table-scroll">
          <table className="table">
            <thead><tr><th scope="col">Species</th><th scope="col">Operators</th><th scope="col">Volume</th><th scope="col">Avg price</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.sp}>
                  <td style={{ fontWeight: 600 }}>{r.sp}</td>
                  {r.ops >= MIN_OPERATORS ? (
                    <><td>{r.ops}</td><td>{kgFmt(r.kg)}</td><td>{ro(r.price)}/kg</td></>
                  ) : (
                    <td colSpan={3}><Badge>Suppressed · {r.ops ? `fewer than ${MIN_OPERATORS} operators` : 'no sales'}</Badge></td>
                  )}
                </tr>
              ))}
              <tr><td style={{ fontWeight: 700 }}>All species</td>{allOps >= MIN_OPERATORS ? <><td>{allOps}</td><td>{kgFmt(allKg)}</td><td>{ro(allPrice)}/kg</td></> : <td colSpan={3}><Badge>Suppressed</Badge></td>}</tr>
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Electronic monitoring and bycatch, by vessel">
        <p className="muted" style={{ fontSize: 13 }}>Shared with a named importer only with the vessel owner's consent. Built from e-Logbook entries and lot records; camera reviews attach here when EM hardware is fitted.</p>
        <div className="table-scroll">
          <table className="table">
            <thead><tr><th scope="col">Vessel</th><th scope="col">Gear</th><th scope="col">Trips</th><th scope="col">Lots</th><th scope="col">Bycatch events</th></tr></thead>
            <tbody>
              {em.map(({ b, trips, lots, events }) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.name}<div className="muted" style={{ fontSize: 12, fontWeight: 400 }}>{b.id} · {boatOf(state, b.id).tracker}</div></td>
                  <td>{b.gear}</td>
                  <td>{trips}</td>
                  <td>{lots}</td>
                  <td>{events.length ? events.join('; ') : <span className="muted">None reported</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!em.length && <Empty>No vessels.</Empty>}
      </Panel>
    </Page>
  )
}
