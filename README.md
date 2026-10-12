# RV Park Pro Forma Dashboard

Interactive, lender-presentable dashboard for a new-build RV park 5-year pro forma (operating years 2027–2031).

- `src/lib/data.ts` — typed assumptions for both scenarios: **Placeholder** (owner inputs only) and **Estimated** (best-guess fills from the estimated workbook).
- `src/lib/estimates.ts` — basis, confidence and source URLs for the 50 estimated inputs.
- `src/lib/model.ts` — TypeScript re-implementation of the workbook model (P&L, sources & uses, debt service, 2027 seasonality, break-even, sensitivity).
- `src/components/Dashboard.tsx` — UI with live sliders/inputs and Recharts visuals.

```bash
npm install
npm run dev      # local dev
npm run verify   # checks both scenarios against their workbook outputs
npm run build    # static export to ./out (Vercel-ready)
```

Items marked **Placeholder** are not supported by the borrower's file and must be replaced with quotes, comps, or the lender's term sheet. Financing terms are illustrative only.
