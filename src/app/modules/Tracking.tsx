import { useMemo, useState } from 'react'
import { c, display } from '../../tokens'
import {
  CLOSED_AREAS, COAST, COVERAGE_NM, MASIRAH, PLACES, closureAt, compass, distToShore, fmtPos, fmtTime,
  gearOverdue, inCoverage, inPermittedArea, KX, nearestShore, soakHours, type Boat, type GearAsset, type Pt,
} from '../store'
import { useStore } from '../StoreContext'
import { Badge, Empty, Field, LotLink, Notice, Page, Panel } from '../ui'

/* ------------------------------------------------------------------ copy */
type Lang = 'en' | 'ar'
const AR = {
  type: { Artisanal: 'حرفي', Coastal: 'ساحلي', Commercial: 'تجاري' } as Record<string, string>,
  tracker: { 'Phone GPS': 'تحديد موقع عبر الهاتف', 'Low-cost tracker': 'جهاز تتبّع منخفض التكلفة', 'VMS (MAFWR)': 'نظام مراقبة السفن (الوزارة)' } as Record<string, string>,
  gear: { Handline: 'خيط يدوي', Gillnet: 'شبكة خيشومية', Trap: 'قراقير', Jig: 'خطّاف حبّار', 'Purse seine': 'شبكة جيب' } as Record<string, string>,
  kind: { 'Trap string': 'سلسلة قراقير', 'Gillnet fleet': 'طقم شباك خيشومية', FAD: 'مجمّع أسماك' } as Record<string, string>,
  site: { Duqm: 'الدقم', Sur: 'صور', Masirah: 'مصيرة' } as Record<string, string>,
}

