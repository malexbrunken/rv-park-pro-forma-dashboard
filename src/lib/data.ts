// Assumptions extracted from the lender pro forma workbook (rv_park_pro_forma.xlsx).
// "borrower" = borrower's own number; "placeholder" = must be provided / supported before lending.

export const YEARS = [2027, 2028, 2029, 2030, 2031] as const;
export type YearIndex = 0 | 1 | 2 | 3 | 4;
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export type SiteType = "classA" | "classBC" | "tent" | "cabin";
export const SITE_TYPES: { key: SiteType; label: string }[] = [
  { key: "classA", label: "Class A motor-home sites" },
  { key: "classBC", label: "Class B/C RV sites" },
  { key: "tent", label: "Tent sites" },
  { key: "cabin", label: "Cabins" },
];

/** Site / unit counts by year (borrower's notes). */
export const SITE_COUNTS: Record<SiteType, number[]> = {
  classA: [20, 40, 40, 40, 40],
  classBC: [20, 40, 40, 40, 40],
  tent: [10, 20, 20, 20, 20],
  cabin: [0, 10, 20, 20, 20],
};

/** Summary of the borrower's 2027 daily rate grid (Apr 1 – Sep 6, 2027). */
export const RATE_GRID_2027 = {
  nightsInGrid: 159,
  classASites: 20,
  classANightsBooked: 2239,
  classARevenue: 165929,
  classBCNightsBooked: 121,
  classBCRevenue: 8591,
  /** Class A revenue by month Apr–Sep (seasonality pattern). */
  classAMonthlyRevenue: { Apr: 22720, May: 33754, Jun: 30954, Jul: 38148, Aug: 33664, Sep: 6689 } as Record<string, number>,
};
export const GRID_CLASS_A_ADR = RATE_GRID_2027.classARevenue / RATE_GRID_2027.classANightsBooked; // ≈ $74.11
export const GRID_CLASS_A_OCC =
  RATE_GRID_2027.classANightsBooked / (RATE_GRID_2027.classASites * RATE_GRID_2027.nightsInGrid); // ≈ 70.4%
export const GRID_CLASS_BC_ADR = RATE_GRID_2027.classBCRevenue / RATE_GRID_2027.classBCNightsBooked; // $71

/** Borrower operating-expense lines. 2027 monthly detail; 2028–2030 annual totals (2031 = 2030 × (1+inflation)). */
export interface OpexLine {
  name: string;
  monthly2027: number[];
  annual: [number, number, number, number]; // 2027..2030
  carriedForward?: string; // note when blank years were carried forward as placeholder
}
export const BORROWER_OPEX: OpexLine[] = [
  { name: "Land lease", monthly2027: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], annual: [0, 0, 0, 49992] },
  { name: "Accounting & bookkeeping (incl. software)", monthly2027: Array(12).fill(250), annual: [3000, 2400, 2400, 2400], carriedForward: "2029–2030 carried forward" },
  { name: "Septic maintenance & pumping", monthly2027: [0, 0, 0, 0, 0, 850, 850, 850, 850, 850, 0, 0], annual: [4250, 4250, 5100, 5100] },
  { name: "Legal", monthly2027: Array(12).fill(0), annual: [0, 0, 0, 0] },
  { name: "Landscaping & trail supplies", monthly2027: [0, 0, 0, 0, 0, 2000, 2000, 0, 0, 0, 0, 0], annual: [4000, 4000, 4000, 4000], carriedForward: "2029–2030 carried forward" },
  { name: "Pool maintenance", monthly2027: [0, 0, 0, 0, 0, 1000, 1000, 1000, 1000, 0, 0, 0], annual: [4000, 4000, 4000, 4000] },
  { name: "Electricity", monthly2027: [200, 200, 200, 1000, 2000, 3000, 4000, 5000, 5000, 3000, 750, 1000], annual: [25350, 25350, 25350, 25350] },
  { name: "Well maintenance & inspections", monthly2027: [0, 0, 0, 0, 1000, 0, 0, 0, 0, 0, 0, 0], annual: [1000, 1000, 1000, 1000] },
  { name: "Sales, marketing & booking software", monthly2027: Array(12).fill(7000), annual: [84000, 48000, 48000, 48000] },
  { name: "Internet access", monthly2027: [600, 600, 600, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200], annual: [12600, 12600, 12600, 12600], carriedForward: "2028–2030 carried forward" },
  { name: "Office & miscellaneous", monthly2027: [600, 600, 600, 600, 1200, 1200, 1200, 1200, 1200, 600, 600, 600], annual: [10200, 10200, 10200, 10200], carriedForward: "2028–2030 carried forward" },
  { name: "General manager (salary, benefits, taxes)", monthly2027: [0, 0, 0, ...Array(9).fill(10000)], annual: [90000, 128400, 136800, 136800] },
  { name: "General store staff", monthly2027: [0, 0, 0, ...Array(9).fill(4833)], annual: [43497, 57996, 57996, 57996], carriedForward: "2030 carried forward" },
  { name: "Groundskeeper / cleaning staff", monthly2027: [0, 0, 0, ...Array(9).fill(3333)], annual: [29997, 39996, 39996, 39996], carriedForward: "2030 carried forward" },
  { name: "Groundskeeper / cleaning staff (seasonal)", monthly2027: [0, 0, 0, 0, ...Array(8).fill(3333)], annual: [26664, 16665, 16665, 16665], carriedForward: "2029–2030 carried forward" },
];

