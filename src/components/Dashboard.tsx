"use client";

import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, Pie, PieChart, ReferenceLine,
  ResponsiveContainer, Cell, Tooltip, XAxis, YAxis,
} from "recharts";
import { DEFAULT_INPUTS, Inputs, PLACEHOLDER_KEYS, REVIEW_NOTES, SITE_TYPES, SiteType } from "@/lib/data";
import { runModel } from "@/lib/model";

const usd = (v: number) => (v < 0 ? "-" : "") + "$" + Math.round(Math.abs(v)).toLocaleString("en-US");
const usdK = (v: number) => (v < 0 ? "-" : "") + "$" + Math.round(Math.abs(v) / 1000).toLocaleString("en-US") + "k";
const pct = (v: number, d = 1) => (v * 100).toFixed(d) + "%";
const x = (v: number) => v.toFixed(2) + "x";

const C = { navy: "#1e3a5f", teal: "#0f766e", amber: "#d97706", red: "#b91c1c", slate: "#64748b", sky: "#0284c7", green: "#15803d" };

function Badge() {
  return <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">Placeholder</span>;
}

function Card({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {title && <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-600">{title}</h2>}
      {children}
    </section>
  );
}

type Fmt = "pct" | "usd" | "num" | "x";
function fmt(v: number, f: Fmt) {
  return f === "pct" ? pct(v) : f === "usd" ? usd(v) : f === "x" ? x(v) : v.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function Slider({ label, value, onChange, min, max, step, format, placeholder }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; format: Fmt; placeholder?: boolean;
}) {
  return (
    <label className={`block rounded-md px-2 py-1.5 ${placeholder ? "bg-amber-50" : ""}`}>
      <div className="flex items-center justify-between text-xs text-slate-700">
        <span>{label}{placeholder && <Badge />}</span>
        <span className="font-mono font-semibold text-slate-900">{fmt(value, format)}</span>
      </div>
      <input type="range" className="mt-1 w-full accent-[#1e3a5f]" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} aria-label={label} />
    </label>
  );
}