const COPY = {
  en: {
    title: 'Position and gear tracking',
    lead: 'Phone GPS for artisanal boats, low-cost trackers for untracked ones, and the optional yes/no permitted-area check from MAFWR vessel monitoring. Geofences flag a boat that enters a closed area, and every tagged trap string or net fleet is tracked from the moment it goes in the water.',
    advance: 'Advance one hour', map: 'Live positions', chart: 'WGS 84 · simplified chart',
    permitted: 'In permitted area', closed: 'Inside a closed area', closedArea: 'Closed area',
    territorial: '12 nm territorial sea', gearLabel: 'Tagged gear',
    alerts: 'Geofence and tracker alerts', noAlerts: 'No alerts. Advance the clock to run the fleet forward an hour.',
    vessel: 'Vessel', pick: 'Select a vessel on the chart or in the table below.',
    position: 'Position', course: 'Course', speed: 'Speed', offshore: 'Distance offshore', lastFix: 'Last fix',
    coverage: 'out of mobile coverage · fixes queued on the device', live: 'reporting every',
    minutes: 'min', kn: 'kn', nm: 'nm', hours: 'h', yes: 'Yes', no: 'No',
    type: 'Type', tracker: 'Tracker', gearOnRecord: 'Gear on record', area: 'Permitted area', lastLot: 'Last lot',
    records: 'Vessels and gear records', gearPanel: 'Tagged gear in the water',
    tag: 'Tag', kind: 'Gear', units: 'Units', set: 'Set', soak: 'Soak', status: 'Status',
    haul: 'Record haul', lost: 'Report lost', hauled: 'Hauled', reported: 'Reported lost',
    fishing: 'Fishing', overdue: 'Overdue · possible ghost gear', anchored: 'Anchored',
    setGear: 'Record new gear', from: 'Vessel', count: 'Units', add: 'Set gear at the vessel’s position',
    privacy: 'Raw positions stay with the vessel and the ministry. Buyers and the public passport only ever see the yes/no permitted-area answer and the landing site.',
    inside: (n: string[]) => `${n.join(', ')} ${n.length > 1 ? 'are' : 'is'} inside a closed area. Lots landed from ${n.length > 1 ? 'these boats' : 'this boat'} will carry a failed permitted-area check.`,
    ghost: (n: number) => `${n} tagged gear ${n > 1 ? 'items have' : 'item has'} been in the water past the 72-hour soak limit with no haul recorded.`,
    mapAlt: (b: number, o: number) => `Chart of the Al Wusta and Ash Sharqiyah coast with ${b} vessels, ${o} inside a closed area`,
    lang: 'ع', langLabel: 'التبديل إلى العربية',
  },
  ar: {
    title: 'تتبّع المواقع ومعدات الصيد',
    lead: 'تحديد الموقع عبر هاتف الصياد للقوارب الحرفية، وأجهزة تتبّع منخفضة التكلفة لغير المزوّدة بها، وفحص اختياري بنعم أو لا للمنطقة المسموحة من نظام مراقبة السفن بالوزارة. تُنبّه الحدود الجغرافية عند دخول أي قارب منطقة مغلقة، وتُتابَع كل معدّة موسومة منذ لحظة نزولها إلى الماء.',
    advance: 'تقديم ساعة واحدة', map: 'المواقع الحالية', chart: 'إحداثيات WGS 84 · خريطة مبسّطة',
    permitted: 'داخل المنطقة المسموحة', closed: 'داخل منطقة مغلقة', closedArea: 'منطقة مغلقة',
    territorial: 'حدّ المياه الإقليمية ١٢ ميلاً بحرياً', gearLabel: 'معدّات موسومة',
    alerts: 'تنبيهات الحدود الجغرافية والتتبّع', noAlerts: 'لا توجد تنبيهات. قدّم الساعة لتحريك الأسطول.',
    vessel: 'القارب', pick: 'اختر قارباً من الخريطة أو من الجدول أدناه.',
    position: 'الموقع', course: 'الاتجاه', speed: 'السرعة', offshore: 'البعد عن الساحل', lastFix: 'آخر تحديد موقع',
    coverage: 'خارج تغطية الشبكة · المواقع محفوظة على الجهاز', live: 'يُرسل كل',
    minutes: 'دقيقة', kn: 'عقدة', nm: 'ميل بحري', hours: 'ساعة', yes: 'نعم', no: 'لا',
    type: 'النوع', tracker: 'جهاز التتبّع', gearOnRecord: 'المعدّة المسجّلة', area: 'المنطقة المسموحة', lastLot: 'آخر دفعة',
    records: 'سجل القوارب والمعدات', gearPanel: 'المعدّات الموسومة في الماء',
    tag: 'الوسم', kind: 'المعدّة', units: 'العدد', set: 'النصب', soak: 'مدة الغمر', status: 'الحالة',
    haul: 'تسجيل الرفع', lost: 'الإبلاغ عن فقدها', hauled: 'مرفوعة', reported: 'مُبلّغ عن فقدها',
    fishing: 'في الماء', overdue: 'متأخرة · يُحتمل فقدانها', anchored: 'مثبّتة',
    setGear: 'تسجيل معدّة جديدة', from: 'القارب', count: 'العدد', add: 'تسجيل النصب عند موقع القارب',
    privacy: 'تبقى الإحداثيات الخام لدى القارب والوزارة. لا يرى المشتري ولا جواز المنتج سوى إجابة نعم أو لا عن المنطقة المسموحة، وموقع الإنزال.',
    inside: (n: string[]) => `${n.join('، ')} ${n.length > 1 ? 'داخل منطقة مغلقة' : 'داخل منطقة مغلقة'}. الدفعات المُنزَلة من ${n.length > 1 ? 'هذه القوارب' : 'هذا القارب'} ستحمل نتيجة فحص منطقة غير مجتازة.`,
    ghost: (n: number) => `${n} من المعدّات الموسومة تجاوزت حدّ الغمر ٧٢ ساعة دون تسجيل رفعها.`,
    mapAlt: (b: number, o: number) => `خريطة ساحل الوسطى والشرقية، وعليها ${b} قوارب، منها ${o} داخل منطقة مغلقة`,
    lang: 'EN', langLabel: 'Switch to English',
  },
} as const

