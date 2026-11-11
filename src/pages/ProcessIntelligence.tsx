import { useState } from 'react'
import PlatformShell, { PageHeader } from '../components/PlatformShell'
import { BarRow } from '../components/ui'
import { c, display } from '../tokens'

const SITES = [
  { tab: 'All', name: 'All pilot sites', lots: '1,284', conform: '82%', lt: [3.4, 5.2, 16.8, 2.7, 3.1], brk: '2.6%', pack: '19 h', devs: [52, 34, 21, 1] },
  { tab: 'Duqm', name: 'Duqm', lots: '642', conform: '87%', lt: [2.8, 4.6, 14.1, 2.5, 2.9], brk: '1.9%', pack: '16 h', devs: [18, 12, 9, 1] },
  { tab: 'Sur', name: 'Sur', lots: '438', conform: '79%', lt: [3.9, 5.8, 19.2, 2.9, 3.3], brk: '3.1%', pack: '22 h', devs: [21, 14, 8, 0] },
  { tab: 'Masirah', name: 'Masirah', lots: '204', conform: '74%', lt: [4.6, 6.1, 20.4, 3.0, 3.4], brk: '3.8%', pack: '24 h', devs: [13, 8, 4, 0] },
]
const NODES = ['Landing', 'Quality check', 'First sale', 'Processing', 'Document pack', 'Release']
const DEVIATIONS = [
  ['Exported without quality check', 'Lot skipped P2; flagged before the pack is built.'],
  ['Sold off-platform', 'Recorded against the lot after sale; price captured.'],
  ['Cold-chain break', 'Temperature above 4 °C during transport or storage.'],
  ['Weight gap vs Bayan', 'Declared export weight above landed lots — possible mixing.'],
]
const LEAD_STEPS = ['Landing → sale', 'Sale → processing', 'Processing → pack', 'Pack → MAFWR signature', 'Signature → release']
const RISKS = [
  { name: 'IUU pattern', level: 'Medium', text: 'Two lots from one boat on the same day at sites 300 km apart.' },
  { name: 'Bycatch reporting gap', level: 'Low', text: 'Gillnet lots without a bycatch record — needed for US MMPA evidence.' },
  { name: 'Species mislabelling', level: 'Low', text: 'Photo grading disagrees with the declared species on one lot.' },
]

