import { useState } from 'react'
import { c, display } from '../../tokens'
import { BUYERS, FEES, fisherOf, kgFmt, REF_PRICE, ro, round3 } from '../store'
import { useStore } from '../StoreContext'
import { Badge, Empty, Field, Kpi, LotLink, Page, Panel } from '../ui'

/* ------------------------------------------------------------------ M6 */
export function Marketplace() {
  const { state, run } = useStore()
  const [buyer, setBuyer] = useState(BUYERS[0])
  const [listing, setListing] = useState<Record<string, { mode: 'auction' | 'fixed'; ask: string }>>({})
  const [off, setOff] = useState({ id: '', buyer: BUYERS[1], price: '' })
  const ready = state.lots.filter((l) => l.status === 'verified')
  const live = state.lots.filter((l) => l.status === 'listed')
  const sold = state.lots.filter((l) => l.price).slice(-6).reverse()
  const unsold = state.lots.filter((l) => l.status === 'registered' || l.status === 'verified')
  const draft = (id: string, sp: string) => listing[id] ?? { mode: 'auction' as const, ask: REF_PRICE[sp].toFixed(3) }

  return (
    <Page
      code="M6"
      title="Digital first-sale marketplace"
      lead="Remote bidding or fixed-price sales against Trace lot IDs, so the price stays linked to origin. Buyers pay every fee; settlement to the fisher runs the same day."
      actions={
        <label className="field" style={{ minWidth: 220 }}>
          <span className="field__label">Acting as buyer</span>
          <select className="input" value={buyer} onChange={(e) => setBuyer(e.target.value)}>{BUYERS.map((b) => <option key={b}>{b}</option>)}</select>
        </label>
      }
    >
      <Panel title={`Live · ${live.length}`}>
        {live.length ? (
          <div className="grid-auto" style={{ ['--min' as string]: '300px', gap: 12 }}>
            {live.map((l) => {
              const price = l.saleMode === 'auction' ? (l.bid ?? l.ask!) : l.ask!
              const value = round3(price * l.kg)
              const fees = round3(value * (FEES.marketplace + FEES.payment))
              const leading = l.bidder === buyer
              return (
                <div key={l.id} className="card stack" style={{ padding: 16, gap: 10 }}>
                  <div className="kv" style={{ alignItems: 'flex-start' }}>
                    <span className="stack"><b>{l.species} · {kgFmt(l.kg)}</b><span className="muted" style={{ fontSize: 13 }}><LotLink id={l.id} /> · {l.site} · {l.gear}</span></span>
                    <Badge tone={l.grade === 'A' ? 'gold' : 'neutral'}>Grade {l.grade}</Badge>
                  </div>
                  <div className="kv" style={{ alignItems: 'baseline' }}>
                    <span className="muted" style={{ fontSize: 13 }}>{l.saleMode === 'auction' ? (l.bidder ? `Leading: ${l.bidder}` : 'Opening price') : 'Fixed price'}</span>
                    <span style={{ ...display, fontWeight: 700, fontSize: 22, color: c.accent }}>{ro(price)}/kg</span>
                  </div>
                  <div className="muted" style={{ fontSize: 13 }}>Lot value {ro(value)} · buyer fees {ro(fees)} (1.0% + 0.25%) · fisher receives 100%</div>
                  {l.saleMode === 'auction' ? (
                    <div className="row" style={{ gap: 8 }}>
                      <button type="button" className="btn btn--amber btn--sm" onClick={() => run('placeBid', { id: l.id, bidder: buyer })}>{leading ? 'Raise' : 'Bid'} {ro(round3((l.bid ?? l.ask!) + 0.05))}/kg</button>
                      <button type="button" className="btn btn--ghost btn--sm" disabled={!l.bidder} onClick={() => run('closeSale', { id: l.id })}>Close and award</button>
                    </div>
                  ) : (
                    <button type="button" className="btn btn--amber btn--sm" onClick={() => run('closeSale', { id: l.id, buyer })}>Buy now as {buyer}</button>
                  )}
                </div>
              )
            })}
          </div>
        ) : <Empty>No lots are live. List a verified lot below.</Empty>}
      </Panel>

      <div className="row" style={{ gap: 20, alignItems: 'flex-start' }}>
        <Panel title={`Verified, ready to list · ${ready.length}`} style={{ flex: '999 1 480px' }}>
          {ready.length ? ready.map((l) => {
            const d = draft(l.id, l.species)
            return (
              <div key={l.id} className="row" style={{ gap: 10, alignItems: 'flex-end', borderBottom: `1px solid ${c.line}`, paddingBottom: 12 }}>
                <span className="stack" style={{ flex: '1 1 180px' }}><LotLink id={l.id} /><span className="muted" style={{ fontSize: 13 }}>{l.species} · {kgFmt(l.kg)} · Grade {l.grade}</span></span>
                <div role="group" aria-label={`Sale type for ${l.id}`} className="segmented">
                  <button type="button" aria-pressed={d.mode === 'auction'} onClick={() => setListing({ ...listing, [l.id]: { ...d, mode: 'auction' } })}>Bidding</button>
                  <button type="button" aria-pressed={d.mode === 'fixed'} onClick={() => setListing({ ...listing, [l.id]: { ...d, mode: 'fixed' } })}>Fixed</button>
                </div>
                <Field label={d.mode === 'auction' ? 'Opening RO/kg' : 'Price RO/kg'} style={{ width: 130 }}>
                  <input className="input" inputMode="decimal" value={d.ask} onChange={(e) => setListing({ ...listing, [l.id]: { ...d, ask: e.target.value.replace(/[^\d.]/g, '') } })} />
                </Field>
                <button type="button" className="btn btn--ocean btn--sm" disabled={!(Number(d.ask) > 0)} onClick={() => run('listLot', { id: l.id, mode: d.mode, ask: Number(d.ask) })}>List</button>
              </div>
            )
          }) : <Empty>No verified lots waiting. Grade one in M2.</Empty>}
        </Panel>

        <Panel title="Record an off-platform sale" style={{ flex: '1 1 300px' }}>
          <p className="muted" style={{ fontSize: 13 }}>A sale made outside the marketplace is still recorded against the lot so the price stays linked to origin. Only the payment fee applies.</p>
          <Field label="Lot">
            <select className="input" value={off.id} onChange={(e) => setOff({ ...off, id: e.target.value })}>
              <option value="">Choose a lot</option>
              {unsold.map((l) => <option key={l.id} value={l.id}>{l.id} · {l.species}{l.grade ? '' : ' (not graded)'}</option>)}
            </select>
          </Field>
          <Field label="Buyer"><select className="input" value={off.buyer} onChange={(e) => setOff({ ...off, buyer: e.target.value })}>{BUYERS.map((b) => <option key={b}>{b}</option>)}</select></Field>
          <Field label="Price RO/kg"><input className="input" inputMode="decimal" value={off.price} onChange={(e) => setOff({ ...off, price: e.target.value.replace(/[^\d.]/g, '') })} /></Field>
          <button type="button" className="btn btn--ghost" disabled={!off.id || !(Number(off.price) > 0)} onClick={() => { run('recordOffPlatformSale', { id: off.id, buyer: off.buyer, price: Number(off.price) }); setOff({ ...off, id: '', price: '' }) }}>Record sale</button>
        </Panel>
      </div>

      <Panel title="Latest sales">
        <div className="table-scroll">
          <table className="table">
            <thead><tr><th scope="col">Lot</th><th scope="col">Species</th><th scope="col">Buyer</th><th scope="col">Price</th><th scope="col">Value</th><th scope="col">Channel</th></tr></thead>
            <tbody>
              {sold.map((l) => (
                <tr key={l.id}><td><LotLink id={l.id} /></td><td>{l.species}</td><td>{l.buyer}</td><td>{ro(l.price!)}/kg</td><td>{ro(l.price! * l.kg)}</td><td>{l.saleMode === 'off-platform' ? <Badge tone="warn">Off-platform</Badge> : <Badge tone="ok">{l.saleMode === 'auction' ? 'Bidding' : 'Fixed price'}</Badge>}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </Page>
  )
}

/* ------------------------------------------------------------------ M7 */
export function Payments() {
  const { state, run } = useStore()
  const [consent, setConsent] = useState<Record<string, boolean>>({ F1: true })
  const pending = state.payments.filter((p) => !p.settled)
  const settled = state.payments.filter((p) => p.settled)
  const buyerFees = state.payments.reduce((n, p) => n + p.mktFee + p.payFee, 0)
  const byFisher = state.fishers.map((f) => {
    const ps = settled.filter((p) => p.fisherId === f.id)
    return { f, n: ps.length, total: ps.reduce((n, p) => n + p.value, 0) }
  }).filter((x) => x.n > 0)

  return (
    <Page code="M7" title="Fisher payments" lead="The licensed partner bank settles each sale to the fisher the same day. Trace holds no client money; the buyer pays the marketplace and payment fees, so the fisher receives 100% of the lot value.">
      <div className="grid-auto" style={{ ['--min' as string]: '190px', gap: 12 }}>
        <Kpi label="Waiting for settlement" value={ro(pending.reduce((n, p) => n + p.value, 0))} note={`${pending.length} payments`} />
        <Kpi label="Settled to fishers" value={ro(settled.reduce((n, p) => n + p.value, 0))} note={`${settled.length} payments`} dark />
        <Kpi label="Fees paid by buyers" value={ro(buyerFees)} note="1.0% marketplace + 0.25% payment" />
      </div>
      <Panel title="Settlements">
        <div className="table-scroll">
          <table className="table">
            <thead><tr><th scope="col">Payment</th><th scope="col">Lot</th><th scope="col">Fisher</th><th scope="col">To fisher</th><th scope="col">Buyer fees</th><th scope="col">Status</th></tr></thead>
            <tbody>
              {state.payments.slice().reverse().map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.id}</td>
                  <td><LotLink id={p.lotId} /></td>
                  <td>{fisherOf(state, state.lots.find((l) => l.id === p.lotId)!).name}</td>
                  <td>{ro(p.value)}</td>
                  <td>{ro(p.mktFee + p.payFee)}{p.mktFee === 0 && <span className="muted" style={{ fontSize: 12 }}> · off-platform</span>}</td>
                  <td>{p.settled ? <Badge tone="ok">Settled</Badge> : <button type="button" className="btn btn--amber btn--sm" onClick={() => run('settlePayment', { id: p.id })}>Settle via partner bank</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Credit records">
        <p className="muted" style={{ fontSize: 13 }}>A fisher's settled sales form a credit history. It is shared with the partner bank only with the fisher's explicit, revocable consent.</p>
        {byFisher.map(({ f, n, total }) => (
          <div key={f.id} className="row" style={{ gap: 12, alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${c.line}`, paddingBottom: 10, fontSize: 14 }}>
            <span className="stack"><b>{f.name}</b><span className="muted">{n} settled sales · {ro(total)}</span></span>
            <label className="check">
              <input type="checkbox" checked={!!consent[f.id]} onChange={() => setConsent({ ...consent, [f.id]: !consent[f.id] })} />
              Share with partner bank
            </label>
          </div>
        ))}
      </Panel>
    </Page>
  )
}
