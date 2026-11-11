import { useState } from 'react'
import { Link } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import { Check, ChevronLeft, FishPhoto } from '../components/ui'
import { c, display } from '../tokens'
import { paths } from '../routes'

const SPECIES = ['Yellowfin tuna', 'Kingfish', 'Squid', 'Lobster', 'Sardine']
const WEIGHTS = ['412.0', '96.4', '238.0', '31.6', '1,180.0']
const GEARS = ['Handline', 'Gillnet', 'Trap', 'Purse seine']
const STEP_LABELS = ['Fisher', 'Catch', 'Evidence', 'QR lot']
const LOT_ID = 'OM-DQM-26-11-0051'

/** Deterministic QR-like 21×21 pattern with the three finder squares. */
const QR: boolean[] = (() => {
  const finder = (r: number, col: number, r0: number, c0: number): boolean | null => {
    const y = r - r0
    const x = col - c0
    if (y < 0 || x < 0 || y > 6 || x > 6) return null
    const edge = y === 0 || y === 6 || x === 0 || x === 6
    const core = y >= 2 && y <= 4 && x >= 2 && x <= 4
    return edge || core
  }
  const cells: boolean[] = []
  for (let r = 0; r < 21; r++) {
    for (let col = 0; col < 21; col++) {
      const f = finder(r, col, 0, 0) ?? finder(r, col, 0, 14) ?? finder(r, col, 14, 0)
      if (f !== null) cells.push(f)
      else if ((r === 7 || col === 7) && r < 8 && col < 8) cells.push(false)
      else cells.push((r * 7 + col * 13 + r * col) % 5 < 2)
    }
  }
  return cells
})()

