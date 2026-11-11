import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { paths, titles } from './routes'
import Overview from './pages/Overview'
import InvestorCase from './pages/InvestorCase'
import MotionStoryboard from './pages/MotionStoryboard'
import FisherApp from './pages/FisherApp'
import LotRegistration from './pages/LotRegistration'
import QualityCheck from './pages/QualityCheck'
import ConsumerPassport from './pages/ConsumerPassport'
import Marketplace from './pages/Marketplace'
import PlantTraceability from './pages/PlantTraceability'
import ExportDocHub from './pages/ExportDocHub'
import ProcessIntelligence from './pages/ProcessIntelligence'
import BuyerAudit from './pages/BuyerAudit'

function RouteEffects() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const t = titles[pathname]
    document.title = t ? `${t} · Trace / أثر` : 'Trace / أثر'
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <RouteEffects />
      <Routes>
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
        <Route path="*" element={<Overview />} />
      </Routes>
    </BrowserRouter>
  )
}
