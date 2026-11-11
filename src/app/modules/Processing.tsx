import { useState } from 'react'
import { c, display } from '../../tokens'
import { CCPS, fmtTime, isReleased, kgFmt, PLANTS, tempSeries, traceAny, type Ccp } from '../store'
import { useStore } from '../StoreContext'
import { Badge, Empty, Field, LotLink, Notice, Page, Panel, TempChart } from '../ui'

/* ------------------------------------------------------------------ M10 */
export function PlantTraceability() {
  const { state, run } = useStore()
  const [plant, setPlant] = useState(PLANTS[0])
  const [picked, setPicked] = useState<string[]>([])
  const [product, setProduct] = useState('Yellowfin loins, frozen')
  const [yieldPct, setYieldPct] = useState('54')
  const [traceId, setTraceId] = useState('')
  const inbound = state.lots.filter((l) => l.status === 'sold' && l.buyer === plant)
  const done = state.processed.filter((p) => p.plant === plant).slice().reverse()
  const ids = [...state.lots.map((l) => l.id), ...state.processed.map((p) => p.id), ...state.shipments.map((s) => s.id)]
  const trace = traceId ? traceAny(state, traceId) : undefined

  const record = () => {
    run('createProcessed', { sourceIds: picked, product, yieldPct: Number(yieldPct), plant })
    setPicked([])
  }

  return (
    <Page
      code="M10"
      title="Plant and exporter traceability"
      lead="Receipts, transformations, and lot merges stay linked to their source lots, so many small artisanal lots remain traceable inside one shipment — and a recall finds every fisher and shipment in seconds."
      actions={
        <label className="field" style={{ minWidth: 220 }}>
          <span className="field__label">Plant</span>
          <select className="input" value={plant} onChange={(e) => { setPlant(e.target.value); setPicked([]) }}>{PLANTS.map((p) => <option key={p}>{p}</option>)}</select>
        </label>
      }
    >
      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <Panel title={`Received, waiting · ${inbound.length}`} style={{ flex: '1 1 380px' }}>
          {inbound.length ? (
            <>
              <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
                <legend className="sr-only">Source lots to merge</legend>
                {inbound.map((l) => (
                  <label key={l.id} className="check" style={{ borderBottom: `1px solid ${c.line}` }}>
                    <input type="checkbox" checked={picked.includes(l.id)} onChange={() => setPicked(picked.includes(l.id) ? picked.filter((x) => x !== l.id) : [...picked, l.id])} />
                    <span style={{ flex: 1 }}><b>{l.id}</b> <span className="muted">· {l.species} · {kgFmt(l.kg)} · Grade {l.grade ?? '—'}</span></span>
                  </label>
                ))}
              </fieldset>
              <div className="form-grid">
                <Field label="Product"><input className="input" value={product} onChange={(e) => setProduct(e.target.value)} /></Field>
                <Field label="Yield %"><input className="input" inputMode="numeric" value={yieldPct} onChange={(e) => setYieldPct(e.target.value.replace(/\D/g, ''))} /></Field>
              </div>
              <div className="muted" style={{ fontSize: 13 }}>
                Input {kgFmt(inbound.filter((l) => picked.includes(l.id)).reduce((n, l) => n + l.kg, 0))} → output {kgFmt((inbound.filter((l) => picked.includes(l.id)).reduce((n, l) => n + l.kg, 0) * Number(yieldPct)) / 100)}
              </div>
              <button type="button" className="btn btn--ocean" disabled={!picked.length || !(Number(yieldPct) > 0 && Number(yieldPct) <= 100) || !product} onClick={record}>
                Record transformation ({picked.length} source lot{picked.length === 1 ? '' : 's'})
              </button>
            </>
          ) : <Empty>No sold lots are waiting at {plant}. Buy lots as this plant on the marketplace.</Empty>}
        </Panel>

        <Panel title="Processed lots" style={{ flex: '999 1 480px' }}>
          {done.length ? done.map((p) => (
            <div key={p.id} className="card stack" style={{ padding: 14, gap: 6 }}>
              <div className="kv"><b>{p.id} · {p.product}</b><span style={{ ...display, fontWeight: 700 }}>{kgFmt(p.kg)}</span></div>
              <div className="muted" style={{ fontSize: 13 }}>From {p.sourceIds.length} lots ({kgFmt(p.inputKg)}) · yield {Math.round((p.kg / p.inputKg) * 100)}% · {fmtTime(p.at)}</div>
              <div className="row" style={{ gap: 8 }}>{p.sourceIds.map((id) => <LotLink key={id} id={id} />)}</div>
              <div>{p.shipmentId ? <Badge tone="done">In {p.shipmentId}</Badge> : <Badge>Ready to ship</Badge>}</div>
            </div>
          )) : <Empty>No processed lots yet.</Empty>}
        </Panel>
      </div>

      <Panel title="Recall and trace" aside={<span className="muted" style={{ fontSize: 13 }}>Forward and backward through the event log</span>}>
        <Field label="Suspect lot, processed lot or shipment" style={{ maxWidth: 420 }}>
          <select className="input" value={traceId} onChange={(e) => setTraceId(e.target.value)}>
            <option value="">Choose an ID</option>
            {ids.map((id) => <option key={id}>{id}</option>)}
          </select>
        </Field>
        {trace && (
          <>
            <Notice tone="warn">
              Recall scope: {trace.lots.length} source lot{trace.lots.length === 1 ? '' : 's'} · {trace.processed.length} processed lot{trace.processed.length === 1 ? '' : 's'} · {trace.shipments.length} shipment{trace.shipments.length === 1 ? '' : 's'} · {trace.fishers.length} fisher{trace.fishers.length === 1 ? '' : 's'} to contact
            </Notice>
            <div className="grid-auto" style={{ ['--min' as string]: '220px', gap: 12 }}>
              <div className="stack" style={{ gap: 6 }}><span className="eyebrow eyebrow--muted">SOURCE LOTS</span>{trace.lots.map((l) => <span key={l.id}><LotLink id={l.id} /> <span className="muted">· {l.site}</span></span>)}</div>
              <div className="stack" style={{ gap: 6 }}><span className="eyebrow eyebrow--muted">FISHERS</span>{trace.fishers.map((f) => <span key={f.id}>{f.name} <span className="muted">· {f.boatId}</span></span>)}</div>
              <div className="stack" style={{ gap: 6 }}><span className="eyebrow eyebrow--muted">PROCESSED</span>{trace.processed.length ? trace.processed.map((p) => <span key={p.id}>{p.id} <span className="muted">· {p.product}</span></span>) : <span className="muted">Not processed yet</span>}</div>
              <div className="stack" style={{ gap: 6 }}><span className="eyebrow eyebrow--muted">SHIPMENTS</span>{trace.shipments.length ? trace.shipments.map((s) => <span key={s.id}>{s.id} <span className="muted">· {s.market} · {s.consignee}</span></span>) : <span className="muted">Not shipped</span>}</div>
            </div>
          </>
        )}
      </Panel>
    </Page>
  )
}

