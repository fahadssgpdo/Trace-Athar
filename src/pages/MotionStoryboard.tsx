import { useState } from 'react'
import { Link } from 'react-router-dom'
import logoOnDark from '../assets/logo-on-dark.svg'
import { c, display } from '../tokens'
import { paths } from '../routes'

const ACTS = [
  { label: 'Act 1 · The hook', color: c.amber, fg: c.ocean },
  { label: 'Act 2 · Broken chain, one record', color: c.harbourLight, fg: c.ocean },
  { label: 'Act 3 · The product', color: c.harbour, fg: c.card },
  { label: 'Act 4 · The case and the ask', color: c.sand, fg: c.ocean },
]

type Ground = 'ocean' | 'sand' | 'amber'
const GROUNDS: Record<Ground, { bg: string; fg: string; line: string }> = {
  ocean: { bg: c.ocean, fg: c.sand, line: c.harbourLight },
  sand: { bg: c.sand, fg: c.ocean, line: c.harbour },
  amber: { bg: c.amber, fg: c.ocean, line: c.harbour },
}

type Scene = {
  a: number
  dur: number
  kind: 'type' | 'phone' | 'web'
  ground: Ground
  title: string
  big?: string
  ar?: string
  screen?: string
  to?: string
  visual: string
  motion: string
  vo: string
  sound: string
}

