/**
 * Prototype data layer: one in-browser record shared by all 17 modules.
 * Every action appends EPCIS-style events to a single log, which is what
 * analytics (M16) and data products (M17) read.
 */

export type Step = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6'
export type LotStatus = 'registered' | 'verified' | 'listed' | 'sold' | 'processed' | 'shipped' | 'released'
export type Grade = 'A' | 'B' | 'C'
export type Ccp = 'pass' | 'fail' | 'pending'

export interface Fisher { id: string; name: string; nameAr: string; boatId: string; site: string; licenceExpiry: string }
export interface Boat { id: string; name: string; site: string; type: 'Artisanal' | 'Coastal' | 'Commercial'; tracker: 'Phone GPS' | 'Low-cost tracker' | 'VMS (MAFWR)'; gear: string; x: number; y: number; route: number }
export interface Lot {
  id: string; species: string; kg: number; gear: string; site: string; boatId: string; fisherId: string
  landedAt: number; gps: string; inZone: boolean; licenceOk: boolean; bycatch: string; status: LotStatus
  receiver: string; tripId?: string
  grade?: Grade; checks?: number
  saleMode?: 'auction' | 'fixed' | 'off-platform'; ask?: number; bid?: number; bidder?: string
  price?: number; buyer?: string; paid?: boolean
  processedId?: string
}
export interface Trip { id: string; boatId: string; captain: string; gear: string; area: string; hours: number; sets: number; catches: { species: string; kg: number }[]; bycatch: string; declared: boolean; synced: boolean; at: number }
export interface Processed { id: string; product: string; kg: number; inputKg: number; sourceIds: string[]; plant: string; at: number; haccp: Record<string, Ccp>; sensorId: string; shipmentId?: string }
export interface Shipment { id: string; processedIds: string[]; kg: number; declaredKg: number; market: string; online: boolean; step: number; exporter: string; consignee: string; corrections: number; declaration?: string; orderId?: string; at: number }
export interface Sensor { id: string; name: string; kind: string; breach: boolean; seed: number }
export interface Order { id: string; buyer: string; country: string; market: string; species: string; kg: number; price: number; stage: number; lotIds: string[] }
export interface Payment { id: string; lotId: string; fisherId: string; value: number; mktFee: number; payFee: number; settled: boolean; at: number }
export interface Ev { t: number; step: Step; type: string; ref: string; text: string; actor: string }

export interface State {
  clock: number; seq: number
  fishers: Fisher[]; boats: Boat[]; lots: Lot[]; trips: Trip[]; processed: Processed[]
  shipments: Shipment[]; sensors: Sensor[]; orders: Order[]; payments: Payment[]; events: Ev[]
  offline: boolean
}

export const SPECIES = ['Yellowfin tuna', 'Kingfish', 'Squid', 'Lobster', 'Sardine']
export const GEARS = ['Handline', 'Gillnet', 'Trap', 'Jig', 'Purse seine']
export const SITES: Record<string, string> = { Duqm: 'DQM', Sur: 'SUR', Masirah: 'MSR' }
export const REF_PRICE: Record<string, number> = { 'Yellowfin tuna': 1.95, Kingfish: 2.4, Squid: 1.3, Lobster: 9.8, Sardine: 0.35 }
export const BUYERS = ['Gulf Blue Buyers', 'Duqm Seafood Plant', 'Sur Bay Fisheries', 'Muscat Fresh Trading']
export const PLANTS = ['Duqm Seafood Plant', 'Sur Bay Fisheries']
export const CCPS = ['Receiving temperature', 'Processing hygiene', 'Metal detection', 'Histamine sample', 'Transport temperature']
export const MARKETS: Record<string, { rule: string; docs: string[] }> = {
  EU: { rule: 'CATCH catch certificate', docs: ['EU catch certificate (CATCH)', 'Health certificate data', 'Lot passport and cold-chain proof'] },
  US: { rule: 'MMPA · SIMP', docs: ['MMPA certificate of admissibility', 'SIMP key data elements', 'Gear, area and bycatch evidence', 'Health certificate data'] },
  Japan: { rule: 'Catch certificate · IOTC', docs: ['IOTC statistical document', 'Data pack for the government certificate', 'Health certificate data'] },
  GCC: { rule: 'Health certificate', docs: ['Health certificate data', 'Lot passport and cold-chain proof'] },
}
export const SHIP_STEPS_ONLINE = ['Request', 'Preparation', 'Electronic submission', 'Official decision (MAFWR)', 'Return and delivery', 'Customs declaration (Bayan)', 'Clearance and release']
export const SHIP_STEPS_OFFLINE = ['Request', 'Preparation', 'Manual filing by exporter', 'Official decision (MAFWR)', 'Signed copy uploaded', 'Declaration keyed by agent', 'Clearance and release']
export const ORDER_STAGES = ['New order', 'Suppliers matched', 'Quality control', 'Logistics booked', 'Delivered']
/** Fees from the proposal's price list. */
export const FEES = { marketplace: 0.01, payment: 0.0025, tradeDesk: 0.025, markPerKg: 0.02, traceabilityPerTonne: 2, docOnline: 12, docOffline: 25 }

