import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import mark from '../assets/logo-on-dark.svg'
import { paths } from '../routes'
import { CORE, GROUPS, MODULES } from './nav'
import { useStore } from './StoreContext'

/** Sidebar listing every module, grouped by target-process step. */
export default function AppShell() {
  const { state, reset } = useStore()
  const { pathname } = useLocation()
  const [openFor, setOpenFor] = useState<string | null>(null)
  const open = openFor === pathname // the mobile menu closes itself on navigation

  return (
    <div className="app">
      <aside className="app__aside">
        <div className="app__brand">
          <Link to={CORE.dashboard} aria-label="Trace platform, dashboard">
            <img src={mark} alt="" style={{ width: 34, height: 34, borderRadius: 8 }} />
            <span className="display" style={{ fontWeight: 700, fontSize: 20 }}>Trace</span>
            <span lang="ar" className="arabic" style={{ fontWeight: 600, fontSize: 18, color: 'var(--amber)' }}>أثر</span>
          </Link>
          <button type="button" className="app__menu" aria-expanded={open} aria-controls="app-nav" onClick={() => setOpenFor(open ? null : pathname)}>
            {open ? 'Close' : 'Modules'}
          </button>
        </div>
        <nav id="app-nav" aria-label="Modules" className={open ? 'app__nav open' : 'app__nav'}>
          <NavLink to={CORE.dashboard} end className="app__link"><span className="app__code">▦</span>Dashboard</NavLink>
          {GROUPS.map((g) => (
            <div key={g.id} className="stack" style={{ gap: 2 }}>
              <div className="app__group">{g.label}</div>
              {MODULES.filter((m) => m.group === g.id).map((m) => (
                <NavLink key={m.id} to={m.path} className="app__link">
                  <span className="app__code">{m.id}</span>
                  {m.short}
                </NavLink>
              ))}
            </div>
          ))}
          <div className="app__group">Shared core</div>
          <NavLink to={CORE.registries} className="app__link"><span className="app__code">◎</span>Registries</NavLink>
          <NavLink to={CORE.events} className="app__link"><span className="app__code">≡</span>EPCIS event log</NavLink>
          <div className="app__group">More</div>
          <Link to={paths.overview} className="app__link"><span className="app__code">↗</span>Investor presentation</Link>
        </nav>
        <div className="app__foot">
          <span>Prototype · demo data saved in this browser</span>
          <span>{state.lots.length} lots · {state.events.length} events</span>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all prototype data to the demo starting point?')) reset()
            }}
          >
            Reset demo data
          </button>
        </div>
      </aside>
      <main className="app__main">
        <Outlet />
      </main>
    </div>
  )
}