/* ------------------------------------------------------------------ M11 */
export function ColdChain() {
  const { state, run } = useStore()
  const alerts = state.events.filter((e) => e.type === 'SensorEvent · breach').slice().reverse()
  return (
    <Page code="M11" title="Cold-chain IoT" lead="Temperature sensors in cold stores and reefer trucks report every five minutes. A breach above 4 °C raises an alert and is linked automatically to every lot in that store or truck.">
      <div className="grid-auto" style={{ ['--min' as string]: 'min(420px, 100%)', gap: 16 }}>
        {state.sensors.map((z) => {
          const linked = state.processed.filter((p) => p.sensorId === z.id)
          return (
            <Panel key={z.id} title={z.name} aside={z.breach ? <Badge tone="bad">Breach</Badge> : <Badge tone="ok">In range</Badge>}>
              <TempChart points={tempSeries(z)} label={`${z.name} temperature over 24 hours${z.breach ? ', with a breach above 4 °C' : ', within limits'}`} breachAt={z.breach ? 29 : undefined} />
              <div className="muted" style={{ fontSize: 13 }}>Linked lots: {linked.length ? linked.map((p) => p.id).join(', ') : 'none'}</div>
              <button type="button" className="btn btn--ghost btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => run('toggleBreach', { id: z.id })}>
                {z.breach ? 'Clear the breach' : 'Simulate a door left open'}
              </button>
            </Panel>
          )
        })}
      </div>
      <Panel title="Breach alerts">
        {alerts.length ? alerts.map((e, i) => (
          <div key={i} style={{ fontSize: 14, borderBottom: `1px solid ${c.line}`, paddingBottom: 8 }}>
            <b>{e.ref}</b> · {e.text}
            <div className="muted" style={{ fontSize: 12 }}>{fmtTime(e.t)}</div>
          </div>
        )) : <Empty>No breaches recorded.</Empty>}
      </Panel>
    </Page>
  )
}

