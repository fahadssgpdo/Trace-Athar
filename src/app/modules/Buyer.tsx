import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { TracedSeal } from '../../components/Brand'
import { BarRow } from '../../components/ui'
import { c, display } from '../../tokens'
import { csv, download } from '../format'
import { CORE } from '../nav'
import { boatOf, fisherOf, fmtDay, fmtTime, kgFmt, lotById, MARKETS, trailFor, type State } from '../store'
import { useStore } from '../StoreContext'
import { Badge, Empty, Field, Kpi, Page, Panel, QrCode } from '../ui'

const PARTS = ['Lot-level traceability coverage', 'Document completeness', 'Cold-chain conformance', 'Grading accuracy', 'Gear and bycatch records']

/** Supplier score from the exporter's own shipments, lots and sensor records. */
function scoreExporter(s: State, exporter: string) {
  const ships = s.shipments.filter((x) => x.exporter === exporter)
  const procs = s.processed.filter((p) => ships.some((x) => x.processedIds.includes(p.id)))
  const lots = s.lots.filter((l) => procs.some((p) => p.sourceIds.includes(l.id)))
  const share = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0)
  const parts = [
    share(lots.filter((l) => l.licenceOk && l.inZone && l.checks === 5).length, lots.length),
    share(ships.filter((x) => x.corrections === 0).length, ships.length),
    share(procs.filter((p) => p.haccp['Transport temperature'] !== 'fail').length, procs.length),
    share(lots.filter((l) => l.grade).length, lots.length),
    share(lots.filter((l) => l.bycatch !== 'No bycatch record').length, lots.length),
  ]
  return { ships, procs, lots, parts, score: Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) }
}