/** Borrower construction budget (Sources & Uses), by year 2026/2027/2028. */
export const CONSTRUCTION_BUDGET: { name: string; byYear: [number, number, number] }[] = [
  { name: "Landscape architect & engineering fees", byYear: [50000, 10000, 0] },
  { name: "Septic system installation", byYear: [0, 64000, 20000] },
  { name: "Well drilling (2 + 2 wells)", byYear: [60000, 60000, 60000] },
  { name: "Electrical", byYear: [0, 60000, 0] },
  { name: "Bathroom construction", byYear: [0, 140000, 60000] },
  { name: "General store remodel", byYear: [30000, 30000, 0] },
  { name: "Land grading & excavating", byYear: [0, 30000, 30000] },
  { name: "Landscaping & trails", byYear: [0, 20000, 30000] },
  { name: "Pool", byYear: [0, 60000, 0] },
];
/** 2026 pre-opening costs from borrower's file: accounting $500 + legal $10,000 + marketing $14,000. */
export const PRE_OPENING_COSTS = 24500;

export interface Inputs {
  seasonNights: number;
  occupancy: Record<SiteType, number>; // single rate applied to all years
  rates: Record<SiteType, number>; // 2027 base nightly rate
  annualRateIncrease: number;
  storeSales: number; // per year
  storeCogsPct: number;
  otherIncome: number; // per year
  insurance: number;
  propertyTax: number;
  repairsMaintenance: number;
  utilitiesOther: number;
  housekeeping: number;
  cardFeesPct: number;
  mgmtFeePct: number;
  replacementReservePerSite: number;
  expenseInflation2031: number;
  borrowerOpexMultiplier: number;
  cabinCostPerUnit: number;
  rvSiteInfrastructure: number;
  softCosts: number;
  ffe: number;
  contingencyPct: number;
  /** null = auto (peak 2027 cumulative cash shortfall) */
  workingCapitalOverride: number | null;
  interestReserve: number;
  closingCosts: number;
  landAcquisition: number;
  projectCostMultiplier: number;
  equityPct: number;
  interestRate: number;
  amortYears: number;
  interestOnlyYears: number;
  minDscr: number;
}