/* ------------------------------------------------------------- projection */
const BOUNDS = { lon0: 56.9, lon1: 60.55, lat0: 18.55, lat1: 23.0 }
const MAP_W = 560
const MAP_H = Math.round((MAP_W * (BOUNDS.lat1 - BOUNDS.lat0)) / ((BOUNDS.lon1 - BOUNDS.lon0) * KX))
const px = (lon: number) => ((lon - BOUNDS.lon0) / (BOUNDS.lon1 - BOUNDS.lon0)) * MAP_W
const py = (lat: number) => ((BOUNDS.lat1 - lat) / (BOUNDS.lat1 - BOUNDS.lat0)) * MAP_H
const line = (pts: Pt[]) => pts.map(([lon, lat], i) => `${i ? 'L' : 'M'} ${px(lon).toFixed(1)} ${py(lat).toFixed(1)}`).join(' ')
const LAND = `${line(COAST)} L ${px(BOUNDS.lon0 - 0.4).toFixed(1)} ${py(BOUNDS.lat0 - 0.4).toFixed(1)} L ${px(BOUNDS.lon0 - 0.4).toFixed(1)} ${py(BOUNDS.lat1 + 0.4).toFixed(1)} Z`
const ISLAND = `${line(MASIRAH)} Z`

/** The 12 nm territorial-sea line, offset seaward from each coast vertex. */
const TERRITORIAL = (() => {
  const off = 12 / 60 // degrees of latitude
  const out: Pt[] = []
  for (let i = 0; i < COAST.length; i++) {
    const a = COAST[Math.max(0, i - 1)]
    const b = COAST[Math.min(COAST.length - 1, i + 1)]
    const tx = (b[0] - a[0]) * KX
    const ty = b[1] - a[1]
    const len = Math.hypot(tx, ty) || 1
    // Rotate the along-coast tangent to point out to sea.
    const nx = -ty / len
    const ny = tx / len
    out.push([COAST[i][0] + (nx * off) / KX, COAST[i][1] + ny * off])
  }
  return out
})()

const SCALE_NM = 20
const SCALE_PX = (SCALE_NM / 60 / (BOUNDS.lat1 - BOUNDS.lat0)) * MAP_H