/* ------------------------------------------------------------------ M14 */
export function BuyerAudit() {
  const { state } = useStore()
  const suppliers = [...new Set(state.shipments.map((x) => x.exporter))]
  const [sel, setSel] = useState(suppliers[0] ?? '')
  const cur = sel ? scoreExporter(state, sel) : undefined
  const alerts = cur ? cur.procs.filter((p) => Object.values(p.haccp).includes('fail')).length + cur.ships.reduce((n, x) => n + x.corrections, 0) : 0

  const esg = () => {
    if (!cur) return
    download(`trace-esg-${sel.replace(/\W+/g, '-').toLowerCase()}.csv`, csv([
      ['shipment', 'market', 'consignee', 'lot', 'species', 'origin', 'landed', 'gear', 'bycatch', 'grade', 'permitted area', 'cold chain'],
      ...cur.ships.flatMap((x) => cur.lots.filter((l) => x.processedIds.includes(l.processedId ?? '')).map((l) => [
        x.id, x.market, x.consignee, l.id, l.species, l.site, new Date(l.landedAt).toISOString(), l.gear, l.bycatch, l.grade ?? '', l.inZone ? 'yes' : 'no',
        state.processed.find((p) => p.id === l.processedId)?.haccp['Transport temperature'] === 'fail' ? 'breach' : 'in range',
      ])),
    ]))
  }

  return (
    <Page code="M14" title="Buyer audit and supplier scoring" lead="Hotels, retailers and importers see delivery-level document checks, supplier scores and alerts, built from the suppliers' own lot records — ready for ESG reporting. Audit services stay independent of the trade desk.">
      {!suppliers.length ? <Panel><Empty>No suppliers have shipped yet.</Empty></Panel> : (
        <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
          <Panel title="Suppliers" style={{ flex: '1 1 280px' }}>
            {suppliers.map((name) => {
              const sc = scoreExporter(state, name).score
              return (
                <button key={name} type="button" className="list-btn" aria-pressed={name === sel} onClick={() => setSel(name)}>
                  <span style={{ fontWeight: 600 }}>{name}</span>
                  <span style={{ ...display, fontWeight: 700, width: 48, height: 48, borderRadius: 999, border: `4px solid ${sc >= 90 ? c.amber : sc >= 80 ? c.harbour : c.mist}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{sc}</span>
                </button>
              )
            })}
          </Panel>
          {cur && (
            <div className="stack" style={{ flex: '999 1 520px', gap: 20, minWidth: 0 }}>
              <Panel title={sel} aside={<span style={{ ...display, fontWeight: 700, fontSize: 26, color: c.accent }}>{cur.score} / 100</span>}>
                {PARTS.map((name, i) => <BarRow key={name} label={name} value={cur.parts[i]} pct={cur.parts[i]} color={cur.parts[i] >= 85 ? c.harbour : c.mist} />)}
              </Panel>
              <div className="grid-auto" style={{ ['--min' as string]: '180px', gap: 12 }}>
                <Kpi label="Deliveries audited" value={cur.ships.length} note={`${cur.lots.length} source lots`} />
                <Kpi label="Open alerts" value={alerts} note="documents or temperature" />
                <Kpi label="Audit subscription" value="RO 6,000–20,000" note="per client per year" dark />
              </div>
              <Panel title="Deliveries" aside={<button type="button" className="btn btn--ghost btn--sm" onClick={esg}>Download ESG data</button>}>
                <div className="table-scroll">
                  <table className="table">
                    <thead><tr><th scope="col">Shipment</th><th scope="col">Product</th><th scope="col">Lots</th><th scope="col">Documents</th><th scope="col">Cold chain</th><th scope="col">Status</th></tr></thead>
                    <tbody>
                      {cur.ships.map((x) => {
                        const ps = cur.procs.filter((p) => x.processedIds.includes(p.id))
                        const breach = ps.some((p) => p.haccp['Transport temperature'] === 'fail')
                        return (
                          <tr key={x.id}>
                            <td style={{ fontWeight: 600 }}>{x.id}</td>
                            <td>{ps.map((p) => p.product).join(', ')} · {kgFmt(x.kg)}</td>
                            <td>{ps.reduce((n, p) => n + p.sourceIds.length, 0)}</td>
                            <td style={{ fontWeight: 600, color: x.corrections ? c.accent : c.link }}>{x.step >= 5 ? 'Signed' : 'In preparation'}{x.corrections ? ` · ${x.corrections} correction` : ''}</td>
                            <td style={{ fontWeight: 600, color: breach ? c.accent : c.link }}>{breach ? '1 breach' : 'In range'}</td>
                            <td>{x.step >= 7 ? <Badge tone="done">Released</Badge> : <Badge>In progress</Badge>}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          )}
        </div>
      )}
    </Page>
  )
}

/* ------------------------------------------------------------------ M15 */
const JOURNEY: { title: string; match: (type: string) => boolean }[] = [
  { title: 'Caught and landed', match: (t) => t.includes('commissioning') },
  { title: 'Graded and verified', match: (t) => t.includes('inspecting') },
  { title: 'First sale', match: (t) => t.includes('· sale') },
  { title: 'Processed', match: (t) => t.startsWith('TransformationEvent') },
  { title: 'Export documents signed', match: (t) => t.includes('signature') },
  { title: 'Cleared for export', match: (t) => t.includes('release') },
]

export function Passport() {
  const { state } = useStore()
  const [params, setParams] = useSearchParams()
  const options = state.lots.filter((l) => l.grade || l.price)
  const id = params.get('lot') && lotById(state, params.get('lot')!) ? params.get('lot')! : (options.find((l) => l.status === 'released') ?? options[0])?.id
  const [stage, setStage] = useState<number | null>(null)
  const lot = id ? lotById(state, id) : undefined

  if (!lot) return <Page code="M15" title="Consumer product passport"><Empty>No lots to show yet.</Empty></Page>

  const trail = trailFor(state, lot.id)
  const steps = JOURNEY.map((j) => ({ ...j, ev: trail.filter((e) => j.match(e.type)).slice(-1)[0] })).filter((s, i) => s.ev || i < 2)
  const reached = steps.filter((s) => s.ev).length
  const cur = steps[stage ?? reached - 1] ?? steps[0]
  const p = lot.processedId ? state.processed.find((x) => x.id === lot.processedId) : undefined
  const sh = p?.shipmentId ? state.shipments.find((x) => x.id === p.shipmentId) : undefined
  const breach = p?.haccp['Transport temperature'] === 'fail'
  const f = fisherOf(state, lot)
  const url = `${window.location.origin}${import.meta.env.BASE_URL}passport?lot=${lot.id}`

  return (
    <Page
      code="M15"
      title="Consumer product passport"
      lead="The QR on the pack or menu opens this page: origin, catch date, cold chain and the quality mark, drawn live from the lot record."
      actions={
        <Field label="Lot">
          <select className="input" value={lot.id} onChange={(e) => { setParams({ lot: e.target.value }); setStage(null) }}>
            {options.map((l) => <option key={l.id} value={l.id}>{l.id} · {l.species}</option>)}
          </select>
        </Field>
      }
    >
      <div className="row" style={{ gap: 24, alignItems: 'flex-start' }}>
        <div className="phone" style={{ height: 760, borderRadius: 28, boxShadow: '0 0 0 1px var(--line), 0 24px 60px rgba(11,37,69,0.18)', flex: 'none' }}>
          <div className="slab" style={{ padding: '20px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
            <TracedSeal size={72} />
            <div className="stack" style={{ gap: 2, minWidth: 0 }}>
              <div lang="ar" dir="rtl" className="arabic" style={{ fontWeight: 600, fontSize: 19, textAlign: 'left' }}>اعرف مصدر سمكك</div>
              <div style={{ fontSize: 15, color: c.onOcean }}>Know where your fish comes from</div>
              <div style={{ fontSize: 12, color: c.mist }}>Lot {lot.id}</div>
            </div>
          </div>
          <div className="phone__body" style={{ padding: '16px 18px', gap: 12 }}>
            <div style={{ ...display, fontWeight: 600, fontSize: 20 }}>{lot.species}, {lot.gear.toLowerCase()}-caught</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="card" style={{ padding: 12 }}><div className="muted" style={{ fontSize: 12 }}>Origin</div><div style={{ ...display, fontWeight: 700, fontSize: 20 }}>{lot.site}</div><div className="muted" style={{ fontSize: 12 }}>Oman · {boatOf(state, lot.boatId).name}</div></div>
              <div className="card" style={{ padding: 12 }}><div className="muted" style={{ fontSize: 12 }}>Caught</div><div style={{ ...display, fontWeight: 700, fontSize: 20, color: c.accent }}>{fmtDay(lot.landedAt)}</div><div className="muted" style={{ fontSize: 12 }}>{new Date(lot.landedAt).getUTCFullYear()}</div></div>
              <div className="card" style={{ padding: 12, gridColumn: 'span 2' }}><div className="muted" style={{ fontSize: 12 }}>Cold chain</div><div style={{ fontWeight: 600 }}>{!p ? 'Not yet processed' : breach ? 'One breach recorded and reviewed by QA' : '0–4 °C all the way · no breaks'}</div></div>
            </div>
            <div style={{ fontWeight: 600 }}>Its journey</div>
            <div role="group" aria-label="Journey stages" style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', flex: 'none' }}>
              <span style={{ position: 'absolute', left: 20, right: 20, top: '50%', height: 4, marginTop: -2, background: c.harbourLight, borderRadius: 999 }} />
              {steps.map((s, k) => {
                const on = s === cur
                const gold = k === steps.length - 1 && !!s.ev && reached === JOURNEY.length
                return (
                  <button key={s.title} type="button" aria-label={s.title} aria-pressed={on} disabled={!s.ev} onClick={() => setStage(k)}
                    style={{ ...display, position: 'relative', width: 40, height: 40, borderRadius: 999, padding: 0, fontWeight: 700, fontSize: 13, border: `4px solid ${gold ? c.amber : s.ev ? c.ocean : c.mist}`, background: on ? (gold ? c.amber : c.ocean) : c.card, color: on && !gold ? c.sand : c.ocean, cursor: s.ev ? 'pointer' : 'default' }}>
                    {k + 1}
                  </button>
                )
              })}
            </div>
            <div className="card stack" aria-live="polite" style={{ padding: 14, gap: 4, flex: 'none', minHeight: 110 }}>
              <div className="eyebrow eyebrow--sm">{cur.ev ? fmtTime(cur.ev.t).toUpperCase() : 'NOT YET'}</div>
              <div style={{ ...display, fontWeight: 600, fontSize: 17 }}>{cur.title}</div>
              <div style={{ fontSize: 14, color: c.body }}>{cur.ev?.text ?? 'This step has not happened yet.'}</div>
            </div>
            <div className="row" style={{ gap: 6 }}>
              {lot.grade && <span className="pill pill--card">Grade {lot.grade}</span>}
              {lot.licenceOk && <span className="pill pill--card">Licensed fisher</span>}
              {sh && sh.step >= 5 && <span className="pill pill--card">{MARKETS[sh.market].docs[0]} signed</span>}
            </div>
          </div>
        </div>
        <Panel title="Passport QR" style={{ flex: '1 1 280px' }}>
          <QrCode value={url} cell={7} />
          <div className="muted" style={{ fontSize: 13, wordBreak: 'break-all' }}>{url}</div>
          <div style={{ fontSize: 14 }}>Fisher: {f.name} · <Link to={CORE.lot(lot.id)}>Full lot record</Link></div>
          <div className="muted" style={{ fontSize: 13 }}>The public page shows no prices or personal data beyond what the fisher has agreed to show.</div>
        </Panel>
      </div>
    </Page>
  )
}