const HOUR = 3_600_000
const START = Date.UTC(2026, 10, 6, 5, 0)

const FISHERS: Fisher[] = [
  { id: 'F1', name: 'Salim Al Balushi', nameAr: 'سالم البلوشي', boatId: 'DQM-1187', site: 'Duqm', licenceExpiry: 'Mar 2027' },
  { id: 'F2', name: 'Hamed Al Wahaibi', nameAr: 'حمد الوهيبي', boatId: 'SUR-0932', site: 'Sur', licenceExpiry: 'Aug 2027' },
  { id: 'F3', name: 'Said Al Farsi', nameAr: 'سعيد الفارسي', boatId: 'MSR-0415', site: 'Masirah', licenceExpiry: 'Jan 2027' },
  { id: 'F4', name: 'Khalid Al Junaibi', nameAr: 'خالد الجنيبي', boatId: 'DQM-1203', site: 'Duqm', licenceExpiry: 'Jun 2027' },
  { id: 'F5', name: 'Nasser Al Araimi', nameAr: 'ناصر العريمي', boatId: 'SUR-1010', site: 'Sur', licenceExpiry: 'Dec 2026' },
  { id: 'F6', name: 'Ali Al Mahrouqi', nameAr: 'علي المحروقي', boatId: 'DQM-C014', site: 'Duqm', licenceExpiry: 'Sep 2027' },
  { id: 'F7', name: 'Majid Al Hinai', nameAr: 'ماجد الهنائي', boatId: 'MSR-0577', site: 'Masirah', licenceExpiry: 'Sep 2026' },
]