export default function ProcessIntelligence() {
  const [site, setSite] = useState(0)
  const d = SITES[site]
  const avg = (d.lt.reduce((a, b) => a + b, 0) / d.lt.length).toFixed(1)
  const max = Math.max(...d.lt)
  const kpis = [
    { label: 'Lots conforming to target process', value: d.conform, note: 'calibrated in the pilot', dark: true },
    { label: 'Average lead time per step', value: `${avg} h`, note: 'landing to customs release' },
    { label: 'Cold-chain break rate', value: d.brk, note: 'share of lots with a breach' },
    { label: 'Document-pack turnaround', value: d.pack, note: 'target under 2 h by Year 5' },
  ]

  return (
    <PlatformShell workspace="Al Wusta Seafood Export (demo)">
      <PageHeader
        eyebrow="M16 ANALYTICS · M17 DATA PRODUCTS · OBJECT-CENTRIC PROCESS MINING"
        title="How the supply chain really runs"
        lead="Every step writes EPCIS 2.0 events. Together they show where lots go, how long they wait and where they leave the target process."
        leadMaxWidth={760}
        action={
          <div role="group" aria-label="Site" className="row" style={{ gap: 6 }}>
            {SITES.map((s, i) => (
              <button key={s.tab} type="button" className="toggle" aria-pressed={i === site} onClick={() => setSite(i)} style={{ padding: '6px 16px' }}>
                {s.tab}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid-auto" style={{ ['--min' as string]: '200px', gap: 12 }}>
        {kpis.map((k) => (
          <div key={k.label} className={`stack ${k.dark ? 'slab' : 'card'}`} style={{ border: `1px solid ${k.dark ? c.ocean : c.line}`, borderRadius: 16, padding: 18, gap: 4 }}>
            <span style={{ fontSize: 13, opacity: 0.85 }}>{k.label}</span>
            <span style={{ ...display, fontWeight: 700, fontSize: 30, color: k.dark ? c.amber : c.ocean }}>{k.value}</span>
            <span style={{ fontSize: 12, opacity: 0.85 }}>{k.note}</span>
          </div>
        ))}
      </div>

      <section aria-label="Discovered process" className="panel stack" style={{ padding: 22, gap: 16 }}>
        <div className="row" style={{ gap: 8, justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 className="h-panel">Discovered paths · {d.name}</h2>
          <span className="muted" style={{ fontSize: 13 }}>{d.lots} lots, last 30 days · pilot illustration</span>
        </div>
        <div className="row" style={{ alignItems: 'center', gap: 8 }}>
          {NODES.map((name, i) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="slab" style={{ borderRadius: 12, padding: '10px 14px', fontWeight: 600, fontSize: 14, minWidth: 110, textAlign: 'center' }}>{name}</span>
              <span aria-hidden="true" style={{ fontSize: 12, fontWeight: 600, color: c.link, minWidth: 44, textAlign: 'center' }}>{i < NODES.length - 1 ? '→' : ''}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 14, color: c.body }}>
          <span style={{ ...display, fontWeight: 700, color: c.ocean }}>{d.conform}</span> of lots follow the target process end to end.
        </div>
        <div className="grid-auto" style={{ ['--min' as string]: '240px', gap: 10 }}>
          {DEVIATIONS.map(([name, text], i) => (
            <div key={name} className="stack" style={{ border: `2px dashed ${c.mist}`, borderRadius: 14, padding: '12px 14px', gap: 4 }}>
              <span className="kv">
                <span style={{ fontWeight: 600 }}>{name}</span>
                <span style={{ ...display, fontWeight: 700, color: c.accent, whiteSpace: 'nowrap' }}>{d.devs[i]} {d.devs[i] === 1 ? 'lot' : 'lots'}</span>
              </span>
              <span className="muted" style={{ fontSize: 13 }}>{text}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <section aria-label="Lead times" className="panel stack" style={{ flex: '999 1 460px', minWidth: 0, padding: 22, gap: 12 }}>
          <h2 className="h-panel">Average lead time per step</h2>
          {LEAD_STEPS.map((name, i) => (
            <BarRow key={name} label={name} value={`${d.lt[i].toFixed(1)} h`} pct={Math.round((d.lt[i] / max) * 100)} color={d.lt[i] === max ? c.amber : c.harbour} labelWidth={180} valueWidth={64} height={18} />
          ))}
          <div className="muted" style={{ fontSize: 13 }}>The bottleneck is highlighted: that is where exporters gain most from pre-filled packs.</div>
        </section>

        <section aria-label="Risk flags" className="slab stack" style={{ flex: '1 1 320px', minWidth: 0, borderRadius: 20, padding: 22, gap: 12 }}>
          <h2 className="h-panel">Risk flags</h2>
          {RISKS.map((r) => (
            <div key={r.name} className="stack" style={{ background: c.slab, borderRadius: 12, padding: '12px 14px', gap: 4 }}>
              <span className="kv" style={{ gap: 8 }}>
                <span style={{ fontWeight: 600 }}>{r.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, background: r.level === 'Medium' ? c.amber : c.mist, color: c.ocean, padding: '2px 8px', borderRadius: 999 }}>{r.level}</span>
              </span>
              <span style={{ fontSize: 13, color: c.onOcean }}>{r.text}</span>
            </div>
          ))}
          <div style={{ fontSize: 12, color: c.mist }}>Scores are commercial assurance, not enforcement. Data beyond a customer's account needs Data Governance Council approval.</div>
        </section>
      </div>
    </PlatformShell>
  )
}
