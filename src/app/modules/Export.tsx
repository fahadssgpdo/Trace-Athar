import { useState } from 'react'
import { c, display } from '../../tokens'
import {
  EXPORTERS, FEES, fmtTime, kgFmt, MARKETS, ORDER_STAGES, ro, SHIP_STEPS_OFFLINE, SHIP_STEPS_ONLINE, SPECIES,
} from '../store'
import { useStore } from '../StoreContext'
import { Badge, Empty, Field, Kpi, LotLink, Notice, Page, Panel } from '../ui'

const GOV = [3, 6]

/* ------------------------------------------------------------------ M13 */
export function ExportDocs() {
  const { state, run } = useStore()
  const ready = state.processed.filter((p) => !p.shipmentId)
  const [picked, setPicked] = useState<string[]>([])
  const [market, setMarket] = useState('EU')
  const [online, setOnline] = useState(true)
  const [exporter, setExporter] = useState(EXPORTERS[0].name)
  const [consignee, setConsignee] = useState('Mariscos Levante, Spain')
  const [declared, setDeclared] = useState('')
  const [selId, setSelId] = useState(state.shipments[state.shipments.length - 1]?.id ?? '')
  const exp = EXPORTERS.find((e) => e.name === exporter)!
  const pickedKg = ready.filter((p) => picked.includes(p.id)).reduce((n, p) => n + p.kg, 0)
  const haccpFail = ready.some((p) => picked.includes(p.id) && Object.values(p.haccp).includes('fail'))
  const canCreate = exp.licence && picked.length > 0 && !haccpFail && consignee

  const create = () => {
    const id = run('createShipment', { processedIds: picked, market, online, exporter, consignee, declaredKg: Number(declared) || undefined }) as string
    setPicked([])
    setDeclared('')
    setSelId(id)
  }
  const sh = state.shipments.find((x) => x.id === selId)

  return (
    <Page
      code="M13"
      title="Export document hub, MAFWR exchange and Bayan link"
      lead="Trace prepares the pack from verified lots, submits it electronically to MAFWR, returns the signed documents, and sends declaration data to Bayan. Trace never validates, signs or clears: MAFWR and Customs decide."
    >
      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <Panel title="New shipment" style={{ flex: '1 1 380px' }}>
          <Field label="Exporter">
            <select className="input" value={exporter} onChange={(e) => setExporter(e.target.value)}>{EXPORTERS.map((e) => <option key={e.name}>{e.name}</option>)}</select>
          </Field>
          {!exp.licence && <Notice tone="bad">{exporter} has no valid export licence. Trace cannot request a permit, certificate or declaration for it.</Notice>}
          <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
            <legend className="field__label" style={{ fontSize: 14, marginBottom: 4 }}>Processed lots</legend>
            {ready.length ? ready.map((p) => {
              const fail = Object.values(p.haccp).includes('fail')
              return (
                <label key={p.id} className="check" style={{ borderBottom: `1px solid ${c.line}` }}>
                  <input type="checkbox" checked={picked.includes(p.id)} onChange={() => setPicked(picked.includes(p.id) ? picked.filter((x) => x !== p.id) : [...picked, p.id])} />
                  <span style={{ flex: 1 }}><b>{p.id}</b> <span className="muted">· {p.product} · {kgFmt(p.kg)}</span></span>
                  {fail && <Badge tone="bad">HACCP fail</Badge>}
                </label>
              )
            }) : <Empty>No processed lots ready. Record a transformation in M10.</Empty>}
          </fieldset>
          {haccpFail && <Notice tone="bad">A selected lot has a failed HACCP control point. Resolve it in M12 first.</Notice>}
          <div className="form-grid">
            <Field label="Market">
              <select className="input" value={market} onChange={(e) => setMarket(e.target.value)}>{Object.entries(MARKETS).map(([k, v]) => <option key={k} value={k}>{k} · {v.rule}</option>)}</select>
            </Field>
            <Field label="Consignee"><input className="input" value={consignee} onChange={(e) => setConsignee(e.target.value)} /></Field>
            <Field label="Declared export weight (kg)" hint={`Processed weight ${kgFmt(pickedKg)}`}>
              <input className="input" inputMode="decimal" placeholder={String(pickedKg || '')} value={declared} onChange={(e) => setDeclared(e.target.value.replace(/[^\d.]/g, ''))} />
            </Field>
          </div>
          <div role="group" aria-label="Integration mode" className="segmented" style={{ alignSelf: 'flex-start' }}>
            <button type="button" aria-pressed={online} onClick={() => setOnline(true)}>Online exchange</button>
            <button type="button" aria-pressed={!online} onClick={() => setOnline(false)}>Offline service</button>
          </div>
          <div className="muted" style={{ fontSize: 13 }}>
            {MARKETS[market].docs.length} documents · {ro(online ? FEES.docOnline : FEES.docOffline, 0)} each {online ? 'online' : 'offline'} · MAFWR fees and Customs duties pass through unchanged
          </div>
          <button type="button" className="btn btn--amber" disabled={!canCreate} onClick={create}>Request export pack</button>
        </Panel>

        <div className="stack" style={{ flex: '999 1 520px', gap: 20, minWidth: 0 }}>
          <Panel title="Shipments">
            <div className="row" style={{ gap: 8 }}>
              {state.shipments.slice().reverse().map((s) => (
                <button key={s.id} type="button" className="toggle" aria-pressed={s.id === selId} onClick={() => setSelId(s.id)} style={{ padding: '6px 14px', fontSize: 14 }}>
                  {s.id} · {s.market} {s.step >= 7 ? '✓' : `${s.step}/7`}
                </button>
              ))}
            </div>
          </Panel>
          {sh ? <ShipmentDetail id={sh.id} /> : <Panel><Empty>No shipments yet.</Empty></Panel>}
        </div>
      </div>
    </Page>
  )
}

