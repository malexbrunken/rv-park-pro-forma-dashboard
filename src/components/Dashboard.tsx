"use client";

import { createContext, useContext, useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, Pie, PieChart, ReferenceLine,
  ResponsiveContainer, Cell, Tooltip, XAxis, YAxis,
} from "recharts";
import { Inputs, RvSiteType, PLACEHOLDER_KEYS, REVIEW_NOTES, SCENARIO_DEFAULTS, Scenario, SITE_TYPES, SiteType, Y5, YEARS } from "@/lib/data";
import { ESTIMATE_BY_KEY, ESTIMATE_NOTES, ESTIMATE_SOURCES, ESTIMATE_URLS } from "@/lib/estimates";
import { runModel } from "@/lib/model";

const usd = (v: number) => (v < 0 ? "-" : "") + "$" + Math.round(Math.abs(v)).toLocaleString("en-US");
const usdK = (v: number) => (v < 0 ? "-" : "") + "$" + Math.round(Math.abs(v) / 1000).toLocaleString("en-US") + "k";
const pct = (v: number, d = 1) => (v * 100).toFixed(d) + "%";
const x = (v: number) => v.toFixed(2) + "x";

const C = { navy: "#1e3a5f", teal: "#0f766e", amber: "#d97706", red: "#b91c1c", slate: "#64748b", sky: "#0284c7", green: "#15803d" };

function Badge() {
  return <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">Placeholder</span>;
}

function EstimateBadge({ k }: { k: string }) {
  const src = ESTIMATE_BY_KEY[k] ?? [];
  const tip = src.map((e) => `${e.input}\nBasis: ${e.basis}\nSource type: ${e.sourceType} · Confidence: ${e.confidence}`).join("\n\n");
  return (
    <span title={tip} className="ml-1 cursor-help rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-800">
      Estimate{src[0] ? ` · ${src[0].confidence}` : ""}
    </span>
  );
}

/** Scenario-aware tag: blue Estimate badge in estimated mode, yellow Placeholder badge in placeholder mode. */
const ScenarioCtx = createContext<Scenario>("placeholder");
function Tag({ k }: { k?: string }) {
  const scenario = useContext(ScenarioCtx);
  if (!k) return null;
  if (scenario === "estimated") return ESTIMATE_BY_KEY[k] ? <EstimateBadge k={k} /> : null;
  return PLACEHOLDER_KEYS.has(k) ? <Badge /> : null;
}
function useTagBg(k?: string) {
  const scenario = useContext(ScenarioCtx);
  if (!k) return "";
  if (scenario === "estimated") return ESTIMATE_BY_KEY[k] ? "bg-sky-50" : "";
  return PLACEHOLDER_KEYS.has(k) ? "bg-amber-50" : "";
}

function Card({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {title && <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-600">{title}</h2>}
      {children}
    </section>
  );
}

type Fmt = "pct" | "usd" | "num" | "x" | "year";
function fmt(v: number, f: Fmt) {
  return f === "year" ? String(v) : f === "pct" ? pct(v) : f === "usd" ? usd(v) : f === "x" ? x(v) : v.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function Slider({ label, value, onChange, min, max, step, format, tag }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; format: Fmt; tag?: string;
}) {
  const bg = useTagBg(tag);
  return (
    <label className={`block rounded-md px-2 py-1.5 ${bg}`}>
      <div className="flex items-center justify-between text-xs text-slate-700">
        <span>{label}<Tag k={tag} /></span>
        <span className="font-mono font-semibold text-slate-900">{fmt(value, format)}</span>
      </div>
      <input type="range" className="mt-1 w-full accent-[#1e3a5f]" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} aria-label={label} />
    </label>
  );
}

