import { Scenario, SCENARIO_DEFAULTS, WORKBOOK_OUTPUTS_ESTIMATED, WORKBOOK_OUTPUTS_PLACEHOLDER, WorkbookOutputs } from "../src/lib/data";
import { runModel } from "../src/lib/model";

let fail = 0, total = 0;
function verify(scenario: Scenario, W: WorkbookOutputs) {
  console.log(`\n=== ${scenario.toUpperCase()} scenario vs. workbook ===`);
  const r = runModel(SCENARIO_DEFAULTS[scenario]);
  const chk = (label: string, got: number, exp: number, tol = 0.5) => {
    total++;
    const ok = Math.abs(got - exp) <= tol;
    if (!ok) fail++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${label}: model=${got.toFixed(4)} workbook=${exp.toFixed(4)}`);
  };
  r.years.forEach((y, i) => {
    chk(`Revenue ${y.year}`, y.revenue, W.revenue[i]);
    chk(`Opex ${y.year}`, y.opex, W.opex[i]);
    chk(`NOI ${y.year}`, y.noi, W.noi[i]);
    chk(`Debt service ${y.year}`, y.debtService, W.debtService[i], 0.01);
    chk(`DSCR ${y.year}`, y.dscr, W.dscr[i], 1e-6);
    chk(`Break-even occ ${y.year}`, y.breakEvenDscr1, W.breakEvenOcc[i], 1e-6);
  });
  chk("Total project cost", r.totalUses, W.totalProjectCost, 0.01);
  chk("Loan", r.loan, W.loan, 0.01);
  chk("Equity", r.equity, W.equity, 0);
  chk("Working capital reserve", r.workingCapital, W.workingCapital, 0.01);
  W.sens1.forEach(([i, j, v]) => chk(`Sensitivity 1 [occ ${r.sens1.occChanges[i]}, rate ${r.sens1.rateChanges[j]}]`, r.sens1.grid[i][j], v, 1e-6));
  W.sens2.forEach(([i, j, v]) => chk(`Sensitivity 2 [rate ${r.sens2.rates[i].toFixed(3)}, overrun ${r.sens2.overruns[j]}]`, r.sens2.grid[i][j], v, 1e-6));
  r.cabins.forEach((c, i) => chk(`Cabin schedule ending cash ${c.year}`, c.endingCash, W.cabinEndingCash[i], 0.01));
  chk("Cabins built from cash by 2031", r.cabinsBuiltTotal, W.cabinsBuilt, 0);
  chk("Inputs still at $0 / 0%", r.placeholderCount, W.placeholderCount, 0);
  console.log(`Cabins built ${r.cabinsBuiltTotal} (${r.cabinNote}) · Loan $${Math.round(r.loan).toLocaleString()}`);
  console.log(`Total project cost $${Math.round(r.totalUses).toLocaleString()} · NOI 2028 $${Math.round(r.years[1].noi).toLocaleString()} · DSCR ${r.years.map((y) => y.dscr.toFixed(2) + "x").join(" / ")}`);
}
verify("placeholder", WORKBOOK_OUTPUTS_PLACEHOLDER);
verify("estimated", WORKBOOK_OUTPUTS_ESTIMATED);
if (fail) { console.log(`\n${fail}/${total} FAILED`); process.exit(1); } else console.log(`\nALL ${total} CHECKS PASS`);
