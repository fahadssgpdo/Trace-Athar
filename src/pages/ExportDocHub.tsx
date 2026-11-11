import { useState } from 'react'
import PlatformShell, { PageHeader } from '../components/PlatformShell'
import { Stat } from '../components/ui'
import { c, display } from '../tokens'

const MARKETS = [
  { code: 'EU', rule: 'CATCH catch certificate', docs: [['EU catch certificate (CATCH)', 'Validated by MAFWR as flag state'], ['Health certificate data', 'Approved establishment'], ['Lot passport and cold-chain proof', 'Trace record, QR']] },
  { code: 'US', rule: 'MMPA · SIMP', docs: [['MMPA certificate of admissibility', 'Signed by an authorised MAFWR official'], ['SIMP key data elements', 'Harvest and landing data'], ['Gear, area and bycatch evidence', 'Per lot'], ['Health certificate data', 'Approved establishment']] },
  { code: 'Japan', rule: 'Catch certificate · IOTC', docs: [['IOTC statistical document', 'Tuna'], ['Data pack for the government certificate', 'Designated species'], ['Health certificate data', 'Approved establishment']] },
  { code: 'GCC', rule: 'Health certificate', docs: [['Health certificate data', 'Approved establishment'], ['Lot passport and cold-chain proof', 'Audited sourcing for hotels']] },
]

const ONLINE = (eu: boolean) => [
  ['Request', 'Exporter selects lots and market'],
  ['Preparation', 'Trace builds the pack from verified lots'],
  ['Electronic submission', 'Trace → MAFWR via API or e-services'],
  ['Official decision', 'MAFWR reviews, validates and signs'],
  ['Return and delivery', `Signed documents to exporter${eu ? ' and EU CATCH' : ''}`],
  ['Customs declaration', 'Shipment data → Bayan, with MAFWR document numbers'],
  ['Clearance and release', 'Customs clears; Bayan returns release status'],
]
const OFFLINE = [
  ['Request', 'Exporter selects lots and market'],
  ['Preparation', 'Trace builds the pack from verified lots'],
  ['Manual filing', 'Exporter files the Trace pack with MAFWR'],
  ['Official decision', 'MAFWR reviews, validates and signs'],
  ['Signed copy uploaded', 'Exporter adds the signed documents to the record'],
  ['Declaration keyed', 'Clearing agent keys from the Trace PDF and QR'],
  ['Clearance and release', 'Customs clears at the port or airport'],
]
const TIMES = ['08:02', '08:40', '08:41', '11:15', '11:16', '11:30', '14:05']
/** Steps decided by government (MAFWR signature, Customs release). */
const GOV_STEPS = [3, 6]
const TOTAL = 7

