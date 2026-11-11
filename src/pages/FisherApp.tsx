import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import appIcon from '../assets/app-icon.svg'
import PhoneFrame from '../components/PhoneFrame'
import { c, display } from '../tokens'
import { paths } from '../routes'

const COPY = {
  ar: {
    hello: 'صباح الخير', name: 'سالم البلوشي', switch: 'EN', switchLabel: 'Switch to English',
    paidToday: 'مدفوعات اليوم', sameDay: 'في نفس اليوم', paidNote: 'من البنك الشريك · لا رسوم على الصياد',
    prices: 'أسعار اليوم', pricesSite: 'الدقم · لكل كجم', myLots: 'دفعاتي',
    sea: 'البحر الآن', seaVal: 'رياح ١٢ عقدة · موج ٠٫٨ م', sosNote: 'خدمة مساندة', navLabel: 'التنقل',
    voiceIdle: 'سجّل صيدك بصوتك', voiceIdleSub: 'اضغط وتكلّم بالعربية', voiceOn: 'أستمع…', voiceOnSub: '«٤٠ كيلو كنعد، خيط، رأس مدركة»',
    species: ['تونة صفراء الزعانف', 'كنعد', 'حبّار'],
    lots: [['تونة · ٤١٢ كجم', 'مُباع · موثّق'], ['كنعد · ٩٦ كجم', 'قيد الفحص']],
    tabs: ['الرئيسية', 'تسجيل', 'السوق', 'جوازي'],
  },
  en: {
    hello: 'Good morning', name: 'Salim Al Balushi', switch: 'ع', switchLabel: 'التبديل إلى العربية',
    paidToday: 'Paid today', sameDay: 'Same day', paidNote: 'From the partner bank · no fees for fishers',
    prices: "Today's prices", pricesSite: 'Duqm · per kg', myLots: 'My lots',
    sea: 'Sea now', seaVal: 'Wind 12 kn · waves 0.8 m', sosNote: 'Supplementary', navLabel: 'Navigation',
    voiceIdle: 'Log your catch by voice', voiceIdleSub: 'Tap and speak in Arabic', voiceOn: 'Listening…', voiceOnSub: '"40 kilo kingfish, handline, Ras Madrakah"',
    species: ['Yellowfin tuna', 'Kingfish', 'Squid'],
    lots: [['Tuna · 412 kg', 'Sold · Verified'], ['Kingfish · 96 kg', 'In check']],
    tabs: ['Home', 'Register', 'Market', 'Passport'],
  },
}

const PRICES = [
  { trend: '▲ 4%', up: true, price: 'RO 1.950' },
  { trend: '▲ 2%', up: true, price: 'RO 2.400' },
  { trend: '▼ 1%', up: false, price: 'RO 1.300' },
]
const LOTS = [
  { id: 'OM-DQM-26-11-0042', dot: c.amber },
  { id: 'OM-DQM-26-11-0047', dot: c.harbour },
]
const TAB_PATHS = [paths.fisher, paths.lotRegistration, paths.marketplace, paths.passport]

