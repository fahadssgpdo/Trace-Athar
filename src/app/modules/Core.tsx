import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { c, display } from '../../tokens'
import { csv, download } from '../format'
import { CORE, MODULES, mod } from '../nav'
import { boatOf, EXPORTERS, fisherOf, fmtTime, kgFmt, licenceValid, lotById, ro, trailFor, type LotStatus, type Step } from '../store'
import { useStore } from '../StoreContext'
import { Badge, Empty, Kpi, LotLink, Page, Panel, QrCode, StatusBadge } from '../ui'

const PIPELINE: { status: LotStatus; next: string; hint: string }[] = [
  { status: 'registered', next: 'M2', hint: 'Waiting for the quality officer' },
  { status: 'verified', next: 'M6', hint: 'Ready to list for sale' },
  { status: 'listed', next: 'M6', hint: 'Live on the marketplace' },
  { status: 'sold', next: 'M10', hint: 'At the plant, waiting to be processed' },
  { status: 'processed', next: 'M13', hint: 'Ready for an export shipment' },
  { status: 'shipped', next: 'M13', hint: 'Documents with MAFWR or Customs' },
  { status: 'released', next: 'M15', hint: 'Cleared; passport live' },
]

const WALK = [
  ['M1', 'Register a lot at first receipt, with a licence check and QR label'],
  ['M2', 'Sample, photograph and grade it; mark it Trace Verified'],
  ['M6', 'List it, take bids and close the sale'],
  ['M7', 'Settle the fisher the same day through the partner bank'],
  ['M10', 'Merge source lots into a processed lot at the plant'],
  ['M12', 'Record the critical control points'],
  ['M13', 'Build the export pack, have MAFWR sign it, and clear it through Bayan'],
  ['M15', 'Open the consumer passport for any lot in the shipment'],
]

const STEP_TONE: Record<Step, 'neutral' | 'ok' | 'gold' | 'done'> = { P1: 'neutral', P2: 'ok', P3: 'gold', P4: 'ok', P5: 'done', P6: 'done' }

export function Dashboard() {
  const { state } = useStore()
  const landed = state.lots.reduce((n, l) => n + l.kg, 0)
  const verified = state.lots.filter((l) => l.grade).length
  const settled = state.payments.filter((p) => p.settled).reduce((n, p) => n + p.value, 0)
  const released = state.shipments.filter((s) => s.step >= 7).length

  return (
    <Page
      title="Trace platform prototype"
      lead="All 17 modules work on one shared record. Every action writes an EPCIS event, so a lot can be followed from the landing site to customs release, and analytics read the same log. Data is demo data, kept in this browser."
      actions={<Link to={mod('M1').path} className="btn btn--amber">Register a lot</Link>}
    >
      <div className="grid-auto" style={{ ['--min' as string]: '190px', gap: 12 }}>
        <Kpi label="Landed and registered" value={kgFmt(landed)} note={`${state.lots.length} lots`} />
        <Kpi label="Trace Verified" value={`${Math.round((verified / Math.max(1, state.lots.length)) * 100)}%`} note={`${verified} lots graded`} />
        <Kpi label="Paid to fishers" value={ro(settled, 0)} note="same-day settlement" dark />
        <Kpi label="Shipments released" value={`${released} of ${state.shipments.length}`} note="through MAFWR and Bayan" />
      </div>

      <Panel title="Where every lot is now" aside={<span className="muted" style={{ fontSize: 13 }}>Open a stage to work on it</span>}>
        <div className="grid-auto" style={{ ['--min' as string]: '140px', gap: 10 }}>
          {PIPELINE.map((p) => {
            const n = state.lots.filter((l) => l.status === p.status).length
            return (
              <Link key={p.status} to={mod(p.next).path} className="card stack" style={{ padding: 14, gap: 6, textDecoration: 'none', color: c.ocean }}>
                <StatusBadge status={p.status} />
                <span style={{ ...display, fontWeight: 700, fontSize: 28 }}>{n}</span>
                <span className="muted" style={{ fontSize: 12 }}>{p.hint}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: c.link }}>{p.next} →</span>
              </Link>
            )
          })}
        </div>
      </Panel>

      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <Panel title="Walk one lot through the chain" style={{ flex: '1 1 380px' }}>
          <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {WALK.map(([id, text], i) => (
              <li key={id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ ...display, flex: 'none', width: 28, height: 28, borderRadius: 999, background: c.ocean, color: c.sand, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                <span style={{ fontSize: 14 }}>
                  <Link to={mod(id).path} style={{ fontWeight: 600 }}>{id} {mod(id).short}</Link> — {text}
                </span>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="Latest events" aside={<Link to={CORE.events} style={{ fontSize: 14, fontWeight: 600 }}>All events →</Link>} style={{ flex: '999 1 480px' }}>
          <EventList events={state.events.slice(-8).reverse()} />
        </Panel>
      </div>

      <Panel title="All 17 modules">
        <div className="grid-auto" style={{ ['--min' as string]: '220px', gap: 10 }}>
          {MODULES.map((m) => (
            <Link key={m.id} to={m.path} className="card stack" style={{ padding: 14, gap: 4, textDecoration: 'none', color: c.ocean }}>
              <span style={{ ...display, fontWeight: 700, fontSize: 13, color: c.accent }}>{m.id}</span>
              <span style={{ fontWeight: 600 }}>{m.title}</span>
              <span className="muted" style={{ fontSize: 12 }}>{m.users}</span>
            </Link>
          ))}
        </div>
      </Panel>
    </Page>
  )
}

export function EventList({ events }: { events: { t: number; step: Step; type: string; ref: string; text: string; actor: string }[] }) {
  const { state } = useStore()
  if (!events.length) return <Empty>No events yet.</Empty>
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {events.map((e, i) => (
        <li key={`${e.t}-${i}`} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < events.length - 1 ? `1px solid ${c.line}` : undefined, alignItems: 'flex-start' }}>
          <Badge tone={STEP_TONE[e.step]}>{e.step}</Badge>
          <span className="stack" style={{ minWidth: 0, flex: 1, gap: 2 }}>
            <span style={{ fontSize: 14 }}>{e.text}</span>
            <span className="muted" style={{ fontSize: 12 }}>
              {fmtTime(e.t)} · {e.actor} · {e.type} · {lotById(state, e.ref) ? <LotLink id={e.ref} /> : e.ref}
            </span>
          </span>
        </li>
      ))}
    </ol>
  )
}

