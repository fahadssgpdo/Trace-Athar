import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import AppShell from './app/AppShell'
import { Dashboard, EventLog, LotDetail, Registries } from './app/modules/Core'
import { Buyer, Export, Intelligence, Landing, Processing, Quality, Sale } from './app/modules'
import { CORE, MODULES } from './app/nav'
import StoreProvider from './app/StoreProvider'
import { paths, titles } from './routes'
const Overview = lazy(() => import('./pages/Overview'))
const InvestorCase = lazy(() => import('./pages/InvestorCase'))
const MotionStoryboard = lazy(() => import('./pages/MotionStoryboard'))
const FisherApp = lazy(() => import('./pages/FisherApp'))
const LotRegistration = lazy(() => import('./pages/LotRegistration'))
const QualityCheck = lazy(() => import('./pages/QualityCheck'))
const ConsumerPassport = lazy(() => import('./pages/ConsumerPassport'))
const Marketplace = lazy(() => import('./pages/Marketplace'))
const PlantTraceability = lazy(() => import('./pages/PlantTraceability'))
const ExportDocHub = lazy(() => import('./pages/ExportDocHub'))
const ProcessIntelligence = lazy(() => import('./pages/ProcessIntelligence'))
const BuyerAudit = lazy(() => import('./pages/BuyerAudit'))

const MODULE_PAGES: Record<string, () => React.JSX.Element> = {
  M1: Landing.LotRegistration, M3: Landing.ELogbook, M4: Landing.FisherAppModule, M5: Landing.Tracking,
  M2: Quality.QualityCheck, M8: Quality.Grading,
  M6: Sale.Marketplace, M7: Sale.Payments,
  M10: Processing.PlantTraceability, M11: Processing.ColdChain, M12: Processing.Haccp,
  M13: Export.ExportDocs, M9: Export.TradeDesk,
  M14: Buyer.BuyerAudit, M15: Buyer.Passport,
  M16: Intelligence.Analytics, M17: Intelligence.DataProducts,
}

function RouteEffects() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const m = MODULES.find((x) => x.path === pathname)
    const t = titles[pathname] ?? (m ? `${m.id} ${m.short}` : undefined)
    document.title = t ? `${t} · Trace / أثر` : 'Trace / أثر'
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <RouteEffects />
      <StoreProvider>
        <Suspense fallback={null}>
        <Routes>
          {/* Working prototype of all 17 modules */}
          <Route element={<AppShell />}>
            <Route path={CORE.dashboard} element={<Dashboard />} />
            {MODULES.map((m) => {
              const El = MODULE_PAGES[m.id]
              return <Route key={m.id} path={m.path} element={<El />} />
            })}
            <Route path="/lots/:id" element={<LotDetail />} />
            <Route path={CORE.registries} element={<Registries />} />
            <Route path={CORE.events} element={<EventLog />} />
          </Route>
          {/* Investor presentation */}
          <Route path={paths.overview} element={<Overview />} />
          <Route path={paths.investorCase} element={<InvestorCase />} />
          <Route path={paths.storyboard} element={<MotionStoryboard />} />
          <Route path={paths.fisher} element={<FisherApp />} />
          <Route path={paths.lotRegistration} element={<LotRegistration />} />
          <Route path={paths.qualityCheck} element={<QualityCheck />} />
          <Route path={paths.passport} element={<ConsumerPassport />} />
          <Route path={paths.marketplace} element={<Marketplace />} />
          <Route path={paths.plant} element={<PlantTraceability />} />
          <Route path={paths.exportDocs} element={<ExportDocHub />} />
          <Route path={paths.intelligence} element={<ProcessIntelligence />} />
          <Route path={paths.buyerAudit} element={<BuyerAudit />} />
          <Route path="*" element={<AppShell />}>
            <Route path="*" element={<Dashboard />} />
          </Route>
        </Routes>
        </Suspense>
      </StoreProvider>
    </BrowserRouter>
  )
}