function NumField({ label, value, onChange, tag, step = 1000 }: {
  label: string; value: number; onChange: (v: number) => void; tag?: string; step?: number;
}) {
  const bg = useTagBg(tag);
  return (
    <label className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs text-slate-700 ${bg}`}>
      <span>{label}<Tag k={tag} /></span>
      <input type="number" min={0} step={step} value={value} onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="w-28 rounded border border-slate-300 bg-white px-2 py-1 text-right font-mono text-slate-900" aria-label={label} />
    </label>
  );
}

function YearRow({ label, values, onChange, tag, format, step }: {
  label: string; values: Y5; onChange: (v: Y5) => void; tag?: string; format: "pct" | "usd"; step: number;
}) {
  const bg = useTagBg(tag);
  const scale = format === "pct" ? 100 : 1;
  return (
    <div className={`rounded-md px-2 py-1.5 text-xs text-slate-700 ${bg}`}>
      <div className="mb-1">{label}{format === "pct" ? " (%)" : " ($)"}<Tag k={tag} /></div>
      <div className="grid grid-cols-5 gap-1">
        {YEARS.map((y, i) => (
          <label key={y} className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400">{y}</span>
            <input type="number" min={0} step={step} aria-label={`${label} ${y}`}
              value={Number((values[i] * scale).toFixed(format === "pct" ? 2 : 0))}
              onChange={(e) => { const nv = [...values] as Y5; nv[i] = Math.max(0, Number(e.target.value) || 0) / scale; onChange(nv); }}
              className="w-full rounded border border-slate-300 bg-white px-1 py-0.5 text-right font-mono text-[11px] text-slate-900" />
          </label>
        ))}
      </div>
    </div>
  );
}

function RampRow({ values, onChange }: { values: [number, number, number, number]; onChange: (v: [number, number, number, number]) => void }) {
  const bg = useTagBg("cabinOccRamp");
  return (
    <div className={`rounded-md px-2 py-1.5 text-xs text-slate-700 ${bg}`}>
      <div className="mb-1">Cabin occupancy by operating year (%)<Tag k="cabinOccRamp" /></div>
      <div className="grid grid-cols-4 gap-1">
        {["Yr 1", "Yr 2", "Yr 3", "Yr 4+"].map((lbl, i) => (
          <label key={lbl} className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400">{lbl}</span>
            <input type="number" min={0} max={100} step={1} aria-label={`Cabin occupancy ${lbl}`} value={Number((values[i] * 100).toFixed(2))}
              onChange={(e) => { const nv = [...values] as [number, number, number, number]; nv[i] = Math.min(100, Math.max(0, Number(e.target.value) || 0)) / 100; onChange(nv); }}
              className="w-full rounded border border-slate-300 bg-white px-1 py-0.5 text-right font-mono text-[11px] text-slate-900" />
          </label>
        ))}
      </div>
    </div>
  );
}

function AutoField({ label, value, auto, onChange, tag }: {
  label: string; value: number | null; auto: number; onChange: (v: number | null) => void; tag?: string;
}) {
  const bg = useTagBg(tag);
  return (
    <div className={`rounded-md px-2 py-1.5 text-xs text-slate-700 ${bg}`}>
      <div className="flex items-center justify-between gap-2">
        <span>{label}<Tag k={tag} /></span>
        <label className="flex items-center gap-1"><input type="checkbox" checked={value === null}
          onChange={(e) => onChange(e.target.checked ? null : Math.round(auto))} />auto</label>
      </div>
      {value === null ? <div className="mt-1 text-right font-mono text-slate-900">{usd(auto)}</div> : (
        <input type="number" min={0} step={1000} value={value} aria-label={label}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-right font-mono text-slate-900" />
      )}
    </div>
  );
}

function Group({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="border-b border-slate-200 py-2">
      <summary className="cursor-pointer select-none py-1 text-sm font-semibold text-slate-800">{title}</summary>
      <div className="mt-1 space-y-1">{children}</div>
    </details>
  );
}

function Kpi({ label, value, sub, tone = "default" }: { label: string; value: string; sub?: string; tone?: "default" | "good" | "bad" }) {
  const color = tone === "good" ? "text-emerald-700" : tone === "bad" ? "text-red-700" : "text-slate-900";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${color}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function heat(v: number, min: number) {
  if (v < 1) return "bg-red-100 text-red-800";
  if (v < min) return "bg-amber-100 text-amber-800";
  return "bg-emerald-50 text-emerald-800";
}

const PH_ROW_KEYS: Record<string, string> = {
  "Insurance (property, liability, workers comp)": "insurance",
  "Property / personal property tax": "propertyTax",
  "Repairs & maintenance": "rmPct",
  "Water, trash, propane & other utilities": "utilitiesPerUnit",
  "Cabin & bathhouse housekeeping / supplies": "housekeeping",
  "Card & booking fees": "cardFeesPct",
  "Management fee": "mgmtFeePct",
  "Replacement reserve": "replacementReservePerSite",
};
const USE_KEYS: Record<string, string> = {
  "Cabins financed at closing (owner: none; cash-funded, see cabin schedule)": "cabinCostPerUnit",
  "RV pads, roads, power pedestals, water/sewer laterals": "rvSiteInfrastructure",
  "Permits, impact fees & soft costs": "softCosts",
  "Furniture, fixtures & equipment": "ffe",
  "Hard-cost contingency": "contingencyPct",
  "Working capital / off-season reserve": "workingCapital",
  "Interest reserve during construction": "interestReserve",
  "Loan closing costs / guarantee fees": "closingCosts",
  "Land acquisition (leased)": "landAcquisition",
};

const SCENARIOS: { key: Scenario; label: string; sub: string }[] = [
  { key: "placeholder", label: "Placeholder", sub: "Owner inputs only" },
  { key: "estimated", label: "Estimated", sub: "Best-guess fills" },
];

export default function Dashboard() {
  const [scenario, setScenario] = useState<Scenario>("placeholder");
  const [inp, setInp] = useState<Inputs>(SCENARIO_DEFAULTS.placeholder);
  const r = useMemo(() => runModel(inp), [inp]);
  const autoWc = useMemo(() => runModel({ ...inp, workingCapitalOverride: null }).workingCapital, [inp]);
  const autoIr = useMemo(() => runModel({ ...inp, interestReserveOverride: null }).uses.find((u) => u.name.startsWith("Interest reserve"))!.amount, [inp]);
  const autoCc = useMemo(() => runModel({ ...inp, closingCostsOverride: null }).uses.find((u) => u.name.startsWith("Loan closing"))!.amount, [inp]);
  const switchScenario = (s: Scenario) => { setScenario(s); setInp(SCENARIO_DEFAULTS[s]); };
  const set = <K extends keyof Inputs>(k: K) => (v: Inputs[K]) => setInp((p) => ({ ...p, [k]: v }));
  const setOcc = (k: RvSiteType) => (v: Y5) => setInp((p) => ({ ...p, occupancy: { ...p.occupancy, [k]: v } }));
  const setRate = (k: SiteType) => (v: number) => setInp((p) => ({ ...p, rates: { ...p.rates, [k]: v } }));
  const estimated = scenario === "estimated";

  const stab = r.years[3];
  const minDscrYear = r.years.slice(1).reduce((a, b) => (b.dscr < a.dscr ? b : a));
  const failingYears = r.years.filter((y) => !y.meetsMin).map((y) => y.year);
  const chartYears = r.years.map((y) => ({
    year: String(y.year), Revenue: y.revenue, Opex: y.opex, NOI: y.noi, "Debt service": y.debtService, DSCR: y.dscr,
    "Break-even occ.": y.breakEvenDscr1, "Modeled occ.": y.weightedOcc, "Occ. for min DSCR": y.occForMinDscr,
  }));
  const usesChart = r.uses.filter((u) => u.amount > 0);
  const pieColors = [C.navy, C.teal, C.sky, C.amber, C.green, C.slate, "#7c3aed", "#be185d", "#0891b2", "#a16207", "#4d7c0f", "#9f1239"];
  const flagFill = estimated ? C.sky : C.amber;
  const flagRow = estimated ? "bg-sky-50/60" : "bg-amber-50/60";

  return (
    <ScenarioCtx.Provider value={scenario}>
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-[#1e3a5f] text-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-end justify-between gap-4 px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-200">Lender pro forma · New build</p>
            <h1 className="mt-1 text-2xl font-semibold">RV Park — 5-Year Pro Forma Dashboard</h1>
            <p className="mt-1 max-w-3xl text-sm text-sky-100">Operating years 2027–2031. Choose a scenario, then adjust the assumptions on the left; every figure recalculates live. Scenario defaults reproduce their lender workbooks.</p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div role="radiogroup" aria-label="Scenario" data-testid="scenario-toggle" className="flex rounded-xl bg-white/10 p-1 ring-1 ring-white/30">
              {SCENARIOS.map((s) => (
                <button key={s.key} role="radio" aria-checked={scenario === s.key} onClick={() => switchScenario(s.key)}
                  className={`rounded-lg px-4 py-2 text-left transition ${scenario === s.key ? (s.key === "estimated" ? "bg-sky-400 text-[#0b2440] shadow" : "bg-amber-300 text-[#3b2a00] shadow") : "text-white hover:bg-white/10"}`}>
                  <div className="text-sm font-semibold">{s.label}</div>
                  <div className="text-[11px] opacity-80">{s.sub}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setInp(SCENARIO_DEFAULTS[scenario])} className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20">Reset scenario</button>
            <button onClick={() => window.print()} className="rounded-md bg-white px-3 py-2 text-sm font-medium text-[#1e3a5f] hover:bg-sky-50">Print / PDF</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] space-y-3 px-6 pt-4">
        {estimated && failingYears.length > 0 && (
          <div role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
            <strong>DSCR is below the lender minimum of {x(inp.minDscr)} in {failingYears.join(", ")}.</strong> Lowest operating-year coverage is {x(minDscrYear.dscr)} ({minDscrYear.year}); 2030 is {x(stab.dscr)}.
            With realistic costs filled in, projected NOI does not cover debt service. The project needs more equity, lower costs, higher revenue, or different loan terms to qualify.
          </div>
        )}
        {estimated ? (
          <div className="rounded-lg border border-sky-300 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            <strong>Estimated scenario:</strong> {ESTIMATE_SOURCES.length} former placeholders are filled with best-guess estimates, marked <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-sky-800">Estimate</span> (hover for basis &amp; confidence).
            These are starting estimates to edit, not verified figures. Replace each with a quote, bid, comp survey or lender term sheet before submission.
          </div>
        ) : (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <strong>{r.placeholderCount} placeholder inputs are still at $0 / 0%.</strong> Items marked <Badge /> are not supported by the borrower&apos;s file
            (missing costs, illustrative financing terms, assumed occupancy). Outputs are only as reliable as these inputs. Switch to <em>Estimated</em> to see best-guess fills.
          </div>
        )}
      </div>

      <div className="mx-auto grid max-w-[1500px] gap-6 px-6 py-6 lg:grid-cols-[360px_1fr]">
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto print:hidden">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Assumptions · {estimated ? "Estimated" : "Placeholder"}</h2>
          <Group title="Occupancy by year" open>
            <Slider label="Occupancy adjustment (all types & years)" value={inp.occupancyMultiplier} onChange={set("occupancyMultiplier")} min={0.5} max={1.5} step={0.01} format="x" />
            {SITE_TYPES.filter((s) => s.key !== "cabin").map((s) => (
              <YearRow key={s.key} label={s.label} values={inp.occupancy[s.key as RvSiteType]} onChange={setOcc(s.key as RvSiteType)} format="pct" step={1} tag={`occupancy.${s.key}`} />
            ))}
            <Slider label="Season length (nights open)" value={inp.seasonNights} onChange={set("seasonNights")} min={60} max={365} step={1} format="num" tag="seasonNights" />
          </Group>
          <Group title="Nightly rates (2027 base)" open>
            {SITE_TYPES.map((s) => (
              <Slider key={s.key} label={s.label} value={inp.rates[s.key]} onChange={setRate(s.key)} min={0} max={250} step={0.5} format="usd" tag={`rates.${s.key}`} />
            ))}
            <Slider label="Annual rate increase" value={inp.annualRateIncrease} onChange={set("annualRateIncrease")} min={0} max={0.1} step={0.005} format="pct" tag="annualRateIncrease" />
          </Group>
          <Group title="Cabins (cash-funded build-out)" open>
            <p className="px-2 text-[11px] text-slate-500">Cabins are not in the loan. Starting in the first build year, a cabin is bought only when start-of-year cash minus the minimum reserve covers its full cost.</p>
            <NumField label="Cabin cost per unit (2027 $, all-in)" value={inp.cabinCostPerUnit} onChange={set("cabinCostPerUnit")} tag="cabinCostPerUnit" />
            <Slider label="Cabin cost escalation / yr" value={inp.cabinCostEscalation} onChange={set("cabinCostEscalation")} min={0} max={0.08} step={0.005} format="pct" tag="expenseInflation" />
            <Slider label="First build year" value={inp.cabinBuildStartYear} onChange={set("cabinBuildStartYear")} min={2028} max={2031} step={1} format="year" />
            <NumField label="Minimum cash reserve before buying" value={inp.cabinMinReserve} onChange={set("cabinMinReserve")} tag="cabinMinReserve" step={5000} />
            <Slider label="Cabins planned (max)" value={inp.cabinsPlanned} onChange={set("cabinsPlanned")} min={0} max={30} step={1} format="num" />
            <Slider label="Cabins financed in the loan at closing" value={inp.cabinsFinanced} onChange={set("cabinsFinanced")} min={0} max={inp.cabinsPlanned} step={1} format="num" />
            <Slider label="Share of build-year season operated" value={inp.cabinBuildYearShare} onChange={set("cabinBuildYearShare")} min={0} max={1} step={0.25} format="pct" tag="cabinBuildYearShare" />
            <RampRow values={inp.cabinOccRamp} onChange={set("cabinOccRamp")} />
          </Group>
          <Group title="Financing" open>
            <Slider label="Interest rate" value={inp.interestRate} onChange={set("interestRate")} min={0.03} max={0.14} step={0.0025} format="pct" tag="interestRate" />
            <Slider label="Amortization (years)" value={inp.amortYears} onChange={set("amortYears")} min={5} max={30} step={1} format="num" tag="amortYears" />
            <Slider label="Interest-only years" value={inp.interestOnlyYears} onChange={set("interestOnlyYears")} min={0} max={3} step={1} format="num" tag="interestOnlyYears" />
            <Slider label="Equity injection %" value={inp.equityPct} onChange={set("equityPct")} min={0} max={0.6} step={0.01} format="pct" tag="equityPct" />
            <Slider label="Lender minimum DSCR" value={inp.minDscr} onChange={set("minDscr")} min={1} max={2} step={0.05} format="x" tag="minDscr" />
          </Group>
          <Group title="Project cost">
            <Slider label="Project cost multiplier (hard costs)" value={inp.projectCostMultiplier} onChange={set("projectCostMultiplier")} min={0.5} max={3} step={0.05} format="x" />
            <NumField label="RV pads / roads / pedestals / laterals" value={inp.rvSiteInfrastructure} onChange={set("rvSiteInfrastructure")} tag="rvSiteInfrastructure" step={10000} />
            <NumField label="Permits & soft costs" value={inp.softCosts} onChange={set("softCosts")} tag="softCosts" />
            <NumField label="FF&E" value={inp.ffe} onChange={set("ffe")} tag="ffe" />
            <Slider label="Hard-cost contingency" value={inp.contingencyPct} onChange={set("contingencyPct")} min={0} max={0.25} step={0.005} format="pct" tag="contingencyPct" />
            <AutoField label="Interest reserve (auto = hard cost × loan % × 50% × rate × 9/12)" value={inp.interestReserveOverride} auto={autoIr} onChange={set("interestReserveOverride")} tag="interestReserve" />
            <AutoField label="Closing costs (auto = SBA 7(a) guaranty fee + third-party)" value={inp.closingCostsOverride} auto={autoCc} onChange={set("closingCostsOverride")} tag="closingCosts" />
            <AutoField label="Working capital (auto = peak 2027 shortfall + off-season months)" value={inp.workingCapitalOverride} auto={autoWc} onChange={set("workingCapitalOverride")} tag="workingCapital" />
            <Slider label="Off-season carry months in working capital" value={inp.workingCapitalExtraMonths} onChange={set("workingCapitalExtraMonths")} min={0} max={6} step={1} format="num" tag="workingCapital" />
            <NumField label="Land acquisition" value={inp.landAcquisition} onChange={set("landAcquisition")} tag="landAcquisition" />
          </Group>
          <Group title="Operating expenses">
            <Slider label="Borrower opex lines multiplier" value={inp.borrowerOpexMultiplier} onChange={set("borrowerOpexMultiplier")} min={0.5} max={2} step={0.05} format="x" />
            <Slider label="Expense inflation (2031 & carried-forward lines)" value={inp.expenseInflation} onChange={set("expenseInflation")} min={0} max={0.08} step={0.005} format="pct" tag="expenseInflation" />
            <YearRow label="Insurance (base)" values={inp.insurance} onChange={set("insurance")} format="usd" step={500} tag="insurance" />
            <NumField label="Insurance per operating cabin" value={inp.insurancePerCabin} onChange={set("insurancePerCabin")} tag="insurance" step={100} />
            <Slider label="Property tax rate" value={inp.propertyTaxRate} onChange={set("propertyTaxRate")} min={0} max={0.04} step={0.0005} format="pct" tag="propertyTax" />
            <Slider label="Assessed value (% of hard cost)" value={inp.assessedPctOfHardCost} onChange={set("assessedPctOfHardCost")} min={0} max={1} step={0.05} format="pct" tag="propertyTax" />
            <YearRow label="Property tax phase-in" values={inp.taxPhaseIn} onChange={set("taxPhaseIn")} format="pct" step={5} tag="propertyTax" />
            <YearRow label="Repairs & maintenance, % of revenue" values={inp.rmPctOfRevenue} onChange={set("rmPctOfRevenue")} format="pct" step={0.5} tag="rmPct" />
            <YearRow label="Water/trash/propane per site/unit" values={inp.utilitiesPerUnit} onChange={set("utilitiesPerUnit")} format="usd" step={10} tag="utilitiesPerUnit" />
            <NumField label="Housekeeping $ per occupied cabin-night" value={inp.housekeepingPerCabinNight} onChange={set("housekeepingPerCabinNight")} tag="housekeeping" step={1} />
            <YearRow label="Bathhouse supplies" values={inp.bathhouseSupplies} onChange={set("bathhouseSupplies")} format="usd" step={500} tag="housekeeping" />
            <Slider label="Card & booking fees (% rev.)" value={inp.cardFeesPct} onChange={set("cardFeesPct")} min={0} max={0.08} step={0.0025} format="pct" tag="cardFeesPct" />
            <Slider label="Management fee (% rev.)" value={inp.mgmtFeePct} onChange={set("mgmtFeePct")} min={0} max={0.12} step={0.005} format="pct" tag="mgmtFeePct" />
            <NumField label="Replacement reserve ($/site/yr)" value={inp.replacementReservePerSite} onChange={set("replacementReservePerSite")} tag="replacementReservePerSite" step={25} />
          </Group>
          <Group title="Store & other income">
            <Slider label="Store sales per occupied night" value={inp.storeSalesPerNight} onChange={set("storeSalesPerNight")} min={0} max={15} step={0.5} format="usd" tag="storeSalesPerNight" />
            <Slider label="Store COGS %" value={inp.storeCogsPct} onChange={set("storeCogsPct")} min={0} max={0.9} step={0.01} format="pct" tag="storeCogsPct" />
            <Slider label="Other income per occupied night" value={inp.otherIncomePerNight} onChange={set("otherIncomePerNight")} min={0} max={10} step={0.5} format="usd" tag="otherIncomePerNight" />
          </Group>
        </aside>

        <main className="space-y-6">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <Kpi label="Total project cost" value={usd(r.totalUses)} sub={`Loan ${usd(r.loan)} · Equity ${usd(r.equity)}`} />
            <Kpi label="Stabilized NOI (2030)" value={usd(stab.noi)} sub={`${pct(stab.noi / (stab.revenue || 1))} margin`} tone={stab.noi > 0 ? "good" : "bad"} />
            <Kpi label="DSCR 2030" value={x(stab.dscr)} sub={`Min ${x(inp.minDscr)} · lowest 2028–31: ${x(minDscrYear.dscr)} (${minDscrYear.year})`} tone={stab.dscr >= inp.minDscr ? "good" : "bad"} />
            <Kpi label="Break-even occupancy 2030" value={pct(stab.breakEvenDscr1)} sub={`Modeled ${pct(stab.weightedOcc)} · cushion ${((stab.weightedOcc - stab.breakEvenDscr1) * 100).toFixed(1)} pts`} tone={stab.weightedOcc > stab.breakEvenDscr1 ? "good" : "bad"} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card title="Revenue, operating expenses & NOI">
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={chartYears}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" /><YAxis tickFormatter={usdK} width={60} />
                  <Tooltip formatter={(v) => usd(Number(v))} /><Legend />
                  <Bar isAnimationActive={false} dataKey="Revenue" fill={C.navy} /><Bar isAnimationActive={false} dataKey="Opex" fill={C.slate} />
                  <Line isAnimationActive={false} dataKey="NOI" stroke={C.teal} strokeWidth={3} />
                  <Line isAnimationActive={false} dataKey="Debt service" stroke={C.red} strokeDasharray="5 4" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Debt service coverage ratio">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartYears}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" /><YAxis tickFormatter={(v) => v + "x"} width={45} />
                  <Tooltip formatter={(v) => x(Number(v))} />
                  <ReferenceLine ifOverflow="extendDomain" y={inp.minDscr} stroke={C.amber} strokeDasharray="6 3" label={{ value: `Lender min ${x(inp.minDscr)}`, position: "insideTopRight", fill: C.amber, fontSize: 11 }} />
                  <ReferenceLine y={1} stroke={C.red} strokeDasharray="2 2" />
                  <Bar isAnimationActive={false} dataKey="DSCR">
                    {chartYears.map((d) => <Cell key={d.year} fill={d.DSCR >= inp.minDscr ? C.teal : d.DSCR >= 1 ? C.amber : C.red} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card title="Projected P&L (2027–2031)">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead><tr className="border-b border-slate-300 text-right text-xs uppercase text-slate-500">
                  <th className="py-2 text-left">Line item</th>{r.years.map((y) => <th key={y.year} className="py-2">{y.year}</th>)}
                </tr></thead>
                <tbody className="text-right [&_td:first-child]:text-left [&_td:not(:first-child)]:font-mono">
                  {SITE_TYPES.map((s) => (
                    <tr key={s.key} className="text-slate-600"><td className="py-1 pl-3">{s.label}<Tag k={s.key === "cabin" ? "cabinOccRamp" : `occupancy.${s.key}`} /></td>
                      {r.years.map((y) => <td key={y.year}>{usd(y.lodgingBySite[s.key])}</td>)}</tr>
                  ))}
                  <tr className="text-slate-600"><td className="py-1 pl-3">General store sales<Tag k="storeSalesPerNight" /></td>{r.years.map((y) => <td key={y.year}>{usd(y.store)}</td>)}</tr>
                  <tr className="text-slate-600"><td className="py-1 pl-3">Other income<Tag k="otherIncomePerNight" /></td>{r.years.map((y) => <td key={y.year}>{usd(y.other)}</td>)}</tr>
                  <tr className="border-t border-slate-200 font-semibold"><td className="py-1.5">Total revenue</td>{r.years.map((y) => <td key={y.year}>{usd(y.revenue)}</td>)}</tr>
                  <tr className="text-slate-600"><td className="py-1 pl-3">Less: store COGS</td>{r.years.map((y) => <td key={y.year}>{usd(-y.cogs)}</td>)}</tr>
                  {r.years[0].opexLines.map((l, li) => (
                    <tr key={l.name} className={l.placeholder ? `${flagRow} text-slate-600` : "text-slate-600"}>
                      <td className="py-1 pl-3">{l.name}<Tag k={l.placeholder ? (PH_ROW_KEYS[l.name] ?? "carriedForward") : undefined} />{l.placeholder && !PH_ROW_KEYS[l.name] && <span className="ml-1 text-[10px] text-slate-400">(blank years carried fwd)</span>}</td>
                      {r.years.map((y) => <td key={y.year}>{usd(-y.opexLines[li].amount)}</td>)}
                    </tr>
                  ))}
                  <tr className="border-t border-slate-200 font-semibold"><td className="py-1.5">Total operating expenses</td>{r.years.map((y) => <td key={y.year}>{usd(y.opex)}</td>)}</tr>
                  <tr className="border-t-2 border-slate-400 bg-slate-50 font-semibold"><td className="py-2">Net operating income</td>{r.years.map((y) => <td key={y.year} className={y.noi < 0 ? "text-red-700" : ""}>{usd(y.noi)}</td>)}</tr>
                  <tr className="text-slate-600"><td className="py-1 pl-3">Debt service (P&amp;I)</td>{r.years.map((y) => <td key={y.year}>{usd(-y.debtService)}</td>)}</tr>
                  <tr className="font-semibold"><td className="py-1.5">Cash flow after debt service</td>{r.years.map((y) => <td key={y.year} className={y.cashFlow < 0 ? "text-red-700" : ""}>{usd(y.cashFlow)}</td>)}</tr>
                  <tr className="font-semibold"><td className="py-1.5">DSCR</td>{r.years.map((y) => <td key={y.year} className={y.meetsMin ? "text-emerald-700" : "text-red-700"}>{x(y.dscr)} {y.meetsMin ? "✓" : "✗"}</td>)}</tr>
                  <tr className="text-slate-600"><td className="py-1">Modeled weighted occupancy</td>{r.years.map((y) => <td key={y.year}>{pct(y.weightedOcc)}</td>)}</tr>
                  <tr className="text-slate-600"><td className="py-1">Break-even occupancy (NOI = 0)</td>{r.years.map((y) => <td key={y.year}>{pct(y.breakEvenNoi)}</td>)}</tr>
                  <tr className="text-slate-600"><td className="py-1">Break-even occupancy (DSCR 1.00x)</td>{r.years.map((y) => <td key={y.year}>{pct(y.breakEvenDscr1)}</td>)}</tr>
                  <tr className="text-slate-600"><td className="py-1">Occupancy for lender min DSCR</td>{r.years.map((y) => <td key={y.year}>{pct(y.occForMinDscr)}</td>)}</tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate-500">Borrower opex lines for 2027–2030 come from his monthly expense tab (blank later-year lines carried forward from the prior year as placeholders); 2031 = 2030 × (1 + expense inflation). Debt service assumes full funding at closing with monthly payments from Jan 2027.</p>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card title="Sources & uses of funds">
              <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                <table className="w-full text-sm">
                  <tbody className="[&_td:last-child]:text-right [&_td:last-child]:font-mono">
                    {r.uses.map((u) => (
                      <tr key={u.name} className={u.placeholder ? flagRow : ""}>
                        <td className="py-0.5 pr-2 text-slate-700">{u.name}<Tag k={USE_KEYS[u.name]} /></td><td>{usd(u.amount)}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-slate-400 font-semibold"><td className="py-1.5">Total uses</td><td>{usd(r.totalUses)}</td></tr>
                    <tr><td className="pt-3 font-semibold text-slate-700" colSpan={2}>Sources</td></tr>
                    <tr className={flagRow}><td className="py-0.5">Owner equity ({pct(inp.equityPct, 0)})<Tag k="equityPct" /></td><td>{usd(r.equity)}</td></tr>
                    <tr><td className="py-0.5">Bank / SBA loan ({pct(r.loan / r.totalUses, 0)})</td><td>{usd(r.loan)}</td></tr>
                    <tr className="border-t-2 border-slate-400 font-semibold"><td className="py-1.5">Total sources</td><td>{usd(r.equity + r.loan)}</td></tr>
                  </tbody>
                </table>
                <div>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie isAnimationActive={false} data={[{ name: "Equity", value: r.equity }, { name: "Loan", value: r.loan }]} dataKey="value" innerRadius={45} outerRadius={75}>
                        <Cell fill={C.amber} /><Cell fill={C.navy} />
                      </Pie>
                      <Tooltip formatter={(v) => usd(Number(v))} />
                    </PieChart>
                  </ResponsiveContainer>
                  <dl className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between"><dt>Monthly P&amp;I</dt><dd className="font-mono">{usd(r.monthlyPayment)}</dd></div>
                    <div className="flex justify-between"><dt>Cost / stabilized RV site</dt><dd className="font-mono">{usd(r.costPerRvSite)}</dd></div>
                    <div className="flex justify-between"><dt>Loan bal. end 2031</dt><dd className="font-mono">{usd(r.years[4].endBalance)}</dd></div>
                  </dl>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={Math.max(160, usesChart.length * 22)}>
                <BarChart data={usesChart} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" tickFormatter={usdK} /><YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => usd(Number(v))} />
                  <Bar isAnimationActive={false} dataKey="amount">{usesChart.map((u, i) => <Cell key={u.name} fill={u.placeholder ? flagFill : pieColors[i % pieColors.length]} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="2027 monthly cash flow (first operating year)">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={r.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" /><YAxis tickFormatter={usdK} width={60} />
                  <Tooltip formatter={(v) => usd(Number(v))} /><Legend />
                  <ReferenceLine y={0} stroke="#94a3b8" />
                  <Bar isAnimationActive={false} dataKey="revenue" name="Revenue" fill={C.navy} />
                  <Bar isAnimationActive={false} dataKey="cashFlow" name="Cash flow after debt service">
                    {r.monthly.map((m) => <Cell key={m.month} fill={m.cashFlow < 0 ? C.red : C.teal} />)}
                  </Bar>
                  <Line isAnimationActive={false} dataKey="cumulative" name="Cumulative cash" stroke={C.amber} strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs">
                <div className="rounded-lg bg-slate-50 p-2"><div className="text-slate-500">Negative months</div><div className="text-lg font-semibold">{r.negativeMonths}</div></div>
                <div className="rounded-lg bg-slate-50 p-2"><div className="text-slate-500">Peak shortfall</div><div className="text-lg font-semibold text-red-700">{usd(r.peakShortfall)}</div></div>
                <div className="rounded-lg bg-slate-50 p-2"><div className="text-slate-500">Lowest month</div><div className="text-lg font-semibold">{r.lowestMonth}</div></div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Revenue spread by the monthly pattern of the borrower&apos;s 2027 Class A rate grid (Apr–Sep); expenses by month from his 2027 expense tab; annual costs not in his file spread evenly. Debt service here excludes the working-capital portion of the loan. The peak shortfall feeds the working-capital reserve in Sources &amp; Uses when set to auto.</p>
            </Card>
          </div>

          <Card title="Cabin build schedule & cash balance (cash-funded, not financed)">
            <div className={`mb-3 rounded-md px-3 py-2 text-sm ${r.cabinsBuiltTotal > 0 ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
              <strong>{r.cabinsBuiltTotal} of {inp.cabinsPlanned - Math.min(inp.cabinsFinanced, inp.cabinsPlanned)} cash-funded cabins built by 2031.</strong> {r.cabinNote}
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Cash balance (opening reserve + cash flow after debt service − cabin capex)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={r.cabins.map((c) => ({ year: String(c.year), "Ending cash": c.endingCash, "Cash flow after DS": c.cashFlow, "Cabin capex": -c.capex }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" /><YAxis tickFormatter={usdK} width={65} />
                    <Tooltip formatter={(v) => usd(Number(v))} /><Legend />
                    <ReferenceLine y={0} stroke="#94a3b8" />
                    <ReferenceLine ifOverflow="extendDomain" y={inp.cabinMinReserve} stroke={C.amber} strokeDasharray="6 3" label={{ value: "Min reserve", position: "insideTopLeft", fill: C.amber, fontSize: 11 }} />
                    <Bar isAnimationActive={false} dataKey="Cash flow after DS">{r.cabins.map((c) => <Cell key={c.year} fill={c.cashFlow < 0 ? C.red : C.teal} />)}</Bar>
                    <Bar isAnimationActive={false} dataKey="Cabin capex" fill={C.sky} />
                    <Line isAnimationActive={false} dataKey="Ending cash" stroke={C.navy} strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Cabins built & operating</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={r.cabins.map((c) => ({ year: String(c.year), "Built this year": c.built, "Operating (effective)": c.effectiveUnits, "Cumulative built": c.cumulativeBuilt }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" /><YAxis allowDecimals={false} width={40} domain={[0, (max: number) => Math.max(4, max)]} />
                    <Tooltip /><Legend />
                    <Bar isAnimationActive={false} dataKey="Built this year" fill={C.sky} />
                    <Bar isAnimationActive={false} dataKey="Operating (effective)" fill={C.teal} />
                    <Line isAnimationActive={false} dataKey="Cumulative built" stroke={C.navy} strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead><tr className="border-b border-slate-300 text-right text-xs uppercase text-slate-500"><th className="py-2 text-left">Cabin schedule</th>{r.cabins.map((c) => <th key={c.year}>{c.year}</th>)}</tr></thead>
                <tbody className="text-right [&_td:first-child]:text-left [&_td:not(:first-child)]:font-mono">
                  {([
                    ["Opening cash balance", (c) => usd(c.openingCash)],
                    ["Cash flow after debt service", (c) => usd(c.cashFlow)],
                    ["Cash available for cabins (opening − reserve)", (c) => usd(c.available)],
                    ["Cost per cabin this year", (c) => usd(c.costPerCabin)],
                    ["Cabins built this year", (c) => String(c.built)],
                    ["Cumulative cabins built", (c) => String(c.cumulativeBuilt)],
                    ["Cabin capex paid from cash", (c) => usd(-c.capex)],
                    ["Ending cash balance", (c) => usd(c.endingCash)],
                    ["Cabins operating (effective units)", (c) => c.effectiveUnits.toLocaleString("en-US", { maximumFractionDigits: 2 })],
                    ["Cabin occupancy this year", (c) => pct(c.occupancy)],
                  ] as [string, (c: (typeof r.cabins)[number]) => string][]).map(([label, f]) => (
                    <tr key={label} className={label === "Ending cash balance" ? "border-t border-slate-200 font-semibold" : "text-slate-600"}>
                      <td className="py-1">{label}</td>
                      {r.cabins.map((c) => <td key={c.year} className={label === "Ending cash balance" && c.endingCash < 0 ? "text-red-700" : ""}>{f(c)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-500">Opening 2027 cash = working-capital reserve funded at closing. Cabins built in a year open the following season (unless a build-year share is set) and add revenue, housekeeping, insurance (+ per cabin), utilities, reserves and property tax (from the following Jan 1).</p>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card title="Break-even occupancy vs. modeled">
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={chartYears}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" /><YAxis tickFormatter={(v) => pct(v, 0)} domain={[0, (max: number) => Math.max(1, max)]} width={50} />
                  <Tooltip formatter={(v) => pct(Number(v))} /><Legend />
                  <Bar isAnimationActive={false} dataKey="Modeled occ." fill={C.navy} />
                  <Line isAnimationActive={false} dataKey="Break-even occ." stroke={C.red} strokeWidth={3} />
                  <Line isAnimationActive={false} dataKey="Occ. for min DSCR" stroke={C.amber} strokeWidth={2} strokeDasharray="5 4" />
                </ComposedChart>
              </ResponsiveContainer>
              <p className="mt-2 text-xs text-slate-500">Uniform occupancy across all site types needed to cover operating expenses plus debt service (DSCR 1.00x) and the lender minimum.</p>
            </Card>

            <Card title="Sensitivity — 2030 DSCR">
              <p className="mb-2 text-xs text-slate-500">Occupancy change (rows) vs. nightly-rate change (columns), relative to the current case.</p>
              <table className="w-full text-center text-sm">
                <thead><tr className="text-xs text-slate-500"><th className="py-1 text-left">Occ ↓ / Rate →</th>{r.sens1.rateChanges.map((c) => <th key={c}>{c > 0 ? "+" : ""}{pct(c, 0)}</th>)}</tr></thead>
                <tbody>{r.sens1.grid.map((row, i) => (
                  <tr key={i}><td className="py-1 text-left text-xs text-slate-500">{r.sens1.occChanges[i] > 0 ? "+" : ""}{pct(r.sens1.occChanges[i], 0)}</td>
                    {row.map((v, j) => <td key={j} className={`border border-white font-mono ${heat(v, inp.minDscr)} ${r.sens1.occChanges[i] === 0 && r.sens1.rateChanges[j] === 0 ? "font-bold ring-2 ring-[#1e3a5f] ring-inset" : ""}`}>{x(v)}</td>)}</tr>
                ))}</tbody>
              </table>
              <p className="mb-2 mt-5 text-xs text-slate-500">Interest rate (rows) vs. project-cost overrun funded at the same loan-to-cost (columns).</p>
              <table className="w-full text-center text-sm">
                <thead><tr className="text-xs text-slate-500"><th className="py-1 text-left">Rate ↓ / Overrun →</th>{r.sens2.overruns.map((c) => <th key={c}>+{pct(c, 0)}</th>)}</tr></thead>
                <tbody>{r.sens2.grid.map((row, i) => (
                  <tr key={i}><td className="py-1 text-left text-xs text-slate-500">{pct(r.sens2.rates[i], 2)}</td>
                    {row.map((v, j) => <td key={j} className={`border border-white font-mono ${heat(v, inp.minDscr)} ${i === 2 && j === 0 ? "font-bold ring-2 ring-[#1e3a5f] ring-inset" : ""}`}>{x(v)}</td>)}</tr>
                ))}</tbody>
              </table>
              <div className="mt-3 flex gap-3 text-[11px] text-slate-500">
                <span><span className="mr-1 inline-block h-2.5 w-2.5 bg-emerald-100" />≥ lender min</span>
                <span><span className="mr-1 inline-block h-2.5 w-2.5 bg-amber-100" />1.00x – min</span>
                <span><span className="mr-1 inline-block h-2.5 w-2.5 bg-red-100" />&lt; 1.00x</span>
              </div>
            </Card>
          </div>

          <Card title="Estimate sources" className={estimated ? "ring-2 ring-sky-300" : ""}>
            <ul className="mb-3 space-y-1 text-xs text-slate-600">{ESTIMATE_NOTES.map((n) => <li key={n}>{n}</li>)}</ul>
            <details open={estimated}>
              <summary className="cursor-pointer text-sm font-semibold text-slate-800">{ESTIMATE_SOURCES.length} estimated inputs: basis &amp; confidence</summary>
              <div className="mt-2 max-h-[420px] overflow-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-white text-slate-500"><tr><th className="py-1 pr-2">#</th><th className="pr-2">Input</th><th className="pr-2">Basis / method</th><th className="pr-2">Source type</th><th>Confidence</th></tr></thead>
                  <tbody>{ESTIMATE_SOURCES.map((e, i) => (
                    <tr key={i} className="border-t border-slate-100 align-top"><td className="py-1 pr-2 text-slate-400">{i + 1}</td><td className="pr-2 font-medium text-slate-800">{e.input}</td><td className="pr-2 text-slate-600">{e.basis}</td><td className="pr-2 text-slate-500">{e.sourceType}</td><td className="whitespace-nowrap text-slate-700">{e.confidence}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            </details>
            <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Source URLs</h3>
            <ul className="mt-1 grid gap-1 text-xs md:grid-cols-2">
              {ESTIMATE_URLS.map((u) => <li key={u} className="truncate"><a href={u} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline hover:text-sky-900">{u}</a></li>)}
            </ul>
          </Card>

          <Card title="Open items before submission">
            <ul className="grid gap-x-6 gap-y-2 text-sm md:grid-cols-2">
              {REVIEW_NOTES.map((n) => (
                <li key={n.area} className="border-l-2 border-amber-400 pl-3"><span className="font-semibold text-slate-800">{n.area}.</span> <span className="text-slate-600">{n.issue}</span></li>
              ))}
            </ul>
          </Card>

          <footer className="pb-6 text-center text-xs text-slate-400">
            Projections are estimates based on borrower-provided figures and placeholder assumptions; not a guarantee of future results. Financing terms are illustrative, not a lender quote.
          </footer>
        </main>
      </div>
    </div>
    </ScenarioCtx.Provider>
  );
}