export function LotDetail() {
  const { id = '' } = useParams()
  const { state } = useStore()
  const lot = lotById(state, id)
  if (!lot) {
    return (
      <Page title="Lot not found" lead={`No lot with the ID ${id} exists in this prototype.`}>
        <Link to={CORE.dashboard}>← Dashboard</Link>
      </Page>
    )
  }
  const f = fisherOf(state, lot)
  const b = boatOf(state, lot.boatId)
  const p = lot.processedId ? state.processed.find((x) => x.id === lot.processedId) : undefined
  const sh = p?.shipmentId ? state.shipments.find((x) => x.id === p.shipmentId) : undefined
  const pay = state.payments.find((x) => x.lotId === lot.id)
  const facts: [string, ReactNode][] = [
    ['Species', lot.species], ['Weight', kgFmt(lot.kg)], ['Gear', lot.gear], ['Landed', `${lot.site} · ${fmtTime(lot.landedAt)}`],
    ['Fisher', f.name], ['Boat', `${b.name} · ${b.id}`], ['GPS', lot.gps], ['Permitted area (MAFWR check)', lot.inZone ? 'Yes' : 'No — flagged'],
    ['Licence', lot.licenceOk ? 'Checked, valid' : 'Not valid'], ['Bycatch', lot.bycatch], ['Grade', lot.grade ?? '—'],
    ['Sale', lot.price ? `${ro(lot.price)}/kg to ${lot.buyer}${lot.saleMode === 'off-platform' ? ' (off-platform)' : ''}` : '—'],
    ['Fisher payment', pay ? `${ro(pay.value)} · ${pay.settled ? 'settled' : 'pending'}` : '—'],
    ['Processed into', p ? `${p.id} · ${p.product}` : '—'], ['Shipment', sh ? `${sh.id} · ${sh.market}${sh.declaration ? ` · ${sh.declaration}` : ''}` : '—'],
  ]
  return (
    <Page
      title={`Lot ${lot.id}`}
      lead="One record from first receipt onwards. Every event below is part of the lot's chain of custody."
      actions={
        <>
          <StatusBadge status={lot.status} />
          <Link to={`${mod('M15').path}?lot=${lot.id}`} className="btn btn--ocean btn--sm">Consumer passport</Link>
        </>
      }
    >
      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <Panel title="Lot record" style={{ flex: '1 1 340px' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <QrCode value={lot.id} cell={5} />
            <div className="stack" style={{ gap: 4 }}>
              <span style={{ ...display, fontWeight: 700 }}>{lot.id}</span>
              <span className="muted" style={{ fontSize: 13 }}>GS1 lot code · EPCIS · hash-chained events</span>
            </div>
          </div>
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 150px) minmax(0, 1fr)', gap: '8px 12px', fontSize: 14 }}>
            {facts.map(([k, v]) => (
              <div key={k} style={{ display: 'contents' }}>
                <dt className="muted">{k}</dt>
                <dd style={{ margin: 0, fontWeight: 500 }}>{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel title="Chain of custody" style={{ flex: '999 1 460px' }}>
          <EventList events={trailFor(state, lot.id)} />
        </Panel>
      </div>
    </Page>
  )
}

export function Registries() {
  const { state } = useStore()
  return (
    <Page title="Registries" lead="Shared core: operators, vessels, licence documents, exporters and sensors used by every module.">
      <Panel title="Fishers and licences">
        <div className="table-scroll">
          <table className="table">
            <thead><tr><th scope="col">Fisher</th><th scope="col">Arabic</th><th scope="col">Boat</th><th scope="col">Site</th><th scope="col">Licence expiry</th><th scope="col">Status</th></tr></thead>
            <tbody>
              {state.fishers.map((f) => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 600 }}>{f.name}</td>
                  <td lang="ar" className="arabic">{f.nameAr}</td>
                  <td>{boatOf(state, f.boatId).name} · {f.boatId}</td>
                  <td>{f.site}</td>
                  <td>{f.licenceExpiry}</td>
                  <td>{licenceValid(f, state.clock) ? <Badge tone="ok">Valid</Badge> : <Badge tone="bad">Expired</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <Panel title="Vessels" style={{ flex: '1 1 420px' }}>
          <div className="table-scroll">
            <table className="table">
              <thead><tr><th scope="col">ID</th><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Tracker</th><th scope="col">Gear</th></tr></thead>
              <tbody>
                {state.boats.map((b) => (
                  <tr key={b.id}><td style={{ fontWeight: 600 }}>{b.id}</td><td>{b.name}</td><td>{b.type}</td><td>{b.tracker}</td><td>{b.gear}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Exporters" style={{ flex: '1 1 320px' }}>
          {EXPORTERS.map((e) => (
            <div key={e.name} className="kv" style={{ fontSize: 14, borderBottom: `1px solid ${c.line}`, paddingBottom: 8 }}>
              <span><span style={{ fontWeight: 600 }}>{e.name}</span><br /><span className="muted">{e.cr}</span></span>
              {e.licence ? <Badge tone="ok">Export licence verified</Badge> : <Badge tone="bad">No export licence</Badge>}
            </div>
          ))}
          <p className="muted" style={{ fontSize: 13 }}>Only exporters with a valid export licence and commercial registration can request packs or send data to Bayan.</p>
        </Panel>
      </div>
    </Page>
  )
}

export function EventLog() {
  const { state } = useStore()
  const [step, setStep] = useState<'all' | Step>('all')
  const [q, setQ] = useState('')
  const list = state.events
    .filter((e) => (step === 'all' || e.step === step) && (!q || `${e.ref} ${e.text} ${e.actor} ${e.type}`.toLowerCase().includes(q.toLowerCase())))
    .slice()
    .reverse()
  const exportJson = () => {
    const doc = {
      '@context': ['https://ref.gs1.org/standards/epcis/epcis-context.jsonld'],
      type: 'EPCISDocument',
      schemaVersion: '2.0',
      creationDate: new Date(state.clock).toISOString(),
      epcisBody: { eventList: state.events.map((e) => ({ type: e.type.split(' · ')[0], eventTime: new Date(e.t).toISOString(), bizStep: e.type.split(' · ')[1] ?? e.type, 'trace:ref': e.ref, 'trace:step': e.step, 'trace:actor': e.actor, 'trace:text': e.text })) },
    }
    download('trace-epcis-events.json', JSON.stringify(doc, null, 2), 'application/json')
  }
  return (
    <Page
      title="EPCIS event log"
      lead="The single signed, hash-chained log every module writes to. Process intelligence and data products read from here."
      actions={
        <>
          <button type="button" className="btn btn--ghost btn--sm" onClick={exportJson}>Export EPCIS JSON</button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => download('trace-events.csv', csv([['time', 'step', 'type', 'ref', 'actor', 'text'], ...state.events.map((e) => [new Date(e.t).toISOString(), e.step, e.type, e.ref, e.actor, e.text])]))}>CSV</button>
        </>
      }
    >
      <div className="row" style={{ gap: 12, alignItems: 'flex-end' }}>
        <label className="field" style={{ flex: '0 1 200px' }}>
          <span className="field__label">Step</span>
          <select className="input" value={step} onChange={(e) => setStep(e.target.value as 'all' | Step)}>
            <option value="all">All steps</option>
            {(['P1', 'P2', 'P3', 'P4', 'P5', 'P6'] as Step[]).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="field" style={{ flex: '1 1 260px' }}>
          <span className="field__label">Search</span>
          <input className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Lot ID, actor or text" />
        </label>
        <span className="muted" style={{ fontSize: 13, paddingBottom: 12 }}>{list.length} events</span>
      </div>
      <Panel>
        <EventList events={list} />
      </Panel>
    </Page>
  )
}
