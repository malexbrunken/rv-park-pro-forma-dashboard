// Assumptions extracted from the lender pro forma workbook (rv_park_pro_forma.xlsx).
// "borrower" = borrower's own number; "placeholder" = must be provided / supported before lending.

export const YEARS = [2027, 2028, 2029, 2030, 2031] as const;
export type YearIndex = 0 | 1 | 2 | 3 | 4;
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export type SiteType = "classA" | "classBC" | "tent" | "cabin";
export type RvSiteType = Exclude<SiteType, "cabin">;
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

/**
 * Borrower operating-expense lines. 2027 monthly detail; `annual` holds his 2027–2030 totals.
 * Years listed in `carried` were blank in his file and are estimated as prior year × (1 + expense inflation).
 * 2031 = 2030 × (1 + expense inflation).
 */
export interface OpexLine {
  name: string;
  monthly2027: number[];
  annual: [number, number, number, number]; // 2027..2030 (carried years ignored)
  carried?: number[]; // year indexes (1=2028 … 3=2030) carried forward
}
export const BORROWER_OPEX: OpexLine[] = [
  { name: "Land lease", monthly2027: Array(12).fill(0), annual: [0, 0, 0, 49992] },
  { name: "Accounting & bookkeeping (incl. software)", monthly2027: Array(12).fill(250), annual: [3000, 2400, 0, 0], carried: [2, 3] },
  { name: "Septic maintenance & pumping", monthly2027: [0, 0, 0, 0, 0, 850, 850, 850, 850, 850, 0, 0], annual: [4250, 4250, 5100, 5100] },
  { name: "Legal", monthly2027: Array(12).fill(0), annual: [0, 0, 0, 0] },
  { name: "Landscaping & trail supplies", monthly2027: [0, 0, 0, 0, 0, 2000, 2000, 0, 0, 0, 0, 0], annual: [4000, 4000, 0, 0], carried: [2, 3] },
  { name: "Pool maintenance", monthly2027: [0, 0, 0, 0, 0, 1000, 1000, 1000, 1000, 0, 0, 0], annual: [4000, 4000, 4000, 4000] },
  { name: "Electricity", monthly2027: [200, 200, 200, 1000, 2000, 3000, 4000, 5000, 5000, 3000, 750, 1000], annual: [25350, 25350, 25350, 25350] },
  { name: "Well maintenance & inspections", monthly2027: [0, 0, 0, 0, 1000, 0, 0, 0, 0, 0, 0, 0], annual: [1000, 1000, 1000, 1000] },
  { name: "Sales, marketing & booking software", monthly2027: Array(12).fill(7000), annual: [84000, 48000, 48000, 48000] },
  { name: "Internet access", monthly2027: [600, 600, 600, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200], annual: [12600, 0, 0, 0], carried: [1, 2, 3] },
  { name: "Office & miscellaneous", monthly2027: [600, 600, 600, 600, 1200, 1200, 1200, 1200, 1200, 600, 600, 600], annual: [10200, 0, 0, 0], carried: [1, 2, 3] },
  { name: "General manager (salary, benefits, taxes)", monthly2027: [0, 0, 0, ...Array(9).fill(10000)], annual: [90000, 128400, 136800, 136800] },
  { name: "General store staff", monthly2027: [0, 0, 0, ...Array(9).fill(4833)], annual: [43497, 57996, 57996, 0], carried: [3] },
  { name: "Groundskeeper / cleaning staff", monthly2027: [0, 0, 0, ...Array(9).fill(3333)], annual: [29997, 39996, 39996, 0], carried: [3] },
  { name: "Groundskeeper / cleaning staff (seasonal)", monthly2027: [0, 0, 0, 0, ...Array(8).fill(3333)], annual: [26664, 16665, 0, 0], carried: [2, 3] },
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

export type Scenario = "placeholder" | "estimated";
export type Y5 = [number, number, number, number, number];

export interface Inputs {
  seasonNights: number;
  occupancy: Record<RvSiteType, Y5>; // by year 2027–2031 (cabins: see cabin schedule)
  occupancyMultiplier: number; // scales every occupancy (1 = as entered)
  rates: Record<SiteType, number>; // 2027 base nightly rate
  annualRateIncrease: number;
  storeSalesPerNight: number; // $ per occupied site/unit-night
  storeCogsPct: number;
  otherIncomePerNight: number; // $ per occupied site/unit-night
  insurance: Y5; // base by year
  insurancePerCabin: number; // + $ per operating cabin
  propertyTaxRate: number;
  assessedPctOfHardCost: number;
  taxPhaseIn: Y5;
  rmPctOfRevenue: Y5;
  utilitiesPerUnit: Y5; // $ per site/unit per year
  housekeepingPerCabinNight: number;
  bathhouseSupplies: Y5;
  cardFeesPct: number;
  mgmtFeePct: number;
  replacementReservePerSite: number;
  expenseInflation: number; // 2031 vs 2030 and blank carried-forward lines
  borrowerOpexMultiplier: number;
  cabinCostPerUnit: number; // all-in, 2027 $
  /** Cabin build schedule: cabins are cash-funded from operations (not in the loan). */
  cabinsPlanned: number;
  cabinsFinanced: number; // cabins in the loan at closing (owner: 0)
  cabinBuildStartYear: number;
  cabinMinReserve: number; // cash kept before buying a cabin
  cabinCostEscalation: number;
  cabinBuildYearShare: number; // share of build-year season a new cabin operates
  cabinOccRamp: [number, number, number, number]; // occupancy by cabin operating year 1,2,3,4+
  rvSiteInfrastructure: number;
  softCosts: number;
  ffe: number;
  contingencyPct: number;
  /** null = auto: peak 2027 cumulative shortfall + N months of Jan–Mar carry */
  workingCapitalOverride: number | null;
  workingCapitalExtraMonths: number;
  /** null = auto: hard cost × loan % × 50% avg outstanding × rate × 9/12 */
  interestReserveOverride: number | null;
  /** null = auto: SBA 7(a) guaranty fee (75% guaranty; 3.5% ≤ $1M, 3.75% above) + third-party costs */
  closingCostsOverride: number | null;
  closingThirdParty: number;
  landAcquisition: number;
  projectCostMultiplier: number;
  equityPct: number;
  interestRate: number;
  amortYears: number;
  interestOnlyYears: number;
  minDscr: number;
}

const flat = (v: number): Y5 => [v, v, v, v, v];
const occA = GRID_CLASS_A_OCC;

export const PLACEHOLDER_INPUTS: Inputs = {
  seasonNights: 159,
  occupancy: { classA: flat(occA), classBC: flat(occA), tent: flat(occA) },
  occupancyMultiplier: 1,
  rates: { classA: GRID_CLASS_A_ADR, classBC: GRID_CLASS_BC_ADR, tent: 0, cabin: 0 },
  annualRateIncrease: 0,
  storeSalesPerNight: 0,
  storeCogsPct: 0,
  otherIncomePerNight: 0,
  insurance: flat(0),
  insurancePerCabin: 0,
  propertyTaxRate: 0,
  assessedPctOfHardCost: 0.6,
  taxPhaseIn: [0.35, 0.75, 0.9, 1, 1],
  rmPctOfRevenue: flat(0),
  utilitiesPerUnit: flat(0),
  housekeepingPerCabinNight: 0,
  bathhouseSupplies: flat(0),
  cardFeesPct: 0,
  mgmtFeePct: 0,
  replacementReservePerSite: 0,
  expenseInflation: 0,
  borrowerOpexMultiplier: 1,
  cabinCostPerUnit: 0,
  cabinsPlanned: 20,
  cabinsFinanced: 0,
  cabinBuildStartYear: 2029,
  cabinMinReserve: 50000,
  cabinCostEscalation: 0,
  cabinBuildYearShare: 0,
  cabinOccRamp: [occA, occA, occA, occA],
  rvSiteInfrastructure: 0,
  softCosts: 0,
  ffe: 0,
  contingencyPct: 0,
  workingCapitalOverride: null,
  workingCapitalExtraMonths: 0,
  interestReserveOverride: 0,
  closingCostsOverride: 0,
  closingThirdParty: 45000,
  landAcquisition: 0,
  projectCostMultiplier: 1,
  equityPct: 0.1,
  interestRate: 0.08,
  amortYears: 25,
  interestOnlyYears: 0,
  minDscr: 1.25,
};

/** Best-guess fills from rv_park_pro_forma_estimated.xlsx (see Estimate Sources). */
export const ESTIMATED_INPUTS: Inputs = {
  ...PLACEHOLDER_INPUTS,
  occupancy: {
    classA: [occA, 0.55, 0.6, 0.63, 0.65],
    classBC: [0.35, 0.45, 0.55, 0.6, 0.62],
    tent: [0.15, 0.18, 0.22, 0.25, 0.25],
  },
  cabinOccRamp: [0.35, 0.42, 0.48, 0.52],
  cabinCostEscalation: 0.03,
  rates: { classA: GRID_CLASS_A_ADR, classBC: GRID_CLASS_BC_ADR, tent: 32, cabin: 150 },
  annualRateIncrease: 0.03,
  storeSalesPerNight: 4,
  storeCogsPct: 0.6,
  otherIncomePerNight: 2,
  insurance: [15000, 19500, 20000, 20600, 21200],
  insurancePerCabin: 500,
  propertyTaxRate: 0.0175,
  rmPctOfRevenue: [0.025, 0.03, 0.035, 0.04, 0.045],
  utilitiesPerUnit: [200, 206, 212, 218, 225],
  housekeepingPerCabinNight: 25,
  bathhouseSupplies: [4000, 6000, 6000, 6000, 6000],
  cardFeesPct: 0.03,
  mgmtFeePct: 0.04,
  replacementReservePerSite: 250,
  expenseInflation: 0.03,
  cabinCostPerUnit: 80000,
  rvSiteInfrastructure: (40 + 40) * 15000 + 20 * 1500,
  softCosts: 85000,
  ffe: 110000,
  contingencyPct: 0.125,
  workingCapitalExtraMonths: 3,
  interestReserveOverride: null,
  closingCostsOverride: null,
  equityPct: 0.2,
  interestRate: 0.095,
  interestOnlyYears: 1,
};

export const SCENARIO_DEFAULTS: Record<Scenario, Inputs> = { placeholder: PLACEHOLDER_INPUTS, estimated: ESTIMATED_INPUTS };
export const DEFAULT_INPUTS = PLACEHOLDER_INPUTS;

/** Inputs that are placeholders in the owner-inputs-only workbook. */
export const PLACEHOLDER_KEYS = new Set<string>([
  "occupancy.classA", "occupancy.classBC", "occupancy.tent", "cabinOccRamp", "rates.tent", "rates.cabin", "annualRateIncrease",
  "storeSalesPerNight", "storeCogsPct", "otherIncomePerNight", "insurance", "propertyTax", "rmPct", "utilitiesPerUnit",
  "housekeeping", "cardFeesPct", "mgmtFeePct", "replacementReservePerSite", "expenseInflation",
  "cabinCostPerUnit", "rvSiteInfrastructure", "softCosts", "ffe", "contingencyPct", "workingCapital", "interestReserve",
  "closingCosts", "equityPct", "interestRate", "amortYears", "interestOnlyYears", "minDscr", "carriedForward",
]);

/** Workbook outputs at default inputs (for verification). */
export interface WorkbookOutputs {
  revenue: number[]; opex: number[]; noi: number[]; debtService: number[]; dscr: number[]; breakEvenOcc: number[];
  totalProjectCost: number; loan: number; equity: number; workingCapital: number;
  sens1: [number, number, number][]; sens2: [number, number, number][]; placeholderCount: number;
  cabinEndingCash: number[]; cabinsBuilt: number;
}
export const WORKBOOK_OUTPUTS_PLACEHOLDER: WorkbookOutputs = {
  revenue: [324898, 649796, 649796, 649796, 649796],
  opex: [338558, 354857, 364107, 414099, 414099],
  noi: [-13660, 294939, 285689, 235697, 235697],
  debtService: [76858.922475809, 76858.922475809, 76858.922475809, 76858.922475809, 76858.922475809],
  dscr: [-0.177728226729947, 3.83740742778212, 3.71705705463044, 3.06661858386298, 3.06661858386298],
  breakEvenOcc: [0.900252051455004, 0.467786847173118, 0.477809707371409, 0.531978661645244, 0.531978661645244],
  totalProjectCost: 922054.13319398,
  loan: 829849.13319398,
  equity: 92205,
  workingCapital: 83554.1331939804,
  sens1: [[3, 2, 3.06661858386298], [0, 0, -0.653316991476226]],
  sens2: [[0, 0, 3.6735402640044], [5, 4, 1.20744595509183]],
  placeholderCount: 23,
  cabinEndingCash: [-6964.78928182858, 211115.288242362, 419945.365766553, 578783.443290744, 737621.520814935],
  cabinsBuilt: 0,
};

export const WORKBOOK_OUTPUTS_ESTIMATED: WorkbookOutputs = {
  revenue: [274127, 536767.953218401, 635335.14292904, 700037.293261337, 741787.624302989],
  opex: [413599.89, 496417.756725288, 524397.930005033, 592461.204628294, 614679.455624209],
  noi: [-148090.09, 23712.196493113, 91704.8129240068, 86893.488633043, 105814.76867878],
  debtService: [237109.8198, 261678.388821607, 261678.388821607, 261678.388821607, 261678.388821607],
  dscr: [-0.624563293603414, 0.0906157997987303, 0.350448553802907, 0.33206215088813, 0.404369536037294],
  breakEvenOcc: [1.30147325571593, 0.711633375902385, 0.708357847497239, 0.746895313230585, 0.742378296357057],
  totalProjectCost: 3119865.84,
  loan: 2495892.84,
  equity: 623973,
  workingCapital: 442365.84,
  sens1: [[0, 0, -0.681765384496915], [0, 3, -0.197893151699507], [3, 2, 0.332062150888129], [3, 3, 0.562477499839276]],
  sens2: [[0, 0, 0.392591441785438], [0, 4, 0.196295720892719], [5, 0, 0.266080168082155], [5, 4, 0.133040084041077]],
  placeholderCount: 0,
  cabinEndingCash: [57165.9302, -180800.262128494, -350773.838026093, -525558.738214657, -681422.358357484],
  cabinsBuilt: 0,
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
