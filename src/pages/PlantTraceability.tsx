import { useState } from 'react'
import { Link } from 'react-router-dom'
import PlatformShell, { PageHeader } from '../components/PlatformShell'
import { c, display } from '../tokens'
import { paths } from '../routes'

const SOURCES = [
  { id: 'OM-DQM-0042', site: 'Duqm', boat: 'Al Najm', kg: 412, pl: 0 },
  { id: 'OM-DQM-0051', site: 'Duqm', boat: 'Al Najm', kg: 186, pl: 0 },
  { id: 'OM-SUR-0121', site: 'Sur', boat: 'Al Bahri', kg: 210, pl: 0 },
  { id: 'OM-MSR-0031', site: 'Masirah', boat: 'Hilf 3', kg: 148, pl: 1 },
  { id: 'OM-DQM-0060', site: 'Duqm', boat: 'Ras Al Hadd', kg: 124, pl: 1 },
  { id: 'OM-SUR-0127', site: 'Sur', boat: 'Al Fajr', kg: 100, pl: 1 },
]
const PROCESSED = [
  { id: 'PL-DQM-0412', what: 'Yellowfin loins, frozen', kg: 437, from: '3 lots, 808 kg', yield: '54%', ships: [0, 1] },
  { id: 'PL-DQM-0413', what: 'Yellowfin saku, chilled', kg: 190, from: '3 lots, 372 kg', yield: '51%', ships: [1] },
]
const SHIPMENTS = [
  { id: 'SH-2611-07', dest: 'Spain · EU catch certificate', kg: 300, from: 'from PL-DQM-0412' },
  { id: 'SH-2611-09', dest: 'UAE · health certificate', kg: 327, from: 'from PL-DQM-0412 + 0413' },
]
const SENSORS = ['Cold store CS-2', 'Reefer truck RT-07']
const CCP = [
  ['Receiving temperature', 'Pass · 1.8 °C', true],
  ['Loining hygiene', 'Pass', true],
  ['Metal detection', 'Pass', true],
  ['Histamine sample', 'Pass · < 50 ppm', true],
  ['Transport temperature', 'Review · breach', false],
] as const

// Chart geometry: 48 half-hour readings across x 40…630, 0–8 °C across y 190…20.
const X = (k: number) => 40 + (590 * k) / 48
const Y = (t: number) => 190 - (170 * t) / 8
const BREACH_AT = 29

function series(sensor: number) {
  const pts: number[] = []
  for (let k = 0; k <= 48; k++) {
    let t = sensor === 0 ? 1.6 + 0.35 * Math.sin(k / 3) : 2.2 + 0.5 * Math.sin(k / 2.6) + 0.2 * Math.cos(k / 1.3)
    if (sensor === 1 && k >= 28 && k <= 30) t = k === BREACH_AT ? 5.6 : 4.6
    pts.push(t)
  }
  return pts.map((t, k) => `${k ? 'L' : 'M'}${X(k).toFixed(1)} ${Y(t).toFixed(1)}`).join(' ')
}

const lit = { background: c.ocean, color: c.sand, borderColor: c.ocean, opacity: 1 }
const dim = { background: c.card, color: c.ocean, borderColor: c.line, opacity: 0.55 }
const columnLabel = 'eyebrow eyebrow--muted'
const nodeBase = { border: '1.5px solid', borderRadius: 14, padding: 14, gap: 6 } as const

