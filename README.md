# Trace-Athar · Trace / أثر

It is for Oman SeaFood Trace Solution.

Investor prototype for the Seafood Traceability Hub (STH · أثر): the investor story, the field apps and the business platform, from first receipt to the buyer's audit.

React + TypeScript + Vite, with `react-router-dom` for navigation.

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check and production build
npm run lint
```

## Screens

| Route | Screen |
| --- | --- |
| `/` | Investor overview |
| `/investor-case` | Investor case |
| `/storyboard` | Motion graphics storyboard |
| `/fisher` | Fisher app (Arabic-first, mobile) |
| `/lots/new` | Lot registration at first receipt (mobile) |
| `/quality` | Quality check and grading (mobile) |
| `/passport` | Consumer QR passport (mobile) |
| `/marketplace` | First-sale marketplace |
| `/plant` | Plant traceability and cold chain |
| `/export` | Export document hub: MAFWR and Bayan |
| `/intelligence` | Process intelligence |
| `/buyer-audit` | Buyer audit and supplier scoring |

## Conventions

- `src/index.css` holds the STH brand tokens as CSS variables plus the shared classes (`card`, `panel`, `slab`, `pill`, `btn`, `toggle`, `segmented`, `eyebrow`).
- `src/tokens.ts` exposes the same colours for inline styles and SVG.
- `src/components` has the shared pieces: `PlatformShell` (sidebar layout for desk screens), `PhoneFrame` (390 × 844 field-app frame) and `ui` (`Stat`, `BarRow`, icons).
- `src/routes.ts` is the single list of paths; link with `paths.*`.
- All lots, names and prices on operating screens are demo data held in each page file.
