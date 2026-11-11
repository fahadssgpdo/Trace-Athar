# Trace-Athar · Trace / أثر

It is for Oman SeaFood Trace Solution.

Investor prototype for the Seafood Traceability Hub (Trace · أثر): the investor story, the field apps and the business platform, from first receipt to the buyer's audit.

React + TypeScript + Vite, with `react-router-dom` for navigation.

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check and production build
npm run lint
```

## Platform prototype (all 17 modules)

The app opens on a working prototype of every module in the proposal (Appendix A). All modules share one lot record and write to one EPCIS-style event log, so a lot can be taken from the landing site to customs release and every downstream screen updates. Demo data is seeded on first load and kept in the browser; **Reset demo data** in the sidebar restores it.

| Step | Module | Route |
| --- | --- | --- |
| P1 | M1 Lot registration at first receipt | `/lot-registration` |
| P1 | M3 e-Logbook (offline queue, pre-landing declaration) | `/e-logbook` |
| P1 | M4 Fisher app (Arabic/English, voice log, payments) | `/fisher-app` |
| P1 | M5 Position and gear tracking (geofence) | `/tracking` |
| P2 | M2 Quality check and evidence | `/quality-check` |
| P2 | M8 Premium grading and Trace Verified mark | `/grading` |
| P3 | M6 Digital first-sale marketplace | `/marketplace` |
| P3 | M7 Fisher payments | `/payments` |
| P4 | M10 Plant and exporter traceability (merges, recall) | `/plant` |
| P4 | M11 Cold-chain IoT | `/cold-chain` |
| P4 | M12 e-HACCP | `/haccp` |
| P5 | M13 Export document hub, MAFWR exchange and Bayan link | `/export-documents` |
| P5 | M9 Export trade desk | `/trade-desk` |
| P6 | M14 Buyer audit and supplier scoring | `/buyer-audit` |
| P6 | M15 Consumer product passport | `/passport?lot=…` |
| — | M16 Analytics and process intelligence | `/analytics` |
| — | M17 Data products and EM reports | `/data-products` |

Shared core: dashboard `/`, lot record `/lots/:id`, registries `/registries`, event log `/events` (EPCIS JSON and CSV export).

MAFWR, Bayan, the partner bank, scales, trackers and sensors are simulated in the browser; there is no backend.

## Investor presentation

The earlier investor screens live under `/investor` (overview, case, storyboard and the designed screens).

## Conventions

- `src/index.css` holds the brand tokens as CSS variables plus the shared classes (`card`, `panel`, `slab`, `pill`, `btn`, `toggle`, `segmented`, `eyebrow`).
- `src/tokens.ts` exposes the same colours for inline styles and SVG.
- `src/components` has the shared pieces: `PlatformShell` (sidebar layout for desk screens), `PhoneFrame` (390 × 844 field-app frame) and `ui` (`Stat`, `BarRow`, icons).
- `src/app/` is the prototype: `store.ts` (data model, actions, seed), `StoreProvider.tsx` (state and persistence), `nav.ts` (module list and routes) and `modules/` (one file per process step).
- `src/routes.ts` lists the presentation paths; link with `paths.*`.
- All lots, names and prices on operating screens are demo data held in each page file.
