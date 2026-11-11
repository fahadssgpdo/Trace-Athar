import { useState } from 'react'
import { Link } from 'react-router-dom'
import PlatformShell, { PageHeader } from '../components/PlatformShell'
import { BarRow, Stat } from '../components/ui'
import { c, display } from '../tokens'
import { paths } from '../routes'

const PARTS = ['Lot-level traceability coverage', 'Document completeness', 'Cold-chain conformance', 'Grading accuracy', 'Gear and bycatch records']

const SUPPLIERS = [
  {
    name: 'Al Wusta Seafood Export', meta: 'Duqm · 14 deliveries · since Mar 2027', score: 94, parts: [98, 100, 92, 90, 88], alerts: '1',
    deliveries: [['D-3108', 'Yellowfin loins, 300 kg', '3', 'Complete', 'In range'], ['D-3101', 'Kingfish steaks, 180 kg', '5', 'Complete', 'In range'], ['D-3094', 'Lobster, 40 kg', '2', 'Complete', '1 breach'], ['D-3088', 'Yellowfin saku, 120 kg', '4', 'Complete', 'In range']],
  },
  {
    name: 'Sur Bay Fisheries', meta: 'Sur · 9 deliveries · since May 2027', score: 81, parts: [86, 92, 78, 80, 70], alerts: '3',
    deliveries: [['D-3106', 'Kingfish, 220 kg', '6', 'Complete', 'In range'], ['D-3097', 'Squid, 400 kg', '8', '1 missing', 'In range'], ['D-3090', 'Yellowfin, 160 kg', '3', 'Complete', '1 breach'], ['D-3082', 'Sardine, 600 kg', '11', 'Complete', 'In range']],
  },
  {
    name: 'Masirah Catch Co.', meta: 'Masirah · 6 deliveries · since Jul 2027', score: 72, parts: [74, 80, 70, 76, 58], alerts: '4',
    deliveries: [['D-3104', 'Lobster, 60 kg', '4', 'Complete', '1 breach'], ['D-3095', 'Kingfish, 140 kg', '5', '1 missing', 'In range'], ['D-3086', 'Squid, 300 kg', '7', 'Complete', 'In range'], ['D-3079', 'Yellowfin, 90 kg', '2', 'Complete', 'In range']],
  },
]

const ringFor = (v: number) => (v >= 90 ? c.amber : v >= 80 ? c.harbour : c.mist)
const okColor = (ok: boolean) => (ok ? c.link : c.accent)

export default function BuyerAudit() {
  const [selected, setSelected] = useState(0)
  const cur = SUPPLIERS[selected]

  return (
    <PlatformShell workspace="Dunes Hotels Group, UAE (demo)">
      <PageHeader
        eyebrow="P6 · M14 BUYER AUDIT · M15 PASSPORT"
        title="Verified sourcing, delivery by delivery"
        lead="Supplier scores and audit trails for hotels, importers and retailers — ready for ESG reporting."
        leadMaxWidth={720}
        action={<Link to={paths.passport} className="btn btn--amber">Guest QR passport →</Link>}
      />

      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <section aria-label="Suppliers" className="stack" style={{ flex: '1 1 320px', minWidth: 0, gap: 10 }}>
          <div className="eyebrow eyebrow--muted">SUPPLIERS · OMAN</div>
          {SUPPLIERS.map((s, i) => (
            <button
              key={s.name}
              type="button"
              onClick={() => setSelected(i)}
              aria-pressed={i === selected}
              className="toggle toggle--card"
              style={{ width: '100%', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, fontWeight: 400 }}
            >
              <span style={{ ...display, flex: 'none', width: 56, height: 56, borderRadius: 999, border: `4px solid ${ringFor(s.score)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>{s.score}</span>
              <span className="stack" style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 600, fontSize: 16 }}>{s.name}</span>
                <span style={{ fontSize: 13, opacity: 0.85 }}>{s.meta}</span>
              </span>
            </button>
          ))}
        </section>

        <section aria-label="Supplier detail" className="stack" style={{ flex: '999 1 480px', minWidth: 0, gap: 16 }}>
          <div className="panel stack" style={{ padding: 22, gap: 14 }}>
            <div className="row" style={{ justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
              <h2 style={{ ...display, fontWeight: 600, fontSize: 22 }}>{cur.name}</h2>
              <span style={{ ...display, fontWeight: 700, fontSize: 28, color: c.accent }}>{cur.score} / 100</span>
            </div>
            {PARTS.map((name, i) => (
              <BarRow key={name} label={name} value={cur.parts[i]} pct={cur.parts[i]} color={cur.parts[i] >= 85 ? c.harbour : c.mist} />
            ))}
          </div>

          <div className="panel stack" style={{ padding: 22, gap: 12 }}>
            <h2 className="h-panel">Recent deliveries</h2>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Delivery</th>
                    <th scope="col">Product</th>
                    <th scope="col">Lots</th>
                    <th scope="col">Documents</th>
                    <th scope="col">Cold chain</th>
                  </tr>
                </thead>
                <tbody>
                  {cur.deliveries.map(([id, what, lots, docs, cold]) => (
                    <tr key={id}>
                      <td style={{ fontWeight: 600 }}>{id}</td>
                      <td>{what}</td>
                      <td>{lots}</td>
                      <td style={{ fontWeight: 600, color: okColor(docs === 'Complete') }}>{docs}</td>
                      <td style={{ fontWeight: 600, color: okColor(cold === 'In range') }}>{cold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid-auto" style={{ ['--min' as string]: '200px', gap: 12 }}>
            <Stat dark label="Audit subscription" value="RO 6,000–20,000" note="per client per year" />
            <Stat label="Alerts this month" value={cur.alerts} note="documents or temperature" />
            <Stat label="ESG report" value="Ready" note="origin, gear, bycatch, cold chain" />
          </div>
        </section>
      </div>
      <div className="muted" style={{ fontSize: 13 }}>Demo suppliers and scores. Audit services stay independent: the trade desk sits in a separate subsidiary.</div>
    </PlatformShell>
  )
}
