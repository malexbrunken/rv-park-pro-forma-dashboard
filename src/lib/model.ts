import {
  BORROWER_OPEX, CONSTRUCTION_BUDGET, Inputs, MONTHS, PRE_OPENING_COSTS, RATE_GRID_2027,
  SITE_COUNTS, SITE_TYPES, SiteType, YEARS,
} from "./data";

export function pmt(rate: number, n: number, pv: number): number {
  if (n <= 0) return 0;
  if (rate === 0) return pv / n;
  return (pv * rate) / (1 - Math.pow(1 + rate, -n));
}

/** Annual interest & principal for each model year, monthly amortization (mirrors CUMIPMT/CUMPRINC). */
export function amortize(loan: number, annualRate: number, amortYears: number, ioYears: number, years = 5) {
  const r = annualRate / 12;
  const n = Math.round(amortYears * 12);
  const pay = pmt(r, n, loan);
  const out: { begin: number; interest: number; principal: number; end: number }[] = [];
  let bal = loan;
  for (let y = 1; y <= years; y++) {
    const begin = bal;
    let interest = 0, principal = 0;
    if (y <= ioYears) {
      interest = loan * annualRate;
    } else {
      for (let m = 0; m < 12; m++) {
        const amortMonth = (y - ioYears - 1) * 12 + m + 1;
        if (amortMonth > n || bal <= 0) break;
        const i = bal * r;
        const p = pay - i;
        interest += i; principal += p; bal -= p;
      }
    }
    out.push({ begin, interest, principal, end: bal });
  }
  return { monthlyPayment: pay, schedule: out };
}

export interface YearResult {
  year: number;
  units: Record<SiteType, number>;
  availableNights: Record<SiteType, number>;
  occupiedNights: Record<SiteType, number>;
  rate: Record<SiteType, number>;
  lodgingBySite: Record<SiteType, number>;
  lodging: number; store: number; other: number; revenue: number; cogs: number; grossProfit: number;
  opexLines: { name: string; amount: number; placeholder: boolean }[];
  borrowerOpex: number; placeholderOpex: number; opex: number;
  noi: number; debtService: number; interest: number; principal: number; endBalance: number;
  cashFlow: number; dscr: number; meetsMin: boolean;
  weightedOcc: number; breakEvenNoi: number; breakEvenDscr1: number; occForMinDscr: number;
  revenueAt100: number; variablePct: number; fixedOpex: number;
}

export interface ModelResult {
  years: YearResult[];
  uses: { name: string; amount: number; placeholder: boolean }[];
  constructionSubtotal: number;
  totalUses: number; equity: number; loan: number; workingCapital: number;
  loanExWc: number; monthlyPayment: number;
  monthly: { month: string; share: number; revenue: number; cogs: number; borrowerOpex: number; placeholderOpex: number; variableFees: number; noi: number; debtService: number; cashFlow: number; cumulative: number }[];
  peakShortfall: number; negativeMonths: number; lowestMonth: string;
  sens1: { occChanges: number[]; rateChanges: number[]; grid: number[][] };
  sens2: { rates: number[]; overruns: number[]; grid: number[][] };
  placeholderCount: number;
  costPerRvSite: number;
}

const sumArr = (a: number[]) => a.reduce((s, v) => s + v, 0);

const roundTo = (v: number, step: number) => Math.round(v / step) * step;

