import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { TracedSeal } from '../../components/Brand'
import { c, display } from '../../tokens'
import { mod } from '../nav'
import { boatOf, FEES, fmtTime, kgFmt, ro, type Grade } from '../store'
import { useStore } from '../StoreContext'
import { Badge, Empty, Kpi, LotLink, Notice, Page, Panel } from '../ui'
import { BarRow } from '../../components/ui'

const CHECKS = ['Core temperature at or below 4 °C', 'Bled and iced on board', 'Eyes clear, gills red', 'Flesh firm, no gaping', 'Label matches lot']
const GRADES: [Grade, string][] = [['A', 'Sashimi / premium'], ['B', 'Fresh'], ['C', 'Processing']]

/* ------------------------------------------------------------------ M2 */
export function QualityCheck() {
  const { state, run } = useStore()
  const [params, setParams] = useSearchParams()
  const queue = state.lots.filter((l) => l.status === 'registered')
  const selectedId = params.get('lot') && queue.some((l) => l.id === params.get('lot')) ? params.get('lot')! : queue[0]?.id
  const lot = queue.find((l) => l.id === selectedId)
  const [checks, setChecks] = useState<boolean[]>(CHECKS.map(() => false))
  const [grade, setGrade] = useState<Grade>('A')
  const [photos, setPhotos] = useState(0)
  const [done, setDone] = useState<string | null>(null)

  const select = (id: string) => {
    setParams({ lot: id }, { replace: true })
    setChecks(CHECKS.map(() => false))
    setPhotos(0)
    setGrade('A')
    setDone(null)
  }
  // Risk-based sampling: more fish → more samples; a flag on the lot doubles the sample.
  const fish = lot ? Math.max(3, Math.round(lot.kg / ({ 'Yellowfin tuna': 22, Kingfish: 6, Lobster: 0.8, Squid: 0.4, Sardine: 0.05 }[lot.species] ?? 5))) : 0
  const risky = lot ? !lot.inZone || lot.bycatch === 'No bycatch record' || lot.gear === 'Gillnet' : false
  const sample = Math.min(fish, Math.ceil(Math.sqrt(fish)) * (risky ? 2 : 1))
  const ready = checks.every(Boolean) && photos >= 3
  const verified = done ? state.lots.find((l) => l.id === done) : undefined
  const recent = state.lots.filter((l) => l.grade).slice(-6).reverse()

  return (
    <Page code="M2" title="Quality check and evidence" lead="Trace quality officers sample each lot on a risk basis, photograph it and grade it. A passed lot is marked Trace Verified — private assurance that speeds up official certification, not an official inspection.">
      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <Panel title={`Queue · ${queue.length}`} style={{ flex: '1 1 260px' }}>
          {queue.length ? queue.map((l) => (
            <button key={l.id} type="button" className="list-btn" aria-pressed={l.id === selectedId && !done} onClick={() => select(l.id)}>
              <span className="stack"><b>{l.id}</b><span className="muted" style={{ fontSize: 12 }}>{l.species} · {kgFmt(l.kg)} · {l.site}</span></span>
              {(!l.inZone || l.bycatch === 'No bycatch record') && <Badge tone="warn">Risk</Badge>}
            </button>
          )) : <Empty>Nothing waiting. Register a lot in <Link to={mod('M1').path}>M1</Link>.</Empty>}
        </Panel>

        <div className="stack" style={{ flex: '999 1 520px', gap: 20, minWidth: 0 }}>
          {verified ? (
            <Panel title="Lot Trace Verified">
              <div className="row" style={{ gap: 20, alignItems: 'center' }}>
                <TracedSeal size={120} />
                <div className="stack" style={{ gap: 6, fontSize: 14 }}>
                  <span style={{ ...display, fontWeight: 700, fontSize: 18 }}>{verified.id}</span>
                  <span>Grade {verified.grade} · 5 of 5 checks · 3 photos · officer Q-014</span>
                  <span className="muted">EPCIS inspection event logged. Verified mark licence: {ro(FEES.markPerKg)}/kg.</span>
                  <Link to={mod('M6').path} className="btn btn--ocean btn--sm" style={{ alignSelf: 'flex-start' }}>List it on the marketplace →</Link>
                </div>
              </div>
            </Panel>
          ) : lot ? (
            <Panel title={`Checking ${lot.id}`} aside={<Badge tone={risky ? 'warn' : 'neutral'}>Sample {sample} of {fish}{risky ? ' · raised risk' : ''}</Badge>}>
              <div className="muted" style={{ fontSize: 14 }}>
                {lot.species} · {kgFmt(lot.kg)} · {lot.gear} · {boatOf(state, lot.boatId).name} · landed {fmtTime(lot.landedAt)}
              </div>
              {risky && <Notice tone="warn">Sample doubled: {[!lot.inZone && 'boat failed the permitted-area check', lot.gear === 'Gillnet' && 'gillnet catch', lot.bycatch === 'No bycatch record' && 'no bycatch record'].filter(Boolean).join(', ')}.</Notice>}
              <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
                <legend className="field__label" style={{ fontSize: 14, marginBottom: 6 }}>Checks</legend>
                {CHECKS.map((label, i) => (
                  <label key={label} className="check">
                    <input type="checkbox" checked={checks[i]} onChange={() => setChecks(checks.map((v, k) => (k === i ? !v : v)))} />
                    {label}
                  </label>
                ))}
              </fieldset>
              <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                <button type="button" className="btn btn--ghost btn--sm" disabled={photos >= 3} onClick={() => setPhotos(photos + 1)}>Take photo</button>
                <span className="muted" style={{ fontSize: 14 }}>{photos} of 3 photos attached</span>
              </div>
              <div role="radiogroup" aria-label="Grade" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                {GRADES.map(([g, sub]) => (
                  <button key={g} type="button" role="radio" aria-checked={grade === g} onClick={() => setGrade(g)} className="toggle stack" style={{ borderRadius: 14, minHeight: 68, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <span style={{ ...display, fontWeight: 700, fontSize: 22 }}>{g}</span>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{sub}</span>
                  </button>
                ))}
              </div>
              <button type="button" className="btn btn--amber" disabled={!ready} onClick={() => { run('verifyLot', { id: lot.id, grade, checks: 5 }); setDone(lot.id) }}>
                {ready ? 'Mark Trace Verified' : 'Complete all checks and 3 photos'}
              </button>
            </Panel>
          ) : (
            <Panel title="No lot selected"><Empty>Choose a lot from the queue.</Empty></Panel>
          )}
          <Panel title="Recently verified">
            {recent.map((l) => (
              <div key={l.id} className="kv" style={{ fontSize: 14, borderBottom: `1px solid ${c.line}`, paddingBottom: 8 }}>
                <span><LotLink id={l.id} /> <span className="muted">· {l.species}</span></span>
                <Badge tone={l.grade === 'A' ? 'gold' : 'neutral'}>Grade {l.grade}</Badge>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </Page>
  )
}

/* ------------------------------------------------------------------ M8 */
const STANDARDS: [string, string, string, string][] = [
  ['Yellowfin tuna', 'Bled and iced within 30 min; core ≤ 2 °C; bright red flesh, no gaping', 'Iced within 2 h; core ≤ 4 °C; firm flesh', 'Late icing or bruising; for canning and processing'],
  ['Kingfish', 'Whole, iced on board; clear eyes, red gills; no belly burst', 'Iced on landing; minor scale loss', 'Soft texture; for processing'],
  ['Lobster', 'Live or chilled same day; full set of limbs; no soft shell', 'Chilled; up to one limb missing', 'Weak or damaged; for tails only'],
]
const TRAINING = [
  { id: 'T1', title: 'Handline tuna handling (IPNLF method)', where: 'Masirah', when: '18 Nov' },
  { id: 'T2', title: 'On-board icing and bleeding', where: 'Duqm', when: '24 Nov' },
  { id: 'T3', title: 'Live lobster storage', where: 'Masirah', when: '2 Dec' },
]

export function Grading() {
  const { state } = useStore()
  const [enrolled, setEnrolled] = useState<Record<string, number>>({ T1: 4 })
  const graded = state.lots.filter((l) => l.grade)
  const kgBy = (g: Grade) => graded.filter((l) => l.grade === g).reduce((n, l) => n + l.kg, 0)
  const total = graded.reduce((n, l) => n + l.kg, 0) || 1
  const premiumKg = kgBy('A')
  const premium = (sp: string, g: Grade) => {
    const xs = state.lots.filter((l) => l.species === sp && l.grade === g && l.price)
    return xs.length ? xs.reduce((n, l) => n + l.price!, 0) / xs.length : undefined
  }

  return (
    <Page code="M8" title="Premium grading and Trace Verified mark" lead="Grading standards and training for tuna, kingfish and lobster, and the private Trace Verified quality mark that lets better-handled fish sell — and get paid — as premium.">
      <div className="grid-auto" style={{ ['--min' as string]: '190px', gap: 12 }}>
        <Kpi label="Lots graded" value={graded.length} note={kgFmt(total)} />
        <Kpi label="Grade A share" value={`${Math.round((premiumKg / total) * 100)}%`} note="by weight" />
        <Kpi label="Mark licence income" value={ro(premiumKg * FEES.markPerKg)} note={`${ro(FEES.markPerKg)} per kg of grade A`} dark />
      </div>
      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <Panel title="Grade distribution" style={{ flex: '1 1 360px' }}>
          {(['A', 'B', 'C'] as Grade[]).map((g) => (
            <BarRow key={g} label={`Grade ${g}`} value={kgFmt(kgBy(g))} pct={Math.round((kgBy(g) / total) * 100)} color={g === 'A' ? c.amber : c.harbour} labelWidth={80} valueWidth={90} />
          ))}
          <div className="table-scroll">
            <table className="table table--compact">
              <thead><tr><th scope="col">Species</th><th scope="col">Avg price A</th><th scope="col">Avg price B</th></tr></thead>
              <tbody>
                {STANDARDS.map(([sp]) => {
                  const a = premium(sp, 'A')
                  const b = premium(sp, 'B')
                  return <tr key={sp}><td>{sp}</td><td>{a ? `${ro(a)}/kg` : '—'}</td><td>{b ? `${ro(b)}/kg` : '—'}</td></tr>
                })}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Training programme" style={{ flex: '1 1 360px' }}>
          {TRAINING.map((t) => (
            <div key={t.id} className="kv" style={{ alignItems: 'center', borderBottom: `1px solid ${c.line}`, paddingBottom: 10, fontSize: 14 }}>
              <span className="stack"><b>{t.title}</b><span className="muted">{t.where} · {t.when} · {enrolled[t.id] ?? 0} crews enrolled</span></span>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEnrolled({ ...enrolled, [t.id]: (enrolled[t.id] ?? 0) + 1 })}>Enrol a crew</button>
            </div>
          ))}
          <p className="muted" style={{ fontSize: 13 }}>In a 10-day IPNLF and Seafood Souq training with four Omani handline crews, about 14% of yellowfin reached grade A through better handling.</p>
        </Panel>
      </div>
      <Panel title="Grading standards">
        <div className="table-scroll">
          <table className="table">
            <thead><tr><th scope="col">Species</th><th scope="col">Grade A</th><th scope="col">Grade B</th><th scope="col">Grade C</th></tr></thead>
            <tbody>{STANDARDS.map((r) => <tr key={r[0]}>{r.map((x, i) => <td key={i} style={i === 0 ? { fontWeight: 600 } : undefined}>{x}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </Panel>
    </Page>
  )
}
