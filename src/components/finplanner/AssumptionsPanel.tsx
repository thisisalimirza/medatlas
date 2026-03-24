"use client";
import { Assumptions } from "@/lib/finplanner/types";
import { TIPS } from "@/lib/finplanner/glossary";
import { LabelWithTip } from "@/components/finplanner/Tooltip";
import { ChevronDown, ChevronRight, Info, Lock } from "lucide-react";
import React, { useState } from "react";

interface Props {
  assumptions: Assumptions;
  onChange: (a: Assumptions) => void;
}

function NumberInput({
  label,
  value,
  onChange,
  step,
  min,
  max,
  suffix,
  prefix,
  tip,
  locked,
  lockReason,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  prefix?: string;
  tip?: string;
  locked?: boolean;
  lockReason?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1">
        {tip ? <LabelWithTip label={label} tip={tip} /> : label}
        {locked && (
          <span className="text-slate-300 ml-1" title={lockReason}>
            <Lock size={10} />
          </span>
        )}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          step={step || 1}
          min={min}
          max={max}
          className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all
            ${prefix ? "pl-7" : ""} ${suffix ? "pr-8" : ""}
            ${locked ? "opacity-60" : ""}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function PercentInput({
  label,
  value,
  onChange,
  tip,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  tip?: string;
}) {
  return (
    <NumberInput
      label={label}
      value={Math.round(value * 100 * 10) / 10}
      onChange={(v) => onChange(v / 100)}
      step={0.5}
      min={0}
      max={100}
      suffix="%"
      tip={tip}
    />
  );
}

function Section({
  title,
  description,
  badge,
  defaultOpen,
  children,
}: {
  title: string;
  description?: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
          {badge && (
            <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{badge}</span>
          )}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-4 space-y-3">
          {description && (
            <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{children}</div>
        </div>
      )}
    </div>
  );
}

function GuidanceBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 leading-relaxed">
      <Info size={14} className="shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

export default function AssumptionsPanel({ assumptions, onChange }: Props) {
  const update = <K extends keyof Assumptions>(section: K, field: string, value: number) => {
    onChange({
      ...assumptions,
      [section]: { ...assumptions[section], [field]: value },
    });
  };

  const a = assumptions;

  return (
    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      {/* Intro guidance */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-1">How to use these settings</h3>
        <p className="text-xs text-blue-700 leading-relaxed">
          Most defaults are reasonable for a typical 2026 med school graduate. <strong>You really only need to update the &quot;About You&quot; section</strong> and your tuition numbers. Everything else uses national averages. Look for the <span className="inline-flex items-center"><Info size={10} className="mx-0.5" /></span> icons to learn what each field means. Hover over any <span className="inline-flex items-center text-slate-400"><span className="text-blue-500">ⓘ</span></span> for a plain-English explanation.
        </p>
      </div>

      <Section title="About You" description="Tell us where you are in your training. This determines when each career phase starts." badge="START HERE" defaultOpen={true}>
        <NumberInput label="Current Age" value={a.personal.currentAge} onChange={(v) => update("personal", "currentAge", v)} min={20} max={50} tip="Your age right now. This determines when each phase (residency, fellowship, attending) starts on the timeline." />
        <NumberInput label="Med School Year (of 4)" value={a.personal.medSchoolYear} onChange={(v) => { update("personal", "medSchoolYear", v); update("personal", "yearsRemainingInMedSchool", 4 - v); }} min={1} max={4} tip="Which year of med school you're currently in. An MS1 would enter 1, an MS4 would enter 4. This affects how many more years of tuition and living expenses accrue before you start earning." />
        <NumberInput label="How Far Out to Project" value={a.personal.analysisHorizon} onChange={(v) => update("personal", "analysisHorizon", v)} min={10} max={40} suffix="yrs" tip="How many years into the future to model. 30 years is standard — it captures your entire career through your peak earning years. You can shorten it to 20 if you just want to see the near-term." />
        <NumberInput label="Start Year" value={a.personal.modelStartYear} onChange={(v) => update("personal", "modelStartYear", v)} min={2024} max={2035} tip="The current calendar year. Used to label the timeline. You probably don't need to change this." />
      </Section>

      <Section title="Your Med School Costs" description="Enter your actual tuition and living costs. These determine your total debt at graduation — the starting point for everything." badge="IMPORTANT" defaultOpen={true}>
        <GuidanceBox>
          <strong>Find your real numbers!</strong> Check your financial aid letter or school&apos;s cost of attendance page. Out-of-state Year 1 tuition can be 50% higher than in-state. Entering accurate numbers here makes the rest of the model much more useful.
        </GuidanceBox>
        <NumberInput label="Year 1 Tuition" value={a.education.year1Tuition} onChange={(v) => update("education", "year1Tuition", v)} prefix="$" tip="Your first year tuition. If you paid out-of-state tuition Year 1 and switched to in-state, enter the higher number here." />
        <NumberInput label="Year 2 Tuition" value={a.education.year2Tuition} onChange={(v) => update("education", "year2Tuition", v)} prefix="$" />
        <NumberInput label="Year 3 Tuition" value={a.education.year3Tuition} onChange={(v) => update("education", "year3Tuition", v)} prefix="$" />
        <NumberInput label="Year 4 Tuition" value={a.education.year4Tuition} onChange={(v) => update("education", "year4Tuition", v)} prefix="$" />
        <NumberInput label="Living Expenses / Year" value={a.education.annualLivingExpensesMedSchool} onChange={(v) => update("education", "annualLivingExpensesMedSchool", v)} prefix="$" tip="Your annual cost of living during med school (rent, food, car, phone, etc). $40K is average for a single student. If you live in an expensive city, increase this." />
        <PercentInput label="Tuition Inflation" value={a.education.tuitionInflationRate} onChange={(v) => update("education", "tuitionInflationRate", v)} tip="How much tuition increases each year. 3% is the national average. You probably don't need to change this." />
      </Section>

      <Section title="Student Loans" description="How your loans are structured and repaid. The defaults match 2026 federal loan terms." defaultOpen={false}>
        <GuidanceBox>
          The most important number here is your <strong>blended loan rate</strong>. If you have a mix of Direct and Grad PLUS loans, 7.2% is a good estimate. The model automatically compares Standard Repayment vs PSLF for each career path, so you&apos;ll see both options.
        </GuidanceBox>
        <PercentInput label="Blended Loan Rate" value={a.loans.blendedRate} onChange={(v) => update("loans", "blendedRate", v)} tip={TIPS.blendedRate} />
        <NumberInput label="Standard Repayment Term" value={a.loans.standardRepaymentTerm} onChange={(v) => update("loans", "standardRepaymentTerm", v)} suffix="yrs" tip={TIPS.standardRepayment} />
        <NumberInput label="PSLF Forgiveness After" value={a.loans.pslfForgivenessYear} onChange={(v) => update("loans", "pslfForgivenessYear", v)} suffix="yrs" tip={TIPS.pslf} />
        <PercentInput label="IBR Payment Rate" value={a.loans.ibrPaymentPercent} onChange={(v) => update("loans", "ibrPaymentPercent", v)} tip={TIPS.ibr} />
        <PercentInput label="Refinance Rate (if private)" value={a.loans.refinanceRate} onChange={(v) => update("loans", "refinanceRate", v)} tip={TIPS.refinanceRate} />
      </Section>

      <Section title="Where You'll Live & Practice" description="Your cost of living as a resident and attending. This is one of the biggest levers for building wealth." defaultOpen={true}>
        <GuidanceBox>
          <strong>This matters more than you think.</strong> A cardiologist making $500K in rural Texas takes home dramatically more than one making $500K in Manhattan after taxes and expenses. Choose the region that matches where you plan to practice.
        </GuidanceBox>
        <NumberInput label="Living Cost (Residency)" value={a.lifestyle.livingCostResidency} onChange={(v) => update("lifestyle", "livingCostResidency", v)} prefix="$" tip={TIPS.livingCostResidency} />
        <NumberInput label="Living Cost (High COL Area)" value={a.lifestyle.livingCostAttendingHighCOL} onChange={(v) => update("lifestyle", "livingCostAttendingHighCOL", v)} prefix="$" tip={TIPS.livingCostHighCOL} />
        <NumberInput label="Living Cost (Low COL Area)" value={a.lifestyle.livingCostAttendingLowCOL} onChange={(v) => update("lifestyle", "livingCostAttendingLowCOL", v)} prefix="$" tip={TIPS.livingCostLowCOL} />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            <LabelWithTip label="Where Will You Practice?" tip={TIPS.colRegion} />
          </label>
          <select
            value={a.lifestyle.colRegion}
            onChange={(e) => update("lifestyle", "colRegion", parseInt(e.target.value) as 1 | 2)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
          >
            <option value={1}>🏙️ High Cost of Living (NYC, SF, Boston, etc.)</option>
            <option value={2}>🏡 Lower Cost of Living (Midwest, South, Rural, etc.)</option>
          </select>
        </div>
        <PercentInput label="State + Local Tax Rate" value={a.tax.stateLocalTaxRate} onChange={(v) => update("tax", "stateLocalTaxRate", v)} tip={TIPS.stateLocalTax} />
      </Section>

      <Section title="Insurance & Protection" description="Costs you'll pay as an attending to protect yourself and your income." defaultOpen={false}>
        <GuidanceBox>
          These are set to national averages. <strong>Malpractice insurance is set per-specialty on the Career Paths tab</strong> since it varies wildly ($8K for psychiatry vs $50K for CT surgery). Health and disability insurance are what you&apos;ll pay out-of-pocket after residency.
        </GuidanceBox>
        <NumberInput label="Health Insurance / Year" value={a.lifestyle.healthInsurance} onChange={(v) => update("lifestyle", "healthInsurance", v)} prefix="$" tip={TIPS.healthInsurance} />
        <NumberInput label="Disability Insurance / Year" value={a.lifestyle.disabilityInsurance} onChange={(v) => update("lifestyle", "disabilityInsurance", v)} prefix="$" tip={TIPS.disabilityInsurance} />
      </Section>

      <Section title="Saving & Investing" description="How much you save for retirement and what returns you expect. Starting early is the single most powerful financial decision you can make." defaultOpen={true}>
        <GuidanceBox>
          <strong>The magic of compound growth:</strong> If you invest $75K/year starting at age 30 with 7% returns, you&apos;ll have ~$4.2M by age 55. Start at 35 instead? Only ~$2.8M. Those 5 years cost you $1.4 million. This is why the model tracks retirement contributions carefully.
        </GuidanceBox>
        <PercentInput label="% of Income to Save" value={a.lifestyle.retirementContributionPercent} onChange={(v) => update("lifestyle", "retirementContributionPercent", v)} tip={TIPS.retirementPercent} />
        <NumberInput label="Start Saving at Age" value={a.lifestyle.retirementStartAge} onChange={(v) => update("lifestyle", "retirementStartAge", v)} tip={TIPS.retirementStartAge} />
        <PercentInput label="Expected Investment Return" value={a.lifestyle.expectedInvestmentReturn} onChange={(v) => update("lifestyle", "expectedInvestmentReturn", v)} tip={TIPS.investmentReturn} />
      </Section>

      <Section title="Side Business / Entrepreneurship" description="If any of your career paths include a side business, configure the business details here. These numbers apply to all paths with 'Include Side Business' checked." defaultOpen={false}>
        <GuidanceBox>
          <strong>How this works:</strong> When you check &quot;Include Side Business&quot; on a career path, the model adds business income on top of your medical salary. You set how much the business earns each year, what percentage goes to expenses, and how much you pay yourself. The business starts when you finish med school (or during residency for side hustles).
        </GuidanceBox>
        <NumberInput label="Startup Capital Needed" value={a.business.startupCapital} onChange={(v) => update("business", "startupCapital", v)} prefix="$" tip={TIPS.startupCapital} />
        <NumberInput label="Year 1 Revenue" value={a.business.year1Revenue} onChange={(v) => update("business", "year1Revenue", v)} prefix="$" tip="How much total revenue your business generates in its first year. Be conservative — most new businesses make less than you expect." />
        <NumberInput label="Year 2 Revenue" value={a.business.year2Revenue} onChange={(v) => update("business", "year2Revenue", v)} prefix="$" />
        <NumberInput label="Year 3 Revenue" value={a.business.year3Revenue} onChange={(v) => update("business", "year3Revenue", v)} prefix="$" />
        <NumberInput label="Year 4 Revenue" value={a.business.year4Revenue} onChange={(v) => update("business", "year4Revenue", v)} prefix="$" />
        <PercentInput label="Year 5+ Growth Rate" value={a.business.year5PlusGrowthRate} onChange={(v) => update("business", "year5PlusGrowthRate", v)} tip="After year 4, how fast does revenue grow each year? 15% is optimistic but achievable for a growing business." />
        <NumberInput label="Revenue Ceiling" value={a.business.revenueCeiling} onChange={(v) => update("business", "revenueCeiling", v)} prefix="$" tip={TIPS.revenueCeiling} />
        <PercentInput label="Operating Expenses (% of Revenue)" value={a.business.opexPercentOfRevenue} onChange={(v) => update("business", "opexPercentOfRevenue", v)} tip={TIPS.opexPercent} />
        <PercentInput label="How Much You Pay Yourself" value={a.business.ownersDrawPercent} onChange={(v) => update("business", "ownersDrawPercent", v)} tip={TIPS.ownersDrawPercent} />
        <div className="col-span-full border-t border-slate-100 pt-3 mt-1">
          <p className="text-xs font-semibold text-slate-600 mb-2">Side Hustle During Residency</p>
          <p className="text-xs text-slate-500 mb-3">If you start a smaller side business during training (not a full business launch):</p>
        </div>
        <NumberInput label="Side Biz Year 1 Revenue" value={a.business.sideBusinessRevYear1} onChange={(v) => update("business", "sideBusinessRevYear1", v)} prefix="$" tip={TIPS.sideBusinessRevYear1} />
        <PercentInput label="Side Biz Annual Growth" value={a.business.sideBusinessGrowthRate} onChange={(v) => update("business", "sideBusinessGrowthRate", v)} tip={TIPS.sideBusinessGrowth} />
      </Section>

      <Section title="Advanced: Tax & Economic Settings" description="Federal tax brackets, inflation rates, and other economic assumptions. These use 2026 estimates and generally don't need changing." defaultOpen={false}>
        <GuidanceBox>
          <strong>You probably don&apos;t need to change these.</strong> They&apos;re based on 2026 tax law and historical economic averages. Only adjust if you have a specific reason (e.g., you expect to live in a no-income-tax state, or you want to see how different inflation scenarios play out).
        </GuidanceBox>
        <NumberInput label="Standard Deduction" value={a.tax.standardDeduction} onChange={(v) => update("tax", "standardDeduction", v)} prefix="$" tip={TIPS.standardDeduction} locked lockReason="Set by tax law — rarely needs changing" />
        <NumberInput label="FICA Cap" value={a.tax.ficaCap} onChange={(v) => update("tax", "ficaCap", v)} prefix="$" tip={TIPS.ficaCap} locked lockReason="Set by the government each year" />
        <PercentInput label="General Inflation Rate" value={a.lifestyle.inflationRate} onChange={(v) => update("lifestyle", "inflationRate", v)} tip={TIPS.inflationRate} />
        <PercentInput label="Discount Rate (for NPV)" value={a.lifestyle.discountRate} onChange={(v) => update("lifestyle", "discountRate", v)} tip={TIPS.discountRate} />
      </Section>
    </div>
  );
}