function ShipmentDetail({ id }: { id: string }) {
  const { state, run } = useStore()
  const sh = state.shipments.find((x) => x.id === id)!
  const names = sh.online ? SHIP_STEPS_ONLINE : SHIP_STEPS_OFFLINE
  const docs = MARKETS[sh.market].docs
  const sourceLots = state.lots.filter((l) => sh.processedIds.some((pid) => state.processed.find((p) => p.id === pid)?.sourceIds.includes(l.id)))
  const landedKg = sourceLots.reduce((n, l) => n + l.kg, 0)
  const processedKg = sh.kg
  const closed = sh.step >= 7
  const gap = sh.declaredKg > processedKg + 0.5
  const signed = sh.step >= 4
  const badge = signed ? 'Signed' : sh.step >= 2 ? 'Ready' : 'Drafting'
  const docFee = (sh.online ? FEES.docOnline : FEES.docOffline) * docs.length
  const traceFee = (landedKg / 1000) * FEES.traceabilityPerTonne
  const stamps = state.events.filter((e) => e.ref === sh.id)
  const atDecision = sh.step === 3

  return (
    <Panel title={`${sh.id} · ${sh.market}`} aside={closed ? <Badge tone="done">Released · {sh.declaration}</Badge> : <Badge tone={sh.online ? 'ok' : 'warn'}>{sh.online ? 'Online exchange' : 'Offline service'}</Badge>}>
      <div className="muted" style={{ fontSize: 14 }}>
        {sh.exporter} → {sh.consignee} · {kgFmt(processedKg)} from {sh.processedIds.join(', ')} · {sourceLots.length} source lots
      </div>
      {sh.corrections > 0 && <Notice tone="warn">MAFWR requested {sh.corrections} correction{sh.corrections > 1 ? 's' : ''}; the pack was rebuilt from the lot records.</Notice>}
      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, flex: '999 1 300px' }}>
          {names.map((title, i) => {
            const done = i < sh.step
            const cur = i === sh.step
            const gov = GOV.includes(i)
            const final = i === 6
            const fill = done ? (final ? c.amber : c.ocean) : c.card
            const when = done ? stamps.filter((e) => e.text.startsWith(title) || (i === 3 && e.type.includes('signature')) || (i === 6 && e.type.includes('release')) || (i === 0 && e.type.includes('request'))).slice(-1)[0] : undefined
            return (
              <li key={title} aria-current={cur ? 'step' : undefined} style={{ display: 'flex', gap: 12 }}>
                <span className="stack" style={{ alignItems: 'center', flex: 'none', width: 30 }}>
                  <span style={{ ...display, width: 30, height: 30, borderRadius: 999, border: `2px ${gov && !done ? 'dashed' : 'solid'} ${done ? fill : cur ? c.harbour : c.mist}`, background: fill, color: done && !final ? c.sand : c.ocean, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{i + 1}</span>
                  {!final && <span style={{ flex: 1, width: 2, minHeight: 14, background: done ? c.ocean : c.line }} />}
                </span>
                <span className="kv" style={{ flex: 1, paddingBottom: 12, fontSize: 14 }}>
                  <span style={{ fontWeight: 600, color: done || cur ? c.ocean : c.muted }}>{title}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: done ? c.link : cur ? c.accent : c.muted }}>
                    {done ? (when ? fmtTime(when.t) : 'Done') : cur ? (gov ? 'Awaiting decision' : 'In progress') : 'Pending'}
                  </span>
                </span>
              </li>
            )
          })}
        </ol>
        <div className="stack" style={{ flex: '1 1 220px', gap: 8 }}>
          <span className="eyebrow eyebrow--muted">DOCUMENT PACK</span>
          {docs.map((d) => (
            <div key={d} className="kv" style={{ fontSize: 13, alignItems: 'center', gap: 8 }}>
              <span>{d}</span>
              <Badge tone={signed ? 'gold' : 'neutral'}>{badge}</Badge>
            </div>
          ))}
          <div className="kv" style={{ fontSize: 13, borderTop: `1px solid ${c.line}`, paddingTop: 8 }}><span className="muted">Document fees</span><b>{ro(docFee, 0)}</b></div>
          <div className="kv" style={{ fontSize: 13 }}><span className="muted">Traceability fee · RO 2/t landed</span><b style={{ whiteSpace: 'nowrap' }}>{ro(traceFee)}</b></div>
        </div>
      </div>
      {!closed && (
        <div className="row" style={{ gap: 8 }}>
          {atDecision ? (
            <>
              <button type="button" className="btn btn--ocean btn--sm" onClick={() => run('advanceShipment', { id: sh.id })}>MAFWR: validate and sign</button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => run('requestCorrection', { id: sh.id })}>MAFWR: request correction</button>
            </>
          ) : (
            <button type="button" className="btn btn--amber btn--sm" onClick={() => run('advanceShipment', { id: sh.id })}>
              {sh.step === 6 ? 'Customs: clear and release' : `Complete: ${names[sh.step]}`}
            </button>
          )}
        </div>
      )}
      {closed && (
        gap
          ? <Notice tone="bad">Weight check failed: declared {kgFmt(sh.declaredKg)} is above the {kgFmt(processedKg)} produced from landed lots ({kgFmt(landedKg)} landed). Possible mixing of unrecorded fish — flagged to process intelligence.</Notice>
          : <Notice>Weight check passed: declared {kgFmt(sh.declaredKg)} reconciles with {kgFmt(landedKg)} of landed lots. Shipment record closed.</Notice>
      )}
      <div className="row" style={{ gap: 8, fontSize: 13 }}><span className="muted">Source lots:</span>{sourceLots.map((l) => <LotLink key={l.id} id={l.id} />)}</div>
    </Panel>
  )
}

