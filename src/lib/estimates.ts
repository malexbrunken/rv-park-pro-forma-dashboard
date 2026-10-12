// Extracted from the 'Estimate Sources' tab of rv_park_pro_forma_estimated.xlsx (50 estimated inputs).
// Personal names / the reference-bid tab are intentionally excluded.

export interface EstimateSource { key: string; input: string; location: string; basis: string; urls: string[]; sourceType: string; confidence: string }

export const ESTIMATE_NOTES: string[] = [
  "IMPORTANT: These are STARTING ESTIMATES TO EDIT, NOT VERIFIED FIGURES. Replace each with a quote, bid, comp survey or lender term sheet before sending to a bank. His own numbers (blue text) were not changed.",
  "Location: the workbook states no location. Assumed a Midwest (Nebraska-area) seasonal park; Nebraska state-park rates and Nebraska property-tax rates are used as local benchmarks. If the park is elsewhere, rates, taxes, insurance and season length change.",
  "Source type: 'Fetched' = page actually retrieved while building this file (URL listed). 'Rule-of-thumb' = industry judgment, no specific citation."
];

export const ESTIMATE_SOURCES: EstimateSource[] = [
  {
    "key": "seasonNights",
    "input": "Operating season (nights/yr)",
    "location": "Assumptions C6",
    "basis": "Kept his 159-night grid (Apr 1–Sep 6). Nebraska state parks run full-hookup services mid-Apr to mid-Oct, so a ~180-night season is possible upside – not assumed.",
    "urls": [
      "https://outdoornebraska.gov/parks/park-pricing/"
    ],
    "sourceType": "Fetched + his file",
    "confidence": "Medium"
  },
  {
    "key": "occupancy.classA",
    "input": "Class A occupancy 2028-31",
    "location": "Assumptions D18:G18",
    "basis": "2027 = HIS grid (70.4%, unchanged). 2028-31 ramp 55→65% as Class A sites double to 40. ARVC 2023: full-hookup sites avg 68% in months of operation.",
    "urls": [
      "https://ohi.org/wp-content/uploads/2023/10/2023_Benchmarking-Report.pdf",
      "https://unionmetricfeasibility.com/insights/rv-park-occupancy-regional-analysis-feasibility-guide"
    ],
    "sourceType": "Fetched",
    "confidence": "Medium-Low"
  },
  {
    "key": "occupancy.classBC",
    "input": "Class B/C occupancy 2027-31",
    "location": "Assumptions C19:G19",
    "basis": "Conservative new-park ramp: feasibility norm Yr1 30-40%, stabilized 60-70% by Yr3-4; Midwest parks lower (45-60% annual incl. closed months).",
    "urls": [
      "https://unionmetricfeasibility.com/insights/rv-park-occupancy-regional-analysis-feasibility-guide",
      "https://www.analytics.loan/sba-feasibility-study-rv-park"
    ],
    "sourceType": "Fetched",
    "confidence": "Medium-Low"
  },
  {
    "key": "occupancy.tent",
    "input": "Tent occupancy 2027-31",
    "location": "Assumptions C20:G20",
    "basis": "ARVC 2023: rustic/tent sites avg 25% occupancy in months of operation. Ramp 15→25%.",
    "urls": [
      "https://ohi.org/wp-content/uploads/2023/10/2023_Benchmarking-Report.pdf"
    ],
    "sourceType": "Fetched",
    "confidence": "Medium-Low"
  },
  {
    "key": "cabinOccRamp",
    "input": "Cabin occupancy ramp by operating year (feeds Assumptions row 21)",
    "location": "Cabin Schedule C13:F13",
    "basis": "ARVC 2023: park-model cabins avg 52%, modern cabins 50% in operating months. Ramp 35/42/48/52% by year of operation; cabins only operate the season after they are cash-built.",
    "urls": [
      "https://ohi.org/wp-content/uploads/2023/10/2023_Benchmarking-Report.pdf"
    ],
    "sourceType": "Fetched",
    "confidence": "Low-Medium"
  },
  {
    "key": "cabinMinReserve",
    "input": "Minimum cash reserve before buying a cabin",
    "location": "Cabin Schedule C7",
    "basis": "Suggested starting point (~1-2 months of off-season fixed costs). Owner/lender may want more.",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Low"
  },
  {
    "key": "cabinBuildYearShare",
    "input": "Share of build-year season a new cabin operates",
    "location": "Cabin Schedule C10",
    "basis": "0 = a cabin bought with year-t cash opens the following season (conservative; avoids counting revenue before delivery/set-up).",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Medium"
  },
  {
    "key": "rates.tent",
    "input": "Tent site nightly rate",
    "location": "Assumptions C26",
    "basis": "ARVC 2023 Midwest rustic/tent median $30 midweek / $35 weekend. NE state parks: basic $15, primitive $10.",
    "urls": [
      "https://ohi.org/wp-content/uploads/2023/10/2023_Benchmarking-Report.pdf",
      "https://outdoornebraska.gov/parks/park-pricing/"
    ],
    "sourceType": "Fetched",
    "confidence": "Medium"
  },
  {
    "key": "rates.cabin",
    "input": "Cabin nightly rate",
    "location": "Assumptions C27",
    "basis": "ARVC 2023 Midwest park-model cabin median $168 midweek / $175 weekend; NE state-park cabins $105-$210. Used $150 (conservative).",
    "urls": [
      "https://ohi.org/wp-content/uploads/2023/10/2023_Benchmarking-Report.pdf",
      "https://outdoornebraska.gov/parks/park-pricing/"
    ],
    "sourceType": "Fetched",
    "confidence": "Medium"
  },
  {
    "key": "annualRateIncrease",
    "input": "Annual rate increase",
    "location": "Assumptions C28",
    "basis": "~inflation.",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Medium"
  },
  {
    "key": "storeSalesPerNight",
    "input": "General store gross sales",
    "location": "Assumptions C32:G32",
    "basis": "Formula: $4 × occupied site/unit-nights (Pro Forma row 26). ARVC 2023 median camp-store revenue ≈5% of median nightly-rental revenue.",
    "urls": [
      "https://ohi.org/wp-content/uploads/2023/10/2023_Benchmarking-Report.pdf"
    ],
    "sourceType": "Rule-of-thumb (ARVC ratio)",
    "confidence": "Low"
  },
  {
    "key": "storeCogsPct",
    "input": "Store COGS %",
    "location": "Assumptions C33",
    "basis": "Grocery/convenience COGS ~60%; rvpark.world says use only a 15-25% net store margin.",
    "urls": [
      "https://rvpark.world/blog/rv-park-underwriting/"
    ],
    "sourceType": "Rule-of-thumb + fetched",
    "confidence": "Medium"
  },
  {
    "key": "otherIncomePerNight",
    "input": "Other income (laundry, firewood, pets)",
    "location": "Assumptions C34:G34",
    "basis": "Formula: $2 × occupied nights. Store + other ≈8% of lodging, in line with analytics.loan's 8% ancillary assumption.",
    "urls": [
      "https://www.analytics.loan/sba-feasibility-study-rv-park"
    ],
    "sourceType": "Rule-of-thumb + fetched",
    "confidence": "Low"
  },
  {
    "key": "insurance",
    "input": "Insurance (property, GL, workers comp)",
    "location": "Assumptions C38:G38",
    "basis": "CompleteMarkets: small campground $3.5-9k, mid-size park ($0.5-2M revenue) $9-25k core package; analytics.loan example 3.6% of revenue. Formula: base $15k→$21.2k + $500 per operating cabin. GET A QUOTE.",
    "urls": [
      "https://completemarkets.com/contentpage/Campground-and-RV-Park-Insurance-Guide/",
      "https://www.analytics.loan/sba-feasibility-study-rv-park"
    ],
    "sourceType": "Fetched",
    "confidence": "Low-Medium"
  },
  {
    "key": "propertyTax",
    "input": "Property / personal property tax",
    "location": "Assumptions C39:G39",
    "basis": "Formula: 1.75% (NE 2025 avg commercial/industrial rate 1.7481%) × assumed assessed value 60% of financed hard cost (his budget + site work) × phase-in 35/75/90/100/100%, plus cash-built cabins from the following Jan 1. County levies vary a lot – ask the county assessor.",
    "urls": [
      "https://revenue.nebraska.gov/sites/default/files/doc/pad/research/annual-reports/2025/annrpt2025%20table%2019.pdf"
    ],
    "sourceType": "Fetched rate; assessment ratio rule-of-thumb",
    "confidence": "Low"
  },
  {
    "key": "rmPct",
    "input": "Repairs & maintenance",
    "location": "Assumptions C40:G40",
    "basis": "Formula: 2.5% of revenue (2027) rising to 4.5% (2031) – new build. analytics.loan stabilized R&M 4.5%; American Campground suggests ~5% of revenue repair fund.",
    "urls": [
      "https://www.analytics.loan/sba-feasibility-study-rv-park",
      "https://www.americancampground.net/how-much-does-it-cost-to-build-an-rv-park/"
    ],
    "sourceType": "Fetched + rule-of-thumb",
    "confidence": "Medium"
  },
  {
    "key": "utilitiesPerUnit",
    "input": "Water, trash, propane & other utilities",
    "location": "Assumptions C41:G41",
    "basis": "Formula: ≈$200 per site/unit/yr (+3%/yr). Wells mean no water bill; covers trash hauling, propane, water testing, phone. Electricity stays his number.",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Low"
  },
  {
    "key": "housekeeping",
    "input": "Cabin & bathhouse housekeeping/supplies",
    "location": "Assumptions C42:G42",
    "basis": "Formula: $25 per occupied cabin-night + $4k/yr bathhouse supplies ($6k from 2028).",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Low"
  },
  {
    "key": "cardFeesPct",
    "input": "Card / booking fees %",
    "location": "Assumptions C43",
    "basis": "Nav 2026: cards 1.5-3.5%; online/keyed 2.25-3% + $0.25; most campground bookings are card-not-present.",
    "urls": [
      "https://www.nav.com/blog/credit-card-processing-fees/"
    ],
    "sourceType": "Fetched",
    "confidence": "Medium-High"
  },
  {
    "key": "mgmtFeePct",
    "input": "Management fee %",
    "location": "Assumptions C44",
    "basis": "analytics.loan SBA worked example imputes 4%; rvpark.world shows 8-12% for third-party management. Lender may accept his paid GM instead.",
    "urls": [
      "https://www.analytics.loan/sba-feasibility-study-rv-park",
      "https://rvpark.world/blog/rv-park-underwriting/"
    ],
    "sourceType": "Fetched",
    "confidence": "Medium"
  },
  {
    "key": "replacementReservePerSite",
    "input": "Replacement reserve $/site/yr",
    "location": "Assumptions C45",
    "basis": "rvpark.world: $150-400/site/yr depending on age. $250 because cabins & pool wear faster.",
    "urls": [
      "https://rvpark.world/blog/rv-park-underwriting/"
    ],
    "sourceType": "Fetched",
    "confidence": "Medium"
  },
  {
    "key": "expenseInflation",
    "input": "Expense inflation (2031 and blank carried-forward lines)",
    "location": "Assumptions C46",
    "basis": "3%/yr.",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Medium"
  },
  {
    "key": "cabinCostPerUnit",
    "input": "Cabin cost per unit (all-in)",
    "location": "Assumptions C49",
    "basis": "Green River park-model cabins $58.9-88.9k unit; $65-75k fully installed in the Southeast; extra delivery to the Midwest. OWNER UPDATE: cabins are cash-funded one at a time from 2029 (Cabin Schedule), not financed.",
    "urls": [
      "https://greenriverlogcabins.com/how-to-add-cabins-to-rv-park/"
    ],
    "sourceType": "Fetched",
    "confidence": "Medium"
  },
  {
    "key": "rvSiteInfrastructure",
    "input": "RV site infrastructure (pads/roads/pedestals/laterals)",
    "location": "Assumptions C50",
    "basis": "Formula: 80 RV sites × $15,000 + 20 tent sites × $1,500, ON TOP of his electrical/grading/septic/well budget. American Campground: $13-42k per site excl. roads; analytics.loan: $28k/site site work; MMCG: $15-50k/pad. GET A CIVIL BID.",
    "urls": [
      "https://www.americancampground.net/how-much-does-it-cost-to-build-an-rv-park/",
      "https://www.analytics.loan/sba-feasibility-study-rv-park",
      "https://www.mmcginvest.com/post/practical-guide-for-rv-park-planning-development-operations"
    ],
    "sourceType": "Fetched",
    "confidence": "Low-Medium"
  },
  {
    "key": "softCosts",
    "input": "Permits / soft costs",
    "location": "Assumptions C51",
    "basis": "Permits, impact fees, survey, geotech/perc, Phase I, state licensing, builder's risk, legal. American Campground: permits/engineering $6k-150k. His $60k design fees are separate.",
    "urls": [
      "https://www.americancampground.net/how-much-does-it-cost-to-build-an-rv-park/"
    ],
    "sourceType": "Fetched range + rule-of-thumb",
    "confidence": "Low"
  },
  {
    "key": "ffe",
    "input": "FF&E",
    "location": "Assumptions C52",
    "basis": "Golf carts, mower/UTV, store fixtures/POS, laundry machines, park Wi-Fi/IT, signage. analytics.loan example uses $2k/site.",
    "urls": [
      "https://www.analytics.loan/sba-feasibility-study-rv-park",
      "https://www.mmcginvest.com/post/practical-guide-for-rv-park-planning-development-operations"
    ],
    "sourceType": "Rule-of-thumb + fetched",
    "confidence": "Low"
  },
  {
    "key": "contingencyPct",
    "input": "Construction contingency %",
    "location": "Assumptions C53",
    "basis": "MMCG and UnionMetric: 10-15% contingency; no contractor bids yet, so mid-range 12.5%. Applied to financed construction only (cabins excluded).",
    "urls": [
      "https://www.mmcginvest.com/post/practical-guide-for-rv-park-planning-development-operations",
      "https://unionmetricfeasibility.com/insights/rv-park-occupancy-regional-analysis-feasibility-guide"
    ],
    "sourceType": "Fetched",
    "confidence": "Medium-High"
  },
  {
    "key": "workingCapital",
    "input": "Working capital / off-season reserve",
    "location": "Assumptions C54",
    "basis": "Formula: peak 2027 cumulative cash shortfall (Seasonality tab) + 3 months of fixed opex & debt service for the Jan-Mar 2028 off-season. UnionMetric: reserve 6-12 months opex + debt service; analytics.loan sizes WC to the Yr-1 shortfall.",
    "urls": [
      "https://unionmetricfeasibility.com/insights/rv-park-occupancy-regional-analysis-feasibility-guide",
      "https://www.analytics.loan/sba-feasibility-study-rv-park"
    ],
    "sourceType": "Fetched method",
    "confidence": "Medium"
  },
  {
    "key": "interestReserve",
    "input": "Construction interest reserve",
    "location": "Assumptions C55",
    "basis": "Formula: hard costs × loan % × 50% avg outstanding × rate × 9 months of 2026 draws.",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Medium"
  },
  {
    "key": "closingCosts",
    "input": "Loan closing costs / guarantee fee",
    "location": "Assumptions C56",
    "basis": "Formula: SBA 7(a) FY2027 guaranty fee = 3.5% of guaranteed portion up to $1M + 3.75% above (75% guaranty on loans >$150k), plus ~$45k packaging/appraisal/feasibility/title/legal.",
    "urls": [
      "https://www.wert-berater.com/blog/sba-fee-schedules-fy2027.html",
      "https://www.sba.gov/loans/7a-loans/"
    ],
    "sourceType": "Fetched (fee); rule-of-thumb (third-party)",
    "confidence": "Medium"
  },
  {
    "key": "equityPct",
    "input": "Equity injection %",
    "location": "Assumptions C60",
    "basis": "SBA 7(a) minimum 10% (MMCG); 504 requires 20% for a new business on special-purpose property (analytics.loan); Staves: banks typically want 20%.",
    "urls": [
      "https://www.mmcginvest.com/post/practical-guide-for-rv-park-planning-development-operations",
      "https://www.analytics.loan/sba-feasibility-study-rv-park",
      "https://stavesconsulting.com/faq/"
    ],
    "sourceType": "Fetched",
    "confidence": "Medium"
  },
  {
    "key": "interestRate",
    "input": "Interest rate",
    "location": "Assumptions C61",
    "basis": "WSJ/JPM Prime 7.00% (eff. 9/17/2026) + 2.50%. SBA 7(a) variable cap for loans >$350k = Prime + 3.0% = 10.00%. Alt: SBA 504 25-yr debenture 6.974% (Oct 2026) on ~40% of cost; USDA B&I (rural) 3% guarantee fee, up to 40-yr term, rate negotiated.",
    "urls": [
      "https://www.jpmorganchase.com/legal/historical-prime-rate",
      "https://www.sba.gov/loans/7a-loans/",
      "https://www.sbapulse.com/data/rates/2026-10",
      "https://www.rd.usda.gov/programs-services/business-programs/business-industry-loan-guarantees-10"
    ],
    "sourceType": "Fetched",
    "confidence": "Medium"
  },
  {
    "key": "amortYears",
    "input": "Amortization (years)",
    "location": "Assumptions C62",
    "basis": "SBA 7(a): 25 years for real estate/long-lived improvements. Lease must outlast the loan.",
    "urls": [
      "https://www.sba.gov/loans/7a-loans/",
      "https://www.mmcginvest.com/post/practical-guide-for-rv-park-planning-development-operations"
    ],
    "sourceType": "Fetched",
    "confidence": "Medium-High"
  },
  {
    "key": "interestOnlyYears",
    "input": "Interest-only years",
    "location": "Assumptions C63",
    "basis": "1 year interest-only to cover build-out + first season; common on construction loans but must be negotiated. Set 0 to see full amortization in 2027.",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Low"
  },
  {
    "key": "minDscr",
    "input": "Lender minimum DSCR",
    "location": "Assumptions C64",
    "basis": "1.25x common SBA/bank floor; SBA SOP requires ≥1.15x within 2 years of completion for projection-based loans; seasonal parks often 1.30-1.35x.",
    "urls": [
      "https://rvpark.world/blog/rv-park-underwriting/",
      "https://www.analytics.loan/sba-feasibility-study-rv-park"
    ],
    "sourceType": "Fetched",
    "confidence": "Medium-High"
  },
  {
    "key": "landAcquisition",
    "input": "Land acquisition",
    "location": "Sources & Uses E26",
    "basis": "$0 – land is leased per his expense tab (lease $0 2027-29, $50k/yr from 2030).",
    "urls": [],
    "sourceType": "From his file",
    "confidence": "High"
  },
  {
    "key": "carriedForward",
    "input": "2028 Internet access (blank in his file)",
    "location": "Opex Detail B32:M32",
    "basis": "Prior year's monthly amounts × (1 + 3% inflation, Assumptions C46).",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Medium"
  },
  {
    "key": "carriedForward",
    "input": "2028 Office & misc. (blank in his file)",
    "location": "Opex Detail B33:M33",
    "basis": "Prior year's monthly amounts × (1 + 3% inflation, Assumptions C46).",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Medium"
  },
  {
    "key": "carriedForward",
    "input": "2029 Accounting & bookkeeping (blank in his file)",
    "location": "Opex Detail B42:M42",
    "basis": "Prior year's monthly amounts × (1 + 3% inflation, Assumptions C46).",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Medium"
  },
  {
    "key": "carriedForward",
    "input": "2029 Landscaping & trail supplies (blank in his file)",
    "location": "Opex Detail B45:M45",
    "basis": "Prior year's monthly amounts × (1 + 3% inflation, Assumptions C46).",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Medium"
  },
  {
    "key": "carriedForward",
    "input": "2029 Internet access (blank in his file)",
    "location": "Opex Detail B50:M50",
    "basis": "Prior year's monthly amounts × (1 + 3% inflation, Assumptions C46).",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Medium"
  },
  {
    "key": "carriedForward",
    "input": "2029 Office & misc. (blank in his file)",
    "location": "Opex Detail B51:M51",
    "basis": "Prior year's monthly amounts × (1 + 3% inflation, Assumptions C46).",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Medium"
  },
  {
    "key": "carriedForward",
    "input": "2029 Groundskeeper (seasonal) (blank in his file)",
    "location": "Opex Detail B55:M55",
    "basis": "Prior year's monthly amounts × (1 + 3% inflation, Assumptions C46).",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Medium"
  },
  {
    "key": "carriedForward",
    "input": "2030 Accounting & bookkeeping (blank in his file)",
    "location": "Opex Detail B60:M60",
    "basis": "Prior year's monthly amounts × (1 + 3% inflation, Assumptions C46).",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Medium"
  },
  {
    "key": "carriedForward",
    "input": "2030 Landscaping & trail supplies (blank in his file)",
    "location": "Opex Detail B63:M63",
    "basis": "Prior year's monthly amounts × (1 + 3% inflation, Assumptions C46).",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Medium"
  },
  {
    "key": "carriedForward",
    "input": "2030 Internet access (blank in his file)",
    "location": "Opex Detail B68:M68",
    "basis": "Prior year's monthly amounts × (1 + 3% inflation, Assumptions C46).",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Medium"
  },
  {
    "key": "carriedForward",
    "input": "2030 Office & misc. (blank in his file)",
    "location": "Opex Detail B69:M69",
    "basis": "Prior year's monthly amounts × (1 + 3% inflation, Assumptions C46).",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Medium"
  },
  {
    "key": "carriedForward",
    "input": "2030 General store staff (blank in his file)",
    "location": "Opex Detail B71:M71",
    "basis": "Prior year's monthly amounts × (1 + 3% inflation, Assumptions C46).",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Medium"
  },
  {
    "key": "carriedForward",
    "input": "2030 Groundskeeper / cleaning staff (blank in his file)",
    "location": "Opex Detail B72:M72",
    "basis": "Prior year's monthly amounts × (1 + 3% inflation, Assumptions C46).",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Medium"
  },
  {
    "key": "carriedForward",
    "input": "2030 Groundskeeper (seasonal) (blank in his file)",
    "location": "Opex Detail B73:M73",
    "basis": "Prior year's monthly amounts × (1 + 3% inflation, Assumptions C46).",
    "urls": [],
    "sourceType": "Rule-of-thumb",
    "confidence": "Medium"
  }
];

export const ESTIMATE_BY_KEY: Record<string, EstimateSource[]> = ESTIMATE_SOURCES.reduce((m, s) => {
  (m[s.key] ??= []).push(s);
  return m;
}, {} as Record<string, EstimateSource[]>);

export const ESTIMATE_URLS: string[] = Array.from(new Set(ESTIMATE_SOURCES.flatMap((s) => s.urls))).sort();
