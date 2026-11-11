import { useState } from 'react'
import { Link } from 'react-router-dom'
import { c, display } from '../../tokens'
import { mod } from '../nav'
import {
  boatOf, CLOSED_AREA, coastX, fmtTime, GEARS, inPermittedArea, kgFmt, licenceValid, REF_PRICE, ro, SPECIES,
  type LotStatus,
} from '../store'
import { useStore } from '../StoreContext'
import { Badge, Empty, Field, LotLink, Notice, Page, Panel, QrCode, StatusBadge } from '../ui'

const RECEIVERS = ['Duqm collection centre', 'Sur landing site', 'Masirah landing site', 'Duqm Seafood Plant']
const BYCATCH = ['None recorded', 'None observed', 'Turtle released alive', 'Dolphin released alive', 'Shark retained', 'No bycatch record']

/* ------------------------------------------------------------------ M1 */
export function LotRegistration() {
  const { state, run } = useStore()
  const [fisherId, setFisherId] = useState(state.fishers[0].id)
  const [licence, setLicence] = useState<'unchecked' | 'ok' | 'fail'>('unchecked')
  const [species, setSpecies] = useState(SPECIES[0])
  const [gear, setGear] = useState(boatOf(state, state.fishers[0].boatId).gear)
  const [kg, setKg] = useState('')
  const [receiver, setReceiver] = useState(RECEIVERS[0])
  const [bycatch, setBycatch] = useState(BYCATCH[0])
  const [tripId, setTripId] = useState('')
  const [photo, setPhoto] = useState(false)
  const [created, setCreated] = useState<string | null>(null)

  const fisher = state.fishers.find((f) => f.id === fisherId)!
  const boat = boatOf(state, fisher.boatId)
  const openTrips = state.trips.filter((t) => t.boatId === boat.id && !state.lots.some((l) => l.tripId === t.id))
  const weight = Number(kg)
  const ready = licence === 'ok' && weight > 0 && photo

  const pickFisher = (id: string) => {
    const f = state.fishers.find((x) => x.id === id)!
    setFisherId(id)
    setLicence('unchecked')
    setGear(boatOf(state, f.boatId).gear)
    setTripId('')
  }
  const readScale = () => {
    // A stable "reading" per species, nudged by how many lots exist so repeats differ.
    const base = { 'Yellowfin tuna': 380, Kingfish: 96, Squid: 240, Lobster: 34, Sardine: 1100 }[species] ?? 100
    setKg(String(Math.round((base + ((state.lots.length * 17) % 60) - 20) * 10) / 10))
  }
  const submit = () => {
    if (!ready) return
    const id = run('registerLot', { fisherId, species, kg: weight, gear, receiver, bycatch, licenceOk: true, tripId: tripId || undefined }) as string
    setCreated(id)
    setKg('')
    setPhoto(false)
  }
  const recent = state.lots.slice().sort((a, b) => b.landedAt - a.landedAt).slice(0, 8)
  const newLot = created ? state.lots.find((l) => l.id === created) : undefined

  return (
    <Page code="M1" title="Lot registration at first receipt" lead="The first receiver creates the lot when the fish comes ashore: who landed it, what came in, and the evidence. The lot gets a QR label and a verified digital identity. Fishers pay nothing.">
      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <Panel title="New lot" aside={<Badge tone="ok">Offline-ready</Badge>} style={{ flex: '999 1 520px' }}>
          <div className="form-grid">
            <Field label="Fisher (scan QR ID)">
              <select className="input" value={fisherId} onChange={(e) => pickFisher(e.target.value)}>
                {state.fishers.map((f) => <option key={f.id} value={f.id}>{f.name} · {f.boatId}</option>)}
              </select>
            </Field>
            <Field label="Received by">
              <select className="input" value={receiver} onChange={(e) => setReceiver(e.target.value)}>
                {RECEIVERS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
          </div>
          <div className="card row" style={{ padding: 14, gap: '8px 24px', fontSize: 14 }}>
            <span><span className="muted">Boat </span><b>{boat.name}</b> · {boat.id} · {boat.type}</span>
            <span><span className="muted">Licence </span><b>expires {fisher.licenceExpiry}</b></span>
            <span><span className="muted">Position </span><b>{boat.tracker}</b></span>
          </div>
          {licence === 'unchecked' && (
            <button type="button" className="btn btn--ghost" style={{ borderStyle: 'dashed', borderColor: c.harbour, color: c.link }} onClick={() => setLicence(licenceValid(fisher, state.clock) ? 'ok' : 'fail')}>
              Check fishing licence document
            </button>
          )}
          {licence === 'ok' && <Notice>Licence document valid until the end of {fisher.licenceExpiry}.</Notice>}
          {licence === 'fail' && <Notice tone="bad">Licence expired ({fisher.licenceExpiry}). The lot cannot be registered until the fisher renews it with MAFWR.</Notice>}

          <div className="form-grid">
            <Field label="Species">
              <select className="input" value={species} onChange={(e) => setSpecies(e.target.value)}>
                {SPECIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Gear">
              <select className="input" value={gear} onChange={(e) => setGear(e.target.value)}>
                {GEARS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Weight (kg)" hint={<button type="button" className="text-link" style={{ minHeight: 0, background: 'none', border: 'none', padding: 0 }} onClick={readScale}>Read Bluetooth scale</button>}>
              <input className="input" inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value.replace(/[^\d.]/g, ''))} placeholder="0.0" />
            </Field>
            <Field label="Bycatch">
              <select className="input" value={bycatch} onChange={(e) => setBycatch(e.target.value)}>
                {BYCATCH.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Link e-Logbook trip" hint={openTrips.length ? undefined : 'No open trips for this boat'}>
              <select className="input" value={tripId} onChange={(e) => setTripId(e.target.value)} disabled={!openTrips.length}>
                <option value="">None</option>
                {openTrips.map((t) => <option key={t.id} value={t.id}>{t.id} · {t.catches.map((x) => `${x.kg} kg ${x.species}`).join(', ')}</option>)}
              </select>
            </Field>
          </div>
          <div className="row" style={{ gap: 12, alignItems: 'center' }}>
            <button type="button" className="btn btn--ghost btn--sm" aria-pressed={photo} onClick={() => setPhoto(true)}>{photo ? 'Photo taken ✓' : 'Take photo'}</button>
            <span className="muted" style={{ fontSize: 13 }}>GPS from the {boat.tracker.toLowerCase()} · permitted-area check via MAFWR: <b style={{ color: inPermittedArea(boat) ? c.link : c.accent }}>{inPermittedArea(boat) ? 'Yes' : 'No'}</b> (yes/no only; raw positions are never shared)</span>
          </div>
          <button type="button" className="btn btn--amber" disabled={!ready} onClick={submit}>
            {licence !== 'ok' ? 'Check the licence first' : !(weight > 0) ? 'Enter the weight' : !photo ? 'Take a photo first' : 'Create lot and print QR label'}
          </button>
        </Panel>

        <div className="stack" style={{ flex: '1 1 320px', gap: 20, minWidth: 0 }}>
          {newLot && (
            <Panel title="Lot created" aside={<Badge tone="gold">EPCIS event logged</Badge>}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <QrCode value={newLot.id} cell={5} />
                <div className="stack" style={{ gap: 4, fontSize: 14 }}>
                  <span style={{ ...display, fontWeight: 700, fontSize: 16 }}>{newLot.id}</span>
                  <span>{newLot.species} · {kgFmt(newLot.kg)} · {newLot.gear}</span>
                  <span className="muted">{newLot.gps}</span>
                </div>
              </div>
              <Link to={`${mod('M2').path}?lot=${newLot.id}`} className="btn btn--ocean btn--sm">Send to quality check →</Link>
            </Panel>
          )}
          <Panel title="Latest receipts">
            {recent.map((l) => (
              <div key={l.id} className="kv" style={{ fontSize: 14, alignItems: 'center', borderBottom: `1px solid ${c.line}`, paddingBottom: 8 }}>
                <span className="stack"><LotLink id={l.id} /><span className="muted" style={{ fontSize: 12 }}>{l.species} · {kgFmt(l.kg)} · {fmtTime(l.landedAt)}</span></span>
                <StatusBadge status={l.status} />
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </Page>
  )
}

/* ------------------------------------------------------------------ M3 */
export function ELogbook() {
  const { state, run } = useStore()
  const [boatId, setBoatId] = useState('DQM-C014')
  const boat = boatOf(state, boatId)
  const [gear, setGear] = useState(boat.gear)
  const [area, setArea] = useState('Arabian Sea · offshore Duqm')
  const [hours, setHours] = useState('12')
  const [sets, setSets] = useState('2')
  const [rows, setRows] = useState([{ species: 'Sardine', kg: '' }, { species: 'Squid', kg: '' }])
  const [bycatch, setBycatch] = useState('None observed')
  const captain = state.fishers.find((f) => f.boatId === boatId)?.name ?? 'Captain'
  const catches = rows.filter((r) => Number(r.kg) > 0).map((r) => ({ species: r.species, kg: Number(r.kg) }))

  const save = () => {
    run('addTrip', { boatId, captain, gear, area, hours: Number(hours) || 0, sets: Number(sets) || 0, catches, bycatch })
    setRows(rows.map((r) => ({ ...r, kg: '' })))
  }
  const trips = state.trips.slice().reverse()

  return (
    <Page
      code="M3"
      title="e-Logbook"
      lead="Gear-specific catch and effort, recorded at sea and kept offline until the boat is back in coverage, then a pre-landing declaration before arrival."
      actions={
        <div role="group" aria-label="Connection" className="segmented">
          <button type="button" aria-pressed={!state.offline} onClick={() => run('setOffline', { offline: false })}>Online</button>
          <button type="button" aria-pressed={state.offline} onClick={() => run('setOffline', { offline: true })}>Offline at sea</button>
        </div>
      }
    >
      {state.offline && <Notice tone="warn">No coverage. New entries are stored on the device and sync automatically when you switch back online.</Notice>}
      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <Panel title="New entry" style={{ flex: '1 1 420px' }}>
          <div className="form-grid">
            <Field label="Vessel">
              <select className="input" value={boatId} onChange={(e) => { setBoatId(e.target.value); setGear(boatOf(state, e.target.value).gear) }}>
                {state.boats.map((b) => <option key={b.id} value={b.id}>{b.name} · {b.id} ({b.type})</option>)}
              </select>
            </Field>
            <Field label="Gear"><select className="input" value={gear} onChange={(e) => setGear(e.target.value)}>{GEARS.map((g) => <option key={g}>{g}</option>)}</select></Field>
            <Field label="Fishing area"><input className="input" value={area} onChange={(e) => setArea(e.target.value)} /></Field>
            <Field label="Hours fished"><input className="input" inputMode="numeric" value={hours} onChange={(e) => setHours(e.target.value.replace(/\D/g, ''))} /></Field>
            <Field label={gear === 'Purse seine' || gear === 'Gillnet' ? 'Sets / hauls' : 'Lines / pots'}><input className="input" inputMode="numeric" value={sets} onChange={(e) => setSets(e.target.value.replace(/\D/g, ''))} /></Field>
            <Field label="Bycatch"><select className="input" value={bycatch} onChange={(e) => setBycatch(e.target.value)}>{BYCATCH.slice(1).map((x) => <option key={x}>{x}</option>)}</select></Field>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            <span className="field__label" style={{ fontSize: 14 }}>Catch</span>
            {rows.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 120px', gap: 10 }}>
                <select className="input" aria-label={`Species ${i + 1}`} value={r.species} onChange={(e) => setRows(rows.map((x, k) => (k === i ? { ...x, species: e.target.value } : x)))}>
                  {SPECIES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <input className="input" aria-label={`Kilograms ${i + 1}`} inputMode="decimal" placeholder="kg" value={r.kg} onChange={(e) => setRows(rows.map((x, k) => (k === i ? { ...x, kg: e.target.value.replace(/[^\d.]/g, '') } : x)))} />
              </div>
            ))}
          </div>
          <button type="button" className="btn btn--ocean" disabled={!catches.length} onClick={save}>{state.offline ? 'Save on device' : 'Save entry'}</button>
        </Panel>

        <Panel title="Trips" style={{ flex: '999 1 520px' }}>
          <div className="table-scroll">
            <table className="table">
              <thead><tr><th scope="col">Entry</th><th scope="col">Vessel</th><th scope="col">Catch</th><th scope="col">Effort</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Action</span></th></tr></thead>
              <tbody>
                {trips.map((t) => {
                  const lot = state.lots.find((l) => l.tripId === t.id)
                  return (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{t.id}<div className="muted" style={{ fontSize: 12, fontWeight: 400 }}>{t.captain}</div></td>
                      <td>{boatOf(state, t.boatId).name}<div className="muted" style={{ fontSize: 12 }}>{t.area}</div></td>
                      <td>{t.catches.map((x) => `${x.kg} kg ${x.species}`).join(', ')}<div className="muted" style={{ fontSize: 12 }}>Bycatch: {t.bycatch}</div></td>
                      <td>{t.gear} · {t.hours} h · {t.sets}</td>
                      <td>
                        <div className="stack" style={{ gap: 4, alignItems: 'flex-start' }}>
                          {t.synced ? <Badge tone="ok">Synced</Badge> : <Badge tone="warn">Queued on device</Badge>}
                          {t.declared && <Badge tone="done">Declared</Badge>}
                          {lot && <LotLink id={lot.id} />}
                        </div>
                      </td>
                      <td>
                        {!t.declared && (
                          <button type="button" className="btn btn--ghost btn--sm" disabled={state.offline || !t.synced} onClick={() => run('declareTrip', { id: t.id })}>
                            Pre-landing declaration
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {!trips.length && <Empty>No entries yet.</Empty>}
        </Panel>
      </div>
    </Page>
  )
}

/* ------------------------------------------------------------------ M4 */
const AR_SPECIES: Record<string, string> = { 'Yellowfin tuna': 'تونة صفراء الزعانف', Kingfish: 'كنعد', Squid: 'حبّار', Lobster: 'شروخ', Sardine: 'سردين' }
const AR_STATUS: Record<LotStatus, string> = { registered: 'مسجّل', verified: 'موثّق', listed: 'معروض للبيع', sold: 'مُباع', processed: 'في المصنع', shipped: 'قيد التصدير', released: 'تم التصدير' }
const EN_STATUS: Record<LotStatus, string> = { registered: 'Registered', verified: 'Verified', listed: 'For sale', sold: 'Sold', processed: 'At the plant', shipped: 'Being exported', released: 'Exported' }

export function FisherAppModule() {
  const { state, run } = useStore()
  const [fisherId, setFisherId] = useState('F1')
  const [ar, setAr] = useState(true)
  const [tab, setTab] = useState<'home' | 'lots' | 'pay'>('home')
  const [voice, setVoice] = useState<'idle' | 'listening' | string>('idle')
  const [sos, setSos] = useState(false)
  const f = state.fishers.find((x) => x.id === fisherId)!
  const boat = boatOf(state, f.boatId)
  const lots = state.lots.filter((l) => l.fisherId === f.id).slice().reverse()
  const pays = state.payments.filter((p) => p.fisherId === f.id).slice().reverse()
  const paid = pays.filter((p) => p.settled).reduce((n, p) => n + p.value, 0)
  const pending = pays.filter((p) => !p.settled).reduce((n, p) => n + p.value, 0)
  const sold = state.lots.filter((l) => l.price && l.site === f.site)
  const price = (sp: string) => {
    const xs = sold.filter((l) => l.species === sp)
    return xs.length ? xs.reduce((n, l) => n + l.price!, 0) / xs.length : REF_PRICE[sp]
  }
  const voiceSpecies = boat.gear === 'Trap' ? 'Lobster' : 'Kingfish'
  const t = (en: string, arabic: string) => (ar ? arabic : en)
  const stopVoice = () => {
    const id = run('addTrip', { boatId: boat.id, captain: f.name, gear: boat.gear, area: 'Ras Madrakah', hours: 6, sets: 1, catches: [{ species: voiceSpecies, kg: 40 }], bycatch: 'None observed' }) as string
    setVoice(id)
  }
  const species = ['Yellowfin tuna', 'Kingfish', 'Squid']

  return (
    <Page code="M4" title="Fisher app" lead="Arabic-first, voice and icon interface for artisanal fishers: same-day payments, prices at their landing site, weather and a supplementary SOS. Voice notes go straight to the e-Logbook.">
      <div className="row" style={{ gap: 24, alignItems: 'flex-start' }}>
        <div className="stack" style={{ gap: 14, flex: '1 1 260px', maxWidth: 360 }}>
          <Field label="Preview as">
            <select className="input" value={fisherId} onChange={(e) => { setFisherId(e.target.value); setVoice('idle') }}>
              {state.fishers.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.site}</option>)}
            </select>
          </Field>
          <Notice>Payments and lot statuses come live from the marketplace (M6), payments (M7) and the export hub (M13). Settle a payment in M7 and it appears here.</Notice>
        </div>

        <div className="phone" dir={ar ? 'rtl' : 'ltr'} lang={ar ? 'ar' : 'en'} style={{ height: 780, borderRadius: 28, boxShadow: '0 0 0 1px var(--line), 0 24px 60px rgba(11,37,69,0.18)', fontFamily: ar ? 'var(--font-arabic)' : 'var(--font-text)', flex: 'none' }}>
          <div className="slab stack" style={{ padding: '20px 18px 22px', gap: 16, borderRadius: '0 0 24px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: c.mist }}>{t('Good morning', 'صباح الخير')}</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{ar ? f.nameAr : f.name}</div>
              </div>
              <button type="button" onClick={() => setAr(!ar)} aria-label={ar ? 'Switch to English' : 'التبديل إلى العربية'} className="btn btn--outline-light" style={{ minWidth: 52, minHeight: 44, padding: 0 }}>{ar ? 'EN' : 'ع'}</button>
            </div>
            <div className="stack" style={{ background: c.slab, borderRadius: 16, padding: 14, gap: 4 }}>
              <span style={{ fontSize: 14, color: c.onOcean }}>{t('Paid to you', 'المبالغ المدفوعة لك')}</span>
              <span dir="ltr" style={{ ...display, fontWeight: 700, fontSize: 30, color: c.amber, textAlign: ar ? 'right' : 'left' }}>{ro(paid)}</span>
              <span style={{ fontSize: 13, color: c.mist }}>{pending > 0 ? <span dir="ltr">{t('Pending', 'قيد التحويل')} {ro(pending)}</span> : t('From the partner bank · no fees for fishers', 'من البنك الشريك · لا رسوم على الصياد')}</span>
            </div>
          </div>

          <div className="phone__body" style={{ padding: '16px 18px', gap: 14 }}>
            {tab === 'home' && (
              <>
                <button
                  type="button"
                  className="card"
                  onClick={() => (voice === 'listening' ? stopVoice() : setVoice('listening'))}
                  style={{ textAlign: 'start', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, minHeight: 68, flex: 'none' }}
                >
                  <span style={{ flex: 'none', width: 46, height: 46, borderRadius: 999, background: voice === 'listening' ? c.amber : c.ocean, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={voice === 'listening' ? c.ocean : c.sand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></svg>
                  </span>
                  <span className="stack" style={{ gap: 2, color: c.ocean }}>
                    <span style={{ fontWeight: 600 }}>
                      {voice === 'listening' ? t('Listening… tap to save', 'أستمع… اضغط للحفظ') : voice === 'idle' ? t('Log your catch by voice', 'سجّل صيدك بصوتك') : t('Saved to your logbook', 'حُفظ في سجلّك')}
                    </span>
                    <span className="muted" style={{ fontSize: 13 }}>
                      {voice === 'listening'
                        ? t(`"40 kilo ${voiceSpecies.toLowerCase()}, ${boat.gear.toLowerCase()}, Ras Madrakah"`, `«٤٠ كيلو ${AR_SPECIES[voiceSpecies]}، رأس مدركة»`)
                        : voice === 'idle' ? t('Tap and speak in Arabic', 'اضغط وتكلّم بالعربية') : <span dir="ltr">{voice}</span>}
                    </span>
                  </span>
                </button>
                <div className="stack" style={{ gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>{t("Today's prices", 'أسعار اليوم')}</span>
                    <span className="muted" style={{ fontSize: 12 }}>{f.site} · {t('per kg', 'لكل كجم')}</span>
                  </div>
                  <div className="card" style={{ overflow: 'hidden' }}>
                    {species.map((sp, i) => (
                      <div key={sp} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < species.length - 1 ? `1px solid ${c.line}` : undefined }}>
                        <span>{ar ? AR_SPECIES[sp] : sp}</span>
                        <span dir="ltr" style={{ ...display, fontWeight: 600 }}>{ro(price(sp))}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="card" style={{ padding: 12, borderRadius: 14 }}>
                    <div className="muted" style={{ fontSize: 12 }}>{t('Sea now', 'البحر الآن')}</div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t('Wind 12 kn · waves 0.8 m', 'رياح ١٢ عقدة · موج ٠٫٨ م')}</div>
                  </div>
                  <button type="button" aria-pressed={sos} onClick={() => setSos(!sos)} style={{ border: '2px solid var(--danger)', background: sos ? 'var(--danger)' : c.card, color: sos ? c.card : 'var(--danger-text)', borderRadius: 14, fontWeight: 700, minHeight: 60 }}>
                    {sos ? t('SOS sent · cancel', 'تم الإرسال · إلغاء') : 'SOS'}
                    <span style={{ display: 'block', fontSize: 11, fontWeight: 500 }}>{t('Supplementary · call 9999', 'خدمة مساندة · اتصل ٩٩٩٩')}</span>
                  </button>
                </div>
              </>
            )}
            {tab === 'lots' && (
              lots.length ? lots.map((l) => (
                <div key={l.id} className="card" style={{ padding: '10px 14px', borderRadius: 14, display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <span className="stack"><span style={{ fontWeight: 500 }}>{ar ? AR_SPECIES[l.species] : l.species} · <span dir="ltr">{kgFmt(l.kg)}</span></span><span dir="ltr" className="muted" style={{ fontSize: 12, textAlign: ar ? 'right' : 'left' }}>{l.id}</span></span>
                  <Badge tone={l.status === 'released' ? 'done' : 'neutral'}>{ar ? AR_STATUS[l.status] : EN_STATUS[l.status]}</Badge>
                </div>
              )) : <Empty>{t('No lots yet.', 'لا توجد دفعات بعد.')}</Empty>
            )}
            {tab === 'pay' && (
              pays.length ? pays.map((p) => (
                <div key={p.id} className="card" style={{ padding: '10px 14px', borderRadius: 14, display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <span className="stack"><span dir="ltr" style={{ ...display, fontWeight: 700, textAlign: ar ? 'right' : 'left' }}>{ro(p.value)}</span><span className="muted" style={{ fontSize: 12 }}>{t('Buyer paid all fees', 'المشتري دفع كل الرسوم')}</span></span>
                  {p.settled ? <Badge tone="ok">{t('Paid', 'مدفوع')}</Badge> : <Badge tone="warn">{t('Pending', 'قيد التحويل')}</Badge>}
                </div>
              )) : <Empty>{t('No payments yet.', 'لا توجد مدفوعات بعد.')}</Empty>
            )}
          </div>
          <nav aria-label={t('App sections', 'أقسام التطبيق')} className="phone__footer" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: '6px 6px 14px' }}>
            {([['home', 'Home', 'الرئيسية'], ['lots', 'My lots', 'دفعاتي'], ['pay', 'Payments', 'مدفوعاتي']] as const).map(([k, en, arabic]) => (
              <button key={k} type="button" aria-current={tab === k ? 'page' : undefined} onClick={() => setTab(k)} style={{ background: 'none', border: 'none', minHeight: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: tab === k ? c.ocean : c.muted, fontWeight: 600, fontSize: 12 }}>
                <span style={{ width: 22, height: 4, borderRadius: 999, background: tab === k ? c.amber : 'transparent' }} />
                {ar ? arabic : en}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </Page>
  )
}

/* ------------------------------------------------------------------ M5 */
export function Tracking() {
  const { state, run } = useStore()
  const outside = state.boats.filter((b) => !inPermittedArea(b))
  const alerts = state.events.filter((e) => e.type === 'ObjectEvent · geofence').slice(-6).reverse()
  const SITES_XY: [string, number, number][] = [['Sur', coastX(40) - 4, 40], ['Masirah', 318, 190], ['Duqm', coastX(290) - 2, 290]]

  return (
    <Page
      code="M5"
      title="Position and gear tracking"
      lead="Phone GPS for artisanal boats, low-cost trackers for untracked ones, and the optional yes/no permitted-area check from MAFWR vessel monitoring. Geofences flag a boat that enters a closed area."
      actions={<button type="button" className="btn btn--ocean" onClick={() => run('moveBoats')}>Advance one hour</button>}
    >
      {outside.length > 0 && <Notice tone="warn">{outside.map((b) => b.name).join(', ')} {outside.length > 1 ? 'are' : 'is'} inside the closed area. Lots landed from {outside.length > 1 ? 'these boats' : 'this boat'} will carry a failed permitted-area check.</Notice>}
      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <Panel title="Live positions" aside={<span className="muted" style={{ fontSize: 13 }}>Schematic map · {fmtTime(state.clock)}</span>} style={{ flex: '999 1 520px' }}>
          <svg viewBox="0 0 560 360" role="img" aria-label={`Map of ${state.boats.length} boats; ${outside.length} inside the closed area`} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 14, background: '#DCE8F2', fontFamily: 'var(--font-text)' }}>
            <path d={`M0 0 H${coastX(0)} L${coastX(360)} 360 H0 Z`} fill="#EDE5D3" />
            <ellipse cx="318" cy="190" rx="9" ry="24" fill="#EDE5D3" />
            <rect x={CLOSED_AREA.x} y={CLOSED_AREA.y} width={CLOSED_AREA.w} height={CLOSED_AREA.h} fill="rgba(227,163,59,0.18)" stroke={c.accent} strokeDasharray="6 4" strokeWidth="1.5" rx="6" />
            <text x={CLOSED_AREA.x + 6} y={CLOSED_AREA.y + 16} fontSize="11" fill={c.accent} fontWeight="600">Closed area · lobster season</text>
            {SITES_XY.map(([n, x, y]) => (
              <g key={n}>
                <rect x={x - 4} y={y - 4} width="8" height="8" fill={c.ocean} />
                <text x={x - 10} y={y + 4} fontSize="12" fill={c.ocean} textAnchor="end" fontWeight="600">{n}</text>
              </g>
            ))}
            {state.boats.map((b) => {
              const ok = inPermittedArea(b)
              return (
                <g key={b.id}>
                  <circle cx={b.x} cy={b.y} r="7" fill={ok ? c.harbour : c.amber} stroke={c.ocean} strokeWidth="2" />
                  <text x={b.x + 11} y={b.y + 4} fontSize="11" fill={c.ocean}>{b.name}</text>
                </g>
              )
            })}
          </svg>
          <div className="row muted" style={{ gap: 16, fontSize: 13 }}>
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><span className="swatch" style={{ background: c.harbour, borderRadius: 999 }} />In permitted area</span>
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><span className="swatch" style={{ background: c.amber, borderRadius: 999 }} />Inside a geofence</span>
          </div>
        </Panel>
        <Panel title="Geofence alerts" style={{ flex: '1 1 300px' }}>
          {alerts.length ? alerts.map((e, i) => (
            <div key={i} style={{ fontSize: 14, borderBottom: `1px solid ${c.line}`, paddingBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>{e.text}</div>
              <div className="muted" style={{ fontSize: 12 }}>{fmtTime(e.t)} · {e.actor}</div>
            </div>
          )) : <Empty>No alerts. Advance the clock to move the fleet.</Empty>}
        </Panel>
      </div>
      <Panel title="Vessels and gear records">
        <div className="table-scroll">
          <table className="table">
            <thead><tr><th scope="col">Vessel</th><th scope="col">Type</th><th scope="col">Tracker</th><th scope="col">Gear on record</th><th scope="col">Permitted area</th><th scope="col">Last lot</th></tr></thead>
            <tbody>
              {state.boats.map((b) => {
                const last = state.lots.filter((l) => l.boatId === b.id).slice(-1)[0]
                return (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{b.name}<div className="muted" style={{ fontSize: 12, fontWeight: 400 }}>{b.id}</div></td>
                    <td>{b.type}</td>
                    <td>{b.tracker}</td>
                    <td>{b.gear}</td>
                    <td>{inPermittedArea(b) ? <Badge tone="ok">Yes</Badge> : <Badge tone="warn">No</Badge>}</td>
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
