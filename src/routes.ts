/** Single source of truth for screen paths, so links never drift from the router. */
export const paths = {
  overview: '/',
  investorCase: '/investor-case',
  storyboard: '/storyboard',
  fisher: '/fisher',
  lotRegistration: '/lots/new',
  qualityCheck: '/quality',
  passport: '/passport',
  marketplace: '/marketplace',
  plant: '/plant',
  exportDocs: '/export',
  intelligence: '/intelligence',
  buyerAudit: '/buyer-audit',
} as const

export const titles: Record<string, string> = {
  [paths.overview]: 'Investor overview',
  [paths.investorCase]: 'Investor case',
  [paths.storyboard]: 'Motion graphics storyboard',
  [paths.fisher]: 'Fisher app',
  [paths.lotRegistration]: 'Lot registration at first receipt',
  [paths.qualityCheck]: 'Quality check and grading',
  [paths.passport]: 'Consumer QR passport',
  [paths.marketplace]: 'First-sale marketplace',
  [paths.plant]: 'Plant traceability and cold chain',
  [paths.exportDocs]: 'Export document hub',
  [paths.intelligence]: 'Process intelligence',
  [paths.buyerAudit]: 'Buyer audit and supplier scoring',
}
