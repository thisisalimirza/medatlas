"use client";
import { PathResult } from "@/lib/finplanner/types";
import { formatCurrency } from "@/lib/finplanner/format";
import { TIPS } from "@/lib/finplanner/glossary";
import { LabelWithTip } from "@/components/finplanner/Tooltip";
import React, { useState } from "react";
import { Info } from "lucide-react";

interface Props {
  result: PathResult;
}

export default function YearlyTable({ result }: Props) {
  const [mode, setMode] = useState<"standard" | "pslf">("standard");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-bold text-slate-800">{result.config.label}</h3>
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setMode("standard")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              mode === "standard" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setMode("pslf")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              mode === "pslf" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"
            }`}
          >
            PSLF
          </button>
        </div>
      </div>

      {/* Phase legend */}
      <div className="flex flex-wrap gap-2 text-[10px]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-slate-300" /> Med School — no income, building debt</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-400" /> Residency — ~$63K salary</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-400" /> Fellowship — ~$75K salary</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-400" /> Attending — full salary</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="sticky left-0 bg-slate-50 px-2 py-2 text-left text-slate-600 font-semibold z-10">Year</th>
              <th className="px-2 py-2 text-left text-slate-600 font-semibold">Age</th>
              <th className="px-2 py-2 text-left text-slate-600 font-semibold">Phase</th>
              <th className="px-2 py-2 text-right text-slate-600 font-semibold">
                <LabelWithTip label="Gross Income" tip={TIPS.grossIncome} />
              </th>
              <th className="px-2 py-2 text-right text-slate-600 font-semibold">
                <LabelWithTip label="Taxes" tip={TIPS.effectiveTaxRate} />
              </th>
              <th className="px-2 py-2 text-right text-slate-600 font-semibold">
                <LabelWithTip label="Expenses" tip="Living costs + malpractice + health/disability insurance. Grows with inflation each year." />
              </th>
              <th className="px-2 py-2 text-right text-slate-600 font-semibold">
                <LabelWithTip label="Loan Pmt" tip={mode === "standard" ? TIPS.standardRepayment : TIPS.ibr} />
              </th>
              <th className="px-2 py-2 text-right text-slate-600 font-semibold">
                <LabelWithTip label="Loan Bal" tip={TIPS.loanBalance} />
              </th>
              <th className="px-2 py-2 text-right text-slate-600 font-semibold">
                <LabelWithTip label="Retire $" tip={TIPS.retirementPercent} />
              </th>
              <th className="px-2 py-2 text-right text-slate-600 font-semibold">
                <LabelWithTip label="Portfolio" tip={TIPS.investmentPortfolio} />
              </th>
              <th className="px-2 py-2 text-right text-slate-600 font-semibold">
                <LabelWithTip label="Disposable" tip={TIPS.disposableIncome} />
              </th>
              <th className="px-2 py-2 text-right text-slate-600 font-semibold">
                <LabelWithTip label="Net Worth" tip={TIPS.netWorth} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {result.years.map((y) => {
              const nw = mode === "standard" ? y.netWorthStd : y.netWorthPslf;
              return (
                <tr key={y.yearOfAnalysis} className="hover:bg-blue-50/30">
                  <td className="sticky left-0 bg-white px-2 py-1.5 font-medium text-slate-700 z-10">
                    {y.calendarYear}
                  </td>
                  <td className="px-2 py-1.5 text-slate-600">{y.age}</td>
                  <td className="px-2 py-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        y.phase === "Med School"
                          ? "bg-slate-100 text-slate-600"
                          : y.phase === "Residency"
                          ? "bg-blue-100 text-blue-700"
                          : y.phase === "Fellowship"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {y.phase}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-right text-slate-700">{formatCurrency(y.totalGrossIncome)}</td>
                  <td className="px-2 py-1.5 text-right text-red-600">{formatCurrency(y.totalTaxes)}</td>
                  <td className="px-2 py-1.5 text-right text-slate-600">{formatCurrency(y.totalExpenses)}</td>
                  <td className="px-2 py-1.5 text-right text-slate-600">
                    {formatCurrency(mode === "standard" ? y.loanPaymentStd : y.ibrPayment)}
                  </td>
                  <td className="px-2 py-1.5 text-right text-orange-600">
                    {formatCurrency(mode === "standard" ? y.loanBalanceEOYStd : y.loanBalanceEOYPslf)}
                  </td>
                  <td className="px-2 py-1.5 text-right text-slate-600">{formatCurrency(y.retirementContribution)}</td>
                  <td className="px-2 py-1.5 text-right text-blue-600">{formatCurrency(y.investmentPortfolioEOY)}</td>
                  <td className={`px-2 py-1.5 text-right font-medium ${
                    (mode === "standard" ? y.disposableIncomeStd : y.disposableIncomePslf) >= 0
                      ? "text-green-600" : "text-red-600"
                  }`}>
                    {formatCurrency(mode === "standard" ? y.disposableIncomeStd : y.disposableIncomePslf)}
                  </td>
                  <td className={`px-2 py-1.5 text-right font-bold ${nw >= 0 ? "text-green-700" : "text-red-600"}`}>
                    {formatCurrency(nw, true)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