/* ------------------------------------------------------------------ M12 */
const CCP_TONE: Record<Ccp, 'ok' | 'bad' | 'neutral'> = { pass: 'ok', fail: 'bad', pending: 'neutral' }

export function Haccp() {
  const { state, run } = useStore()
  const open = state.processed.filter((p) => !isReleased(state, p))
  const [id, setId] = useState(open[open.length - 1]?.id ?? state.processed[0]?.id ?? '')
  const p = state.processed.find((x) => x.id === id)
  return (
    <Page code="M12" title="e-HACCP" lead="Digital critical-control-point records kept on each processed lot, ready for an auditor, an importer or MAFWR.">
      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <Panel title="Processed lots" style={{ flex: '1 1 260px' }}>
          {state.processed.slice().reverse().map((x) => {
            const fails = Object.values(x.haccp).filter((v) => v === 'fail').length
            const pend = Object.values(x.haccp).filter((v) => v === 'pending').length
            return (
              <button key={x.id} type="button" className="list-btn" aria-pressed={x.id === id} onClick={() => setId(x.id)}>
                <span className="stack"><b>{x.id}</b><span className="muted" style={{ fontSize: 12 }}>{x.product}</span></span>
                {fails ? <Badge tone="bad">{fails} fail</Badge> : pend ? <Badge>{pend} open</Badge> : <Badge tone="ok">Complete</Badge>}
              </button>
            )
          })}
          {!state.processed.length && <Empty>No processed lots yet.</Empty>}
        </Panel>
        {p && (
          <Panel title={`Critical control points · ${p.id}`} style={{ flex: '999 1 480px' }}>
            <div className="muted" style={{ fontSize: 14 }}>{p.product} · {p.plant} · sensor {p.sensorId}</div>
            {CCPS.map((ccp) => (
              <div key={ccp} className="row" style={{ gap: 10, alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${c.line}`, paddingBottom: 10 }}>
                <span style={{ fontWeight: 500 }}>{ccp}</span>
                <span className="row" style={{ gap: 8, alignItems: 'center' }}>
                  <Badge tone={CCP_TONE[p.haccp[ccp]]}>{p.haccp[ccp]}</Badge>
                  <span role="group" aria-label={`Record ${ccp}`} className="segmented">
                    <button type="button" aria-pressed={p.haccp[ccp] === 'pass'} onClick={() => run('setCcp', { id: p.id, ccp, value: 'pass' })}>Pass</button>
                    <button type="button" aria-pressed={p.haccp[ccp] === 'fail'} onClick={() => run('setCcp', { id: p.id, ccp, value: 'fail' })}>Fail</button>
                  </span>
                </span>
              </div>
            ))}
            {Object.values(p.haccp).includes('fail') && <Notice tone="bad">A failed control point blocks this lot from an export pack until QA records a corrective action and passes it.</Notice>}
          </Panel>
        )}
      </div>
    </Page>
  )
}
