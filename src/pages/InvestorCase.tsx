import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import logoOnDark from '../assets/logo-on-dark.svg'
import { BarRow } from '../components/ui'
import { c, display } from '../tokens'
import { paths } from '../routes'

const YEARS = [
  { rev: 100, run: 320, build: 300, net: -520, cum: -520, note: 'Includes the six ideation months; about RO 6,600 from the offline paid service.' },
  { rev: 550, run: 640, build: 150, net: -240, cum: -760, note: 'Peak funding need of about RO 0.76M. Build completes.' },
  { rev: 1250, run: 930, build: 0, net: 320, cum: -440, note: 'Operating profit. Milestone 3: monthly revenue covers running costs.' },
  { rev: 2100, run: 1200, build: 0, net: 900, cum: 460, note: 'Peak funding repaid.' },
  { rev: 2988, run: 1450, build: 0, net: 1538, cum: 1998, note: '51% EBITDA margin; net profit about RO 1.23M after depreciation and 15% tax.' },
]

const STREAMS: [string, number][] = [
  ['Export traceability fee · RO 2/t', 434],
  ['Digital first-sale marketplace · 1.0%', 400],
  ['Export trade desk · 2.5%', 400],
  ['Plant and exporter SaaS', 390],
  ['Buyer audit and supplier scoring', 320],
  ['Trace Verified mark · 20 bz/kg', 300],
  ['Payment-processing share · 0.25%', 200],
  ['Data products', 160],
  ['Export compliance documents', 144],
  ['Electronic monitoring and bycatch', 144],
  ['Cold-chain IoT monitoring', 96],
]

const FUNDS = [
  { name: 'Proof of concept and prototype', ro: '16,000', pct: 40, what: 'Two contract engineers: lot registration, QR label, document pack', color: c.ocean },
  { name: 'Hosting, devices and pilot site', ro: '6,000', pct: 15, what: 'Oman cloud, tablets, QR printers and scales', color: c.harbour },
  { name: 'Pilot operations and first customers', ro: '6,000', pct: 15, what: 'Field coordinator, training, offline paid service', color: c.harbourLight },
  { name: 'MAFWR and Customs groundwork, legal', ro: '5,000', pct: 12.5, what: 'Agreement drafts, LLC registration, shareholders’ agreement', color: c.amber },
  { name: 'Expert input', ro: '2,000', pct: 5, what: 'Travel of the two part-time experts', color: c.mist },
  { name: 'Seed preparation, trademark, brand', ro: '2,000', pct: 5, what: 'Financial model, investor pack, trademark', color: c.mistDeep },
  { name: 'Contingency', ro: '3,000', pct: 7.5, what: 'Released by the board; unspent rolls into seed', color: c.line },
]

const GOALS = [
  '30+ validation interviews with exporters, plants and GCC buyers',
  'Five signed letters of intent from exporters or plants',
  'A MAFWR pilot letter for the EU catch certificate and a confirmed Bayan route with Customs',
  'Prototype of lot registration and the document pack, tested at one landing site and used by paying exporters',
  'A seed-ready company: investor pack, data room, valuation range, seed process launched',
]

const DOCS = [8, 15, 30, 45, 60, 75]

type Tone = 'amber' | 'ocean' | 'card'
const PATH: { when: string; amount: string; name: string; gate: string; tone: Tone }[] = [
  { when: 'NOW · MONTHS 0–6', amount: 'RO 40,000', name: 'Ideation · OTF Scale', gate: '10% at RO 400,000 post-money', tone: 'amber' },
  { when: 'MILESTONE 1 · MONTH 6', amount: 'RO 0.5M', name: 'Seed tranche 1', gate: 'Five goals met; MAFWR letter; closes by month 9', tone: 'ocean' },
  { when: 'MILESTONE 2 · MONTH 18', amount: 'RO 0.3M', name: 'Seed tranche 2', gate: 'Bayan live; 60% of pilot lots; 10 paying exporters; 300 active fishers', tone: 'ocean' },
  { when: 'MILESTONE 3 · MONTH 36', amount: 'Break-even', name: 'Self-funding', gate: 'Monthly revenue covers monthly running costs. Plus about RO 0.1M of grants.', tone: 'card' },
]
const TONES: Record<Tone, { bg: string; fg: string; border: string }> = {
  amber: { bg: c.amber, fg: c.ocean, border: c.amber },
  ocean: { bg: c.ocean, fg: c.sand, border: c.ocean },
  card: { bg: c.card, fg: c.ocean, border: c.line },
}