/* ------------------------------------------------------------------- M5 */
export function Tracking() {
  const { state, run } = useStore()
  const [lang, setLang] = useState<Lang>('en')
  const [sel, setSel] = useState<string | null>('DQM-1203')
  const [gearBoat, setGearBoat] = useState('MSR-0415')
  const [gearKind, setGearKind] = useState<GearAsset['kind']>('Trap string')
  const [gearUnits, setGearUnits] = useState('20')
  const x = COPY[lang]
  const ar = lang === 'ar'
  const name = (b: Boat) => (ar ? b.nameAr : b.name)

  const outside = state.boats.filter((b) => !inPermittedArea(b))
  const overdue = state.gearAssets.filter((g) => gearOverdue(g, state.clock))
  const boat = sel ? state.boats.find((b) => b.id === sel) : undefined
  const alerts = useMemo(
    () => state.events.filter((e) => e.type.startsWith('ObjectEvent · geofence') || e.type.includes('position gap') || e.type.includes('gear ')).slice(-8).reverse(),
    [state.events],
  )
  const live = state.gearAssets.filter((g) => !g.hauledAt)

  const label = {
    kind: (k: GearAsset['kind']) => (ar ? AR.kind[k] : k),
    gear: (g: string) => (ar ? AR.gear[g] ?? g : g),
    type: (t: string) => (ar ? AR.type[t] ?? t : t),
    tracker: (t: string) => (ar ? AR.tracker[t] ?? t : t),
    site: (s: string) => (ar ? AR.site[s] ?? s : s),
  }
  const num = (v: string | number) => <span dir="ltr">{v}</span>
  const fixAge = (b: Boat) => Math.round((state.clock - b.lastFix) / 3_600_000)

  return (
    <Page
      code="M5"
      title={x.title}
      lead={x.lead}
      dir={ar ? 'rtl' : 'ltr'}
      lang={lang}
      actions={
        <div className="row" style={{ gap: 10 }}>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setLang(ar ? 'en' : 'ar')} aria-label={x.langLabel} style={{ minWidth: 52 }}>{x.lang}</button>
          <button type="button" className="btn btn--ocean" onClick={() => run('moveBoats')}>{x.advance}</button>
        </div>
      }
    >
      {outside.length > 0 && <Notice tone="warn">{x.inside(outside.map(name))}</Notice>}
      {overdue.length > 0 && <Notice tone="bad">{x.ghost(overdue.length)}</Notice>}

      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <Panel title={x.map} aside={<span className="muted" style={{ fontSize: 13 }} dir="ltr">{x.chart} · {fmtTime(state.clock)}</span>} style={{ flex: '1 1 440px', maxWidth: 560 }}>
          <svg
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            dir="ltr"
            role="img"
            aria-label={x.mapAlt(state.boats.length, outside.length)}
            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 14, background: '#DAE7F2', direction: 'ltr', fontFamily: ar ? 'var(--font-arabic)' : 'var(--font-text)' }}
          >
            {/* territorial sea */}
            <path d={line(TERRITORIAL)} fill="none" stroke={c.harbour} strokeWidth="1" strokeDasharray="7 5" opacity="0.75" />
            <text x={px(TERRITORIAL[6][0]) + 6} y={py(TERRITORIAL[6][1])} fontSize="9.5" fill={c.harbour}>12 nm</text>

            {/* land */}
            <path d={LAND} fill="#EADFC9" stroke="#CBBDA2" strokeWidth="1" />
            <path d={ISLAND} fill="#EADFC9" stroke="#CBBDA2" strokeWidth="1" />

            {/* closed areas */}
            {CLOSED_AREAS.map((z) => {
              const xs = z.poly.map((p) => px(p[0]))
              const ys = z.poly.map((p) => py(p[1]))
              return (
                <g key={z.id}>
                  <path d={`${line(z.poly)} Z`} fill="rgba(227,163,59,0.16)" stroke={c.accent} strokeWidth="1.4" strokeDasharray="6 4" />
                  <text x={Math.min(...xs) + 5} y={Math.min(...ys) + 13} fontSize="9.5" fontWeight="600" fill={c.accent}>
                    {(ar ? z.nameAr : z.name).split(' · ')[0]}
                  </text>
                </g>
              )
            })}

            {/* tagged gear */}
            {live.map((g) => {
              const bad = gearOverdue(g, state.clock) || g.lost
              return (
                <g key={g.id}>
                  <title>{g.tag} · {label.kind(g.kind)}</title>
                  <rect x={px(g.lon) - 3.5} y={py(g.lat) - 3.5} width="7" height="7" transform={`rotate(45 ${px(g.lon)} ${py(g.lat)})`} fill={bad ? 'var(--danger)' : c.card} stroke={bad ? 'var(--danger)' : c.ocean} strokeWidth="1.4" />
                </g>
              )
            })}

            {/* places */}
            {PLACES.map((p) => (
              <g key={p.name}>
                {p.port
                  ? <rect x={px(p.lon) - 3.5} y={py(p.lat) - 3.5} width="7" height="7" fill={c.ocean} />
                  : <circle cx={px(p.lon)} cy={py(p.lat)} r="2.2" fill={c.ocean} opacity="0.65" />}
                <text
                  x={px(p.lon) - 7} y={py(p.lat) + 3.5} fontSize={p.port ? 11 : 9.5} textAnchor="end"
                  fontWeight={p.port ? 700 : 500} fill={c.ocean} opacity={p.port ? 1 : 0.7}
                  stroke="#EADFC9" strokeWidth="2.5" paintOrder="stroke"
                >
                  {ar ? p.nameAr : p.name}
                </text>
              </g>
            ))}

            {/* vessel tracks */}
            {state.boats.map((b) => b.track.length > 0 && (
              <path key={`t-${b.id}`} d={line([...b.track, [b.lon, b.lat]])} fill="none" stroke={c.ocean} strokeWidth="1" strokeDasharray="2 3" opacity="0.45" />
            ))}

            {/* vessels */}
            {state.boats.map((b) => {
              const ok = inPermittedArea(b)
              const on = b.id === sel
              return (
                <g key={b.id} onClick={() => setSel(b.id)} style={{ cursor: 'pointer' }}>
                  <title>{name(b)} · {b.id}</title>
                  {on && <circle cx={px(b.lon)} cy={py(b.lat)} r="13" fill="none" stroke={c.ocean} strokeWidth="1.5" opacity="0.5" />}
                  <g transform={`translate(${px(b.lon).toFixed(1)} ${py(b.lat).toFixed(1)}) rotate(${b.heading})`}>
                    <path d="M0 -8.5 L5.5 7 L0 3.5 L-5.5 7 Z" fill={ok ? c.harbour : c.amber} stroke={c.ocean} strokeWidth="1.6" strokeLinejoin="round" />
                  </g>
                  <text
                    x={px(b.lon) + 11} y={py(b.lat) + 3.5} fontSize="10.5" fill={c.ocean} fontWeight={on ? 700 : 500}
                    stroke="#DAE7F2" strokeWidth="2.5" paintOrder="stroke"
                  >
                    {name(b)}
                  </text>
                </g>
              )
            })}

            {/* scale bar and north arrow */}
            <g transform={`translate(16 ${MAP_H - 24})`}>
              <line x1="0" y1="0" x2={SCALE_PX} y2="0" stroke={c.ocean} strokeWidth="1.5" />
              <line x1="0" y1="-4" x2="0" y2="4" stroke={c.ocean} strokeWidth="1.5" />
              <line x1={SCALE_PX} y1="-4" x2={SCALE_PX} y2="4" stroke={c.ocean} strokeWidth="1.5" />
              <text x={SCALE_PX / 2} y="-7" fontSize="9.5" textAnchor="middle" fill={c.ocean}>{SCALE_NM} nm</text>
            </g>
            <g transform={`translate(${MAP_W - 24} 26)`}>
              <path d="M0 -12 L5 6 L0 2 L-5 6 Z" fill={c.ocean} />
              <text x="0" y="19" fontSize="9.5" textAnchor="middle" fill={c.ocean} fontWeight="700">N</text>
            </g>
          </svg>

          <div className="row muted" style={{ gap: 14, fontSize: 12.5 }}>
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><span className="swatch" style={{ background: c.harbour, borderRadius: 2 }} />{x.permitted}</span>
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><span className="swatch" style={{ background: c.amber, borderRadius: 2 }} />{x.closed}</span>
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><span className="swatch" style={{ background: c.card, border: `1.5px solid ${c.ocean}`, transform: 'rotate(45deg)' }} />{x.gearLabel}</span>
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><span className="swatch" style={{ background: 'none', borderTop: `2px dashed ${c.harbour}`, height: 0 }} />{x.territorial}</span>
          </div>
        </Panel>

        <div className="stack" style={{ flex: '1 1 340px', gap: 20, minWidth: 0 }}>
          <Panel title={x.vessel} aside={boat && <Badge tone={inPermittedArea(boat) ? 'ok' : 'warn'}>{inPermittedArea(boat) ? x.permitted : x.closed}</Badge>}>
            {boat ? (
              <>
                <div className="kv" style={{ alignItems: 'baseline' }}>
                  <span style={{ ...display, fontWeight: 700, fontSize: 18 }}>{name(boat)}</span>
                  <span className="muted" dir="ltr">{boat.id} · {label.site(boat.site)}</span>
                </div>
                <div className="grid-auto" style={{ ['--min' as string]: '150px', gap: 12 }}>
                  {([
                    [x.position, fmtPos(boat.lat, boat.lon), true],
                    [x.course, `${boat.heading}° ${compass(boat.heading)}`, true],
                    [x.speed, `${boat.speed.toFixed(1)} ${x.kn}`, true],
                    [x.offshore, `${distToShore(boat).toFixed(1)} ${x.nm}`, true],
                    [x.tracker, label.tracker(boat.tracker), false],
                    [x.gearOnRecord, label.gear(boat.gear), false],
                  ] as const).map(([k, v, ltr]) => (
                    <div key={k} className="stack" style={{ gap: 2 }}>
                      <span className="eyebrow eyebrow--muted">{k}</span>
                      <span dir={ltr ? 'ltr' : undefined} style={{ fontWeight: 500, fontSize: 14, fontVariantNumeric: 'tabular-nums', textAlign: ar && ltr ? 'right' : undefined }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="card stack" style={{ padding: 12, gap: 4, fontSize: 13 }}>
                  <span><b>{x.lastFix}:</b> <span dir="ltr">{fmtTime(boat.lastFix)}</span>{fixAge(boat) > 0 && <> · {fixAge(boat)} {x.hours}</>}</span>
                  <span className="muted">
                    {inCoverage(boat)
                      ? <>{x.live} {num(`${boat.tracker === 'VMS (MAFWR)' ? 10 : boat.tracker === 'Low-cost tracker' ? 60 : 30} ${x.minutes}`)}</>
                      : <>{num(`${distToShore(boat).toFixed(0)} ${x.nm}`)} · {x.coverage}</>}
                  </span>
                </div>
                {closureAt(boat) && <Notice tone="warn">{ar ? closureAt(boat)!.nameAr : closureAt(boat)!.name} · {ar ? closureAt(boat)!.seasonAr : closureAt(boat)!.season}</Notice>}
                <div className="muted" style={{ fontSize: 12.5 }}>{x.privacy}</div>
              </>
            ) : <Empty>{x.pick}</Empty>}
          </Panel>

          <Panel title={x.alerts}>
            {alerts.length ? alerts.map((e, i) => (
              <div key={i} style={{ fontSize: 14, borderBottom: `1px solid ${c.line}`, paddingBottom: 8 }}>
                <div style={{ fontWeight: 600 }} dir={ar && e.textAr ? undefined : 'ltr'}>{ar && e.textAr ? e.textAr : e.text}</div>
                <div className="muted" style={{ fontSize: 12 }} dir="ltr">{fmtTime(e.t)} · {e.actor}</div>
              </div>
            )) : <Empty>{x.noAlerts}</Empty>}
          </Panel>
        </div>
      </div>

      <Panel
        title={x.gearPanel}
        aside={<span className="muted" style={{ fontSize: 13 }}>{live.length} {ar ? 'في الماء' : 'in the water'}</span>}
      >
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">{x.tag}</th><th scope="col">{x.kind}</th><th scope="col">{x.vessel}</th>
                <th scope="col">{x.position}</th><th scope="col">{x.soak}</th><th scope="col">{x.status}</th>
                <th scope="col"><span className="sr-only">{x.haul}</span></th>
              </tr>
            </thead>
            <tbody>
              {state.gearAssets.map((g) => {
                const b = state.boats.find((v) => v.id === g.boatId)!
                const bad = gearOverdue(g, state.clock)
                return (
                  <tr key={g.id}>
                    <td style={{ fontWeight: 600 }} dir="ltr">{g.tag}</td>
                    <td>{label.kind(g.kind)}<div className="muted" style={{ fontSize: 12 }}>{num(g.units)}</div></td>
                    <td>{name(b)}<div className="muted" style={{ fontSize: 12 }} dir="ltr">{g.boatId}</div></td>
                    <td dir="ltr" style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{fmtPos(g.lat, g.lon)}</td>
                    <td dir="ltr">{soakHours(g, state.clock)} {x.hours}</td>
                    <td>
                      {g.hauledAt ? <Badge tone="done">{x.hauled}</Badge>
                        : g.lost ? <Badge tone="bad">{x.reported}</Badge>
                          : bad ? <Badge tone="bad">{x.overdue}</Badge>
                            : g.kind === 'FAD' ? <Badge>{x.anchored}</Badge>
                              : <Badge tone="ok">{x.fishing}</Badge>}
                    </td>
                    <td>
                      {!g.hauledAt && (
                        <span className="row" style={{ gap: 8 }}>
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => run('haulGear', { id: g.id })}>{x.haul}</button>
                          {!g.lost && <button type="button" className="btn btn--ghost btn--sm" onClick={() => run('reportGearLost', { id: g.id })}>{x.lost}</button>}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="form-grid" style={{ alignItems: 'end' }}>
          <Field label={x.from}>
            <select className="input" value={gearBoat} onChange={(e) => setGearBoat(e.target.value)}>
              {state.boats.map((b) => <option key={b.id} value={b.id}>{name(b)} · {b.id}</option>)}
            </select>
          </Field>
          <Field label={x.kind}>
            <select className="input" value={gearKind} onChange={(e) => setGearKind(e.target.value as GearAsset['kind'])}>
              {(['Trap string', 'Gillnet fleet', 'FAD'] as const).map((k) => <option key={k} value={k}>{label.kind(k)}</option>)}
            </select>
          </Field>
          <Field label={x.count}>
            <input className="input" inputMode="numeric" value={gearUnits} onChange={(e) => setGearUnits(e.target.value.replace(/\D/g, ''))} />
          </Field>
          <button type="button" className="btn btn--amber" disabled={!(Number(gearUnits) > 0)} onClick={() => run('setGear', { boatId: gearBoat, kind: gearKind, units: Number(gearUnits) })}>
            {x.add}
          </button>
        </div>
      </Panel>

      <Panel title={x.records}>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">{x.vessel}</th><th scope="col">{x.type}</th><th scope="col">{x.tracker}</th>
                <th scope="col">{x.gearOnRecord}</th><th scope="col">{x.position}</th><th scope="col">{x.course}</th>
                <th scope="col">{x.offshore}</th><th scope="col">{x.lastFix}</th><th scope="col">{x.area}</th><th scope="col">{x.lastLot}</th>
              </tr>
            </thead>
            <tbody>
              {state.boats.map((b) => {
                const last = state.lots.filter((l) => l.boatId === b.id).slice(-1)[0]
                const shore = nearestShore(b.lon, b.lat).nm
                return (
                  <tr key={b.id}>
                    <td>
                      <button type="button" className="text-link" aria-pressed={b.id === sel} onClick={() => setSel(b.id)} style={{ background: 'none', border: 'none', padding: 0, fontWeight: 600, minHeight: 0 }}>{name(b)}</button>
                      <div className="muted" style={{ fontSize: 12 }} dir="ltr">{b.id}</div>
                    </td>
                    <td>{label.type(b.type)}</td>
                    <td>{label.tracker(b.tracker)}</td>
                    <td>{label.gear(b.gear)}</td>
                    <td dir="ltr" style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{fmtPos(b.lat, b.lon)}</td>
                    <td dir="ltr">{b.heading}° {compass(b.heading)} · {b.speed.toFixed(1)} kn</td>
                    <td dir="ltr">{shore.toFixed(1)} nm</td>
                    <td>
                      {inCoverage(b) ? <span dir="ltr">{fmtTime(b.lastFix)}</span> : <Badge tone="warn">{fixAge(b)} {x.hours}</Badge>}
                      {!inCoverage(b) && <div className="muted" dir="ltr" style={{ fontSize: 12, textAlign: ar ? 'right' : 'left' }}>&gt; {COVERAGE_NM} nm</div>}
                    </td>
                    <td>{inPermittedArea(b) ? <Badge tone="ok">{x.yes}</Badge> : <Badge tone="warn">{x.no}</Badge>}</td>
                    <td>{last ? <LotLink id={last.id} /> : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </Page>
  )
}