export const DEFAULT_INPUTS: Inputs = {
  seasonNights: 159,
  occupancy: { classA: GRID_CLASS_A_OCC, classBC: GRID_CLASS_A_OCC, tent: GRID_CLASS_A_OCC, cabin: GRID_CLASS_A_OCC },
  rates: { classA: GRID_CLASS_A_ADR, classBC: GRID_CLASS_BC_ADR, tent: 0, cabin: 0 },
  annualRateIncrease: 0,
  storeSales: 0,
  storeCogsPct: 0,
  otherIncome: 0,
  insurance: 0,
  propertyTax: 0,
  repairsMaintenance: 0,
  utilitiesOther: 0,
  housekeeping: 0,
  cardFeesPct: 0,
  mgmtFeePct: 0,
  replacementReservePerSite: 0,
  expenseInflation2031: 0,
  borrowerOpexMultiplier: 1,
  cabinCostPerUnit: 0,
  rvSiteInfrastructure: 0,
  softCosts: 0,
  ffe: 0,
  contingencyPct: 0,
  workingCapitalOverride: null,
  interestReserve: 0,
  closingCosts: 0,
  landAcquisition: 0,
  projectCostMultiplier: 1,
  equityPct: 0.1,
  interestRate: 0.08,
  amortYears: 25,
  interestOnlyYears: 0,
  minDscr: 1.25,
};

/** Inputs that are placeholders in the workbook (not supported by the borrower's file). */
export const PLACEHOLDER_KEYS = new Set<string>([
  "occupancy.classBC", "occupancy.tent", "occupancy.cabin", "rates.tent", "rates.cabin", "annualRateIncrease",
  "storeSales", "storeCogsPct", "otherIncome", "insurance", "propertyTax", "repairsMaintenance", "utilitiesOther",
  "housekeeping", "cardFeesPct", "mgmtFeePct", "replacementReservePerSite", "expenseInflation2031",
  "cabinCostPerUnit", "rvSiteInfrastructure", "softCosts", "ffe", "contingencyPct", "interestReserve",
  "closingCosts", "equityPct", "interestRate", "amortYears", "minDscr",
]);

/** Workbook outputs at default inputs (for verification). */
export const WORKBOOK_OUTPUTS = {
  revenue: [324898, 649796, 649796, 649796, 649796],
  opex: [338558, 354857, 364107, 414099, 414099],
  noi: [-13660, 294939, 285689, 235697, 235697],
  debtService: 76858.922475809,
  dscr: [-0.177728226729947, 3.83740742778212, 3.71705705463044, 3.06661858386298, 3.06661858386298],
  breakEvenOcc: [0.900252051455004, 0.467786847173118, 0.477809707371409, 0.531978661645244, 0.531978661645244],
  totalProjectCost: 922054.13319398,
  loan: 829849.13319398,
  equity: 92205,
  workingCapital: 83554.1331939804,
  sens1Base: 3.06661858386298,
  sens1Corner: -0.653316991476226, // occ -30%, rate -20%
  sens2: { rate06_overrun0: 3.6735402640044, rate11_overrun100: 1.20744595509183 },
};

export const REVIEW_NOTES: { area: string; issue: string }[] = [
  { area: "Missing – financing", issue: "Original file had no loan amount, rate, term, equity injection, debt service, DSCR or Sources & Uses. Financing terms here are illustrative placeholders." },
  { area: "Missing – revenue", issue: "Monthly income and quarterly P&L tabs were empty; revenue is built from the 2027 daily rate grid only." },
  { area: "Missing – construction", issue: "No cabin cost (20 cabins), no RV pad/road/pedestal/sewer-lateral cost, no permits/soft costs, FF&E or contingency in the construction budget." },
  { area: "Missing – opex", issue: "Insurance blank every year. No property tax, repairs & maintenance, water/trash/propane, housekeeping, card fees, management fee or replacement reserve." },
  { area: "Incomplete – opex", issue: "Several lines go blank in later years (internet, office, accounting, landscaping, staff); carried forward from the prior year as placeholders." },
  { area: "Assumption – land lease", issue: "Land lease is $0 in 2027–2029, then ~$50k/yr from 2030. Lender will need the lease document and term." },
  { area: "Assumption – occupancy", issue: "Implied Class A occupancy ~70% in the first season of a new park with no ramp-up; B/C, tent and cabin occupancy default to the Class A rate." },
  { area: "Assumption – season", issue: "Revenue grid covers Apr 1 – Sep 6 only, while staff, electricity and marketing run 12 months." },
  { area: "Assumption – rates", issue: "Nightly rates $55–$87 (avg ~$74) Class A and $71 B/C. Support with comps; tent and cabin rates not provided." },
  { area: "Missing – lender package", issue: "No balance sheet / cash-flow statement, owner experience, or market study yet." },
];