const HERO_STATS = [
  ['Year-5 revenue', 'RO 2.99M', true],
  ['Year-5 net profit', 'RO 1.23M', false],
  ['Operating profit', 'Year 3', false],
  ['Payback', 'Year 4', false],
] as const

const STRESS = [
  ['Year-5 revenue', 'RO 2.1M', 'against RO 3.0M'],
  ['Peak funding need', 'RO 1.0M', 'about RO 0.1M above funding in place'],
  ['Cumulative cash, end of Year 5', 'Slightly negative', ''],
]

const fmt = (v: number) => (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-US')
// Chart scale: −1000 … 3000 (RO thousand) mapped onto y 270 … 20.
const yS = (v: number) => 270 - ((v + 1000) / 4000) * 250
const barX = (i: number) => 80 + i * 112

export default function InvestorCase() {
  const [scenario, setScenario] = useState<0 | 1>(0)
  const [year, setYear] = useState(4)
  const d = YEARS[year]
  const zeroY = yS(0)

  return (
    <div style={{ fontSize: 16, lineHeight: 1.5 }}>
      <section className="slab">
        <div className="container stack" style={{ paddingTop: 24, paddingBottom: 64, gap: 40 }}>
          <nav aria-label="Investor case" className="row nav-light" style={{ gap: '12px 24px', alignItems: 'center' }}>
            <img src={logoOnDark} alt="Trace" style={{ height: 36, width: 'auto', marginRight: 'auto' }} />
            <Link to={paths.overview}>← Overview</Link>
            <Link to={paths.storyboard}>Motion storyboard</Link>
          </nav>
          <div className="row" style={{ gap: 40, alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div className="stack" style={{ flex: '1 1 560px', minWidth: 0, gap: 14 }}>
              <div className="eyebrow eyebrow--amber">THE INVESTOR CASE · IDEATION ROUND</div>
              <h1 style={{ ...display, fontWeight: 700, fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.08 }}>RO 40,000 for 10%</h1>
              <p style={{ fontSize: 19, color: c.onOcean, maxWidth: 620 }}>Post-money RO 400,000. Six months to a working prototype, paying exporters and a seed-ready company. The seed round is raised only when all five goals are met.</p>
            </div>
            <div style={{ flex: '1 1 320px', minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
              {HERO_STATS.map(([l, v, hi]) => (
                <div key={l} style={{ background: c.slab, borderRadius: 16, padding: 16 }}>
                  <div style={{ fontSize: 13, color: c.mist }}>{l}</div>
                  <div style={{ ...display, fontWeight: 700, fontSize: 26, color: hi ? c.amber : undefined }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Financials */}
      <section className="container stack" style={{ paddingTop: 64, paddingBottom: 24, gap: 22 }}>
        <div className="row" style={{ gap: 16, justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div className="stack" style={{ gap: 8, maxWidth: 720 }}>
            <div className="eyebrow">FIVE-YEAR PLAN · RO THOUSAND</div>
            <h2 className="h-section">Two building years, then profit</h2>
          </div>
          <div role="group" aria-label="Scenario" className="segmented">
            <button type="button" aria-pressed={scenario === 0} onClick={() => setScenario(0)}>Optimistic case</button>
            <button type="button" aria-pressed={scenario === 1} onClick={() => setScenario(1)}>Adoption −30%</button>
          </div>
        </div>

        {scenario === 0 ? (
          <div className="row" style={{ gap: 20, alignItems: 'stretch' }}>
            <div className="panel stack" style={{ flex: '999 1 560px', minWidth: 0, gap: 12 }}>
              <div className="row muted" style={{ gap: 16, fontSize: 13 }}>
                <LegendItem><span style={{ width: 12, height: 12, borderRadius: 3, background: c.harbour, display: 'inline-block' }} />Revenue</LegendItem>
                <LegendItem><span style={{ width: 12, height: 12, borderRadius: 3, background: c.mist, display: 'inline-block' }} />Running and build costs</LegendItem>
                <LegendItem><span style={{ width: 16, height: 3, background: c.ocean, display: 'inline-block' }} />Cumulative cash</LegendItem>
              </div>
              <svg
                viewBox="0 0 640 300"
                role="img"
                aria-label="Revenue, total costs and cumulative cash by year. Revenue grows from 100 to 2,988; cumulative cash bottoms at minus 760 in Year 2 and reaches 1,998 in Year 5."
                style={{ width: '100%', height: 'auto', display: 'block', fontFamily: 'var(--font-text)' }}
              >
                <line x1="50" y1={zeroY} x2="630" y2={zeroY} stroke={c.muted} strokeWidth="1" />
                {[-1000, 0, 1000, 2000, 3000].map((v) => (
                  <g key={v}>
                    <line x1="50" y1={yS(v)} x2="630" y2={yS(v)} stroke={v === 0 ? c.muted : c.line} strokeWidth="1" />
                    <text x="44" y={yS(v) + 4} fill={c.muted} fontSize="11" textAnchor="end">{fmt(v)}</text>
                  </g>
                ))}
                {YEARS.map((y, i) => {
                  const cost = y.run + y.build
                  const op = i === year ? 1 : 0.55
                  return (
                    <g key={i}>
                      <rect x={barX(i)} y={yS(y.rev)} width="34" height={zeroY - yS(y.rev)} rx="4" fill={c.harbour} opacity={op} />
                      <rect x={barX(i) + 38} y={yS(cost)} width="34" height={zeroY - yS(cost)} rx="4" fill={c.mist} opacity={op} />
                      <text x={barX(i) + 36} y="292" fill={c.ocean} fontSize="12" fontWeight="600" textAnchor="middle">Year {i + 1}</text>
                    </g>
                  )
                })}
                <path
                  d={YEARS.map((y, i) => `${i ? 'L' : 'M'}${barX(i) + 36} ${yS(y.cum).toFixed(1)}`).join(' ')}
                  fill="none"
                  stroke={c.ocean}
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                {YEARS.map((y, i) => (
                  <circle key={i} cx={barX(i) + 36} cy={yS(y.cum)} r={i === year ? 8 : 5} fill={i === year ? c.amber : c.card} stroke={c.ocean} strokeWidth="2" />
                ))}
              </svg>
              <div role="group" aria-label="Year" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 6 }}>
                {YEARS.map((_, i) => (
                  <button key={i} type="button" className="toggle" aria-pressed={i === year} onClick={() => setYear(i)} style={{ borderRadius: 10, padding: 0 }}>
                    Y{i + 1}
                  </button>
                ))}
              </div>
            </div>
            <div className="slab stack" style={{ flex: '1 1 300px', minWidth: 0, borderRadius: 20, padding: 22, gap: 12 }}>
              <div style={{ ...display, fontWeight: 600, fontSize: 22 }}>Year {year + 1}</div>
              {[
                ['Revenue', fmt(d.rev)],
                ['Running costs', fmt(d.run)],
                ['Build', d.build ? fmt(d.build) : '–'],
                ['Net cash flow', fmt(d.net)],
              ].map(([k, v]) => (
                <div key={k} className="kv" style={{ borderBottom: `1px solid ${c.lineDark}`, paddingBottom: 8 }}>
                  <span style={{ color: c.onOcean }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <div className="kv">
                <span style={{ color: c.onOcean }}>Cumulative</span>
                <span style={{ ...display, fontWeight: 700, fontSize: 22, color: c.amber }}>{fmt(d.cum)}</span>
              </div>
              <div style={{ fontSize: 14, color: c.onOcean }}>{d.note}</div>
            </div>
          </div>
        ) : (
          <div className="panel stack" style={{ gap: 16, padding: 24 }}>
            <div className="grid-auto" style={{ gap: 14 }}>
              {STRESS.map(([l, v, n]) => (
                <div key={l} style={{ border: `1px solid ${c.line}`, borderRadius: 16, padding: 18 }}>
                  <div className="muted" style={{ fontSize: 13 }}>{l}</div>
                  <div style={{ ...display, fontWeight: 700, fontSize: 30, color: c.ocean }}>{v}</div>
                  {n && <div className="muted" style={{ fontSize: 13 }}>{n}</div>}
                </div>
              ))}
            </div>
            <div className="slab stack" style={{ borderRadius: 14, padding: '16px 18px', gap: 6 }}>
              <div style={{ fontWeight: 600 }}>The safeguard</div>
              <div style={{ color: c.onOcean }}>A freeze on deferred modules and new hires at Milestone 2 closes the gap. Tranches release only at milestones, and the cost plan can stop at pilot scale.</div>
            </div>
            <div className="muted" style={{ fontSize: 14 }}>Most fragile assumptions, tested first: marketplace share against Behar, the trade desk and demand for electronic monitoring. The offline paid service and the per-document fee are tested in the ideation months.</div>
          </div>
        )}
      </section>

      {/* Revenue streams */}
      <section className="container row" style={{ paddingTop: 48, paddingBottom: 24, gap: 28 }}>
        <div className="stack" style={{ flex: '1 1 320px', minWidth: 0, gap: 10 }}>
          <div className="eyebrow">YEAR-5 REVENUE MIX</div>
          <h2 className="h-sub">Eleven streams, none above 15%</h2>
          <p className="muted">Paid by exporters, plants, buyers and data users. Fishers pay nothing; buyers bear all marketplace and payment fees. Every fee is published.</p>
        </div>
        <div className="panel stack" style={{ flex: '999 1 560px', minWidth: 0, gap: 8 }}>
          {STREAMS.map(([name, v]) => (
            <BarRow key={name} label={name} value={v} pct={Math.round((v / 434) * 100)} labelWidth={230} valueWidth={54} height={16} />
          ))}
          <div className="kv" style={{ borderTop: `1px solid ${c.line}`, paddingTop: 10, marginTop: 4, fontWeight: 700, color: c.ocean }}>
            <span>Total, RO thousand</span>
            <span>2,988</span>
          </div>
        </div>
      </section>

      {/* Use of funds */}
      <section className="container stack" style={{ paddingTop: 48, paddingBottom: 24, gap: 18 }}>
        <div className="stack" style={{ gap: 8 }}>
          <div className="eyebrow">USE OF FUNDS · RO 40,000 · SIX MONTHS</div>
          <h2 className="h-sub">40% goes straight into the prototype</h2>
        </div>
        <div role="img" aria-label="Use of funds split" style={{ display: 'flex', height: 28, borderRadius: 8, overflow: 'hidden', gap: 2 }}>
          {FUNDS.map((f) => (
            <span key={f.name} style={{ display: 'block', width: `${f.pct}%`, background: f.color }} />
          ))}
        </div>
        <div className="grid-auto" style={{ ['--min' as string]: '250px', gap: 10 }}>
          {FUNDS.map((f) => (
            <div key={f.name} className="card" style={{ borderRadius: 14, padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span className="swatch" style={{ background: f.color, marginTop: 4 }} />
              <span className="stack" style={{ gap: 2, minWidth: 0 }}>
                <span style={{ fontWeight: 600, color: c.ocean }}>{f.name}</span>
                <span style={{ ...display, fontWeight: 700, color: c.ocean }}>RO {f.ro} · {f.pct}%</span>
                <span className="muted" style={{ fontSize: 13 }}>{f.what}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Goals + early income */}
      <section className="container row" style={{ paddingTop: 48, paddingBottom: 24, gap: 20, alignItems: 'stretch' }}>
        <div className="panel stack" style={{ flex: '1 1 460px', minWidth: 0, padding: 24, gap: 12 }}>
          <h2 style={{ ...display, fontWeight: 600, fontSize: 22, color: c.ocean }}>Five goals for month 6</h2>
          {GOALS.map((g, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ ...display, flex: 'none', width: 30, height: 30, borderRadius: 999, background: c.ocean, color: c.sand, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
              <span>{g}</span>
            </div>
          ))}
          <div className="muted" style={{ fontSize: 13 }}>Founders take no salary during ideation. The MAFWR letter depends on the ministry's timetable; the other four goals are in Trace's control.</div>
        </div>
        <div className="panel stack" style={{ flex: '1 1 380px', minWidth: 0, padding: 24, gap: 14 }}>
          <h2 style={{ ...display, fontWeight: 600, fontSize: 22, color: c.ocean }}>Earning from month 1</h2>
          <div className="muted" style={{ fontSize: 15 }}>Offline document packs at RO 25 while the software is built, plus RO 2 per tonne on pilot lots.</div>
          <div role="img" aria-label="Target documents per month: 8, 15, 30, 45, 60 and 75" style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 150, paddingTop: 10 }}>
            {DOCS.map((v, i) => (
              <div key={i} className="stack" style={{ flex: 1, alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: c.ocean }}>{v}</span>
                <span style={{ width: '100%', height: Math.round((v / 75) * 110), background: c.harbour, borderRadius: '6px 6px 0 0' }} />
                <span className="muted" style={{ fontSize: 12 }}>M{i + 1}</span>
              </div>
            ))}
          </div>
          <div className="row" style={{ gap: '8px 24px' }}>
            <div>
              <div style={{ ...display, fontWeight: 700, fontSize: 26, color: c.accent }}>≈ RO 6,600</div>
              <div className="muted" style={{ fontSize: 13 }}>230 documents + 400 t of lots</div>
            </div>
            <div>
              <div style={{ ...display, fontWeight: 700, fontSize: 26, color: c.ocean }}>≈ 17%</div>
              <div className="muted" style={{ fontSize: 13 }}>of the ideation budget covered</div>
            </div>
          </div>
          <div className="muted" style={{ fontSize: 12 }}>A target to test with five anchor exporters, not a forecast.</div>
        </div>
      </section>

      {/* Funding path */}
      <section className="container stack" style={{ paddingTop: 48, paddingBottom: 48, gap: 18 }}>
        <div className="stack" style={{ gap: 8 }}>
          <div className="eyebrow">FUNDING PATH · ABOUT RO 0.94M IN TOTAL · NO LOAN</div>
          <h2 className="h-sub">Each gate releases the next tranche</h2>
        </div>
        <div className="grid-auto" style={{ gap: 12 }}>
          {PATH.map((p) => {
            const t = TONES[p.tone]
            return (
              <div key={p.when} className="stack" style={{ background: t.bg, color: t.fg, border: `1px solid ${t.border}`, borderRadius: 16, padding: 18, gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', opacity: 0.9 }}>{p.when}</span>
                <span style={{ ...display, fontWeight: 700, fontSize: 24 }}>{p.amount}</span>
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                <span style={{ fontSize: 14, opacity: 0.9 }}>{p.gate}</span>
              </div>
            )
          })}
        </div>
        <div className="muted" style={{ fontSize: 13 }}>Figures from the Trace proposal (October 2026), optimistic case. Illustrative planning assumptions, to be validated in the pilot and the detailed financial model. Seed pricing is set on what the six months prove.</div>
      </section>
    </div>
  )
}

function LegendItem({ children }: { children: ReactNode }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{children}</span>
}
