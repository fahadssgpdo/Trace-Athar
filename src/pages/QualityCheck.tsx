import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TracedSeal } from '../components/Brand'
import PhoneFrame from '../components/PhoneFrame'
import { Check, ChevronLeft } from '../components/ui'
import { c, display } from '../tokens'
import { paths } from '../routes'

const CHECKS = [
  ['Core temperature', '2.1 °C'],
  ['Bled and iced on board', 'Yes'],
  ['Eyes clear, gills red', '3 / 3'],
  ['Flesh firm, no gaping', '3 / 3'],
  ['Label matches lot', 'QR ok'],
]
const GRADES = [
  ['A', 'Sashimi'],
  ['B', 'Fresh'],
  ['C', 'Process'],
]
const INITIAL = [true, true, false, false, false]

export default function QualityCheck() {
  const [checks, setChecks] = useState(INITIAL)
  const [grade, setGrade] = useState(0)
  const [verified, setVerified] = useState(false)

  const done = checks.filter(Boolean).length
  const ready = done === CHECKS.length
  const action = () => {
    if (verified) {
      setVerified(false)
      setChecks(INITIAL)
    } else if (ready) setVerified(true)
    else setChecks(CHECKS.map(() => true))
  }

  return (
    <PhoneFrame>
      <div className="slab stack" style={{ padding: '18px 20px 16px', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to={paths.lotRegistration} aria-label="Back to lot registration" className="icon-btn" style={{ borderColor: c.lineDark, color: c.sand }}>
            <ChevronLeft />
          </Link>
          <div style={{ flex: 1 }}>
            <div className="eyebrow eyebrow--sm eyebrow--amber">TRACE QUALITY OFFICER</div>
            <div style={{ ...display, fontWeight: 600, fontSize: 17 }}>OM-DQM-26-11-0051</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
          <span style={{ background: c.slab, padding: '5px 10px', borderRadius: 999 }}>Yellowfin tuna · 412 kg</span>
          <span style={{ background: c.slab, padding: '5px 10px', borderRadius: 999 }}>Handline</span>
          <span style={{ background: c.amber, color: c.ocean, fontWeight: 600, padding: '5px 10px', borderRadius: 999 }}>Risk sample: 3 of 18 fish</span>
        </div>
      </div>

      <div className="phone__body" style={{ padding: '16px 20px', gap: 14 }}>
        {!verified ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h2 style={{ ...display, fontWeight: 600, fontSize: 19 }}>Checks</h2>
              <span className="muted" style={{ fontSize: 13 }}>{done} of 5 passed</span>
            </div>
            <div className="card" style={{ overflow: 'hidden', flex: 'none' }}>
              {CHECKS.map(([label, val], i) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={checks[i]}
                  onClick={() => setChecks(checks.map((v, k) => (k === i ? !v : v)))}
                  style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: i < CHECKS.length - 1 ? `1px solid ${c.line}` : 'none', padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center', minHeight: 54, color: c.ocean, outlineOffset: -3 }}
                >
                  <span style={{ flex: 'none', width: 26, height: 26, borderRadius: 8, border: `2px solid ${checks[i] ? c.harbour : c.mist}`, background: checks[i] ? c.harbour : c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {checks[i] && <Check size={14} width={3.2} />}
                  </span>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{label}</span>
                  <span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>{val}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ ...display, fontWeight: 600, fontSize: 19 }}>Grade</h2>
              <span className="muted" style={{ fontSize: 13 }}>Photos 3 / 3 attached</span>
            </div>
            <div role="radiogroup" aria-label="Grade" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, flex: 'none' }}>
              {GRADES.map(([label, sub], i) => (
                <button
                  key={label}
                  type="button"
                  role="radio"
                  aria-checked={grade === i}
                  onClick={() => setGrade(i)}
                  className="toggle stack"
                  style={{ minHeight: 72, borderRadius: 16, borderWidth: 2, borderColor: grade === i && i === 0 ? c.amber : undefined, alignItems: 'center', justifyContent: 'center', gap: 2, padding: 0 }}
                >
                  <span style={{ ...display, fontWeight: 700, fontSize: 26 }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{sub}</span>
                </button>
              ))}
            </div>
            <div className="card muted" style={{ fontSize: 13, borderRadius: 12, padding: '10px 12px' }}>In an IPNLF and Seafood Souq training with four Omani handline crews, about 14% of yellowfin reached grade A through better handling. Traceability lets it sell as premium.</div>
          </>
        ) : (
          <div role="status" className="stack" style={{ gap: 14, alignItems: 'center', textAlign: 'center', paddingTop: 10 }}>
            <TracedSeal size={168} />
            <div style={{ ...display, fontWeight: 700, fontSize: 24 }}>Lot Trace Verified</div>
            <div style={{ fontSize: 15, color: c.body }}>Grade {GRADES[grade][0]} · 5 of 5 checks · 3 photos · officer ID Q-014</div>
            <div className="card stack" style={{ padding: '14px 16px', width: '100%', textAlign: 'left', gap: 8, fontSize: 14 }}>
              <div className="kv"><span className="muted">Verified mark</span><span style={{ fontWeight: 600 }}>20 baisa / kg licence</span></div>
              <div className="kv"><span className="muted">Next step</span><span style={{ fontWeight: 600 }}>Listed on marketplace</span></div>
              <div className="kv"><span className="muted">Event</span><span style={{ fontWeight: 600 }}>EPCIS inspection · logged</span></div>
            </div>
            <div className="muted" style={{ fontSize: 13 }}>Private assurance by Trace. It speeds up official certification but does not replace MAFWR inspection.</div>
            <Link to={paths.marketplace} className="text-link">See it on the marketplace →</Link>
          </div>
        )}
      </div>

      <div className="phone__footer" style={{ padding: '14px 20px 22px' }}>
        <button type="button" onClick={action} className={`btn btn--block ${!verified && ready ? 'btn--amber' : 'btn--ocean'}`} style={{ minHeight: 54, fontSize: 16 }}>
          {verified ? 'Next lot' : ready ? 'Mark Trace Verified' : 'Complete remaining checks'}
        </button>
      </div>
    </PhoneFrame>
  )
}