export default function PlantTraceability() {
  const [selected, setSelected] = useState(0)
  const [sensor, setSensor] = useState(1)
  const [recall, setRecall] = useState(false)

  const plSel = SOURCES[selected].pl
  const shSel = PROCESSED[plSel].ships
  const breach = sensor === 1

  return (
    <PlatformShell workspace="Duqm Seafood Plant (demo)" gap={24}>
      <PageHeader
        eyebrow="P4 · M10 PLANT · M11 COLD CHAIN · M12 e-HACCP"
        title="Many small lots, one unbroken chain"
        lead="Every cut, split and merge stays linked to its source lots, so artisanal catch remains traceable inside an export shipment. Choose a source lot to trace it forward."
        leadMaxWidth={720}
        action={
          <button type="button" aria-pressed={recall} onClick={() => setRecall(!recall)} className="toggle" style={{ minHeight: 48, padding: '0 20px', borderColor: c.ocean }}>
            {recall ? 'Close recall view' : 'Simulate a recall'}
          </button>
        }
      />

      {recall && (
        <div role="status" className="slab row" style={{ borderRadius: 16, padding: '16px 20px', gap: '10px 28px', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Recall scope for a suspect source lot</span>
          <span style={{ color: c.onOcean }}>1 source lot · 1 processed lot · {shSel.length === 1 ? '1 shipment' : `${shSel.length} shipments`} · 1 fisher to contact</span>
          <span style={{ color: c.amber, fontWeight: 600 }}>Found from the event log, no spreadsheets</span>
        </div>
      )}

      {/* Genealogy */}
      <div className="row" style={{ gap: 16, alignItems: 'stretch' }}>
        <div className="stack" style={{ flex: '1 1 260px', minWidth: 0, gap: 8 }}>
          <div className={columnLabel}>SOURCE LOTS · P1</div>
          {SOURCES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelected(i)}
              aria-pressed={i === selected}
              className="toggle"
              style={{ textAlign: 'left', borderRadius: 12, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', gap: 10, minHeight: 52, alignItems: 'center', fontWeight: 400 }}
            >
              <span className="stack">
                <span style={{ fontWeight: 600, fontSize: 14 }}>{s.id}</span>
                <span style={{ fontSize: 12, opacity: 0.85 }}>{s.site} · {s.boat}</span>
              </span>
              <span style={{ ...display, fontWeight: 600, fontSize: 14 }}>{s.kg} kg</span>
            </button>
          ))}
        </div>
        <Arrow />
        <div className="stack" style={{ flex: '1 1 240px', minWidth: 0, gap: 8 }}>
          <div className={columnLabel}>PROCESSED LOTS · P4</div>
          {PROCESSED.map((p, i) => (
            <div key={p.id} className="stack" style={{ ...nodeBase, ...(i === plSel ? lit : dim) }}>
              <span style={{ fontWeight: 600 }}>{p.id}</span>
              <span style={{ fontSize: 14 }}>{p.what}</span>
              <span style={{ ...display, fontWeight: 700, fontSize: 20 }}>{p.kg} kg</span>
              <span style={{ fontSize: 12, opacity: 0.85 }}>from {p.from} · yield {p.yield}</span>
            </div>
          ))}
        </div>
        <Arrow />
        <div className="stack" style={{ flex: '1 1 240px', minWidth: 0, gap: 8 }}>
          <div className={columnLabel}>SHIPMENTS · P5</div>
          {SHIPMENTS.map((h, i) => (
            <Link
              key={h.id}
              to={paths.exportDocs}
              className="stack"
              style={{ ...nodeBase, textDecoration: 'none', ...(shSel.includes(i) ? { background: c.amber, color: c.ocean, borderColor: c.amber, opacity: 1 } : dim) }}
            >
              <span style={{ fontWeight: 600 }}>{h.id}</span>
              <span style={{ fontSize: 14 }}>{h.dest}</span>
              <span style={{ ...display, fontWeight: 700, fontSize: 20 }}>{h.kg} kg</span>
              <span style={{ fontSize: 12, opacity: 0.85 }}>{h.from}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Cold chain + HACCP */}
      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <section aria-label="Cold chain" className="panel stack" style={{ flex: '999 1 520px', minWidth: 0, gap: 14 }}>
          <div className="row" style={{ gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="h-panel">Cold chain · last 24 h</h2>
            <div role="group" aria-label="Sensor" className="row" style={{ gap: 6 }}>
              {SENSORS.map((label, i) => (
                <button key={label} type="button" className="toggle" aria-pressed={i === sensor} onClick={() => setSensor(i)} style={{ padding: '6px 14px', fontSize: 14 }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <svg
            viewBox="0 0 640 220"
            role="img"
            aria-label={`${SENSORS[sensor]} temperature over 24 hours${breach ? ', one breach of the 4 degree limit at 14:20' : ', within limits'}`}
            style={{ width: '100%', height: 'auto', display: 'block', fontFamily: 'var(--font-text)' }}
          >
            <line x1="40" y1="20" x2="40" y2="190" stroke={c.line} />
            <line x1="40" y1="190" x2="630" y2="190" stroke={c.line} />
            <line x1="40" y1={Y(4)} x2="630" y2={Y(4)} stroke={c.accent} strokeDasharray="6 5" strokeWidth="1.5" />
            <text x="626" y={Y(4) - 6} fill={c.accent} fontSize="12" textAnchor="end">4 °C limit</text>
            <text x="34" y="194" fill={c.muted} fontSize="11" textAnchor="end">0</text>
            <text x="34" y="27" fill={c.muted} fontSize="11" textAnchor="end">8 °C</text>
            <text x="40" y="208" fill={c.muted} fontSize="11">00:00</text>
            <text x="335" y="208" fill={c.muted} fontSize="11" textAnchor="middle">12:00</text>
            <text x="630" y="208" fill={c.muted} fontSize="11" textAnchor="end">24:00</text>
            <path d={series(sensor)} fill="none" stroke={c.harbour} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {breach && <circle cx={X(BREACH_AT)} cy={Y(5.6)} r="7" fill={c.amber} stroke={c.ocean} strokeWidth="2" />}
          </svg>
          {breach ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: c.sand, borderRadius: 12, padding: '12px 14px' }}>
              <span style={{ flex: 'none', width: 12, height: 12, borderRadius: 999, background: c.amber, marginTop: 5 }} />
              <div style={{ fontSize: 14 }}>
                <div style={{ fontWeight: 600 }}>Breach at 14:20 — 5.6 °C for 18 minutes</div>
                <div className="muted">Door open during loading at Duqm. Linked automatically to PL-DQM-0413; QA review requested.</div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 14, color: c.link, fontWeight: 600 }}>Within limits for 24 h · readings every 5 minutes</div>
          )}
        </section>

        <section aria-label="e-HACCP" className="panel stack" style={{ flex: '1 1 300px', minWidth: 0, gap: 10 }}>
          <h2 className="h-panel">e-HACCP · PL-DQM-0413</h2>
          {CCP.map(([name, status, pass]) => (
            <div key={name} className="kv" style={{ padding: '10px 0', borderBottom: `1px solid ${c.line}`, fontSize: 14 }}>
              <span>{name}</span>
              <span style={{ fontWeight: 600, color: pass ? c.link : c.accent }}>{status}</span>
            </div>
          ))}
          <div className="muted" style={{ fontSize: 13 }}>Records sit on the lot itself, ready for an auditor or importer.</div>
        </section>
      </div>
    </PlatformShell>
  )
}

function Arrow() {
  return (
    <div aria-hidden="true" style={{ flex: '0 0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.mist, fontSize: 24 }}>→</div>
  )
}