const SCENES: Scene[] = [
  { a: 0, dur: 6, kind: 'type', ground: 'ocean', title: 'Dawn at the landing site', big: 'Every catch, traced.', ar: 'لكلّ صيدٍ أثر', visual: 'Real footage: an artisanal boat nosing into Duqm at first light, hands lifting a yellowfin onto ice. Title locks up over the water.', motion: 'The trace line draws from the open ring at the boat to the gold dot as the title resolves. Arabic wipes right-to-left, English left-to-right, same size.', vo: 'Oman landed nearly eight hundred thousand tonnes of fish in 2025.', sound: 'Harbour ambience, gulls, a low pad. One soft marimba note on the gold dot.' },
  { a: 0, dur: 7, kind: 'type', ground: 'sand', title: 'The scale of the sector', big: '798,615 t · RO 576M', ar: '٩٠٪ من القوارب الحرفية', visual: 'Three figures on Sand: 798,615 t landed, RO 576 million value, about 90% from artisanal boats.', motion: 'Numbers count up in Sora over 800 ms each, staggered 200 ms; units fade in after the count settles.', vo: 'Worth five hundred and seventy-six million rials — ninety percent of it from small boats.', sound: 'Ticks under the count-up, ending on a clean stop.' },
  { a: 0, dur: 7, kind: 'type', ground: 'ocean', title: 'The markets change the rules', big: 'US 10% → <1%', ar: 'الأسواق تطلب الدليل', visual: 'A bar for the US share of exports shrinks from 10% (2020) to under 1% (2024). Two date stamps land: EU CATCH, 10 Jan 2026; US MMPA, 1 Jan 2026.', motion: 'Bar contracts with an ease-in; stamps drop in with a 4 px settle, no bounce.', vo: 'But the markets that pay most now demand digital proof — lot by lot.', sound: 'Pad drops a fifth; two muted stamp hits.' },
  { a: 1, dur: 7, kind: 'type', ground: 'sand', title: 'Where the proof gets lost', big: 'Landing · Sale · Plant · Export', ar: 'السلسلة تنقطع', visual: 'Six step labels in a row — landing, inspection, first sale, processing, export, buyer — joined by a line that breaks between each.', motion: 'The line snaps at each step in sequence; paper sheets slide out of frame. Keep it calm, not dramatic.', vo: 'Today that proof is lost between the boat and the buyer — on paper, re-keyed, broken.', sound: 'Six dry paper sounds, one per break.' },
  { a: 1, dur: 8, kind: 'type', ground: 'ocean', title: 'One record, sea to market', big: 'Trace · أثر', ar: 'سجلّ واحد من البحر إلى السوق', visual: 'The broken line heals into one trace line through P1 to P6; the Trace logo resolves from the line.', motion: 'Line redraws left to right through six nodes (120 ms each), then contracts into the S-shaped mark. Logo holds 1.5 s.', vo: 'Trace gives every lot one verified record — from first receipt to the export document.', sound: 'Rising marimba run, one note per node.' },
  { a: 2, dur: 7, kind: 'phone', ground: 'sand', title: 'The fisher speaks, in Arabic', screen: '01 Fisher app', to: paths.fisher, visual: 'Phone screen 01: the fisher taps the mic, the voice line appears, today’s payment card shows RO 186.400 paid the same day.', motion: 'Device slides up 24 px with a 300 ms fade. Amber tap ripple on the mic; waveform pulses; payment number counts up.', vo: 'For fishers it is free, in Arabic, by voice — and they are paid the same day.', sound: 'Short Arabic voice sample; soft confirm chime.' },
  { a: 2, dur: 8, kind: 'phone', ground: 'ocean', title: 'A lot is born at first receipt', screen: '02 Lot registration', to: paths.lotRegistration, visual: 'Screen 02: licence check ticks, the scale reads 412.0 kg, the QR label assembles, lot ID OM-DQM-26-11-0051.', motion: 'Stepper advances on cuts; the QR builds cell by cell from the three finder squares outwards in 600 ms.', vo: 'At the landing site, the first receiver creates the lot: licence checked, weighed, photographed, located.', sound: 'Scale beep; quick digital ticks as the QR builds.' },
  { a: 2, dur: 5, kind: 'phone', ground: 'sand', title: 'Graded and verified', screen: '03 Quality check', to: paths.qualityCheck, visual: 'Screen 03: checks tick through, grade A is chosen, the Traced seal stamps onto the screen.', motion: 'Checklist ticks at 120 ms intervals; seal scales from 92% to 100% with a 200 ms settle.', vo: 'Quality officers grade it with photo evidence. Now it can sell as premium.', sound: 'Five light ticks, then the seal note.' },
  { a: 2, dur: 6, kind: 'web', ground: 'ocean', title: 'Sold remotely, paid today', screen: '04 Marketplace', to: paths.marketplace, visual: 'Screen 04: a buyer bids on the tuna lot; the fee panel shows the buyer paying 1.0% and 0.25%; “Fisher receives today · 100%”.', motion: 'Bid price ticks up twice; the 100% line pulses once in amber.', vo: 'Buyers bid from anywhere. They pay the fees. The fisher keeps every baisa.', sound: 'Two auction ticks; warm confirm.' },
  { a: 2, dur: 5, kind: 'web', ground: 'sand', title: 'Many small lots, one chain', screen: '05 Plant & cold chain', to: paths.plant, visual: 'Screen 05: six source lots flow into two processed lots and on to two shipments; the temperature line draws under 4 °C.', motion: 'Selected path lights up left to right; the temperature line draws in 900 ms.', vo: 'Through the plant, every cut and merge stays linked to the boats it came from.', sound: 'Cold, airy tone under the line draw.' },
  { a: 2, dur: 8, kind: 'web', ground: 'ocean', title: 'Trace prepares. MAFWR signs. Customs clears.', screen: '06 Export document hub', to: paths.exportDocs, visual: 'Screen 06: the seven-step tracker advances; the MAFWR step turns from dashed to solid as it is signed; Bayan returns the release.', motion: 'Each step fills in 250 ms; dashed government rings resolve to solid; final dot turns gold.', vo: 'Trace builds the export pack and sends it to MAFWR to sign, and to Bayan for release — in hours, not days.', sound: 'A soft stamp on the signature; the release note matches scene 1.' },
  { a: 2, dur: 5, kind: 'phone', ground: 'sand', title: 'The guest scans the menu', screen: '10 Consumer passport', to: paths.passport, visual: 'Screen 10: a diner in a GCC hotel scans the QR; the journey dots light up from sea to plate.', motion: 'Five dots light in sequence, the last one gold; header text crossfades AR/EN.', vo: 'And at the table, anyone can see where their fish came from.', sound: 'Restaurant murmur; final gold-dot note.' },
  { a: 3, dur: 7, kind: 'web', ground: 'ocean', title: 'A business that pays its way', screen: '11 Investor case · revenue', to: paths.investorCase, visual: 'The five-year chart grows; eleven revenue streams stack up; callouts: RO 3.0M in Year 5, profit in Year 3, payback in Year 4.', motion: 'Bars rise year by year in 150 ms steps; the cumulative cash line draws through zero in Year 4 and the crossing gets the gold dot.', vo: 'Eleven revenue streams. Profit in year three. Repaid in year four.', sound: 'Pad lifts back to the root.' },
  { a: 3, dur: 9, kind: 'type', ground: 'amber', title: 'The ask', big: 'RO 40,000 for 10%', ar: 'لكلّ صيدٍ أثر', to: paths.investorCase, visual: 'Amber statement card, then the end card on Deep Ocean: logo, slogan in Arabic and English, “One record from sea to market”.', motion: 'Card wipes in along the trace line; end card holds 3 s; the gold dot is the last thing to settle.', vo: 'We are raising forty thousand rials to build it, prove it, and make every Omani catch count.', sound: 'Full marimba phrase resolves; silence on the logo.' },
]

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