export default function FisherApp() {
  const [arabic, setArabic] = useState(true)
  const [listening, setListening] = useState(false)
  const t = arabic ? COPY.ar : COPY.en

  return (
    <PhoneFrame dir={arabic ? 'rtl' : 'ltr'} lang={arabic ? 'ar' : 'en'} style={{ fontFamily: arabic ? 'var(--font-arabic)' : 'var(--font-text)' }}>
      <div className="slab stack" style={{ padding: '22px 20px 26px', gap: 18, borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={appIcon} alt="" style={{ width: 40, height: 40, borderRadius: 10 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: c.mist }}>{t.hello}</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{t.name}</div>
          </div>
          <button type="button" onClick={() => setArabic(!arabic)} aria-label={t.switchLabel} className="btn btn--outline-light" style={{ minWidth: 52, minHeight: 44, padding: 0, fontSize: 15 }}>
            {t.switch}
          </button>
        </div>
        <div className="stack" style={{ background: c.slab, borderRadius: 16, padding: 16, gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, color: c.onOcean }}>{t.paidToday}</span>
            <span className="pill pill--amber" style={{ padding: '3px 9px' }}>{t.sameDay}</span>
          </div>
          <div dir="ltr" style={{ ...display, fontWeight: 700, fontSize: 34, color: c.amber, textAlign: arabic ? 'right' : 'left' }}>RO 186.400</div>
          <div style={{ fontSize: 13, color: c.mist }}>{t.paidNote}</div>
        </div>
      </div>

      <div className="phone__body" style={{ padding: '18px 20px 0', gap: 16 }}>
        <button
          type="button"
          aria-pressed={listening}
          onClick={() => setListening(!listening)}
          className="card"
          style={{ textAlign: 'start', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, minHeight: 72, flex: 'none' }}
        >
          <span style={{ flex: 'none', width: 48, height: 48, borderRadius: 999, background: listening ? c.amber : c.ocean, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={listening ? c.ocean : c.sand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0" />
              <path d="M12 18v3" />
            </svg>
          </span>
          <span className="stack" style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <span style={{ fontWeight: 600, fontSize: 16, color: c.ocean }}>{listening ? t.voiceOn : t.voiceIdle}</span>
            <span className="muted" style={{ fontSize: 13 }}>{listening ? t.voiceOnSub : t.voiceIdleSub}</span>
          </span>
        </button>

        <div className="stack" style={{ gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 600, fontSize: 16 }}>{t.prices}</span>
            <span className="muted" style={{ fontSize: 12 }}>{t.pricesSite}</span>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {PRICES.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderBottom: i < PRICES.length - 1 ? `1px solid ${c.line}` : undefined }}>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{t.species[i]}</span>
                <span dir="ltr" style={{ fontSize: 13, fontWeight: 600, color: p.up ? c.link : c.accent }}>{p.trend}</span>
                <span dir="ltr" style={{ ...display, fontWeight: 600, fontSize: 15, minWidth: 86, textAlign: arabic ? 'left' : 'right' }}>{p.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stack" style={{ gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>{t.myLots}</span>
          {LOTS.map((l, i) => (
            <div key={l.id} className="card" style={{ borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ flex: 'none', width: 10, height: 10, borderRadius: 999, background: l.dot }} />
              <span className="stack" style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 500 }}>{t.lots[i][0]}</span>
                <span dir="ltr" className="muted" style={{ fontSize: 12, textAlign: arabic ? 'right' : 'left' }}>{l.id}</span>
              </span>
              <span className="pill">{t.lots[i][1]}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, paddingBottom: 12 }}>
          <div className="card" style={{ borderRadius: 14, padding: '12px 14px' }}>
            <div className="muted" style={{ fontSize: 12 }}>{t.sea}</div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{t.seaVal}</div>
          </div>
          <button type="button" className="stack" style={{ border: '2px solid var(--danger)', background: c.card, color: 'var(--danger-text)', borderRadius: 14, padding: '12px 14px', fontWeight: 700, fontSize: 15, minHeight: 60, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span>SOS</span>
            <span className="muted" style={{ fontSize: 11, fontWeight: 500 }}>{t.sosNote}</span>
          </button>
        </div>
      </div>

      <nav aria-label={t.navLabel} className="phone__footer" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', padding: '8px 6px 18px' }}>
        {t.tabs.map((label, i) => (
          <NavLink
            key={label}
            to={TAB_PATHS[i]}
            end
            className="stack"
            style={({ isActive }) => ({ textDecoration: 'none', alignItems: 'center', gap: 4, minHeight: 48, justifyContent: 'center', color: isActive ? c.ocean : c.muted, fontSize: 12, fontWeight: 600 })}
          >
            {({ isActive }) => (
              <>
                <span style={{ width: 22, height: 4, borderRadius: 999, background: isActive ? c.amber : 'transparent' }} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </PhoneFrame>
  )
}
