/** The 17 modules of the proposal (Appendix A), grouped by target-process step. */
export type Module = { id: string; group: string; path: string; title: string; short: string; users: string }

export const MODULES: Module[] = [
  { id: 'M1', group: 'P1', path: '/lot-registration', title: 'Lot registration at first receipt', short: 'Lot registration', users: 'First receivers, landing-site staff' },
  { id: 'M3', group: 'P1', path: '/e-logbook', title: 'e-Logbook', short: 'e-Logbook', users: 'Commercial and coastal captains' },
  { id: 'M4', group: 'P1', path: '/fisher-app', title: 'Fisher app', short: 'Fisher app', users: 'Artisanal fishers' },
  { id: 'M5', group: 'P1', path: '/tracking', title: 'Position and gear tracking', short: 'Position & gear', users: 'Fishers, exporters' },
  { id: 'M2', group: 'P2', path: '/quality-check', title: 'Quality check and evidence app', short: 'Quality check', users: 'Trace quality officers, plant QA' },
  { id: 'M8', group: 'P2', path: '/grading', title: 'Premium grading and Trace Verified mark', short: 'Grading & Verified mark', users: 'Fishers, processors' },
  { id: 'M6', group: 'P3', path: '/marketplace', title: 'Digital first-sale marketplace', short: 'Marketplace', users: 'Buyers, first receivers' },
  { id: 'M7', group: 'P3', path: '/payments', title: 'Fisher payments', short: 'Fisher payments', users: 'Fishers, buyers, partner bank' },
  { id: 'M10', group: 'P4', path: '/plant', title: 'Plant and exporter traceability', short: 'Plant traceability', users: 'Certified plants, exporters' },
  { id: 'M11', group: 'P4', path: '/cold-chain', title: 'Cold-chain IoT', short: 'Cold-chain IoT', users: 'Transport and cold stores' },
  { id: 'M12', group: 'P4', path: '/haccp', title: 'e-HACCP', short: 'e-HACCP', users: 'Quality managers' },
  { id: 'M13', group: 'P5', path: '/export-documents', title: 'Export document hub, MAFWR exchange and Bayan link', short: 'Export documents', users: 'Exporters, clearing agents, MAFWR export staff' },
  { id: 'M9', group: 'P5', path: '/trade-desk', title: 'Export trade desk', short: 'Trade desk', users: 'Exporters, foreign buyers' },
  { id: 'M14', group: 'P6', path: '/buyer-audit', title: 'Buyer audit and supplier scoring', short: 'Buyer audit', users: 'Hotels, retailers, importers' },
  { id: 'M15', group: 'P6', path: '/passport', title: 'Consumer product passport', short: 'Product passport', users: 'Consumers, restaurants' },
  { id: 'M16', group: 'IN', path: '/analytics', title: 'Analytics and process intelligence', short: 'Process intelligence', users: 'Trace, customers; authorities on request' },
  { id: 'M17', group: 'IN', path: '/data-products', title: 'Data products and electronic monitoring reports', short: 'Data products & EM', users: 'Exporters, banks, insurers, US importers' },
]

export const GROUPS: { id: string; label: string }[] = [
  { id: 'P1', label: 'P1 · Landing and first receipt' },
  { id: 'P2', label: 'P2 · Quality check and grading' },
  { id: 'P3', label: 'P3 · First sale and payment' },
  { id: 'P4', label: 'P4 · Processing and cold chain' },
  { id: 'P5', label: 'P5 · Export documents' },
  { id: 'P6', label: 'P6 · Buyer and consumer' },
  { id: 'IN', label: 'Intelligence' },
]

export const CORE = { dashboard: '/', registries: '/registries', events: '/events', lot: (id: string) => `/lots/${id}` }

export const mod = (id: string) => MODULES.find((m) => m.id === id)!