export default function ExportDocHub() {
  const [market, setMarket] = useState(0)
  const [online, setOnline] = useState(true)
  const [at, setAt] = useState(1)

  const m = MARKETS[market]
  const steps = online ? ONLINE(market === 0) : OFFLINE
  const closed = at >= TOTAL
  const signed = at >= 4
  const rate = online ? 12 : 25
  const badge = signed ? 'Signed' : at >= 2 ? 'Ready' : 'Drafting'

  return (
    <PlatformShell workspace="Al Wusta Seafood Export (demo)" workspaceNote="Export licence and CR verified">
      <PageHeader
        eyebrow="P5 · M13 EXPORT DOCUMENT HUB · MAFWR AND BAYAN"
        title="Shipment SH-2611-07"
        lead="300 kg yellowfin loins · PL-DQM-0412 · 3 verified source lots · Muscat International Airport"
        action={
          <div role="group" aria-label="Integration mode" className="segmented" style={{ gap: 6 }}>
            <button type="button" aria-pressed={online} onClick={() => { setOnline(true); setAt(1) }}>Online exchange</button>
            <button type="button" aria-pressed={!online} onClick={() => { setOnline(false); setAt(1) }}>Offline service</button>
          </div>
        }
      />

      <section aria-label="Destination market" className="stack" style={{ gap: 10 }}>
        <div className="eyebrow eyebrow--muted">DESTINATION MARKET</div>
        <div role="radiogroup" aria-label="Market" className="grid-auto" style={{ ['--min' as string]: '150px', gap: 10 }}>
          {MARKETS.map((k, i) => (
            <button
              key={k.code}
              type="button"
              role="radio"
              aria-checked={i === market}
              onClick={() => { setMarket(i); setAt(1) }}
              className="toggle toggle--card stack"
              style={{ minHeight: 72, padding: '12px 14px', gap: 2, fontWeight: 400 }}
            >
              <span style={{ ...display, fontWeight: 700, fontSize: 18 }}>{k.code}</span>
              <span style={{ fontSize: 13 }}>{k.rule}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        {/* Pack */}
        <section aria-label="Document pack" className="panel stack" style={{ flex: '1 1 340px', minWidth: 0, gap: 12 }}>
          <div className="kv" style={{ alignItems: 'baseline' }}>
            <h2 className="h-panel">Document pack</h2>
            <span className="muted" style={{ fontSize: 13 }}>{m.docs.length} documents</span>
          </div>
          {m.docs.map(([name, who]) => (
            <div key={name} style={{ border: `1px solid ${c.line}`, borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <span aria-hidden="true" className="muted" style={{ flex: 'none', width: 36, height: 44, borderRadius: 6, background: c.sand, border: `1px solid ${c.line}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 4, fontSize: 9, fontWeight: 700 }}>PDF</span>
              <span className="stack" style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 600 }}>{name}</span>
                <span className="muted" style={{ fontSize: 13 }}>{who}</span>
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 9px', borderRadius: 999, background: signed ? c.amber : c.sand, color: c.ocean }}>{badge}</span>
            </div>
          ))}
          <div className="stack" style={{ background: c.sand, borderRadius: 12, padding: '12px 14px', fontSize: 14, gap: 6 }}>
            <div style={{ fontWeight: 600 }}>Pre-filled from verified lots</div>
            <div className="muted">Vessels, licences, gear, catch area and dates, landed and processed weights — no re-keying.</div>
            <div style={{ height: 8, borderRadius: 999, background: c.line, overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: c.harbour }} />
            </div>
          </div>
          <div className="kv" style={{ fontSize: 14, borderTop: `1px solid ${c.line}`, paddingTop: 10 }}>
            <span className="muted">Trace fee · RO {rate} {online ? 'online' : 'offline'} per document</span>
            <span style={{ fontWeight: 700 }}>RO {rate * m.docs.length}</span>
          </div>
          <div className="muted" style={{ fontSize: 12 }}>MAFWR statutory fees and Customs duties are unchanged and pass through in full.</div>
        </section>

        {/* Tracker */}
        <section aria-label="Submission tracker" className="panel stack" style={{ flex: '999 1 460px', minWidth: 0, gap: 14 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <h2 className="h-panel">From request to release</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn--ghost" style={{ minHeight: 44, padding: '0 16px' }} onClick={() => setAt(1)}>Reset</button>
              <button type="button" className={`btn ${closed ? 'btn--disabled' : 'btn--amber'}`} style={{ minHeight: 44, padding: '0 18px', fontWeight: 700, color: c.ocean }} aria-disabled={closed} onClick={() => setAt(Math.min(TOTAL, at + 1))}>
                {closed ? 'Released' : `Advance step ${at + 1}`}
              </button>
            </div>
          </div>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {steps.map(([title, who], i) => {
              const done = i < at
              const current = i === at
              const gov = GOV_STEPS.includes(i)
              const final = i === TOTAL - 1
              const fill = done ? (final ? c.amber : c.ocean) : c.card
              const ring = done ? fill : current ? c.harbour : c.mist
              const status = done ? `${gov ? 'Signed' : 'Done'} · ${TIMES[i]}` : current ? (gov ? 'Awaiting decision' : 'In progress') : 'Pending'
              return (
                <li key={title} aria-current={current ? 'step' : undefined} style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
                  <span className="stack" style={{ flex: 'none', width: 34, alignItems: 'center' }}>
                    <span style={{ ...display, width: 34, height: 34, borderRadius: 999, border: `2px ${gov && !done ? 'dashed' : 'solid'} ${ring}`, background: fill, color: done && !final ? c.sand : c.ocean, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{i + 1}</span>
                    <span style={{ flex: 1, width: 2, background: final ? 'transparent' : done ? c.ocean : c.line, minHeight: 16 }} />
                  </span>
                  <span className="row" style={{ flex: 1, minWidth: 0, padding: '4px 0 16px', gap: '4px 14px', justifyContent: 'space-between' }}>
                    <span className="stack" style={{ minWidth: 0 }}>
                      <span style={{ fontWeight: 600, color: done || current ? c.ocean : c.muted }}>{title}</span>
                      <span className="muted" style={{ fontSize: 13 }}>{who}</span>
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: done ? c.link : current ? c.accent : c.muted }}>{status}</span>
                  </span>
                </li>
              )
            })}
          </ol>
          {closed && (
            <div role="status" className="slab row" style={{ borderRadius: 14, padding: '14px 16px', gap: '8px 20px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Shipment closed</span>
              <span style={{ color: c.onOcean, fontSize: 14 }}>Declared export weight 300 kg reconciles with landed lots — no unrecorded fish mixed in.</span>
            </div>
          )}
          <div className="muted" style={{ fontSize: 13 }}>Trace never validates, signs or clears. It prepares, transmits and delivers; every official decision stays with MAFWR and Customs.</div>
        </section>
      </div>

      <div className="grid-auto" style={{ ['--min' as string]: '200px', gap: 12 }}>
        <Stat label="Pack turnaround, Trace side" value="< 24 h → < 2 h" note="Year 2 → Year 5 target" />
        <Stat label="Submission to signature, MAFWR" value="< 1 day → < 4 h" note="target to agree with MAFWR" />
        <Stat label="Shipments sent to Bayan" value="25% → 90%" note="Year 2 → Year 5 target" />
      </div>
    </PlatformShell>
  )
}