export const EXPORTERS = [
  { name: 'Al Wusta Seafood Export', licence: true, cr: 'CR 1284412' },
  { name: 'Sur Bay Fisheries', licence: true, cr: 'CR 1190377' },
  { name: 'Gulf Pearl Trading', licence: false, cr: 'CR 1402981' },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** A licence is valid until the end of its expiry month. */
export const licenceValid = (f: Fisher, now: number) => {
  const [m, y] = f.licenceExpiry.split(' ')
  return Date.UTC(Number(y), MONTHS.indexOf(m) + 1, 1) > now
}
const BOATS: Boat[] = [
  { id: 'DQM-1187', name: 'Al Najm', site: 'Duqm', type: 'Artisanal', tracker: 'Phone GPS', gear: 'Handline', x: 318, y: 250, route: 0 },
  { id: 'SUR-0932', name: 'Al Bahri', site: 'Sur', type: 'Artisanal', tracker: 'Phone GPS', gear: 'Handline', x: 420, y: 96, route: 1 },
  { id: 'MSR-0415', name: 'Hilf 3', site: 'Masirah', type: 'Artisanal', tracker: 'Low-cost tracker', gear: 'Trap', x: 372, y: 196, route: 2 },
  { id: 'DQM-1203', name: 'Ras Al Hadd', site: 'Duqm', type: 'Artisanal', tracker: 'Low-cost tracker', gear: 'Gillnet', x: 300, y: 292, route: 3 },
  { id: 'SUR-1010', name: 'Al Fajr', site: 'Sur', type: 'Artisanal', tracker: 'Phone GPS', gear: 'Jig', x: 446, y: 128, route: 4 },
  { id: 'DQM-C014', name: 'Bahr Al Arab', site: 'Duqm', type: 'Coastal', tracker: 'VMS (MAFWR)', gear: 'Purse seine', x: 380, y: 300, route: 5 },
  { id: 'MSR-0577', name: 'Al Murjan', site: 'Masirah', type: 'Artisanal', tracker: 'Phone GPS', gear: 'Gillnet', x: 350, y: 170, route: 1 },
]

/** Schematic coastline of the map: land lies west of this x for a given y. */
export const coastX = (y: number) => 340 - y * 0.27

/** Closed area on the tracking map (schematic coordinates). */
export const CLOSED_AREA = { x: 400, y: 210, w: 110, h: 70 }
export const inPermittedArea = (b: { x: number; y: number }) =>
  !(b.x >= CLOSED_AREA.x && b.x <= CLOSED_AREA.x + CLOSED_AREA.w && b.y >= CLOSED_AREA.y && b.y <= CLOSED_AREA.y + CLOSED_AREA.h)

// ---------- helpers ----------
const ev = (s: State, step: Step, type: string, ref: string, text: string, actor: string) => {
  s.events.push({ t: s.clock, step, type, ref, text, actor })
}
const tick = (s: State, hours: number) => {
  // Small deterministic variation so lead times are not all identical.
  s.seq += 1
  s.clock += Math.round(hours * (0.8 + ((s.seq * 37) % 40) / 100) * HOUR)
}
const pad = (n: number, w = 4) => String(n).padStart(w, '0')
export const lotById = (s: State, id: string) => s.lots.find((l) => l.id === id)
export const fisherOf = (s: State, l: Lot) => s.fishers.find((f) => f.id === l.fisherId)!
export const boatOf = (s: State, id: string) => s.boats.find((b) => b.id === id)!
export const round3 = (x: number) => Math.round(x * 1000) / 1000

// ---------- actions (each mutates a draft copy) ----------
export const actions = {
  registerLot(s: State, a: { fisherId: string; species: string; kg: number; gear: string; receiver: string; bycatch: string; licenceOk: boolean; tripId?: string }) {
    const f = s.fishers.find((x) => x.id === a.fisherId)!
    const b = boatOf(s, f.boatId)
    tick(s, 0.4)
    const n = s.lots.length + 31
    const id = `OM-${SITES[f.site]}-26-11-${pad(n)}`
    const lat = (19.6 + (b.y % 50) / 60).toFixed(2)
    const lon = (57.7 + (b.x % 50) / 80).toFixed(2)
    s.lots.push({ id, species: a.species, kg: a.kg, gear: a.gear, site: f.site, boatId: b.id, fisherId: f.id, landedAt: s.clock, gps: `${lat}° N, ${lon}° E`, inZone: inPermittedArea(b), licenceOk: a.licenceOk, bycatch: a.bycatch, status: 'registered', receiver: a.receiver, tripId: a.tripId })
    ev(s, 'P1', 'ObjectEvent · commissioning', id, `Lot created at first receipt: ${a.species}, ${a.kg} kg, ${a.gear}, ${b.name}`, a.receiver)
    return id
  },
  verifyLot(s: State, a: { id: string; grade: Grade; checks: number }) {
    const l = lotById(s, a.id)!
    tick(s, 1.2)
    l.grade = a.grade; l.checks = a.checks; l.status = 'verified'
    ev(s, 'P2', 'ObjectEvent · inspecting', l.id, `Graded ${a.grade}, ${a.checks}/5 checks, 3 photos. Marked Trace Verified`, 'Quality officer Q-014')
  },
  listLot(s: State, a: { id: string; mode: 'auction' | 'fixed'; ask: number }) {
    const l = lotById(s, a.id)!
    tick(s, 0.3)
    l.status = 'listed'; l.saleMode = a.mode; l.ask = a.ask; l.bid = undefined; l.bidder = undefined
    ev(s, 'P3', 'ObjectEvent · listing', l.id, `Listed on the marketplace (${a.mode === 'auction' ? 'remote bidding' : 'fixed price'}) at RO ${a.ask.toFixed(3)}/kg`, l.receiver)
  },
  placeBid(s: State, a: { id: string; bidder: string }) {
    const l = lotById(s, a.id)!
    l.bid = round3((l.bid ?? l.ask!) + 0.05); l.bidder = a.bidder
    ev(s, 'P3', 'TransactionEvent · bid', l.id, `${a.bidder} bids RO ${l.bid.toFixed(3)}/kg`, a.bidder)
  },
  closeSale(s: State, a: { id: string; buyer?: string }) {
    const l = lotById(s, a.id)!
    tick(s, 2.5)
    const price = l.saleMode === 'auction' ? (l.bid ?? l.ask!) : l.ask!
    const buyer = l.saleMode === 'auction' ? (l.bidder ?? a.buyer ?? BUYERS[0]) : (a.buyer ?? BUYERS[0])
    sell(s, l, price, buyer)
  },
  recordOffPlatformSale(s: State, a: { id: string; buyer: string; price: number }) {
    const l = lotById(s, a.id)!
    tick(s, 3)
    l.saleMode = 'off-platform'
    sell(s, l, a.price, a.buyer)
  },
  settlePayment(s: State, a: { id: string }) {
    const p = s.payments.find((x) => x.id === a.id)!
    tick(s, 0.5)
    p.settled = true; p.at = s.clock
    lotById(s, p.lotId)!.paid = true
    ev(s, 'P3', 'TransactionEvent · settlement', p.lotId, `Partner bank settles RO ${p.value.toFixed(3)} to the fisher, same day. Buyer pays RO ${(p.mktFee + p.payFee).toFixed(3)} in fees`, 'Partner bank')
  },
  addTrip(s: State, a: Omit<Trip, 'id' | 'declared' | 'synced' | 'at'>) {
    const id = `LB-${pad(s.trips.length + 201)}`
    s.trips.push({ ...a, id, declared: false, synced: !s.offline, at: s.clock })
    if (!s.offline) ev(s, 'P1', 'ObjectEvent · catch record', id, `e-Logbook entry: ${a.catches.map((c) => `${c.kg} kg ${c.species}`).join(', ')} · ${a.gear} · ${a.area}`, a.captain)
    return id
  },
  declareTrip(s: State, a: { id: string }) {
    const t = s.trips.find((x) => x.id === a.id)!
    t.declared = true
    ev(s, 'P1', 'ObjectEvent · pre-landing declaration', t.id, `Pre-landing declaration sent for ${boatOf(s, t.boatId).name}`, t.captain)
  },
  setOffline(s: State, a: { offline: boolean }) {
    s.offline = a.offline
    if (!a.offline) {
      for (const t of s.trips.filter((x) => !x.synced)) {
        t.synced = true
        ev(s, 'P1', 'ObjectEvent · catch record', t.id, `e-Logbook entry synced after reconnecting: ${t.catches.map((c) => `${c.kg} kg ${c.species}`).join(', ')}`, t.captain)
      }
    }
  },
  moveBoats(s: State) {
    tick(s, 1)
    const ROUTES = [[26, -10], [18, 22], [20, 14], [-14, -18], [-10, 26], [22, -24]]
    for (const b of s.boats) {
      const [dx, dy] = ROUTES[b.route % ROUTES.length]
      b.y = Math.min(330, Math.max(30, b.y + dy))
      const minX = Math.round(coastX(b.y) + 18)
      b.x = Math.min(530, Math.max(minX, b.x + dx))
      if (b.x === 530 || b.x === minX || b.y === 330 || b.y === 30) b.route += 3
    }
    const inside = s.boats.filter((b) => !inPermittedArea(b))
    for (const b of inside) ev(s, 'P1', 'ObjectEvent · geofence', b.id, `${b.name} entered the closed area`, b.tracker)
  },
  createProcessed(s: State, a: { sourceIds: string[]; product: string; yieldPct: number; plant: string }) {
    tick(s, 5)
    const lots = a.sourceIds.map((id) => lotById(s, id)!)
    const inputKg = lots.reduce((n, l) => n + l.kg, 0)
    const id = `PL-${SITES[lots[0].site]}-${pad(s.processed.length + 412)}`
    const sensorId = s.sensors[s.processed.length % s.sensors.length].id
    s.processed.push({ id, product: a.product, kg: Math.round(inputKg * a.yieldPct) / 100, inputKg, sourceIds: a.sourceIds, plant: a.plant, at: s.clock, haccp: Object.fromEntries(CCPS.map((c) => [c, 'pending' as Ccp])), sensorId })
    for (const l of lots) { l.status = 'processed'; l.processedId = id }
    ev(s, 'P4', 'TransformationEvent', id, `${lots.length} source lot${lots.length > 1 ? 's' : ''} (${inputKg} kg) → ${a.product}, yield ${a.yieldPct}%`, a.plant)
    return id
  },
  setCcp(s: State, a: { id: string; ccp: string; value: Ccp }) {
    const p = s.processed.find((x) => x.id === a.id)!
    p.haccp[a.ccp] = a.value
    ev(s, 'P4', 'ObjectEvent · e-HACCP', p.id, `${a.ccp}: ${a.value}`, `${p.plant} QA`)
  },
  toggleBreach(s: State, a: { id: string }) {
    const z = s.sensors.find((x) => x.id === a.id)!
    z.breach = !z.breach
    if (z.breach) {
      for (const p of s.processed.filter((x) => x.sensorId === z.id && !isReleased(s, x))) {
        p.haccp['Transport temperature'] = 'fail'
        ev(s, 'P4', 'SensorEvent · breach', p.id, `${z.name}: 5.6 °C for 18 minutes, above the 4 °C limit. QA review requested`, z.name)
      }
    }
  },
  createShipment(s: State, a: { processedIds: string[]; market: string; online: boolean; declaredKg?: number; exporter: string; consignee: string; orderId?: string }) {
    tick(s, 1.5)
    const ps = a.processedIds.map((id) => s.processed.find((p) => p.id === id)!)
    const kg = ps.reduce((n, p) => n + p.kg, 0)
    const id = `SH-2611-${pad(s.shipments.length + 7, 2)}`
    s.shipments.push({ id, processedIds: a.processedIds, kg, declaredKg: a.declaredKg ?? kg, market: a.market, online: a.online, step: 1, exporter: a.exporter, consignee: a.consignee, corrections: 0, orderId: a.orderId, at: s.clock })
    for (const p of ps) { p.shipmentId = id; for (const lid of p.sourceIds) lotById(s, lid)!.status = 'shipped' }
    ev(s, 'P5', 'ObjectEvent · shipping request', id, `Exporter requests a ${a.market} pack for ${kg} kg from ${a.processedIds.join(', ')}`, a.exporter)
    return id
  },
  advanceShipment(s: State, a: { id: string }) {
    const sh = s.shipments.find((x) => x.id === a.id)!
    if (sh.step >= 7) return
    const i = sh.step
    tick(s, [0, 1.6, 0.2, sh.online ? 2.6 : 9, 0.2, sh.online ? 0.4 : 3, 2.8][i])
    const names = sh.online ? SHIP_STEPS_ONLINE : SHIP_STEPS_OFFLINE
    const actor = i === 3 ? 'MAFWR' : i === 6 ? 'Customs · Bayan' : i === 2 && !sh.online ? sh.exporter : i === 5 && !sh.online ? 'Clearing agent' : 'Trace'
    let text = `${names[i]} complete`
    if (i === 3) text = 'MAFWR validates and signs the documents electronically'
    if (i === 6) {
      sh.declaration = `BYN-26-${pad(48210 + s.shipments.indexOf(sh) * 37, 6)}`
      text = `Customs clears; Bayan returns declaration ${sh.declaration} and release status`
      for (const pid of sh.processedIds) for (const lid of s.processed.find((p) => p.id === pid)!.sourceIds) lotById(s, lid)!.status = 'released'
      if (sh.orderId) { const o = s.orders.find((x) => x.id === sh.orderId); if (o && o.stage < 4) o.stage = 4 }
    }
    sh.step += 1
    ev(s, 'P5', i === 3 ? 'TransactionEvent · signature' : i === 6 ? 'TransactionEvent · release' : 'ObjectEvent · document flow', sh.id, text, actor)
  },
  requestCorrection(s: State, a: { id: string }) {
    const sh = s.shipments.find((x) => x.id === a.id)!
    tick(s, 1.5)
    sh.corrections += 1; sh.step = 1
    ev(s, 'P5', 'TransactionEvent · correction', sh.id, 'MAFWR requests a correction; pack returned to preparation', 'MAFWR')
  },
  createOrder(s: State, a: Omit<Order, 'id' | 'stage' | 'lotIds'>) {
    const id = `TD-${pad(s.orders.length + 118)}`
    s.orders.push({ ...a, id, stage: 0, lotIds: [] })
    ev(s, 'P5', 'TransactionEvent · trade order', id, `${a.buyer} (${a.country}) orders ${a.kg} kg ${a.species} at RO ${a.price.toFixed(3)}/kg`, 'Trade desk')
  },
  matchOrder(s: State, a: { id: string; lotIds: string[] }) {
    const o = s.orders.find((x) => x.id === a.id)!
    o.lotIds = a.lotIds; o.stage = 1
    ev(s, 'P5', 'TransactionEvent · consolidation', o.id, `Order consolidated from ${a.lotIds.length} verified lot${a.lotIds.length > 1 ? 's' : ''}`, 'Trade desk')
  },
  advanceOrder(s: State, a: { id: string }) {
    const o = s.orders.find((x) => x.id === a.id)!
    if (o.stage >= 4) return
    o.stage += 1
    ev(s, 'P5', 'ObjectEvent · trade desk', o.id, ORDER_STAGES[o.stage], 'Trade desk')
  },
}

function sell(s: State, l: Lot, price: number, buyer: string) {
  l.price = price; l.buyer = buyer; l.status = 'sold'
  const value = round3(l.kg * price)
  const onPlatform = l.saleMode !== 'off-platform'
  s.payments.push({ id: `PAY-${pad(s.payments.length + 5001)}`, lotId: l.id, fisherId: l.fisherId, value, mktFee: onPlatform ? round3(value * FEES.marketplace) : 0, payFee: round3(value * FEES.payment), settled: false, at: s.clock })
  ev(s, 'P3', 'TransactionEvent · sale', l.id, `${onPlatform ? 'Sold on the marketplace' : 'Off-platform sale recorded'} to ${buyer} at RO ${price.toFixed(3)}/kg (RO ${value.toFixed(3)})`, buyer)
}

/** Every event in a lot's chain of custody: the lot, its processed lot and its shipment. */
export function trailFor(s: State, lotId: string) {
  const lot = lotById(s, lotId)
  if (!lot) return []
  const refs = new Set([lot.id])
  const p = lot.processedId ? s.processed.find((x) => x.id === lot.processedId) : undefined
  if (p) refs.add(p.id)
  if (p?.shipmentId) refs.add(p.shipmentId)
  if (lot.tripId) refs.add(lot.tripId)
  return s.events.filter((e) => refs.has(e.ref) && !(e.ref === lot.tripId && e.t > lot.landedAt))
}

/** Upstream and downstream of any lot, processed lot or shipment id. */
export function traceAny(s: State, id: string) {
  let shipments: Shipment[] = []
  let processed: Processed[] = []
  const sh = s.shipments.find((x) => x.id === id)
  const pr = s.processed.find((x) => x.id === id)
  const lot = lotById(s, id)
  if (sh) processed = s.processed.filter((p) => sh.processedIds.includes(p.id))
  else if (pr) processed = [pr]
  else if (lot?.processedId) processed = s.processed.filter((p) => p.id === lot.processedId)
  shipments = s.shipments.filter((x) => processed.some((p) => p.shipmentId === x.id))
  // A suspect source lot recalls only itself upstream; a processed lot or shipment recalls all its sources.
  const lots = lot ? [lot] : s.lots.filter((l) => processed.some((p) => p.sourceIds.includes(l.id)))
  const fishers = [...new Set(lots.map((l) => l.fisherId))].map((fid) => s.fishers.find((f) => f.id === fid)!)
  return { lots, processed, shipments, fishers }
}

export const isReleased =(s: State, p: Processed) => !!p.shipmentId && (s.shipments.find((x) => x.id === p.shipmentId)?.step ?? 0) >= 7

export type ActionName = keyof typeof actions
export type ActionArg<K extends ActionName> = Parameters<(typeof actions)[K]>[1]

// ---------- seed: built by replaying the same actions the UI uses ----------
export function seed(): State {
  const s: State = {
    clock: START, seq: 0, fishers: FISHERS, boats: structuredClone(BOATS), lots: [], trips: [], processed: [], shipments: [], payments: [], events: [], offline: false,
    sensors: [
      { id: 'CS-2', name: 'Cold store CS-2', kind: 'Cold store', breach: false, seed: 1 },
      { id: 'RT-07', name: 'Reefer truck RT-07', kind: 'Transport', breach: false, seed: 2 },
      { id: 'RT-11', name: 'Reefer truck RT-11', kind: 'Transport', breach: false, seed: 3 },
    ],
    orders: [],
  }
  const reg = (fisherId: string, species: string, kg: number, gear: string, receiver: string, bycatch = 'None recorded', licenceOk = true) => {
    tick(s, 1.5)
    return actions.registerLot(s, { fisherId, species, kg, gear, receiver, bycatch, licenceOk })
  }
  const sellOn = (id: string, grade: Grade, buyer: string, bids = 2) => {
    actions.verifyLot(s, { id, grade, checks: 5 })
    const l = lotById(s, id)!
    actions.listLot(s, { id, mode: 'auction', ask: REF_PRICE[l.species] })
    for (let i = 0; i < bids; i++) actions.placeBid(s, { id, bidder: buyer })
    actions.closeSale(s, { id })
    actions.settlePayment(s, { id: s.payments[s.payments.length - 1].id })
  }
  actions.addTrip(s, { boatId: 'DQM-C014', captain: 'Ali Al Mahrouqi', gear: 'Purse seine', area: 'Arabian Sea · offshore Duqm', hours: 14, sets: 3, catches: [{ species: 'Sardine', kg: 1180 }], bycatch: 'None observed' })
  actions.declareTrip(s, { id: 'LB-0201' })

  // Fully released chain: three tuna lots → loins → EU shipment.
  const a1 = reg('F1', 'Yellowfin tuna', 412, 'Handline', 'Duqm collection centre')
  const a2 = reg('F4', 'Yellowfin tuna', 186, 'Handline', 'Duqm collection centre')
  const a3 = reg('F2', 'Yellowfin tuna', 210, 'Handline', 'Sur landing site')
  sellOn(a1, 'A', 'Duqm Seafood Plant'); sellOn(a2, 'A', 'Duqm Seafood Plant'); sellOn(a3, 'B', 'Duqm Seafood Plant', 1)
  const p1 = actions.createProcessed(s, { sourceIds: [a1, a2, a3], product: 'Yellowfin loins, frozen', yieldPct: 54, plant: 'Duqm Seafood Plant' })
  for (const c of CCPS) actions.setCcp(s, { id: p1, ccp: c, value: 'pass' })
  const sh1 = actions.createShipment(s, { processedIds: [p1], market: 'EU', online: true, exporter: 'Al Wusta Seafood Export', consignee: 'Mariscos Levante, Spain' })
  for (let i = 0; i < 6; i++) actions.advanceShipment(s, { id: sh1 })

  // Second chain, mid-way through export: kingfish → steaks → GCC shipment awaiting MAFWR.
  const b1 = reg('F3', 'Kingfish', 148, 'Gillnet', 'Masirah landing site', '2 turtles released alive')
  const b2 = reg('F5', 'Kingfish', 96.4, 'Handline', 'Sur landing site')
  sellOn(b1, 'B', 'Sur Bay Fisheries'); sellOn(b2, 'A', 'Sur Bay Fisheries')
  const p2 = actions.createProcessed(s, { sourceIds: [b1, b2], product: 'Kingfish steaks, chilled', yieldPct: 62, plant: 'Sur Bay Fisheries' })
  for (const c of CCPS.slice(0, 4)) actions.setCcp(s, { id: p2, ccp: c, value: 'pass' })
  actions.createOrder(s, { buyer: 'Dunes Hotels Group', country: 'UAE', market: 'GCC', species: 'Kingfish', kg: 150, price: 4.2 })
  actions.matchOrder(s, { id: 'TD-0118', lotIds: [b1, b2] })
  actions.advanceOrder(s, { id: 'TD-0118' })
  const sh2 = actions.createShipment(s, { processedIds: [p2], market: 'GCC', online: true, exporter: 'Sur Bay Fisheries', consignee: 'Dunes Hotels Group, UAE', orderId: 'TD-0118' })
  actions.advanceShipment(s, { id: sh2 }); actions.advanceShipment(s, { id: sh2 })

  // Sold and waiting at the plant, including one off-platform sale that skipped the quality check.
  const c1 = reg('F3', 'Lobster', 31.6, 'Trap', 'Masirah landing site')
  sellOn(c1, 'A', 'Duqm Seafood Plant', 3)
  const c2 = reg('F5', 'Squid', 238, 'Jig', 'Sur landing site')
  actions.recordOffPlatformSale(s, { id: c2, buyer: 'Sur Bay Fisheries', price: 1.25 })
  const c3 = reg('F4', 'Yellowfin tuna', 124, 'Gillnet', 'Duqm collection centre', 'No bycatch record')
  sellOn(c3, 'B', 'Duqm Seafood Plant', 1)

  // Live on the marketplace.
  const d1 = reg('F1', 'Yellowfin tuna', 386, 'Handline', 'Duqm collection centre')
  actions.verifyLot(s, { id: d1, grade: 'A', checks: 5 }); actions.listLot(s, { id: d1, mode: 'auction', ask: 1.95 }); actions.placeBid(s, { id: d1, bidder: 'Muscat Fresh Trading' })
  const d2 = reg('F2', 'Kingfish', 140, 'Handline', 'Sur landing site')
  actions.verifyLot(s, { id: d2, grade: 'B', checks: 5 }); actions.listLot(s, { id: d2, mode: 'fixed', ask: 2.3 })
  // Verified, not yet listed; and fresh landings waiting for the quality officer.
  const e1 = reg('F3', 'Lobster', 44, 'Trap', 'Masirah landing site')
  actions.verifyLot(s, { id: e1, grade: 'A', checks: 5 })
  reg('F4', 'Squid', 300, 'Jig', 'Duqm collection centre')
  reg('F6', 'Sardine', 1180, 'Purse seine', 'Duqm collection centre')
  s.lots[s.lots.length - 1].tripId = 'LB-0201'

  actions.createOrder(s, { buyer: 'Kaiyo Foods', country: 'Japan', market: 'Japan', species: 'Yellowfin tuna', kg: 400, price: 5.6 })
  actions.createOrder(s, { buyer: 'Atlantic Catch Imports', country: 'United States', market: 'US', species: 'Lobster', kg: 60, price: 18.5 })
  return s
}

// ---------- formatting ----------
export const fmtTime = (t: number) =>
  new Date(t).toLocaleString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
export const fmtDay = (t: number) => new Date(t).toLocaleString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short' })
export const ro = (x: number, d = 3) => `RO ${x.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`
export const kgFmt = (x: number) => `${x.toLocaleString('en-US', { maximumFractionDigits: 1 })} kg`

/** Deterministic 24 h temperature series for a sensor (48 half-hour readings). */
export function tempSeries(z: Sensor) {
  const pts: number[] = []
  for (let k = 0; k <= 48; k++) {
    let t = 1.6 + z.seed * 0.3 + 0.4 * Math.sin(k / (2.4 + z.seed * 0.3)) + 0.15 * Math.cos(k / 1.3)
    if (z.breach && k >= 28 && k <= 30) t = k === 29 ? 5.6 : 4.6
    pts.push(t)
  }
  return pts
}
