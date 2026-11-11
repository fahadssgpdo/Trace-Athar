import { useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import mark from '../assets/mark.svg'
import { BrandLogo } from '../components/Brand'
import { c, display } from '../tokens'
import { paths } from '../routes'

const STEPS = [
  { id: 'P1', name: 'Landing & first receipt', actors: 'Fisher, first receiver (collection centre, plant or buyer), Trace field coordinator', change: 'A lot is created with a QR label at first receipt: species, weight, boat, site, photo, gear and GPS from the fisher app. The fisher’s licence is uploaded and checked.', modules: ['M1 Lot registration', 'M3 e-Logbook', 'M4 Fisher app', 'M5 Position & gear'], data: 'Source lot', to: paths.lotRegistration, cta: 'Register a lot' },
  { id: 'P2', name: 'Quality check & grading', actors: 'Trace quality officers, plant QA', change: 'Risk-based sampling, photos and grading. The lot is marked Trace Verified — private assurance, not an official inspection.', modules: ['M2 Quality check', 'M8 Trace Verified mark'], data: 'Verified lot', to: paths.qualityCheck, cta: 'Grade a lot' },
  { id: 'P3', name: 'First sale & payment', actors: 'Buyers, partner bank', change: 'Remote bidding or fixed price on the Trace marketplace, or an off-platform sale recorded against the lot. Same-day payment by the partner bank; the buyer pays all fees.', modules: ['M6 Marketplace', 'M7 Fisher payments'], data: 'Transaction, price, grade', to: paths.marketplace, cta: 'Open the marketplace' },
  { id: 'P4', name: 'Processing & cold chain', actors: 'Plant, transporter', change: 'Receipts, cuts, splits and merges stay linked to source lots, so many small artisanal lots remain traceable inside one shipment. Temperature sensors and digital HACCP.', modules: ['M10 Plant traceability', 'M11 Cold-chain IoT', 'M12 e-HACCP'], data: 'Processed lots, cold-chain records', to: paths.plant, cta: 'Open the plant view' },
  { id: 'P5', name: 'Export documents', actors: 'Exporter, Trace, MAFWR, Customs', change: 'Trace builds the document pack from verified lots and submits it to MAFWR, which validates and signs. Trace returns the signed documents and sends shipment data to Bayan; Customs clears and Bayan returns the release.', modules: ['M13 Document hub', 'M9 Trade desk'], data: 'Signed documents, declaration, release', to: paths.exportDocs, cta: 'Run a shipment' },
  { id: 'P6', name: 'Buyer & consumer', actors: 'Hotels, importers, consumers', change: 'Supplier audit and risk score for buyers; a QR passport for consumers showing origin, catch date, cold chain and the quality mark.', modules: ['M14 Buyer audit', 'M15 Product passport'], data: 'Proof of compliance', to: paths.buyerAudit, cta: 'Open the buyer audit' },
]

type FlowOwner = 'trace' | 'gov' | 'exporter'
const FLOW_STYLE: Record<FlowOwner, { bg: string; fg: string; border: string; num: string }> = {
  trace: { bg: c.ocean, fg: c.sand, border: c.ocean, num: c.amber },
  gov: { bg: c.sand, fg: c.ocean, border: c.muted, num: c.accent },
  exporter: { bg: c.amber, fg: c.ocean, border: c.amber, num: c.ocean },
}
const FLOW: { title: string; who: string; owner: FlowOwner }[] = [
  { title: 'Request', who: 'Exporter picks lots and market', owner: 'exporter' },
  { title: 'Preparation', who: 'Trace builds the pack', owner: 'trace' },
  { title: 'Submission', who: 'Trace → MAFWR, electronically', owner: 'trace' },
  { title: 'Decision', who: 'MAFWR validates and signs', owner: 'gov' },
  { title: 'Delivery', who: 'Signed documents to exporter', owner: 'trace' },
  { title: 'Declaration', who: 'Shipment data → Bayan', owner: 'trace' },
  { title: 'Release', who: 'Customs clears at port', owner: 'gov' },
]

const BREAKS = [
  ['Landing', 'Weighed without a lot ID; origin and gear not linked to the boat.'],
  ['Inspection', 'Paper checks, not tied to a lot; no usable proof downstream.'],
  ['First sale', 'Lots listed with no reference to the landing.'],
  ['Processing', 'Cuts and merges not linked to source lots; no temperature record.'],
  ['Export', 'Certificates filled by hand from re-keyed data.'],
  ['Buyer', 'Trust rests on the supplier’s word.'],
]

const SCREENS = [
  { n: '01', kind: 'Mobile · AR', title: 'Fisher app', desc: 'Prices, payments, weather and SOS in Arabic, with voice.', to: paths.fisher },
  { n: '02', kind: 'Mobile', title: 'Lot registration', desc: 'Create a QR lot at first receipt with a licence check.', to: paths.lotRegistration },
  { n: '03', kind: 'Mobile', title: 'Quality check', desc: 'Grade with photo evidence and apply Trace Verified.', to: paths.qualityCheck },
  { n: '04', kind: 'Web', title: 'First-sale marketplace', desc: 'Remote bidding on verified lots, same-day settlement.', to: paths.marketplace },
  { n: '05', kind: 'Web', title: 'Plant & cold chain', desc: 'Splits and merges linked to source lots; live temperatures.', to: paths.plant },
  { n: '06', kind: 'Web', title: 'Export document hub', desc: 'Pack → MAFWR signature → Bayan release.', to: paths.exportDocs },
  { n: '07', kind: 'Web', title: 'Process intelligence', desc: 'Conformance, lead times and IUU risk from the event log.', to: paths.intelligence },
  { n: '08', kind: 'Web', title: 'Buyer audit', desc: 'Supplier scores and audit trails for hotels and importers.', to: paths.buyerAudit },
  { n: '10', kind: 'Mobile · QR', title: 'Consumer passport', desc: 'Scan to see origin, catch date and cold chain.', to: paths.passport },
]

const PILLS = ['GS1 identifiers', 'EPCIS 2.0', 'GDST', 'Hosted in Oman', 'PDPL (RD 6/2022)', 'Arabic-first', 'Offline-ready']

const WHY_STATS = [
  ['798,615 t', 'landed in 2025', 'worth RO 576.2 million, +12.7% on 2024'],
  ['~90%', 'from artisanal boats', 'tracked by MAFWR, but catch is not recorded per lot'],
  ['RO 261M', 'exported in 2024', 'about 333,000 t to 84+ countries'],
]

const COMPETITION = [
  ['Behar · competitor', 'Online auction at Al Fulaij since 2020. Trace starts where Behar is weakest — landing sites in Al Wusta and South Al Sharqiyah — and sells the sale as part of an export-ready lot, with buyer-paid fees set below Behar’s.'],
  ['Tharawat · ministry gateway', 'Licences and permits, with no lot-level records in public material. Trace complements it: licence data verifies exporters, packs go to MAFWR through the agreed exchange.'],
  ['International vendors · paper', 'Generic plant software lacks landing-level data; paper lacks speed. Trace brings lower cost, local support and a free first year of Basic SaaS for small plants.'],
]

const MODEL_STATS = [
  { v: 'RO 3.0M', l: 'Year-5 revenue, optimistic case', n: 'no stream above 15% of the total', accent: true },
  { v: 'Year 3', l: 'operating profit', n: 'net cash flow +RO 320k' },
  { v: 'Year 4', l: 'peak funding repaid', n: 'peak need about RO 0.76M' },
  { v: '51%', l: 'Year-5 EBITDA margin', n: 'lean team, open-source community editions' },
]

const LOT_FACTS = [
  ['Species', 'Yellowfin tuna'],
  ['Weight', '412 kg'],
  ['Grade', 'A'],
  ['Landing', 'Duqm'],
  ['Gear', 'Handline'],
  ['Market', 'EU · CATCH'],
]

const navLink = { textDecoration: 'none', color: c.ocean } as const

export default function Overview() {
  const [step, setStep] = useState(0)
  const cur = STEPS[step]

  return (
    <div style={{ fontSize: 17, lineHeight: 1.55 }}>
      <header style={{ borderBottom: `1px solid ${c.line}` }}>
        <nav aria-label="Main" className="container row" style={{ paddingTop: 16, paddingBottom: 16, alignItems: 'center', gap: '12px 28px' }}>
          <BrandLogo style={{ marginRight: 'auto' }} />
          <div className="row" style={{ gap: '6px 22px', fontSize: 15, fontWeight: 500 }}>
            <a href="#journey" style={navLink}>Journey</a>
            <a href="#screens" style={navLink}>Platform</a>
            <a href="#model" style={navLink}>Business model</a>
            <Link to={paths.storyboard} style={navLink}>Motion storyboard</Link>
          </div>
          <Link to={paths.investorCase} className="btn btn--amber" style={{ fontSize: 15, minHeight: 44 }}>Investor case</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="slab">
        <div className="container row" style={{ paddingTop: 72, paddingBottom: 80, gap: 48, alignItems: 'center' }}>
          <div className="stack" style={{ flex: '1 1 520px', minWidth: 0, gap: 20 }}>
            <div className="eyebrow eyebrow--amber">SEAFOOD TRACEABILITY HUB · OMAN</div>
            <h1 style={{ ...display, fontWeight: 700, fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1.05, letterSpacing: '-0.01em' }}>Every catch, traced.</h1>
            <div lang="ar" dir="rtl" className="arabic" style={{ fontWeight: 600, fontSize: 'clamp(32px, 4.6vw, 56px)', lineHeight: 1.3, textAlign: 'left' }}>لكلّ صيدٍ أثر</div>
            <p style={{ maxWidth: 560, fontSize: 19, color: c.onOcean }}>Every fish lot gets a verified digital identity at first receipt. That one record produces the documents and proof that EU, US, Asian and GCC buyers now require.</p>
            <div className="row" style={{ gap: 12, marginTop: 8 }}>
              <a href="#journey" className="btn btn--amber" style={{ minHeight: 48, padding: '0 22px' }}>Walk the journey</a>
              <Link to={paths.lotRegistration} className="btn btn--outline-light" style={{ minHeight: 48, padding: '0 22px' }}>Register a lot — live demo</Link>
            </div>
          </div>

          <div className="stack" style={{ flex: '1 1 400px', minWidth: 0, gap: 20 }}>
            <svg viewBox="0 0 440 220" aria-hidden="true" style={{ width: '100%', height: 'auto', display: 'block', fontFamily: 'var(--font-text)' }}>
              <path d="M30 170 C 120 170, 120 60, 220 60 S 320 170, 410 60" fill="none" stroke={c.harbourLight} strokeWidth="6" strokeLinecap="round" />
              <circle cx="30" cy="170" r="16" fill={c.ocean} stroke={c.sand} strokeWidth="6" />
              <circle cx="220" cy="60" r="12" fill={c.harbourLight} />
              <circle cx="410" cy="60" r="18" fill={c.amber} />
              <text x="30" y="210" fill={c.mist} fontSize="14" textAnchor="middle">Caught</text>
              <text x="220" y="30" fill={c.mist} fontSize="14" textAnchor="middle">Landed · sold</text>
              <text x="410" y="100" fill={c.amber} fontSize="14" textAnchor="middle">Verified</text>
            </svg>
            <div className="stack" style={{ background: c.slab, borderRadius: 16, padding: '20px 22px', gap: 12, border: `1px solid ${c.lineDark}` }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ ...display, fontWeight: 600, fontSize: 15, letterSpacing: '0.04em' }}>LOT OM-DQM-26-11-0042</span>
                <span className="pill pill--amber" style={{ padding: '4px 10px' }}>Trace Verified</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, fontSize: 14 }}>
                {LOT_FACTS.map(([k, v]) => (
                  <div key={k}>
                    <div style={{ color: c.mist }}>{k}</div>
                    <div style={{ fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: c.mist }}>Demo lot · illustrative</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why now */}
      <section className="container stack" style={{ paddingTop: 72, paddingBottom: 24, gap: 28 }}>
        <div className="stack" style={{ gap: 10, maxWidth: 760 }}>
          <div className="eyebrow">WHY NOW</div>
          <h2 className="h-section" style={{ fontSize: 'clamp(28px, 3.4vw, 44px)' }}>Oman already exports at scale. What it lacks is lot-level proof.</h2>
        </div>
        <div className="grid-auto" style={{ ['--min' as string]: '230px', gap: 16 }}>
          {WHY_STATS.map(([v, l, n]) => (
            <div key={v} className="card stack" style={{ padding: 22, gap: 6 }}>
              <div style={{ ...display, fontWeight: 700, fontSize: 34, color: c.ocean, lineHeight: 1.1 }}>{v}</div>
              <div style={{ fontWeight: 500, color: c.ocean }}>{l}</div>
              <div className="muted" style={{ fontSize: 14 }}>{n}</div>
            </div>
          ))}
          <div className="slab stack" style={{ borderRadius: 16, padding: 22, gap: 6 }}>
            <div style={{ ...display, fontWeight: 700, fontSize: 34, color: c.amber, lineHeight: 1.1 }}>10% → &lt;1%</div>
            <div style={{ fontWeight: 500 }}>US share of exports</div>
            <div style={{ fontSize: 14, color: c.onOcean }}>2020 against 2024 — premium markets slipping away</div>
          </div>
        </div>
        <div className="grid-auto" style={{ ['--min' as string]: '320px', gap: 16 }}>
          <RuleCard code="EU" bg={c.harbour} fg={c.card} title="Digital catch certificates in CATCH" text="Mandatory for all Omani fish entering the EU since 10 January 2026." />
          <RuleCard code="US" bg={c.ocean} fg={c.sand} title="MMPA import ban on 10 Omani fisheries" text="Since 1 January 2026. All other fish needs a certificate of admissibility, backed by gear, area and bycatch records." />
        </div>
      </section>

      {/* Broken chain */}
      <section className="container stack" style={{ paddingTop: 48, paddingBottom: 48, gap: 22 }}>
        <h2 style={{ ...display, fontWeight: 600, fontSize: 'clamp(24px, 2.6vw, 32px)', color: c.ocean }}>Today the chain breaks at every step</h2>
        <div className="grid-auto" style={{ ['--min' as string]: '170px', gap: 12 }}>
          {BREAKS.map(([s, t]) => (
            <div key={s} className="stack" style={{ borderTop: `3px solid ${c.mist}`, padding: '14px 4px 0', gap: 6 }}>
              <div style={{ fontWeight: 600, color: c.ocean }}>{s}</div>
              <div className="muted" style={{ fontSize: 14 }}>{t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Journey */}
      <section id="journey" style={{ background: c.card, borderTop: `1px solid ${c.line}`, borderBottom: `1px solid ${c.line}` }}>
        <div className="container stack" style={{ paddingTop: 72, paddingBottom: 72, gap: 28 }}>
          <div className="stack" style={{ gap: 10, maxWidth: 780 }}>
            <div className="eyebrow">THE TARGET PROCESS · 6 STEPS · 17 MODULES</div>
            <h2 className="h-section" style={{ fontSize: 'clamp(28px, 3.4vw, 44px)' }}>One record, from sea to market</h2>
            <p className="muted">Choose a step to see who acts, what changes and what data it writes to the lot record. Each step opens its working screen.</p>
          </div>

          <div role="tablist" aria-label="Journey steps" className="grid-auto" style={{ ['--min' as string]: '150px', gap: 10 }}>
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === step}
                onClick={() => setStep(i)}
                className="toggle toggle--card stack"
                style={{ padding: '14px 16px', minHeight: 76, gap: 2, borderWidth: 1.5 }}
              >
                <span style={{ ...display, fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', color: i === step ? c.amber : c.accent }}>{s.id}</span>
                <span style={{ fontWeight: 600, fontSize: 16 }}>{s.name}</span>
              </button>
            ))}
          </div>

          <div role="tabpanel" className="row" style={{ gap: 24, background: c.sand, borderRadius: 16, padding: 28, border: `1px solid ${c.line}` }}>
            <div className="stack" style={{ flex: '1 1 440px', minWidth: 0, gap: 14 }}>
              <div className="row" style={{ alignItems: 'center', gap: 12 }}>
                <span style={{ ...display, fontWeight: 700, color: c.card, background: c.ocean, borderRadius: 999, padding: '4px 12px', fontSize: 14 }}>{cur.id}</span>
                <h3 style={{ ...display, fontWeight: 600, fontSize: 26, color: c.ocean }}>{cur.name}</h3>
              </div>
              <p style={{ fontSize: 18 }}>{cur.change}</p>
              <div className="row" style={{ gap: 8 }}>
                {cur.modules.map((m) => (
                  <span key={m} className="pill pill--card" style={{ fontSize: 13, padding: '5px 11px' }}>{m}</span>
                ))}
              </div>
            </div>
            <div className="stack" style={{ flex: '1 1 280px', minWidth: 0, gap: 14 }}>
              <div>
                <div className="eyebrow" style={{ letterSpacing: '0.1em' }}>ACTORS</div>
                <div style={{ color: c.ocean, fontWeight: 500 }}>{cur.actors}</div>
              </div>
              <div>
                <div className="eyebrow" style={{ letterSpacing: '0.1em' }}>DATA WRITTEN TO THE LOT</div>
                <div style={{ color: c.ocean, fontWeight: 500 }}>{cur.data}</div>
              </div>
              <Link to={cur.to} className="btn btn--ocean" style={{ alignSelf: 'flex-start' }}>{cur.cta} →</Link>
            </div>
          </div>

          <div className="row muted" style={{ gap: 10, alignItems: 'center', fontSize: 14 }}>
            <span className="swatch" style={{ background: c.harbour }} />
            Every step writes EPCIS 2.0 events to one log — the basis of process intelligence (M16, M17).
            <Link to={paths.intelligence} style={{ fontWeight: 600 }}>See it</Link>
          </div>
        </div>
      </section>

      {/* Document flow */}
      <section className="container stack" style={{ paddingTop: 72, paddingBottom: 40, gap: 24 }}>
        <div className="stack" style={{ gap: 10, maxWidth: 800 }}>
          <div className="eyebrow">ELECTRONIC DOCUMENT FLOW</div>
          <h2 className="h-section">Trace prepares, transmits and delivers. MAFWR signs. Customs clears.</h2>
        </div>
        <div className="grid-auto" style={{ ['--min' as string]: '150px', gap: 10 }}>
          {FLOW.map((f, i) => {
            const s = FLOW_STYLE[f.owner]
            return (
              <div key={f.title} className="stack" style={{ background: s.bg, color: s.fg, borderRadius: 14, padding: 16, gap: 6, minHeight: 132, border: `1px solid ${s.border}` }}>
                <span style={{ ...display, fontWeight: 700, fontSize: 22, color: s.num }}>{i + 1}</span>
                <span style={{ fontWeight: 600 }}>{f.title}</span>
                <span style={{ fontSize: 13, opacity: 0.9 }}>{f.who}</span>
              </div>
            )
          })}
        </div>
        <div className="row" style={{ gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="row muted" style={{ gap: 18, fontSize: 14 }}>
            <Legend swatch={{ background: c.ocean }}>Trace</Legend>
            <Legend swatch={{ border: `2px dashed ${c.muted}` }}>Government decision</Legend>
            <Legend swatch={{ background: c.amber }}>Exporter</Legend>
          </div>
          <Link to={paths.exportDocs} className="btn btn--ocean">Run a shipment →</Link>
        </div>
      </section>

      {/* Screens */}
      <section id="screens" className="container stack" style={{ paddingTop: 40, paddingBottom: 72, gap: 24 }}>
        <div className="stack" style={{ gap: 10 }}>
          <div className="eyebrow">THE PLATFORM, SCREEN BY SCREEN</div>
          <h2 className="h-section">Arabic-first in the field. Export-grade at the desk.</h2>
        </div>
        <div className="grid-auto" style={{ ['--min' as string]: '260px', gap: 14 }}>
          {SCREENS.map((s) => (
            <Link key={s.n} to={s.to} className="card stack" style={{ textDecoration: 'none', color: 'inherit', padding: 20, gap: 10, minHeight: 150 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{ ...display, fontWeight: 700, fontSize: 14, color: c.accent }}>{s.n}</span>
                <span className="pill" style={{ padding: '3px 9px' }}>{s.kind}</span>
              </div>
              <span style={{ ...display, fontWeight: 600, fontSize: 18, color: c.ocean }}>{s.title}</span>
              <span className="muted" style={{ fontSize: 14 }}>{s.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Competition */}
      <section className="slab">
        <div className="container stack" style={{ paddingTop: 72, paddingBottom: 72, gap: 28 }}>
          <div className="stack" style={{ gap: 10, maxWidth: 780 }}>
            <div className="eyebrow eyebrow--amber">WHERE TRACE WINS</div>
            <h2 className="h-section" style={{ color: c.sand }}>The only record that runs from landing to the export document</h2>
          </div>
          <div className="grid-auto" style={{ ['--min' as string]: '260px', gap: 14 }}>
            {COMPETITION.map(([t, d]) => (
              <div key={t} className="stack" style={{ background: c.slab, borderRadius: 16, padding: 22, gap: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 18 }}>{t}</div>
                <div style={{ fontSize: 15, color: c.onOcean }}>{d}</div>
              </div>
            ))}
          </div>
          <div className="row" style={{ gap: 8 }}>
            {PILLS.map((p) => (
              <span key={p} style={{ fontSize: 13, fontWeight: 600, border: `1px solid ${c.harbour}`, padding: '6px 12px', borderRadius: 999 }}>{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Business model */}
      <section id="model" className="container stack" style={{ paddingTop: 72, paddingBottom: 72, gap: 28 }}>
        <div className="stack" style={{ gap: 10, maxWidth: 780 }}>
          <div className="eyebrow">BUSINESS MODEL</div>
          <h2 className="h-section">Eleven revenue streams. Fishers pay nothing.</h2>
          <p className="muted">Exporters, plants, buyers and data users pay per tonne, per document or by subscription. No concession, no exclusivity, no government revenue share.</p>
        </div>
        <div className="grid-auto" style={{ gap: 16 }}>
          {MODEL_STATS.map((m) => (
            <div key={m.v} className="card" style={{ padding: 22 }}>
              <div style={{ ...display, fontWeight: 700, fontSize: 36, color: m.accent ? c.accent : c.ocean, lineHeight: 1.1 }}>{m.v}</div>
              <div style={{ color: c.ocean, fontWeight: 500 }}>{m.l}</div>
              <div className="muted" style={{ fontSize: 14 }}>{m.n}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Ask */}
      <section style={{ padding: '0 24px 72px' }}>
        <div className="row" style={{ maxWidth: 1200, margin: '0 auto', background: c.amber, color: c.ocean, borderRadius: 20, padding: '44px 40px', gap: 28, alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="stack" style={{ flex: '1 1 520px', minWidth: 0, gap: 10 }}>
            <div className="eyebrow" style={{ color: 'inherit' }}>THE IDEATION ROUND</div>
            <div style={{ ...display, fontWeight: 700, fontSize: 'clamp(30px, 4vw, 52px)', lineHeight: 1.1 }}>RO 40,000 for 10%</div>
            <div style={{ fontSize: 18 }}>Post-money RO 400,000 · six months · five measurable goals · a prototype that earns from paying exporters in the first months.</div>
          </div>
          <Link to={paths.investorCase} className="btn btn--ocean" style={{ minHeight: 50, padding: '0 24px' }}>Open the investor case →</Link>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${c.line}` }}>
        <div className="container row muted" style={{ paddingTop: 24, paddingBottom: 24, gap: '12px 24px', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
          <img src={mark} alt="Trace mark" style={{ height: 28, width: 'auto' }} />
          <span style={{ flex: '1 1 400px' }}>Market and financial figures from the Trace/أثر proposal (October 2026); financials are illustrative planning assumptions in the optimistic case. Lots, names and prices on operating screens are demo data.</span>
        </div>
      </footer>
    </div>
  )
}

function RuleCard({ code, bg, fg, title, text }: { code: string; bg: string; fg: string; title: string; text: string }) {
  return (
    <div className="card" style={{ padding: 22, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ ...display, flex: 'none', background: bg, color: fg, fontWeight: 700, borderRadius: 12, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{code}</div>
      <div>
        <div style={{ fontWeight: 600, color: c.ocean }}>{title}</div>
        <div className="muted" style={{ fontSize: 15 }}>{text}</div>
      </div>
    </div>
  )
}

function Legend({ swatch, children }: { swatch: CSSProperties; children: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span className="swatch" style={swatch} />
      {children}
    </span>
  )
}
