"use client";
import { PathResult } from "@/lib/finplanner/types";
import { formatCurrency, formatPercent } from "@/lib/finplanner/format";
import { TIPS } from "@/lib/finplanner/glossary";
import { LabelWithTip } from "@/components/finplanner/Tooltip";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, AreaChart, Area,
} from "recharts";
import React, { useState } from "react";
import { TrendingUp, DollarSign, Clock, Award, BarChart3, PiggyBank, Info } from "lucide-react";

interface Props {
  results: PathResult[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
const GRADIENTS = [
  ["#3b82f6", "#1d4ed8"],
  ["#10b981", "#059669"],
  ["#f59e0b", "#d97706"],
  ["#ef4444", "#dc2626"],
  ["#8b5cf6", "#7c3aed"],
  ["#ec4899", "#db2777"],
];

type LoanMode = "standard" | "pslf";

function MetricCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="text-sm font-semibold text-slate-700">{label}</h4>
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-slate-200 p-3 shadow-lg">
      <p className="text-xs font-medium text-slate-500 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-600">{entry.name}:</span>
          <span className="font-semibold text-slate-800">{formatCurrency(entry.value, true)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({ results }: Props) {
  const [loanMode, setLoanMode] = useState<LoanMode>("standard");

  if (results.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-lg">Configure your paths and click Calculate to see results.</p>
      </div>
    );
  }

  // Prepare chart data
  const horizon = results[0]?.years.length ?? 30;
  const netWorthData = Array.from({ length: horizon }, (_, i) => {
    const point: Record<string, number | string> = {
      year: results[0].years[i].calendarYear,
      age: results[0].years[i].age,
    };
    results.forEach((r, idx) => {
      point[r.config.label] =
        loanMode === "standard" ? r.years[i].netWorthStd : r.years[i].netWorthPslf;
    });
    return point;
  });

  const incomeData = Array.from({ length: horizon }, (_, i) => {
    const point: Record<string, number | string> = {
      year: results[0].years[i].calendarYear,
    };
    results.forEach((r) => {
      point[r.config.label] = r.years[i].totalGrossIncome;
    });
    return point;
  });

  const disposableData = Array.from({ length: horizon }, (_, i) => {
    const point: Record<string, number | string> = {
      year: results[0].years[i].calendarYear,
    };
    results.forEach((r) => {
      point[r.config.label] =
        loanMode === "standard" ? r.years[i].disposableIncomeStd : r.years[i].disposableIncomePslf;
    });
    return point;
  });

  const investmentData = Array.from({ length: horizon }, (_, i) => {
    const point: Record<string, number | string> = {
      year: results[0].years[i].calendarYear,
    };
    results.forEach((r) => {
      point[r.config.label] = r.years[i].investmentPortfolioEOY;
    });
    return point;
  });

  // Rankings by NPV
  const ranked = [...results]
    .map((r, i) => ({
      ...r,
      color: COLORS[i],
      npv: loanMode === "standard" ? r.npvStd : r.npvPslf,
      netWorth30: loanMode === "standard" ? r.netWorth30Std : r.netWorth30Pslf,
    }))
    .sort((a, b) => b.npv - a.npv);

  return (
    <div className="space-y-6">
      {/* Quick summary for non-finance people */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-emerald-900 mb-1">📊 How to read this dashboard</h3>
        <p className="text-xs text-emerald-700 leading-relaxed">
          Each path is ranked by its <strong>30-Year NPV</strong> (a fair way to compare paths that pay differently over time — higher is better).
          The <strong>Net Worth</strong> is what you&apos;d be worth at each point.
          Toggle between <strong>Standard Repayment</strong> (pay loans over 20 years) and <strong>PSLF</strong> (work at a nonprofit hospital, get remaining loans forgiven after 10 years) to see how each strategy changes the picture.
          Hover over any ⓘ icon for a plain-English explanation.
        </p>
      </div>

      {/* Loan mode toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-slate-800">Comparison Dashboard</h2>
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setLoanMode("standard")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              loanMode === "standard"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Standard Repayment
          </button>
          <button
            onClick={() => setLoanMode("pslf")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              loanMode === "pslf"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            PSLF / IBR
          </button>
        </div>
      </div>

      {/* Ranking cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ranked.map((r, i) => (
          <div
            key={r.config.id}
            className="bg-white rounded-xl border-2 p-4 space-y-2 shadow-sm"
            style={{ borderColor: r.color }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: r.color }}
                >
                  #{i + 1}
                </span>
                <span className="font-semibold text-slate-800 text-sm">{r.config.label}</span>
              </div>
              {i === 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Award size={12} /> BEST
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-slate-500"><LabelWithTip label="30yr NPV" tip={TIPS.npv} /></div>
                <div className="font-bold text-slate-800">{formatCurrency(r.npv, true)}</div>
              </div>
              <div>
                <div className="text-slate-500"><LabelWithTip label="30yr Net Worth" tip={TIPS.netWorth} /></div>
                <div className="font-bold text-slate-800">{formatCurrency(r.netWorth30, true)}</div>
              </div>
              <div>
                <div className="text-slate-500"><LabelWithTip label="Break-Even Age" tip={TIPS.breakEvenAge} /></div>
                <div className="font-bold text-slate-800">{r.breakEvenAgeStd ?? "N/A"}</div>
              </div>
              <div>
                <div className="text-slate-500"><LabelWithTip label="Portfolio (30yr)" tip={TIPS.investmentPortfolio} /></div>
                <div className="font-bold text-slate-800">{formatCurrency(r.investmentPortfolioFinal, true)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricCard
          icon={<TrendingUp size={18} className="text-blue-600" />}
          label="Net Worth Over Time"
        >
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={netWorthData}>
              <defs>
                {results.map((r, i) => (
                  <linearGradient key={r.config.id} id={`grad-nw-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="age" tick={{ fontSize: 11 }} label={{ value: "Age", position: "insideBottom", offset: -5, fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatCurrency(v, true)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {results.map((r, i) => (
                <Area
                  key={r.config.id}
                  type="monotone"
                  dataKey={r.config.label}
                  stroke={COLORS[i]}
                  strokeWidth={2}
                  fill={`url(#grad-nw-${i})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </MetricCard>

        <MetricCard
          icon={<DollarSign size={18} className="text-green-600" />}
          label="Annual Gross Income"
        >
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={incomeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatCurrency(v, true)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {results.map((r, i) => (
                <Line
                  key={r.config.id}
                  type="monotone"
                  dataKey={r.config.label}
                  stroke={COLORS[i]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </MetricCard>

        <MetricCard
          icon={<BarChart3 size={18} className="text-amber-600" />}
          label="Annual Disposable Income"
        >
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={disposableData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatCurrency(v, true)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {results.map((r, i) => (
                <Line
                  key={r.config.id}
                  type="monotone"
                  dataKey={r.config.label}
                  stroke={COLORS[i]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </MetricCard>

        <MetricCard
          icon={<PiggyBank size={18} className="text-purple-600" />}
          label="Investment Portfolio Growth"
        >
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={investmentData}>
              <defs>
                {results.map((r, i) => (
                  <linearGradient key={r.config.id} id={`grad-inv-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatCurrency(v, true)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {results.map((r, i) => (
                <Area
                  key={r.config.id}
                  type="monotone"
                  dataKey={r.config.label}
                  stroke={COLORS[i]}
                  strokeWidth={2}
                  fill={`url(#grad-inv-${i})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </MetricCard>
      </div>

      {/* Detailed comparison table */}
      <MetricCard
        icon={<Clock size={18} className="text-indigo-600" />}
        label="Detailed Comparison"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Metric</th>
                {results.map((r, i) => (
                  <th key={r.config.id} className="text-right py-2 px-3 font-medium" style={{ color: COLORS[i] }}>
                    {r.config.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                {
                  label: "30-Year NPV",
                  tip: TIPS.npv,
                  values: results.map((r) => formatCurrency(loanMode === "standard" ? r.npvStd : r.npvPslf, true)),
                },
                {
                  label: "Net Worth (Year 10)",
                  tip: "Your net worth 10 years from now — savings + investments minus debt. Shows how quickly each path starts building wealth.",
                  values: results.map((r) =>
                    formatCurrency(loanMode === "standard" ? r.netWorth10Std : r.netWorth10Pslf, true)
                  ),
                },
                {
                  label: "Net Worth (Year 20)",
                  tip: "Your net worth 20 years from now. By this point, most paths have paid off loans and are building significant wealth through compounding.",
                  values: results.map((r) =>
                    formatCurrency(loanMode === "standard" ? r.netWorth20Std : r.netWorth20Pslf, true)
                  ),
                },
                {
                  label: "Net Worth (Year 30)",
                  tip: TIPS.netWorth,
                  values: results.map((r) =>
                    formatCurrency(loanMode === "standard" ? r.netWorth30Std : r.netWorth30Pslf, true)
                  ),
                },
                {
                  label: "Total Gross Earnings",
                  tip: TIPS.grossIncome,
                  values: results.map((r) => formatCurrency(r.totalGrossEarnings, true)),
                },
                {
                  label: "Total Taxes Paid",
                  tip: "The total amount paid in federal, state/local, and FICA taxes over 30 years. Higher earners pay more in absolute terms but the effective rate matters more.",
                  values: results.map((r) => formatCurrency(r.totalTaxesPaid, true)),
                },
                {
                  label: "Total Loan Payments",
                  tip: loanMode === "standard" ? TIPS.standardRepayment : "Total payments made under the Income-Based Repayment plan before PSLF forgiveness kicks in.",
                  values: results.map((r) =>
                    formatCurrency(
                      loanMode === "standard" ? r.totalLoanPaymentsStd : r.totalLoanPaymentsPslf,
                      true
                    )
                  ),
                },
                ...(loanMode === "pslf"
                  ? [
                      {
                        label: "PSLF Forgiveness",
                        tip: TIPS.pslf,
                        values: results.map((r) => formatCurrency(r.pslfForgivenessAmount, true)),
                      },
                    ]
                  : []),
                {
                  label: "Investment Portfolio (30yr)",
                  tip: TIPS.investmentPortfolio,
                  values: results.map((r) => formatCurrency(r.investmentPortfolioFinal, true)),
                },
                {
                  label: "Break-Even Age",
                  tip: TIPS.breakEvenAge,
                  values: results.map((r) => (r.breakEvenAgeStd ? `${r.breakEvenAgeStd}` : "N/A")),
                },
              ].map((row) => (
                <tr key={row.label} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-slate-600">
                    <LabelWithTip label={row.label} tip={row.tip} />
                  </td>
                  {row.values.map((v, i) => (
                    <td key={i} className="py-2 px-3 text-right font-medium text-slate-800">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MetricCard>
    </div>
  );
}