/* ------------------------------------------------------------------ M9 */
export function TradeDesk() {
  const { state, run } = useStore()
  const [form, setForm] = useState({ buyer: '', country: '', market: 'EU', species: SPECIES[0], kg: '', price: '' })
  const [matching, setMatching] = useState<Record<string, string[]>>({})
  const commission = state.orders.reduce((n, o) => n + (o.stage >= 4 ? o.kg * o.price * FEES.tradeDesk : 0), 0)
  const pipeline = state.orders.reduce((n, o) => n + (o.stage < 4 ? o.kg * o.price * FEES.tradeDesk : 0), 0)
  const create = () => {
    run('createOrder', { buyer: form.buyer, country: form.country, market: form.market, species: form.species, kg: Number(form.kg), price: Number(form.price) })
    setForm({ ...form, buyer: '', country: '', kg: '', price: '' })
  }
  const valid = form.buyer && form.country && Number(form.kg) > 0 && Number(form.price) > 0

  return (
    <Page code="M9" title="Export trade desk" lead="An operator service run by a separate subsidiary: foreign buyers order once, and the desk consolidates verified supply from several Omani suppliers, arranges QC and logistics, and earns a commission.">
      <div className="grid-auto" style={{ ['--min' as string]: '190px', gap: 12 }}>
        <Kpi label="Open orders" value={state.orders.filter((o) => o.stage < 4).length} />
        <Kpi label="Commission earned" value={ro(commission, 0)} note="2.5% of delivered value" dark />
        <Kpi label="Commission in pipeline" value={ro(pipeline, 0)} />
      </div>
      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <div className="stack" style={{ flex: '999 1 520px', gap: 14, minWidth: 0 }}>
          {state.orders.slice().reverse().map((o) => {
            const candidates = state.lots.filter((l) => l.species === o.species && l.grade && ['verified', 'listed', 'sold', 'processed'].includes(l.status) && !state.orders.some((x) => x.lotIds.includes(l.id)))
            const sel = matching[o.id] ?? []
            return (
              <Panel key={o.id} title={`${o.id} · ${o.buyer}`} aside={<Badge tone={o.stage >= 4 ? 'done' : 'ok'}>{ORDER_STAGES[o.stage]}</Badge>}>
                <div className="muted" style={{ fontSize: 14 }}>{o.country} · {o.market} documents · {kgFmt(o.kg)} {o.species} at {ro(o.price)}/kg · commission {ro(o.kg * o.price * FEES.tradeDesk, 0)}</div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${ORDER_STAGES.length}, minmax(0, 1fr))`, gap: 4 }} aria-hidden="true">
                  {ORDER_STAGES.map((s, i) => <span key={s} style={{ height: 6, borderRadius: 999, background: i <= o.stage ? (i === 4 ? c.amber : c.ocean) : c.line }} />)}
                </div>
                {o.stage === 0 ? (
                  candidates.length ? (
                    <>
                      <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
                        <legend className="field__label" style={{ fontSize: 14 }}>Verified supply</legend>
                        {candidates.map((l) => (
                          <label key={l.id} className="check">
                            <input type="checkbox" checked={sel.includes(l.id)} onChange={() => setMatching({ ...matching, [o.id]: sel.includes(l.id) ? sel.filter((x) => x !== l.id) : [...sel, l.id] })} />
                            <span>{l.id} · {kgFmt(l.kg)} · Grade {l.grade} · {l.site}</span>
                          </label>
                        ))}
                      </fieldset>
                      <button type="button" className="btn btn--ocean btn--sm" style={{ alignSelf: 'flex-start' }} disabled={!sel.length} onClick={() => run('matchOrder', { id: o.id, lotIds: sel })}>Consolidate {sel.length} lot{sel.length === 1 ? '' : 's'}</button>
                    </>
                  ) : <Empty>No verified {o.species.toLowerCase()} available yet.</Empty>
                ) : (
                  <div className="row" style={{ gap: 8, alignItems: 'center', fontSize: 13 }}>
                    <span className="muted">Lots:</span>{o.lotIds.map((id) => <LotLink key={id} id={id} />)}
                    {o.stage < 4 && <button type="button" className="btn btn--ghost btn--sm" style={{ marginLeft: 'auto' }} onClick={() => run('advanceOrder', { id: o.id })}>Mark {ORDER_STAGES[o.stage + 1].toLowerCase()}</button>}
                  </div>
                )}
              </Panel>
            )
          })}
        </div>
        <Panel title="New buyer order" style={{ flex: '1 1 300px' }}>
          <Field label="Buyer"><input className="input" value={form.buyer} onChange={(e) => setForm({ ...form, buyer: e.target.value })} /></Field>
          <Field label="Country"><input className="input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
          <div className="form-grid">
            <Field label="Market"><select className="input" value={form.market} onChange={(e) => setForm({ ...form, market: e.target.value })}>{Object.keys(MARKETS).map((m) => <option key={m}>{m}</option>)}</select></Field>
            <Field label="Species"><select className="input" value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })}>{SPECIES.map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Quantity (kg)"><input className="input" inputMode="decimal" value={form.kg} onChange={(e) => setForm({ ...form, kg: e.target.value.replace(/[^\d.]/g, '') })} /></Field>
            <Field label="Price RO/kg"><input className="input" inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^\d.]/g, '') })} /></Field>
          </div>
          <button type="button" className="btn btn--amber" disabled={!valid} onClick={create}>Create order</button>
        </Panel>
      </div>
    </Page>
  )
}