export function runModel(inp: Inputs): ModelResult {
  const mult = inp.projectCostMultiplier;

  // ---- Project hard costs (needed by property tax, interest reserve, contingency) ----
  const constructionSubtotal = sumArr(CONSTRUCTION_BUDGET.map((c) => sumArr(c.byYear))) * mult;
  const maxCabins = Math.max(...SITE_COUNTS.cabin);
  const cabins = inp.cabinCostPerUnit * maxCabins * mult;
  const rvInfra = inp.rvSiteInfrastructure * mult;
  const hardCost = constructionSubtotal + cabins + rvInfra;
  const contingency = inp.contingencyPct * hardCost;

  // ---- Borrower opex by year (carried-forward blank years inflate from prior year) ----
  const borrowerAnnual = BORROWER_OPEX.map((l) => {
    const out: number[] = [];
    for (let yi = 0; yi < 4; yi++) {
      if (yi === 0) out.push(sumArr(l.monthly2027));
      else if (l.carried?.includes(yi)) out.push(out[yi - 1] * (1 + inp.expenseInflation));
      else out.push(l.annual[yi]);
    }
    out.push(out[3] * (1 + inp.expenseInflation));
    return out.map((v) => v * inp.borrowerOpexMultiplier);
  });

  // ---- Operating years ----
  const ops = YEARS.map((year, yi) => {
    const units = {} as Record<SiteType, number>;
    const avail = {} as Record<SiteType, number>;
    const occN = {} as Record<SiteType, number>;
    const rate = {} as Record<SiteType, number>;
    const lodgingBySite = {} as Record<SiteType, number>;
    let revenueAt100 = 0;
    for (const { key } of SITE_TYPES) {
      units[key] = SITE_COUNTS[key][yi];
      avail[key] = units[key] * inp.seasonNights;
      occN[key] = avail[key] * Math.min(1, inp.occupancy[key][yi] * inp.occupancyMultiplier);
      rate[key] = inp.rates[key] * Math.pow(1 + inp.annualRateIncrease, yi);
      lodgingBySite[key] = occN[key] * rate[key];
      revenueAt100 += avail[key] * rate[key];
    }
    const occupiedNights = sumArr(Object.values(occN));
    const lodging = sumArr(Object.values(lodgingBySite));
    const store = Math.round(occupiedNights * inp.storeSalesPerNight);
    const other = Math.round(occupiedNights * inp.otherIncomePerNight);
    const revenue = lodging + store + other;
    const cogs = store * inp.storeCogsPct;
    const opexLines: YearResult["opexLines"] = BORROWER_OPEX.map((l, li) => ({
      name: l.name, amount: borrowerAnnual[li][yi], placeholder: !!l.carried?.length,
    }));
    const totalUnits = sumArr(Object.values(units));
    const ph: [string, number][] = [
      ["Insurance (property, liability, workers comp)", inp.insurance[yi]],
      ["Property / personal property tax", roundTo(hardCost * inp.assessedPctOfHardCost * inp.propertyTaxRate * inp.taxPhaseIn[yi], 100)],
      ["Repairs & maintenance", Math.round(revenue * inp.rmPctOfRevenue[yi])],
      ["Water, trash, propane & other utilities", totalUnits * inp.utilitiesPerUnit[yi]],
      ["Cabin & bathhouse housekeeping / supplies", occN.cabin * inp.housekeepingPerCabinNight + inp.bathhouseSupplies[yi]],
      ["Card & booking fees", revenue * inp.cardFeesPct],
      ["Management fee", revenue * inp.mgmtFeePct],
      ["Replacement reserve", totalUnits * inp.replacementReservePerSite],
    ];
    ph.forEach(([name, amount]) => opexLines.push({ name, amount, placeholder: true }));
    const borrowerOpex = sumArr(borrowerAnnual.map((b) => b[yi]));
    const placeholderOpex = sumArr(ph.map(([, v]) => v));
    const opex = borrowerOpex + placeholderOpex;
    const noi = revenue - cogs - opex;
    const totalAvail = sumArr(Object.values(avail));
    const weightedOcc = totalAvail ? occupiedNights / totalAvail : 0;
    const variablePct = inp.cardFeesPct + inp.mgmtFeePct;
    const fixedOpex = opex - revenue * variablePct;
    return { year, units, availableNights: avail, occupiedNights: occN, rate, lodgingBySite, lodging, store, other, revenue, cogs, grossProfit: revenue - cogs, opexLines, borrowerOpex, placeholderOpex, opex, noi, weightedOcc, variablePct, fixedOpex, revenueAt100 };
  });

  // ---- Sources & Uses (excluding working capital) ----
  const loanPct = 1 - inp.equityPct;
  const interestReserve = inp.interestReserveOverride ?? roundTo(hardCost * loanPct * 0.5 * inp.interestRate * 9 / 12, 1000);
  const closingBase = 0.75 * (hardCost + inp.softCosts + inp.ffe + contingency + PRE_OPENING_COSTS + interestReserve) * loanPct;
  const closingCosts = inp.closingCostsOverride ??
    roundTo(Math.min(closingBase, 1_000_000) * 0.035 + Math.max(closingBase - 1_000_000, 0) * 0.0375 + inp.closingThirdParty, 100);
  const usesExWc = hardCost + inp.softCosts + inp.ffe + contingency + PRE_OPENING_COSTS + interestReserve + closingCosts + inp.landAcquisition;
  const loanExWc = usesExWc * loanPct;

  // ---- 2027 monthly seasonality (debt service on loan excl. working-capital line) ----
  const y0 = ops[0];
  const monthlyDs = (inp.interestOnlyYears >= 1 ? loanExWc * inp.interestRate : pmt(inp.interestRate / 12, inp.amortYears * 12, loanExWc) * 12) / 12;
  const gridTotal = sumArr(Object.values(RATE_GRID_2027.classAMonthlyRevenue));
  const phFixed2027 = sumArr(y0.opexLines.slice(BORROWER_OPEX.length).filter((l) => !["Card & booking fees", "Management fee"].includes(l.name)).map((l) => l.amount)) / 12;
  let cum = 0;
  const monthly = MONTHS.map((m, mi) => {
    const share = (RATE_GRID_2027.classAMonthlyRevenue[m] ?? 0) / gridTotal;
    const revenue = y0.revenue * share;
    const cogs = y0.cogs * share;
    const borrowerOpex = sumArr(BORROWER_OPEX.map((l) => l.monthly2027[mi])) * inp.borrowerOpexMultiplier;
    const variableFees = revenue * y0.variablePct;
    const noi = revenue - cogs - borrowerOpex - phFixed2027 - variableFees;
    const cashFlow = noi - monthlyDs;
    cum += cashFlow;
    return { month: m, share, revenue, cogs, borrowerOpex, placeholderOpex: phFixed2027, variableFees, noi, debtService: monthlyDs, cashFlow, cumulative: cum };
  });
  const lowest = Math.min(...monthly.map((m) => m.cumulative));
  const peakShortfall = Math.min(0, lowest);
  const carryMonths = monthly.slice(0, Math.max(0, Math.min(12, inp.workingCapitalExtraMonths)));
  const offSeasonCarry = sumArr(carryMonths.map((m) => m.borrowerOpex + m.placeholderOpex + m.debtService));
  const workingCapital = inp.workingCapitalOverride ?? -peakShortfall + offSeasonCarry;

  const uses = [
    ...CONSTRUCTION_BUDGET.map((c) => ({ name: c.name, amount: sumArr(c.byYear) * mult, placeholder: false })),
    { name: "Cabins (cost per unit × cabins planned)", amount: cabins, placeholder: true },
    { name: "RV pads, roads, power pedestals, water/sewer laterals", amount: rvInfra, placeholder: true },
    { name: "Permits, impact fees & soft costs", amount: inp.softCosts, placeholder: true },
    { name: "Furniture, fixtures & equipment", amount: inp.ffe, placeholder: true },
    { name: "Hard-cost contingency", amount: contingency, placeholder: true },
    { name: "Pre-opening costs (2026 accounting, legal, marketing)", amount: PRE_OPENING_COSTS, placeholder: false },
    { name: "Working capital / off-season reserve", amount: workingCapital, placeholder: true },
    { name: "Interest reserve during construction", amount: interestReserve, placeholder: true },
    { name: "Loan closing costs / guarantee fees", amount: closingCosts, placeholder: true },
    { name: "Land acquisition (leased)", amount: inp.landAcquisition, placeholder: false },
  ];
  const totalUses = usesExWc + workingCapital;
  const equity = Math.round(totalUses * inp.equityPct);
  const loan = totalUses - equity;
  const { monthlyPayment, schedule } = amortize(loan, inp.interestRate, inp.amortYears, inp.interestOnlyYears);

  const years: YearResult[] = ops.map((o, yi) => {
    const s = schedule[yi];
    const debtService = s.interest + s.principal;
    const dscr = debtService ? o.noi / debtService : 0;
    const be = (extra: number) => (o.revenueAt100 ? ((o.fixedOpex + o.cogs + extra) / (1 - o.variablePct) - o.store - o.other) / o.revenueAt100 : 0);
    return {
      ...o, debtService, interest: s.interest, principal: s.principal, endBalance: s.end,
      cashFlow: o.noi - debtService, dscr, meetsMin: dscr >= inp.minDscr,
      breakEvenNoi: be(0), breakEvenDscr1: be(debtService), occForMinDscr: be(debtService * inp.minDscr),
    };
  });

  // ---- Sensitivity (stabilized 2030) ----
  const y30 = years[3];
  const occChanges = [-0.3, -0.2, -0.1, 0, 0.1];
  const rateChanges = [-0.2, -0.1, 0, 0.1];
  const sens1 = {
    occChanges, rateChanges,
    grid: occChanges.map((oc) => rateChanges.map((rc) =>
      y30.debtService ? ((y30.lodging * (1 + oc) * (1 + rc) + y30.store + y30.other) * (1 - y30.variablePct) - y30.cogs - y30.fixedOpex) / y30.debtService : 0)),
  };
  const rates = [-0.02, -0.01, 0, 0.01, 0.02, 0.03].map((d) => inp.interestRate + d);
  const overruns = [0, 0.1, 0.25, 0.5, 1];
  const sens2 = {
    rates, overruns,
    grid: rates.map((r) => overruns.map((ov) => {
      const ds = pmt(r / 12, inp.amortYears * 12, totalUses * (1 + ov) * (1 - inp.equityPct)) * 12;
      return ds ? y30.noi / ds : 0;
    })),
  };

  // Mirrors the workbook's "inputs still at $0 / 0%" counter.
  const sumY = (f: (y: (typeof ops)[number], i: number) => number) => sumArr(ops.map(f));
  const occSum = (k: SiteType, from = 0) => sumArr(inp.occupancy[k].slice(from));
  const zeroChecks = [
    inp.seasonNights, occSum("classA", 1), occSum("classBC"), occSum("tent"), occSum("cabin"), inp.rates.tent, inp.rates.cabin,
    inp.annualRateIncrease, sumY((y) => y.store), inp.storeCogsPct, sumY((y) => y.other),
    sumArr(inp.insurance), sumY((y) => y.opexLines[BORROWER_OPEX.length + 1].amount), sumY((y) => y.opexLines[BORROWER_OPEX.length + 2].amount),
    sumY((y) => y.opexLines[BORROWER_OPEX.length + 3].amount), sumY((y) => y.opexLines[BORROWER_OPEX.length + 4].amount),
    inp.cardFeesPct, inp.mgmtFeePct, inp.replacementReservePerSite, inp.expenseInflation, inp.cabinCostPerUnit, inp.rvSiteInfrastructure,
    inp.softCosts, inp.ffe, inp.contingencyPct, workingCapital, interestReserve, closingCosts, inp.equityPct, inp.interestRate,
    inp.amortYears, inp.interestOnlyYears, inp.minDscr,
  ];
  const placeholderCount = zeroChecks.filter((v) => v === 0).length;
  const stabilizedRv = SITE_COUNTS.classA[3] + SITE_COUNTS.classBC[3];

  return {
    years, uses, constructionSubtotal, totalUses, equity, loan, workingCapital, loanExWc, monthlyPayment,
    monthly, peakShortfall, negativeMonths: monthly.filter((m) => m.cashFlow < 0).length,
    lowestMonth: monthly.find((m) => m.cumulative === lowest)?.month ?? "",
    sens1, sens2, placeholderCount, costPerRvSite: totalUses / stabilizedRv,
  };
}
