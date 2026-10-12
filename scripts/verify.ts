import { DEFAULT_INPUTS, WORKBOOK_OUTPUTS as W } from "../src/lib/data";
import { runModel } from "../src/lib/model";

const r = runModel(DEFAULT_INPUTS);
let fail = 0;
const chk = (label: string, got: number, exp: number, tol = 0.5) => {
  const ok = Math.abs(got - exp) <= tol;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}: model=${got.toFixed(4)} workbook=${exp.toFixed(4)}`);
};
r.years.forEach((y, i) => {
  chk(`Revenue ${y.year}`, y.revenue, W.revenue[i]);
  chk(`Opex ${y.year}`, y.opex, W.opex[i]);
  chk(`NOI ${y.year}`, y.noi, W.noi[i]);
  chk(`Debt service ${y.year}`, y.debtService, W.debtService, 0.01);
  chk(`DSCR ${y.year}`, y.dscr, W.dscr[i], 1e-6);
  chk(`Break-even occ ${y.year}`, y.breakEvenDscr1, W.breakEvenOcc[i], 1e-6);
});
chk("Total project cost", r.totalUses, W.totalProjectCost, 0.01);
chk("Loan", r.loan, W.loan, 0.01);
chk("Equity", r.equity, W.equity, 0);
chk("Working capital (2027 peak shortfall)", r.workingCapital, W.workingCapital, 0.01);
chk("Sens1 base", r.sens1.grid[3][2], W.sens1Base, 1e-6);
chk("Sens1 occ-30/rate-20", r.sens1.grid[0][0], W.sens1Corner, 1e-6);
chk("Sens2 6%/0%", r.sens2.grid[0][0], W.sens2.rate06_overrun0, 1e-6);
chk("Sens2 11%/+100%", r.sens2.grid[5][4], W.sens2.rate11_overrun100, 1e-6);
chk("Placeholder count", r.placeholderCount, 23, 0);
console.log(`\nNOI 2028 = $${Math.round(r.years[1].noi).toLocaleString()}, DSCR 2030 = ${r.years[3].dscr.toFixed(2)}x`);
if (fail) { console.log(`${fail} FAILED`); process.exit(1); } else console.log("ALL CHECKS PASS");
