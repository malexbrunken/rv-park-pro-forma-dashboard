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

export type Scenario = "placeholder" | "estimated" | "viable";
export type Y5 = [number, number, number, number, number];

export interface Inputs {
  seasonNights: number; // core season (his grid: 159)
  shoulderNights: number; // extra shoulder nights (Sep 7 – Oct 31 = 55)
  shoulderOccFactor: number; // shoulder occupancy as % of peak occupancy
  shoulderUtilities: number; // $/yr (2027 $, +inflation)
  marketRate: number; // market median full-hookup nightly rate
  marketRateWeight: number; // 0 = his rates, 1 = market median (Class A and B/C)
  storageUnits: number; // off-season RV/boat storage
  storageRatePerMonth: number;
  storageMonths: number; // Nov–Mar = 5 (2027: Nov–Dec only)
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
  /** null = borrower's GM line; number = owner-operator manager loaded comp $/yr (2027 $, +inflation) */
  ownerManagerComp: number | null;
  /** null = borrower's marketing line; numbers = $/month (2027) and $/month (2028 $, +inflation) */
  marketing2027Monthly: number | null;
  marketing2028Monthly: number | null;
  storeStaffSeasonalOnly: boolean; // store staff Apr–Oct only
  seasonalGroundsThroughOct: boolean; // 2028 seasonal groundskeeper extended through October
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
  /** "7a" = single rate; "504" = blended bank first lien + CDC debenture */
  loanStructure: "7a" | "504";
  bankShare: number; // 504: bank share of project cost (CDC = 1 − bank − equity)
  bankRate: number;
  cdcRate: number;
  cdcFeePct: number; // 504 debenture fees (financed)
  bankFeePct: number;
  /** keep year-end cash ≥ cabin minimum reserve through 2028 when sizing working capital (rounded up to $5k) */
  wcKeepMinCashThrough2028: boolean;
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
  shoulderNights: 0,
  shoulderOccFactor: 0.5,
  shoulderUtilities: 0,
  marketRate: 51,
  marketRateWeight: 0,
  storageUnits: 0,
  storageRatePerMonth: 50,
  storageMonths: 5,
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
  ownerManagerComp: null,
  marketing2027Monthly: null,
  marketing2028Monthly: null,
  storeStaffSeasonalOnly: false,
  seasonalGroundsThroughOct: false,
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
  loanStructure: "7a",
  bankShare: 0.5,
  bankRate: 0.08,
  cdcRate: 0.06974,
  cdcFeePct: 0.0265,
  bankFeePct: 0.01,
  wcKeepMinCashThrough2028: false,
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

/** "Path to 1.25x" scenario from rv_park_pro_forma_viable.xlsx (estimated version + green levers). */
export const VIABLE_INPUTS: Inputs = {
  ...ESTIMATED_INPUTS,
  occupancy: { ...ESTIMATED_INPUTS.occupancy, classA: [0.4, ...ESTIMATED_INPUTS.occupancy.classA.slice(1)] as Y5 },
  marketRateWeight: 0.5,
  rates: { ...ESTIMATED_INPUTS.rates, cabin: 110 },
  shoulderNights: 55,
  shoulderUtilities: 2000,
  storageUnits: 40,
  ownerManagerComp: 60000,
  marketing2027Monthly: 4000,
  marketing2028Monthly: 2500,
  storeStaffSeasonalOnly: true,
  seasonalGroundsThroughOct: true,
  rvSiteInfrastructure: (40 + 40) * 11000 + 20 * 1500,
  contingencyPct: 0.1,
  loanStructure: "504",
  equityPct: 0.27,
  cabinCostPerUnit: 40000,
  wcKeepMinCashThrough2028: true,
};

export interface Lever {
  id: number; name: string; change: string; dNoi2030: number | null; dLoan: number | null; dDscr2029: number | null; dDscr2030: number | null;
  justification: string; mustProve: string; aggressiveness: string; urls: string[];
  /** inputs this lever changes (badge keys) */
  keys: string[];
  /** fields set when the lever is ON (viable) vs OFF (estimated) */
  on?: Partial<Inputs>; toggleable: boolean;
}

export const SCENARIO_DEFAULTS: Record<Scenario, Inputs> = { placeholder: PLACEHOLDER_INPUTS, estimated: ESTIMATED_INPUTS, viable: VIABLE_INPUTS };
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
  cabinEndingCash: number[]; cabinsBuilt: number; cabinsCumulative?: number[];
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

export const WORKBOOK_OUTPUTS_VIABLE: WorkbookOutputs = {
  revenue: [204382.463823135, 556498.609029031, 657434.078539893, 723791.364784524, 774697.193345507],
  opex: [317108.772467619, 392518.902632032, 414861.645497793, 485097.093334917, 508395.767268186],
  noi: [-120111.708644484, 144464.106396999, 220013.6330421, 214434.471449607, 241168.626077322],
  debtService: [143507.74416, 168362.44383636, 168362.44383636, 168362.44383636, 168362.44383636],
  dscr: [-0.836970223088232, 0.85805422578334, 1.3067856941774, 1.27364789060693, 1.43243719075334],
  breakEvenOcc: [0.894038031632669, 0.487832975995621, 0.484292127619447, 0.529772287009679, 0.520847866306071],
  totalProjectCost: 2560800,
  loan: 1869384,
  equity: 691416,
  workingCapital: 340000,
  sens1: [[0, 0, -0.311540064547889], [0, 3, 0.44502691404873], [3, 2, 1.27364789060693], [3, 3, 1.63391788041484]],
  sens2: [[0, 0, 1.53021501282884], [0, 4, 0.765107506414419], [5, 0, 0.999030796523513], [5, 4, 0.499515398261756]],
  placeholderCount: 0,
  cabinEndingCash: [76380.5471955158, 52482.2097561548, 104133.398961895, 106496.346575143, 134282.176416105],
  cabinsBuilt: 2,
  cabinsCumulative: [0, 0, 0, 1, 2],
};

/** Levers tab of rv_park_pro_forma_viable.xlsx. Δ values are the workbook's STATIC drop-one snapshot (LibreOffice recalc, Oct 12, 2026). */
export const LEVERS: Lever[] = [
  { id: 1, name: "Leaner fixed payroll – owner-operated", change: "GM $120-137k/yr → owner-operator manager $60k loaded (+3%/yr); store staff only Apr–Oct (Nov–Mar $0). 4% imputed management fee KEPT as a lender cushion.",
    dNoi2030: 96126.33, dLoan: -120450.0, dDscr2029: 0.622101448359439, dDscr2030: 0.613485035138653,
    justification: "A 100-site seasonal park is commonly owner-run in its first years; the closed-season store needs no staff. His GM line alone was ~20% of stabilized revenue.", mustProve: "Owner's résumé/time commitment (full-time on site), personal budget showing he can live on $60k + distributions, and a plan for who runs it if he can't.", aggressiveness: "AGGRESSIVE – biggest single lever; depends entirely on the owner",
    urls: ["https://rvpark.world/blog/rv-park-underwriting/"], keys: ["ownerManagerComp", "storeStaffSeasonalOnly"], toggleable: true, on: { ownerManagerComp: 60000, storeStaffSeasonalOnly: true } },
  { id: 2, name: "Season extended to ~Apr 1 – Oct 31", change: "Adds 55 shoulder nights (Sep 7–Oct 31) at 50% of peak occupancy = +27.5 effective nights (159 → 186.5); seasonal groundskeeper through Oct; +$2k/yr shoulder utilities.",
    dNoi2030: 84252.403910531, dLoan: -73000.0, dDscr2029: 0.4863034943649, dDscr2030: 0.52948266319183,
    justification: "Nebraska state parks keep full services mid-April to mid-October; September is a strong RV month (snowbirds, retirees, harvest/event traffic). 50% factor is a haircut.", mustProve: "Water/septic winterization date (frost risk in late Oct), comps' Sep–Oct occupancy, bookings data after year 1.", aggressiveness: "MODERATE-AGGRESSIVE",
    urls: ["https://outdoornebraska.gov/parks/park-pricing/", "https://ohi.org/wp-content/uploads/2023/10/2023_Benchmarking-Report.pdf"], keys: ["shoulderNights", "seasonNights", "shoulderUtilities", "seasonalGroundsThroughOct"], toggleable: true, on: { shoulderNights: 55, shoulderUtilities: 2000, seasonalGroundsThroughOct: true } },
  { id: 3, name: "SBA 504 structure (50% bank / 23% CDC / 27% equity), 25-yr", change: "Rate 9.50% 7(a) → ~7.68% blended (CDC share 23% at 27% equity) (bank 8.00% = Prime 7.00% + 1%; CDC 6.974% Oct-2026 effective); fees 2.65% of debenture + 1% bank + $45k instead of the 7(a) guaranty fee.",
    dNoi2030: 0.0, dLoan: -74460.0, dDscr2029: 0.22722699297033, dDscr2030: 0.22146491316451,
    justification: "504 is built for long-lived fixed assets; 20% minimum equity for a new business + special-purpose property; debenture rate is fixed for 25 years.", mustProve: "A CDC and bank willing to lend on a LEASEHOLD (lease term ≥ 25 yrs, recorded, lender-friendly); bank piece usually 10-yr maturity (balloon / refinance risk); interim construction loan.", aggressiveness: "MODERATE",
    urls: ["https://esmpeh55ruo.exactdn.com/wp-content/uploads/2025/10/Lender-Guide-2026.pdf", "https://sbaloanindex.com/guides/sba-504-loan-fees/", "https://www.sbapulse.com/data/rates/2026-10", "https://www.jpmorganchase.com/legal/historical-prime-rate"], keys: ["loanStructure", "interestRate", "closingCosts"], toggleable: true, on: { loanStructure: "504" } },
  { id: 4, name: "Firm / lower site-work cost", change: "RV-site infrastructure $15,000 → $11,000 per RV site (80 sites) and contingency 12.5% → 10%.",
    dNoi2030: 3400.0, dLoan: -346458.0, dDscr2029: 0.21935514899928, dDscr2030: 0.21617824170564,
    justification: "His budget already carries $60k electrical, $60k grading, septic and wells; $11k/site for gravel pads, roads, pedestals and laterals is below American Campground's $13-42k range, so it needs a real bid.", mustProve: "Fixed-price civil/electrical bid ≤ ~$910k for 80 RV + 20 tent sites, with a performance bond; then 10% contingency is acceptable.", aggressiveness: "AGGRESSIVE until a bid exists",
    urls: ["https://www.americancampground.net/how-much-does-it-cost-to-build-an-rv-park/", "https://www.analytics.loan/sba-feasibility-study-rv-park", "https://www.mmcginvest.com/post/practical-guide-for-rv-park-planning-development-operations"], keys: ["rvSiteInfrastructure", "contingencyPct"], toggleable: true, on: { rvSiteInfrastructure: 910000, contingencyPct: 0.1 } },
  { id: 5, name: "More equity (20% → 27%)", change: "Equity $520,560 at 20% → $691,416 at 27% (+$170,856) – the smallest equity step that clears 1.25x in 2029-2031.",
    dNoi2030: 0.0, dLoan: -212856.0, dDscr2029: 0.12726533517806, dDscr2030: 0.12403810848186,
    justification: "Used last, after operating levers. 504 allows more than the 20% minimum.", mustProve: "Proof of liquid funds (bank statements) and source of equity; no borrowed down payment.", aggressiveness: "LOW (just money)",
    urls: ["https://esmpeh55ruo.exactdn.com/wp-content/uploads/2025/10/Lender-Guide-2026.pdf"], keys: ["equityPct"], toggleable: true, on: { equityPct: 0.27 } },
  { id: 6, name: "Marketing & booking software", change: "2027 $84k → $48k ($4k/mo launch year); 2028+ $48k/yr → $30k/yr ($2.5k/mo, +3%/yr) ≈ 4% of revenue.",
    dNoi2030: 16173.0, dLoan: -43800.0, dDscr2029: 0.12915860649452, dDscr2030: 0.12302003124333,
    justification: "His $48k/yr is ~7% of stabilized revenue; online booking platforms + reviews carry most campground demand.", mustProve: "A marketing plan and booking-platform quotes; first-year results.", aggressiveness: "MODERATE",
    urls: [], keys: ["marketing"], toggleable: true, on: { marketing2027Monthly: 4000, marketing2028Monthly: 2500 } },
  { id: 7, name: "Off-season RV/boat storage", change: "New: 40 units × $50/mo × 5 months (Nov–Mar) ≈ $10k/yr (2027: Nov–Dec only); uses existing pads, no capex.",
    dNoi2030: 9725.10999999999, dLoan: -10950.0, dDscr2029: 0.0636799327706501, dDscr2030: 0.0648435666751299,
    justification: "Omaha RV storage median $56/mo (13 facilities, Jul 2026); rural rates likely lower, so $50.", mustProve: "Local demand (waitlist or nearby facility rates), zoning/lease allows storage, insurance.", aggressiveness: "LOW-MODERATE",
    urls: ["https://rvstoragehq.com/reports/omaha"], keys: ["storageUnits"], toggleable: true, on: { storageUnits: 40 } },
  { id: 8, name: "Cheaper A-frame cabins, cash-funded", change: "Cabin $80k park model → $40k A-frame all-in (Green River unit $32,900 + ~$7k delivery/pad/hookups); rate $150 → $110/night; still built only when cash ≥ $50k reserve + cost.",
    dNoi2030: 0.0, dLoan: 0.0, dDscr2029: 0.0, dDscr2030: 0.0,
    justification: "Lower cost per unit lets cash flow buy cabins sooner; NE state-park cabins rent $105-$210.", mustProve: "Delivered quote incl. set-up and utility hookups; zoning/health permit for rental cabins.", aggressiveness: "MODERATE",
    urls: ["https://greenriverlogcabins.com/maximizing-rv-park-and-campground-profitability-how-green-rivers-a-frame-can-restore-40-net-margins/", "https://outdoornebraska.gov/parks/park-pricing/"], keys: ["cabinCostPerUnit", "rates.cabin"], toggleable: true, on: { cabinCostPerUnit: 40000 } },
  { id: 9, name: "Realism: Class A 2027 occupancy haircut", change: "His 70.4% → 40% in 2027 (later years unchanged).",
    dNoi2030: 0.0, dLoan: 54750.0, dDscr2029: -0.0394275191339999, dDscr2030: -0.0384277060887901,
    justification: "New parks typically run 30-40% in year 1; a lender will haircut his grid.", mustProve: "Pre-bookings / waitlist could justify more.", aggressiveness: "CONSERVATIVE (hurts DSCR)",
    urls: ["https://unionmetricfeasibility.com/insights/rv-park-occupancy-regional-analysis-feasibility-guide"], keys: ["occupancy.classA"], toggleable: true },
  { id: 10, name: "Realism: rates midway to market", change: "Class A $73.9 → $62.5; B/C $71 → $61 (midway between his grid and the ARVC Midwest full-hookup median ~$51); +3%/yr kept.",
    dNoi2030: -100516.113850997, dLoan: 40150.0, dDscr2029: -0.56322254528866, dDscr2030: -0.63808166720371,
    justification: "His rates sit ~40% above the Midwest median; midway is what a lender can defend without comps.", mustProve: "Rate comps within ~50 miles; if he proves his own rates, 2030 DSCR rises to ~1.9x.", aggressiveness: "CONSERVATIVE (biggest negative)",
    urls: ["https://ohi.org/wp-content/uploads/2023/10/2023_Benchmarking-Report.pdf"], keys: ["marketRateWeight", "rates.classA", "rates.classBC"], toggleable: true, on: { marketRateWeight: 0.5 } },
  { id: 11, name: "Smaller phase-1 build – TESTED, NOT ADOPTED", change: "Defer 20 of the 40 phase-2 B/C sites from 2028 to 2030, built from 2029 cash (~$242k).",
    dNoi2030: 2300.0, dLoan: -134174.0, dDscr2029: -0.625708325244708, dDscr2030: 0.11320133826351,
    justification: "Cuts the loan, but each RV site earns far more than its debt service, and the 2029 cash build drives cash to $-240,204 – fails the cash test. Shown as impact of ADDING it to the final scenario.", mustProve: "—", aggressiveness: "Rejected",
    urls: [], keys: [], toggleable: false },
  { id: 12, name: "Structural: working-capital reserve resized (always on)", change: "Reserve = max(2027 monthly peak + 3-month carry, amount keeping year-end cash ≥ $50k through 2028) – Levers C31:C41; 2028 cabin build fixed at 0.",
    dNoi2030: null, dLoan: null, dDscr2029: null, dDscr2030: null,
    justification: "Lender will want the start-up losses funded up front, not hoped for.", mustProve: "—", aggressiveness: "Conservative",
    urls: [], keys: ["workingCapital"], toggleable: false },
];
// Levers whose ON patch depends on other inputs
LEVERS[7].on = { cabinCostPerUnit: 40000, rates: { ...VIABLE_INPUTS.rates } };
LEVERS[8].on = { occupancy: { ...VIABLE_INPUTS.occupancy } };

export const LEVER_NOTE = "Green fill = input CHANGED vs. the estimated version (here and on the other tabs). This is a SCENARIO a lender could underwrite only if the owner proves each item in the 'What he must prove' column – it is not a forecast or a verified figure. Light-blue cells elsewhere are unchanged estimates.";
export const LEVER_SUMMARY = "2028 is still below 1.25x (0.86x) – the plan clears 1.25x from 2029. The reserve funded at closing carries 2027-28; cash never drops below the $50k minimum.";