function NumField({ label, value, onChange, placeholder, step = 1000 }: {
  label: string; value: number; onChange: (v: number) => void; placeholder?: boolean; step?: number;
}) {
  return (
    <label className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs text-slate-700 ${placeholder ? "bg-amber-50" : ""}`}>
      <span>{label}{placeholder && <Badge />}</span>
      <input type="number" min={0} step={step} value={value} onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="w-28 rounded border border-slate-300 bg-white px-2 py-1 text-right font-mono text-slate-900" aria-label={label} />
    </label>
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

export default function Dashboard() {
  const [inp, setInp] = useState<Inputs>(DEFAULT_INPUTS);
  const r = useMemo(() => runModel(inp), [inp]);
  const set = <K extends keyof Inputs>(k: K) => (v: Inputs[K]) => setInp((p) => ({ ...p, [k]: v }));
  const setOcc = (k: SiteType) => (v: number) => setInp((p) => ({ ...p, occupancy: { ...p.occupancy, [k]: v } }));
  const setRate = (k: SiteType) => (v: number) => setInp((p) => ({ ...p, rates: { ...p.rates, [k]: v } }));
  const ph = (k: string) => PLACEHOLDER_KEYS.has(k);

  const stab = r.years[3];
  const minDscrYear = r.years.slice(1).reduce((a, b) => (b.dscr < a.dscr ? b : a));
  const chartYears = r.years.map((y) => ({
    year: String(y.year), Revenue: y.revenue, Opex: y.opex, NOI: y.noi, "Debt service": y.debtService, DSCR: y.dscr,
    "Break-even occ.": y.breakEvenDscr1, "Modeled occ.": y.weightedOcc, "Occ. for min DSCR": y.occForMinDscr,
  }));
  const usesChart = r.uses.filter((u) => u.amount > 0);
  const pieColors = [C.navy, C.teal, C.sky, C.amber, C.green, C.slate, "#7c3aed", "#be185d", "#0891b2", "#a16207", "#4d7c0f", "#9f1239"];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-[#1e3a5f] text-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-end justify-between gap-4 px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-200">Lender pro forma · New build</p>
            <h1 className="mt-1 text-2xl font-semibold">RV Park — 5-Year Pro Forma Dashboard</h1>
            <p className="mt-1 max-w-3xl text-sm text-sky-100">Operating years 2027–2031. Adjust the assumptions on the left; every figure recalculates live. Defaults reproduce the lender workbook.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setInp(DEFAULT_INPUTS)} className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20">Reset to workbook</button>
            <button onClick={() => window.print()} className="rounded-md bg-white px-3 py-2 text-sm font-medium text-[#1e3a5f] hover:bg-sky-50">Print / PDF</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 pt-4">
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>{r.placeholderCount} placeholder inputs are still at $0 / 0%.</strong> Items marked <Badge /> are not supported by the borrower&apos;s file
          (missing costs, illustrative financing terms, assumed occupancy). Outputs are only as reliable as these inputs — replace them with quotes, comps and the lender&apos;s term sheet.
        </div>
      </div>

      <div className="mx-auto grid max-w-[1500px] gap-6 px-6 py-6 lg:grid-cols-[340px_1fr]">
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto print:hidden">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Assumptions</h2>
          <Group title="Occupancy (all years)" open>
            {SITE_TYPES.map((s) => (
              <Slider key={s.key} label={s.label} value={inp.occupancy[s.key]} onChange={setOcc(s.key)} min={0} max={1} step={0.005} format="pct" placeholder={ph(`occupancy.${s.key}`)} />
            ))}
            <Slider label="Season length (nights open)" value={inp.seasonNights} onChange={set("seasonNights")} min={60} max={365} step={1} format="num" />
          </Group>
          <Group title="Nightly rates (2027 base)" open>
            {SITE_TYPES.map((s) => (
              <Slider key={s.key} label={s.label} value={inp.rates[s.key]} onChange={setRate(s.key)} min={0} max={250} step={0.5} format="usd" placeholder={ph(`rates.${s.key}`)} />
            ))}
            <Slider label="Annual rate increase" value={inp.annualRateIncrease} onChange={set("annualRateIncrease")} min={0} max={0.1} step={0.005} format="pct" placeholder />
          </Group>
          <Group title="Financing" open>
            <Slider label="Interest rate (illustrative)" value={inp.interestRate} onChange={set("interestRate")} min={0.03} max={0.14} step={0.0025} format="pct" placeholder />
            <Slider label="Amortization (years)" value={inp.amortYears} onChange={set("amortYears")} min={5} max={30} step={1} format="num" placeholder />
            <Slider label="Interest-only years" value={inp.interestOnlyYears} onChange={set("interestOnlyYears")} min={0} max={3} step={1} format="num" />
            <Slider label="Equity injection %" value={inp.equityPct} onChange={set("equityPct")} min={0} max={0.5} step={0.01} format="pct" placeholder />
            <Slider label="Lender minimum DSCR" value={inp.minDscr} onChange={set("minDscr")} min={1} max={2} step={0.05} format="x" placeholder />
          </Group>
          <Group title="Project cost">
            <Slider label="Project cost multiplier (hard costs)" value={inp.projectCostMultiplier} onChange={set("projectCostMultiplier")} min={0.8} max={3} step={0.05} format="x" />
            <NumField label="Cabin cost per unit" value={inp.cabinCostPerUnit} onChange={set("cabinCostPerUnit")} placeholder />
            <NumField label="RV pads / roads / pedestals / laterals" value={inp.rvSiteInfrastructure} onChange={set("rvSiteInfrastructure")} placeholder step={10000} />
            <NumField label="Permits & soft costs" value={inp.softCosts} onChange={set("softCosts")} placeholder />
            <NumField label="FF&E" value={inp.ffe} onChange={set("ffe")} placeholder />
            <Slider label="Hard-cost contingency" value={inp.contingencyPct} onChange={set("contingencyPct")} min={0} max={0.25} step={0.01} format="pct" placeholder />
            <NumField label="Interest reserve" value={inp.interestReserve} onChange={set("interestReserve")} placeholder />
            <NumField label="Closing costs / guarantee fee" value={inp.closingCosts} onChange={set("closingCosts")} placeholder />
            <label className="flex items-center justify-between gap-2 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-slate-700">
              <span>Working capital reserve<Badge /></span>
              <span className="flex items-center gap-1">
                <input type="checkbox" checked={inp.workingCapitalOverride === null}
                  onChange={(e) => set("workingCapitalOverride")(e.target.checked ? null : Math.round(r.workingCapital))} />auto
              </span>
            </label>
            {inp.workingCapitalOverride !== null && (
              <NumField label="Working capital (manual)" value={inp.workingCapitalOverride} onChange={(v) => set("workingCapitalOverride")(v)} placeholder />
            )}
          </Group>
          <Group title="Operating expenses">
            <Slider label="Borrower opex lines multiplier" value={inp.borrowerOpexMultiplier} onChange={set("borrowerOpexMultiplier")} min={0.5} max={2} step={0.05} format="x" />
            <NumField label="Insurance ($/yr)" value={inp.insurance} onChange={set("insurance")} placeholder />
            <NumField label="Property tax ($/yr)" value={inp.propertyTax} onChange={set("propertyTax")} placeholder />
            <NumField label="Repairs & maintenance ($/yr)" value={inp.repairsMaintenance} onChange={set("repairsMaintenance")} placeholder />
            <NumField label="Water/trash/propane ($/yr)" value={inp.utilitiesOther} onChange={set("utilitiesOther")} placeholder />
            <NumField label="Housekeeping & supplies ($/yr)" value={inp.housekeeping} onChange={set("housekeeping")} placeholder />
            <Slider label="Card & booking fees (% rev.)" value={inp.cardFeesPct} onChange={set("cardFeesPct")} min={0} max={0.08} step={0.0025} format="pct" placeholder />
            <Slider label="Management fee (% rev.)" value={inp.mgmtFeePct} onChange={set("mgmtFeePct")} min={0} max={0.1} step={0.005} format="pct" placeholder />
            <NumField label="Replacement reserve ($/site/yr)" value={inp.replacementReservePerSite} onChange={set("replacementReservePerSite")} placeholder step={25} />
            <Slider label="Expense inflation 2031" value={inp.expenseInflation2031} onChange={set("expenseInflation2031")} min={0} max={0.08} step={0.005} format="pct" placeholder />
          </Group>
          <Group title="Store & other income">
            <NumField label="General store sales ($/yr)" value={inp.storeSales} onChange={set("storeSales")} placeholder />
            <Slider label="Store COGS %" value={inp.storeCogsPct} onChange={set("storeCogsPct")} min={0} max={0.9} step={0.01} format="pct" placeholder />
            <NumField label="Other income ($/yr)" value={inp.otherIncome} onChange={set("otherIncome")} placeholder />
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
                  <ReferenceLine y={inp.minDscr} stroke={C.amber} strokeDasharray="6 3" label={{ value: `Lender min ${x(inp.minDscr)}`, position: "insideTopRight", fill: C.amber, fontSize: 11 }} />
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
                    <tr key={s.key} className="text-slate-600"><td className="py-1 pl-3">{s.label}{ph(`rates.${s.key}`) && inp.rates[s.key] === 0 && <Badge />}</td>
                      {r.years.map((y) => <td key={y.year}>{usd(y.lodgingBySite[s.key])}</td>)}</tr>
                  ))}
                  <tr className="text-slate-600"><td className="py-1 pl-3">General store sales{inp.storeSales === 0 && <Badge />}</td>{r.years.map((y) => <td key={y.year}>{usd(y.store)}</td>)}</tr>
                  <tr className="text-slate-600"><td className="py-1 pl-3">Other income{inp.otherIncome === 0 && <Badge />}</td>{r.years.map((y) => <td key={y.year}>{usd(y.other)}</td>)}</tr>
                  <tr className="border-t border-slate-200 font-semibold"><td className="py-1.5">Total revenue</td>{r.years.map((y) => <td key={y.year}>{usd(y.revenue)}</td>)}</tr>
                  <tr className="text-slate-600"><td className="py-1 pl-3">Less: store COGS</td>{r.years.map((y) => <td key={y.year}>{usd(-y.cogs)}</td>)}</tr>
                  {r.years[0].opexLines.map((l, li) => (
                    <tr key={l.name} className={l.placeholder ? "bg-amber-50/60 text-slate-600" : "text-slate-600"}>
                      <td className="py-1 pl-3">{l.name}{l.placeholder && <Badge />}</td>
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
                      <tr key={u.name} className={u.placeholder ? "bg-amber-50/60" : ""}>
                        <td className="py-0.5 pr-2 text-slate-700">{u.name}{u.placeholder && <Badge />}</td><td>{usd(u.amount)}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-slate-400 font-semibold"><td className="py-1.5">Total uses</td><td>{usd(r.totalUses)}</td></tr>
                    <tr><td className="pt-3 font-semibold text-slate-700" colSpan={2}>Sources</td></tr>
                    <tr className="bg-amber-50/60"><td className="py-0.5">Owner equity ({pct(inp.equityPct, 0)})<Badge /></td><td>{usd(r.equity)}</td></tr>
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
                  <Bar isAnimationActive={false} dataKey="amount">{usesChart.map((u, i) => <Cell key={u.name} fill={u.placeholder ? C.amber : pieColors[i % pieColors.length]} />)}</Bar>
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
              <p className="mt-3 text-xs text-slate-500">Revenue spread by the monthly pattern of the borrower&apos;s 2027 Class A rate grid (Apr–Sep); expenses by month from his 2027 expense tab; placeholder fixed costs spread evenly. Debt service here excludes the working-capital portion of the loan. The peak shortfall feeds the working-capital reserve in Sources &amp; Uses when set to auto.</p>
            </Card>
          </div>

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
  );
}
