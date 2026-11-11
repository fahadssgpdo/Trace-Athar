import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import logoOnDark from '../assets/logo-on-dark.svg'
import { paths } from '../routes'
import { c } from '../tokens'

const NAV: [string, string][] = [
  ['Overview', paths.overview],
  ['Marketplace', paths.marketplace],
  ['Plant & cold chain', paths.plant],
  ['Export documents', paths.exportDocs],
  ['Process intelligence', paths.intelligence],
  ['Buyer audit', paths.buyerAudit],
  ['Investor case', paths.investorCase],
]

type Props = {
  workspace: string
  workspaceNote?: string
  gap?: number
  children: ReactNode
}

/** Sidebar + main column shared by every desk (web) screen of the platform. */
export default function PlatformShell({ workspace, workspaceNote, gap, children }: Props) {
  return (
    <div className="shell">
      <aside className="shell__aside">
        <img src={logoOnDark} alt="STH" style={{ height: 34, width: 'auto', alignSelf: 'flex-start' }} />
        <div style={{ fontSize: 13, color: c.mist }}>
          Workspace
          <div style={{ color: c.sand, fontWeight: 600, fontSize: 15 }}>{workspace}</div>
          {workspaceNote && <div style={{ fontSize: 12, marginTop: 4 }}>{workspaceNote}</div>}
        </div>
        <nav aria-label="Platform" className="shell__nav">
          {NAV.map(([label, to]) => (
            <NavLink key={to} to={to} end className="shell__link">
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="shell__main" style={{ gap }}>
        {children}
      </main>
    </div>
  )
}

type HeaderProps = {
  eyebrow: string
  title: string
  lead?: ReactNode
  leadMaxWidth?: number
  action?: ReactNode
}

export function PageHeader({ eyebrow, title, lead, leadMaxWidth, action }: HeaderProps) {
  return (
    <div className="row" style={{ gap: 16, alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <div className="stack" style={{ gap: 6 }}>
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="page-title">{title}</h1>
        {lead && (
          <div className="muted" style={{ maxWidth: leadMaxWidth }}>
            {lead}
          </div>
        )}
      </div>
      {action}
    </div>
  )
}