// Derived per-scene labels: running number, timecode and thumbnail text.
const ALL = (() => {
  let t = 0
  return SCENES.map((s, i) => {
    const start = t
    t += s.dur
    return {
      ...s,
      i,
      n: String(i + 1).padStart(2, '0'),
      tc: `${fmtTime(start)}–${fmtTime(t)}`,
      thumb: s.kind === 'type' ? s.big : s.screen,
    }
  })
})()

const RULES = [
  ['The trace line is the transition', 'Every scene change is the line drawing from the open ring to the gold dot. No wipes, zooms or glitch effects.', '700 ms · cubic-bezier(0.65, 0, 0.35, 1)'],
  ['Amber means “done and verified”', 'Amber appears only on taps, the gold dot and confirmed outcomes — one amber moment per scene.', '60% Sand · 30% Deep Ocean · 10% Amber and Harbour'],
  ['Numbers count, then settle', 'Figures roll up in Sora and stop dead; units and sources fade in after. Every figure on screen comes from the proposal.', '800 ms count · 200 ms stagger'],
  ['Real screens, real taps', 'Product shots are recordings of this prototype in Play mode, framed in plain device outlines. Taps show as an amber ripple.', 'Record at 2× · 24 px slide-in · 300 ms fade'],
  ['Arabic and English as equals', 'Arabic wipes right-to-left, English left-to-right, always the same size. Bilingual captions burned in.', 'Readex Pro 600 · Sora 700'],
  ['Quiet, Omani, true', 'Real Omani harbours in early light; no stock tropical footage, no gradients, glows, 3D fish or blockchain cubes.', 'Per the Trace brand book'],
]

const FORMATS = [
  { name: '16:9 master · 1920 × 1080 · 95 s', text: 'Investor meetings, OTF Investors Hub pitch, website.', w: 48, h: 27 },
  { name: '9:16 cut · 1080 × 1920 · 30 s', text: 'Scenes 1, 5, 7, 11 and 14 for LinkedIn and Instagram stories.', w: 20, h: 36 },
  { name: '1:1 teaser · 1080 × 1080 · 15 s', text: 'Scenes 1, 5 and 14 — the line, the logo and the ask.', w: 32, h: 32 },
]

