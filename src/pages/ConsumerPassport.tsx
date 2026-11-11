import { useState } from 'react'
import mark from '../assets/mark.svg'
import seal from '../assets/seal-traced.svg'
import PhoneFrame from '../components/PhoneFrame'
import { c, display } from '../tokens'

const STAGES = [
  { when: '8 NOV · 06:10', title: 'Caught at sea', text: 'Handline, Arabian Sea coastal waters, boat Al Najm. The licence was checked at landing.' },
  { when: '8 NOV · 09:30', title: 'Landed and verified', text: 'Weighed at the Duqm collection centre; graded A by an STH quality officer with photo evidence.' },
  { when: '8 NOV · 14:05', title: 'Processed', text: 'Loined at a certified plant in Duqm. Digital HACCP records linked to this lot.' },
  { when: '9 NOV · 22:40', title: 'Exported', text: 'Catch certificate signed by MAFWR; cleared through Bayan at Muscat International Airport.' },
  { when: '10 NOV', title: 'On your plate', text: 'Received by the restaurant within 4 °C. The trace ends here — with you.' },
]
const LAST = STAGES.length - 1

export default function ConsumerPassport() {
  const [index, setIndex] = useState(1)
  const cur = STAGES[index]

  return (
    <PhoneFrame>
      <div className="slab" style={{ padding: '22px 20px 20px', display: 'flex', gap: 14, alignItems: 'center' }}>
        <img src={seal} alt="STH Traced seal" style={{ width: 84, height: 84, flex: 'none', objectFit: 'contain' }} />
        <div className="stack" style={{ gap: 4, minWidth: 0 }}>
          <div lang="ar" dir="rtl" className="arabic" style={{ fontWeight: 600, fontSize: 20, textAlign: 'left' }}>اعرف مصدر سمكك</div>
          <div style={{ fontSize: 15, color: c.onOcean }}>Know where your fish comes from</div>
          <div style={{ fontSize: 12, color: c.mist }}>Lot OM-DQM-26-11-0042 · scanned at table</div>
        </div>
      </div>

      <div className="phone__body" style={{ padding: '18px 20px', gap: 14 }}>
        <div style={{ ...display, fontWeight: 600, fontSize: 22 }}>Yellowfin tuna, handline-caught</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          <div className="card" style={{ padding: 14 }}>
            <div className="muted" style={{ fontSize: 12 }}>Origin</div>
            <div style={{ ...display, fontWeight: 700, fontSize: 22, lineHeight: 1.15 }}>Duqm</div>
            <div className="muted" style={{ fontSize: 13 }}>Al Wusta, Oman</div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <div className="muted" style={{ fontSize: 12 }}>Caught</div>
            <div style={{ ...display, fontWeight: 700, fontSize: 22, lineHeight: 1.15, color: c.accent }}>8 Nov</div>
            <div className="muted" style={{ fontSize: 13 }}>2026 · 06:10</div>
          </div>
          <div className="card" style={{ padding: 14, gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div className="muted" style={{ fontSize: 12 }}>Cold chain</div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>0–4 °C all the way · no breaks</div>
            </div>
            <svg width="120" height="40" viewBox="0 0 120 40" aria-hidden="true">
              <rect x="0" y="8" width="120" height="22" rx="4" fill={c.sand} />
              <path d="M2 22 L14 20 L26 23 L38 18 L50 21 L62 19 L74 22 L86 17 L98 20 L110 19 L118 21" fill="none" stroke={c.harbour} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div style={{ fontWeight: 600, fontSize: 16 }}>Its journey</div>
        <div role="group" aria-label="Journey stages" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '0 6px', flex: 'none' }}>
          <span style={{ position: 'absolute', left: 22, right: 22, top: '50%', height: 4, marginTop: -2, background: c.harbourLight, borderRadius: 999 }} />
          {STAGES.map((s, k) => {
            const on = k === index
            const gold = k === LAST
            return (
              <button
                key={s.title}
                type="button"
                onClick={() => setIndex(k)}
                aria-label={s.title}
                aria-pressed={on}
                style={{ ...display, position: 'relative', width: 44, height: 44, borderRadius: 999, border: `4px solid ${gold ? c.amber : k <= index ? c.ocean : c.mist}`, background: on ? (gold ? c.amber : c.ocean) : c.card, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: on && !gold ? c.sand : c.ocean }}
              >
                {k + 1}
              </button>
            )
          })}
        </div>
        <div className="card stack" aria-live="polite" style={{ padding: 16, gap: 6, minHeight: 128, flex: 'none' }}>
          <div className="eyebrow eyebrow--sm">{cur.when}</div>
          <div style={{ ...display, fontWeight: 600, fontSize: 18 }}>{cur.title}</div>
          <div style={{ fontSize: 14, color: c.body }}>{cur.text}</div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Grade A', 'Licensed fisher', 'EU catch certificate signed'].map((p) => (
            <span key={p} className="pill pill--card" style={{ padding: '5px 10px' }}>{p}</span>
          ))}
        </div>
      </div>

      <div className="phone__footer muted" style={{ padding: '12px 20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, fontSize: 12 }}>
        <img src={mark} alt="STH" style={{ height: 24, width: 'auto' }} />
        <span>Every catch, traced. · Demo passport</span>
      </div>
    </PhoneFrame>
  )
}
