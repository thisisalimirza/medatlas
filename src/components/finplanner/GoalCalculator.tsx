"use client";
import React, { useState, useMemo } from "react";
import { Assumptions, PathConfig, PathResult } from "@/lib/finplanner/types";
import { runProjection } from "@/lib/finplanner/calculations";
import { formatCurrency } from "@/lib/finplanner/format";
import { SPECIALTIES } from "@/lib/finplanner/specialties";
import { LabelWithTip } from "@/components/finplanner/Tooltip";
import { Target, TrendingUp, DollarSign, ArrowRight, Sparkles, Info, Calculator } from "lucide-react";

interface Props {
  paths: PathConfig[];
  assumptions: Assumptions;
  results: PathResult[];
}

interface GoalResult {
  pathLabel: string;
  color: string;
  currentNetWorth30Std: number;
  currentNetWorth30Pslf: number;
  gap: number;
  extraAnnualIncomeNeeded: number;
  extraMonthlyIncomeNeeded: number;
  alreadyMeetsGoal: boolean;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const PRESET_GOALS = [
  { label: "$1M by 45", netWorth: 1_000_000, age: 45 },
  { label: "$2M by 50", netWorth: 2_000_000, age: 50 },
  { label: "$3M by 55", netWorth: 3_000_000, age: 55 },
  { label: "$5M by 60", netWorth: 5_000_000, age: 60 },
];

export default function GoalCalculator({ paths, assumptions, results }: Props) {
  const [targetNetWorth, setTargetNetWorth] = useState(2_000_000);
  const [targetAge, setTargetAge] = useState(50);
  const [loanMode, setLoanMode] = useState<"standard" | "pslf">("standard");

  const goalResults = useMemo((): GoalResult[] => {
    if (results.length === 0) return [];

    return results.map((r, idx) => {
      const targetYearIndex = targetAge - assumptions.personal.currentAge - 1;
      const clampedIndex = Math.max(0, Math.min(targetYearIndex, r.years.length - 1));

      const currentNW =
        loanMode === "standard"
          ? r.years[clampedIndex]?.netWorthStd ?? 0
          : r.years[clampedIndex]?.netWorthPslf ?? 0;

      const gap = targetNetWorth - currentNW;
      const alreadyMeetsGoal = gap <= 0;

      // Binary search: how much extra annual business income is needed to close the gap?
      let extraAnnual = 0;
      if (!alreadyMeetsGoal) {
        let lo = 0;
        let hi = 2_000_000; // max $2M/yr extra
        for (let iter = 0; iter < 30; iter++) {
          const mid = (lo + hi) / 2;
          // Create a modified assumptions with extra side business revenue
          const modifiedAssumptions: Assumptions = {
            ...assumptions,
            business: {
              ...assumptions.business,
              sideBusinessRevYear1: assumptions.business.sideBusinessRevYear1 + mid,
              sideBusinessGrowthRate: 0.03, // conservative: just inflation growth for the extra
            },
          };
          const modifiedPath: PathConfig = {
            ...r.config,
            includeBusiness: true,
          };
          const projection = runProjection(modifiedPath, modifiedAssumptions);
          const projectedNW =
            loanMode === "standard"
              ? projection.years[clampedIndex]?.netWorthStd ?? 0
              : projection.years[clampedIndex]?.netWorthPslf ?? 0;

          if (projectedNW >= targetNetWorth) {
            hi = mid;
          } else {
            lo = mid;
          }
        }
        extraAnnual = Math.ceil(hi / 100) * 100; // round up to nearest $100
      }

      return {
        pathLabel: r.config.label,
        color: COLORS[idx % COLORS.length],
        currentNetWorth30Std: r.years[clampedIndex]?.netWorthStd ?? 0,
        currentNetWorth30Pslf: r.years[clampedIndex]?.netWorthPslf ?? 0,
        gap: Math.max(0, gap),
        extraAnnualIncomeNeeded: extraAnnual,
        extraMonthlyIncomeNeeded: Math.ceil(extraAnnual / 12 / 10) * 10, // round to $10
        alreadyMeetsGoal,
      };
    });
  }, [results, targetNetWorth, targetAge, loanMode, assumptions]);

  if (results.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        <Target size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-lg">Calculate your paths first, then set your financial goals here.</p>
        <p className="text-sm mt-2">Go to Career Paths → Click Calculate → Come back here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-violet-900 mb-1 flex items-center gap-2">
          <Target size={16} />
          🎯 What&apos;s your financial goal?
        </h3>
        <p className="text-xs text-violet-700 leading-relaxed">
          Set a target net worth and age, and we&apos;ll calculate exactly how much <strong>extra side income</strong> you&apos;d
          need to earn each year to hit that goal — on top of your medical salary. This accounts for taxes,
          expenses, loan payments, and investment growth. Use the presets or enter your own numbers.
        </p>
      </div>

      {/* Goal Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Calculator size={16} className="text-violet-600" />
          Configure Your Goal
        </h4>

        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2">
          {PRESET_GOALS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setTargetNetWorth(preset.netWorth);
                setTargetAge(preset.age);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                targetNetWorth === preset.netWorth && targetAge === preset.age
                  ? "bg-violet-100 border-violet-300 text-violet-700"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">
              <LabelWithTip
                label="Target Net Worth"
                tip="The total amount you want to be worth at your target age. Net worth = savings + investments - debts. $2M is enough to consider early retirement in many areas."
              />
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                type="number"
                value={targetNetWorth}
                onChange={(e) => setTargetNetWorth(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white pl-7 pr-3 py-2.5 text-sm text-slate-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none"
                step={100000}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">
              <LabelWithTip
                label="Target Age"
                tip="The age by which you want to reach your net worth goal. Earlier targets require more aggressive saving or higher side income."
              />
            </label>
            <input
              type="number"
              value={targetAge}
              onChange={(e) => setTargetAge(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none"
              min={assumptions.personal.currentAge + 5}
              max={assumptions.personal.currentAge + assumptions.personal.analysisHorizon}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Loan Strategy</label>
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setLoanMode("standard")}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  loanMode === "standard" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setLoanMode("pslf")}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  loanMode === "pslf" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"
                }`}
              >
                PSLF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {goalResults.map((gr, i) => (
          <div
            key={gr.pathLabel}
            className="bg-white rounded-xl border-2 p-5 space-y-4 shadow-sm"
            style={{ borderColor: gr.color }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: gr.color }}
              >
                {i + 1}
              </span>
              <span className="font-semibold text-slate-800 text-sm">{gr.pathLabel}</span>
            </div>

            {/* Current projection */}
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <div className="text-xs text-slate-500">Projected net worth at age {targetAge}</div>
              <div className="text-xl font-bold text-slate-800">
                {formatCurrency(
                  loanMode === "standard" ? gr.currentNetWorth30Std : gr.currentNetWorth30Pslf,
                  true
                )}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <ArrowRight size={12} className="text-slate-400" />
                <span className="text-slate-500">Goal: {formatCurrency(targetNetWorth, true)}</span>
              </div>
            </div>

            {gr.alreadyMeetsGoal ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-green-600" />
                  <span className="text-sm font-semibold text-green-800">Goal already met! ✅</span>
                </div>
                <p className="text-xs text-green-700">
                  This path already reaches your {formatCurrency(targetNetWorth, true)} goal by age {targetAge} without any extra side income.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="text-xs text-amber-700 mb-1">Gap to goal</div>
                  <div className="text-lg font-bold text-amber-800">
                    {formatCurrency(gr.gap, true)}
                  </div>
                </div>

                <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-violet-600" />
                    <span className="text-xs font-semibold text-violet-800">Extra side income needed</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[10px] text-violet-600 uppercase tracking-wide">Per Year</div>
                      <div className="text-lg font-bold text-violet-900">
                        {formatCurrency(gr.extraAnnualIncomeNeeded, true)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-violet-600 uppercase tracking-wide">Per Month</div>
                      <div className="text-lg font-bold text-violet-900">
                        {formatCurrency(gr.extraMonthlyIncomeNeeded, true)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-[11px] text-slate-500 leading-relaxed">
                  <Info size={12} className="shrink-0 mt-0.5" />
                  <span>
                    This is the <strong>additional gross revenue</strong> your side business would need to generate
                    (before taxes and expenses). The model accounts for taxes, the {Math.round(assumptions.business.opexPercentOfRevenue * 100)}% operating
                    cost, and investment growth on the extra income.
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ideas section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Side income ideas for physicians</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            { name: "Medical content creation", range: "$5K–$50K/yr", desc: "YouTube, courses, social media" },
            { name: "Expert witness / consulting", range: "$10K–$100K/yr", desc: "Legal cases, pharma consulting" },
            { name: "Locum tenens shifts", range: "$20K–$150K/yr", desc: "Pick up extra shifts at other facilities" },
            { name: "Real estate investing", range: "$10K–$80K/yr", desc: "Rental properties, REITs" },
            { name: "Telemedicine side gigs", range: "$15K–$60K/yr", desc: "After-hours virtual visits" },
            { name: "Medical device / app", range: "$0–$500K+/yr", desc: "Build something that solves a problem" },
          ].map((idea) => (
            <div key={idea.name} className="bg-white/70 rounded-lg p-2.5 border border-blue-100">
              <div className="text-xs font-semibold text-blue-800">{idea.name}</div>
              <div className="text-[11px] text-blue-600 font-medium">{idea.range}</div>
              <div className="text-[10px] text-slate-500">{idea.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