const TODO = [
  'Shoot dawn footage at a pilot landing site (Duqm or Sur) with the fisher’s consent',
  'Record voiceover in English and Arabic; native copywriter signs off all Arabic',
  'Screen-record screens 01–06, 10 and 11 from this prototype in Play mode',
  'Animate the trace line and logo build as one reusable After Effects or Lottie asset',
  'Compose a short marimba-and-pad score; licence harbour ambience',
  'Fact-check every on-screen figure against the final proposal before export',
]

const HERO_STATS = [
  ['95 s', 'master', true],
  ['14', 'scenes', false],
  ['3', 'formats', false],
] as const

const smallLabel = { fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: c.muted } as const

export default function MotionStoryboard() {
  const [index, setIndex] = useState(0)
  const [act, setAct] = useState(-1)
  const cur = ALL[index]
  const g = GROUNDS[cur.ground]
  const visible = act < 0 ? ALL : ALL.filter((s) => s.a === act)
  const step = (d: number) => setIndex((index + ALL.length + d) % ALL.length)

  return (
    <div style={{ fontSize: 16, lineHeight: 1.5 }}>
      <section className="slab">
        <div className="container container--wide stack" style={{ paddingTop: 24, paddingBottom: 48, gap: 32 }}>
          <nav aria-label="Storyboard" className="row nav-light" style={{ gap: '12px 24px', alignItems: 'center' }}>
            <img src={logoOnDark} alt="Trace" style={{ height: 36, width: 'auto', marginRight: 'auto' }} />
            <Link to={paths.overview}>← Overview</Link>
            <Link to={paths.investorCase}>Investor case</Link>
          </nav>
          <div className="row" style={{ gap: 32, alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div className="stack" style={{ flex: '1 1 620px', minWidth: 0, gap: 12 }}>
              <div className="eyebrow eyebrow--amber">MOTION GRAPHICS · PROPOSED STORYBOARD</div>
              <h1 style={{ ...display, fontWeight: 700, fontSize: 'clamp(32px, 4.4vw, 56px)', lineHeight: 1.1 }}>“Every catch, traced.” — a 95-second investor film</h1>
              <p style={{ fontSize: 18, color: c.onOcean, maxWidth: 680 }}>Four acts, fourteen scenes. Every product shot is a screen from this prototype, so the film and the live demo tell the same story. Choose a scene to see its direction.</p>
            </div>
            <div style={{ flex: '0 1 320px', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, textAlign: 'center' }}>
              {HERO_STATS.map(([v, l, hi]) => (
                <div key={l} style={{ background: c.slab, borderRadius: 14, padding: 12 }}>
                  <div style={{ ...display, fontWeight: 700, fontSize: 24, color: hi ? c.amber : undefined }}>{v}</div>
                  <div style={{ fontSize: 12, color: c.mist }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="stack" style={{ gap: 8 }}>
            <div role="group" aria-label="Timeline" style={{ display: 'flex', height: 40, gap: 3 }}>
              {ALL.map((s) => (
                <button
                  key={s.n}
                  type="button"
                  onClick={() => setIndex(s.i)}
                  aria-label={`Scene ${s.i + 1}: ${s.title}`}
                  aria-pressed={s.i === index}
                  style={{ ...display, flex: `${s.dur} 1 0`, minWidth: 0, border: `2px solid ${s.i === index ? c.amber : 'transparent'}`, borderRadius: 6, background: ACTS[s.a].color, padding: 0, fontWeight: 700, fontSize: 11, color: ACTS[s.a].fg, outlineOffset: 3 }}
                >
                  {s.n}
                </button>
              ))}
            </div>
            <div className="row" style={{ gap: '8px 20px' }}>
              {ACTS.map((a, k) => (
                <button
                  key={a.label}
                  type="button"
                  aria-pressed={act === k}
                  onClick={() => setAct(act === k ? -1 : k)}
                  style={{ background: 'transparent', border: 'none', color: c.sand, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 36, padding: 0, fontWeight: act === k ? 600 : 400 }}
                >
                  <span className="swatch" style={{ background: a.color, border: `1px solid ${c.mist}` }} />
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Selected scene */}
      <section className="container container--wide" style={{ paddingTop: 40, paddingBottom: 24 }}>
        <div className="card row" style={{ borderRadius: 24, padding: 24, gap: 28 }}>
          <div className="stack" style={{ flex: '1 1 460px', minWidth: 0, gap: 12 }}>
            <div style={{ aspectRatio: '16 / 9', borderRadius: 16, background: g.bg, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <svg viewBox="0 0 400 225" preserveAspectRatio="none" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <path d="M20 190 C 110 190, 110 70, 200 70 S 290 190, 380 60" fill="none" stroke={g.line} strokeWidth="4" strokeLinecap="round" opacity="0.6" />
                <circle cx="20" cy="190" r="9" fill="none" stroke={g.line} strokeWidth="4" opacity="0.6" />
                <circle cx="380" cy="60" r="10" fill={c.amber} />
              </svg>
              {cur.kind === 'phone' && (
                <div style={{ position: 'relative', width: '22%', aspectRatio: '9 / 19', borderRadius: 18, border: `4px solid ${c.ocean}`, background: c.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 11, fontWeight: 600, color: c.ocean, padding: 6 }}>{cur.screen}</div>
              )}
              {cur.kind === 'web' && (
                <div style={{ position: 'relative', width: '62%', aspectRatio: '16 / 10', borderRadius: 10, border: `4px solid ${c.ocean}`, background: c.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 13, fontWeight: 600, color: c.ocean, padding: 8 }}>{cur.screen}</div>
              )}
              {cur.kind === 'type' && (
                <div className="stack" style={{ position: 'relative', textAlign: 'center', gap: 4, maxWidth: '80%' }}>
                  <span style={{ ...display, fontWeight: 700, fontSize: 'clamp(20px, 2.6vw, 34px)', lineHeight: 1.15, color: g.fg }}>{cur.big}</span>
                  <span lang="ar" dir="rtl" className="arabic" style={{ fontWeight: 600, fontSize: 'clamp(16px, 2vw, 26px)', color: g.fg }}>{cur.ar}</span>
                </div>
              )}
              <span style={{ position: 'absolute', left: 12, top: 12, fontSize: 12, fontWeight: 700, background: c.amber, color: c.ocean, padding: '3px 9px', borderRadius: 999 }}>{cur.tc}</span>
            </div>
            <div className="row" style={{ gap: 10 }}>
              <button type="button" className="btn btn--ghost" style={{ padding: '0 18px' }} onClick={() => step(-1)}>← Previous</button>
              <button type="button" className="btn btn--ocean" style={{ padding: '0 18px' }} onClick={() => step(1)}>Next scene →</button>
              {cur.to && (
                <Link to={cur.to} className="btn btn--amber" style={{ marginLeft: 'auto', padding: '0 18px' }}>Open source screen</Link>
              )}
            </div>
          </div>
          <div className="stack" style={{ flex: '1 1 420px', minWidth: 0, gap: 14 }} aria-live="polite">
            <div className="eyebrow" style={{ letterSpacing: '0.12em' }}>SCENE {cur.n} · {ACTS[cur.a].label.split(' · ')[0]} · {cur.dur} s</div>
            <h2 style={{ ...display, fontWeight: 600, fontSize: 28, color: c.ocean }}>{cur.title}</h2>
            <div>
              <div style={smallLabel}>ON SCREEN</div>
              <div style={{ color: c.ocean }}>{cur.visual}</div>
            </div>
            <div>
              <div style={smallLabel}>MOTION</div>
              <div style={{ color: c.ocean }}>{cur.motion}</div>
            </div>
            <div className="stack" style={{ background: c.sand, borderRadius: 14, padding: '14px 16px', gap: 6 }}>
              <div style={smallLabel}>VOICEOVER</div>
              <div style={{ color: c.ocean, fontSize: 17 }}>“{cur.vo}”</div>
            </div>
            <div>
              <div style={smallLabel}>SOUND</div>
              <div style={{ color: c.ocean }}>{cur.sound}</div>
            </div>
          </div>
        </div>
      </section>

      {/* All scenes */}
      <section className="container container--wide stack" style={{ paddingTop: 24, paddingBottom: 24, gap: 16 }}>
        <h2 style={{ ...display, fontWeight: 600, fontSize: 26, color: c.ocean }}>All scenes{act < 0 ? '' : ` · ${ACTS[act].label}`}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
          {visible.map((s) => {
            const sg = GROUNDS[s.ground]
            return (
              <button
                key={s.n}
                type="button"
                onClick={() => setIndex(s.i)}
                aria-pressed={s.i === index}
                className="stack"
                style={{ textAlign: 'left', background: c.card, border: `2px solid ${s.i === index ? c.ocean : c.line}`, borderRadius: 16, padding: 12, gap: 10, color: c.ocean, fontSize: 'inherit' }}
              >
                <span style={{ ...display, aspectRatio: '16 / 9', width: '100%', borderRadius: 10, background: sg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10, textAlign: 'center', fontWeight: 700, fontSize: 15, lineHeight: 1.2, color: sg.fg }}>{s.thumb}</span>
                <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, fontWeight: 600 }}>
                  <span style={{ color: c.accent }}>{s.n} · {s.tc}</span>
                  <span className="muted">{s.dur} s</span>
                </span>
                <span style={{ fontWeight: 600, fontSize: 16 }}>{s.title}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Motion system */}
      <section className="container container--wide stack" style={{ paddingTop: 40, paddingBottom: 40, gap: 18 }}>
        <div className="stack" style={{ gap: 8 }}>
          <div className="eyebrow">MOTION SYSTEM</div>
          <h2 className="h-sub">One move carries the whole film: the trace line</h2>
        </div>
        <div className="grid-auto" style={{ ['--min' as string]: '260px', gap: 14 }}>
          {RULES.map(([name, text, spec]) => (
            <div key={name} className="card stack" style={{ padding: 18, gap: 6 }}>
              <span style={{ fontWeight: 600, color: c.ocean, fontSize: 17 }}>{name}</span>
              <span style={{ fontSize: 15 }}>{text}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: c.link }}>{spec}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Formats + production */}
      <section className="container container--wide row" style={{ paddingBottom: 64, gap: 20 }}>
        <div className="slab stack" style={{ flex: '1 1 460px', minWidth: 0, borderRadius: 20, padding: 24, gap: 12 }}>
          <h2 style={{ ...display, fontWeight: 600, fontSize: 22 }}>Formats</h2>
          {FORMATS.map((f) => (
            <div key={f.name} style={{ display: 'flex', gap: 14, alignItems: 'center', borderBottom: `1px solid ${c.lineDark}`, paddingBottom: 10 }}>
              <span style={{ flex: 'none', width: 48, display: 'flex', justifyContent: 'center' }}>
                <span style={{ width: f.w, height: f.h, border: `2px solid ${c.amber}`, borderRadius: 4 }} />
              </span>
              <span className="stack">
                <span style={{ fontWeight: 600 }}>{f.name}</span>
                <span style={{ fontSize: 14, color: c.onOcean }}>{f.text}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="panel stack" style={{ flex: '1 1 460px', minWidth: 0, padding: 24, gap: 10 }}>
          <h2 style={{ ...display, fontWeight: 600, fontSize: 22, color: c.ocean }}>To produce before animation</h2>
          {TODO.map((t) => (
            <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ flex: 'none', width: 18, height: 18, borderRadius: 5, border: `2px solid ${c.harbour}`, marginTop: 3 }} />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
