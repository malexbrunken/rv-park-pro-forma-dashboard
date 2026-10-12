# RV Park Pro Forma Dashboard

Interactive, lender-presentable dashboard for a new-build RV park 5-year pro forma (operating years 2027–2031).

- `src/lib/data.ts` — typed assumptions extracted from the lender workbook (placeholders flagged).
- `src/lib/model.ts` — TypeScript re-implementation of the workbook model (P&L, sources & uses, debt service, 2027 seasonality, break-even, sensitivity).
- `src/components/Dashboard.tsx` — UI with live sliders/inputs and Recharts visuals.

```bash
npm install
npm run dev      # local dev
npm run verify   # checks model defaults against workbook outputs
npm run build    # static export to ./out (Vercel-ready)
```

Items marked **Placeholder** are not supported by the borrower's file and must be replaced with quotes, comps, or the lender's term sheet. Financing terms are illustrative only.