export default function LotRegistration() {
  const [step, setStep] = useState(0)
  const [licence, setLicence] = useState(false)
  const [species, setSpecies] = useState(0)
  const [gear, setGear] = useState(0)

  const canNext = step !== 0 || licence
  const last = step === 3
  const next = () => {
    if (last) {
      setStep(0)
      setLicence(false)
    } else if (canNext) setStep(step + 1)
  }
  const nextLabel = last ? 'Print label · register next' : step === 2 ? 'Create lot' : canNext ? 'Continue' : 'Check the licence first'
  const nextClass = !canNext ? 'btn--disabled' : step === 2 ? 'btn--amber' : 'btn--ocean'

  return (
    <PhoneFrame>
      <div className="stack" style={{ padding: '18px 20px 14px', gap: 12, background: c.card, borderBottom: `1px solid ${c.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to={paths.overview} aria-label="Back to overview" className="icon-btn" style={{ color: c.ocean }}>
            <ChevronLeft />
          </Link>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow eyebrow--sm">FIRST RECEIPT · DUQM CENTRE</div>
            <div style={{ ...display, fontWeight: 600, fontSize: 18 }}>
              New lot{' '}
              <span lang="ar" className="arabic muted" style={{ fontWeight: 500, fontSize: 15 }}>· دفعة جديدة</span>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: c.link, border: `1px solid ${c.harbourLight}`, borderRadius: 999, padding: '4px 8px' }}>Offline-ready</span>
        </div>
        <div role="group" aria-label={`Step ${step + 1} of 4`} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6 }}>
          {STEP_LABELS.map((label, i) => {
            const reached = i <= step
            return (
              <div key={label} className="stack" style={{ gap: 4 }} aria-current={i === step ? 'step' : undefined}>
                <span style={{ height: 5, borderRadius: 999, background: reached ? (i === 3 ? c.amber : c.ocean) : c.line }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: reached ? c.ocean : c.muted }}>{label}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="phone__body" style={{ padding: '18px 20px', gap: 14 }}>
        {step === 0 && (
          <>
            <h2 style={{ ...display, fontWeight: 600, fontSize: 22 }}>Who landed it?</h2>
            <div className="card stack" style={{ padding: 16, gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ ...display, width: 48, height: 48, borderRadius: 999, background: c.ocean, color: c.sand, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>SB</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 17 }}>Salim Al Balushi</div>
                  <div className="muted" style={{ fontSize: 13 }}>Fisher app · scanned QR ID</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, fontSize: 14 }}>
                <Fact label="Boat" value="Al Najm · DQM-1187" />
                <Fact label="Type" value="Artisanal, 2 crew" />
              </div>
            </div>
            {licence ? (
              <div role="status" style={{ background: c.card, border: `1.5px solid ${c.harbour}`, borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ flex: 'none', width: 32, height: 32, borderRadius: 999, background: c.harbour, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check />
                </span>
                <div style={{ fontSize: 14 }}>
                  <div style={{ fontWeight: 600 }}>Licence document valid</div>
                  <div className="muted">Artisanal licence · expires Mar 2027</div>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setLicence(true)} style={{ minHeight: 52, flex: 'none', borderRadius: 14, border: `1.5px dashed ${c.harbour}`, background: c.card, color: c.link, fontWeight: 600, fontSize: 16 }}>
                Check fishing licence
              </button>
            )}
            <div className="muted" style={{ fontSize: 13 }}>Registered by the first receiver, so adoption does not wait for a regulation. The fisher pays nothing.</div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 style={{ ...display, fontWeight: 600, fontSize: 22 }}>What came in?</h2>
            <ChipGroup label="Species" options={SPECIES} value={species} onChange={setSpecies} />
            <ChipGroup label="Gear" options={GEARS} value={gear} onChange={setGear} />
            <div className="slab" style={{ borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: c.mist }}>Weight · Bluetooth scale</div>
                <div style={{ ...display, fontWeight: 700, fontSize: 34, color: c.amber }}>{WEIGHTS[species]} kg</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, border: `1px solid ${c.harbourLight}`, borderRadius: 999, padding: '4px 9px' }}>Stable</span>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ ...display, fontWeight: 600, fontSize: 22 }}>Evidence</h2>
            <FishPhoto height={180} label="Photo · 06:42 · placeholder" />
            <div className="card stack" style={{ padding: '14px 16px', gap: 10, fontSize: 14 }}>
              <div className="kv"><span className="muted">GPS (fisher app)</span><span style={{ fontWeight: 600 }}>19.66° N, 57.70° E</span></div>
              <div className="kv"><span className="muted">Catch area</span><span style={{ fontWeight: 600 }}>Arabian Sea · coastal</span></div>
              <div className="kv" style={{ alignItems: 'center' }}><span className="muted">Permitted-area check</span><span style={{ fontWeight: 600, color: c.link }}>Yes · via MAFWR</span></div>
            </div>
            <div className="muted" style={{ fontSize: 13 }}>The optional MAFWR check returns yes/no only — raw vessel positions are never shared.</div>
          </>
        )}

        {step === 3 && (
          <div className="stack" style={{ gap: 14, alignItems: 'center', textAlign: 'center' }}>
            <span className="eyebrow eyebrow--sm">LOT CREATED · EVENT LOGGED</span>
            <div className="card stack" style={{ borderRadius: 20, padding: 18, gap: 12, alignItems: 'center', width: '100%' }}>
              <div role="img" aria-label={`QR label for lot ${LOT_ID}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(21, 7px)', gridAutoRows: 7, padding: 8, background: c.card }}>
                {QR.map((on, i) => (
                  <span key={i} style={{ background: on ? c.ocean : c.card }} />
                ))}
              </div>
              <div style={{ ...display, fontWeight: 700, fontSize: 18, letterSpacing: '0.02em' }}>{LOT_ID}</div>
              <div className="muted" style={{ fontSize: 14 }}>{SPECIES[species]} · {WEIGHTS[species]} kg · {GEARS[gear]} · Al Najm</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                {['GS1 lot code', 'EPCIS ObjectEvent', 'Hash-chained'].map((p) => (
                  <span key={p} className="pill">{p}</span>
                ))}
              </div>
            </div>
            <Link to={paths.qualityCheck} className="text-link">Send to quality check →</Link>
          </div>
        )}
      </div>

      <div className="phone__footer" style={{ padding: '14px 20px 22px', display: 'flex', gap: 10 }}>
        {step > 0 && !last && (
          <button type="button" className="btn btn--ghost" style={{ minHeight: 52, padding: '0 18px', fontSize: 16 }} onClick={() => setStep(step - 1)}>Back</button>
        )}
        <button type="button" className={`btn ${nextClass}`} style={{ flex: 1, minHeight: 52, fontSize: 16 }} aria-disabled={!canNext} onClick={next}>
          {nextLabel}
        </button>
      </div>
    </PhoneFrame>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 12 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  )
}

function ChipGroup({ label, options, value, onChange }: { label: string; options: string[]; value: number; onChange: (i: number) => void }) {
  return (
    <>
      <div className="muted" style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
      <div role="group" aria-label={label} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o, i) => (
          <button key={o} type="button" className="toggle" aria-pressed={i === value} onClick={() => onChange(i)} style={{ padding: '8px 14px', fontSize: 14 }}>
            {o}
          </button>
        ))}
      </div>
    </>
  )
}
