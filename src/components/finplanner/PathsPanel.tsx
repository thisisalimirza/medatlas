"use client";
import { PathConfig, Assumptions } from "@/lib/finplanner/types";
import { SPECIALTIES, SPECIALTY_CATEGORIES } from "@/lib/finplanner/specialties";
import { createNewPath } from "@/lib/finplanner/defaults";
import { TIPS } from "@/lib/finplanner/glossary";
import { LabelWithTip } from "@/components/finplanner/Tooltip";
import { Plus, Trash2, Briefcase, ChevronDown, ChevronRight, Info, HelpCircle } from "lucide-react";
import React, { useState } from "react";

interface Props {
  paths: PathConfig[];
  onChange: (paths: PathConfig[]) => void;
  assumptions: Assumptions;
}

function PathCard({
  path,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  path: PathConfig;
  index: number;
  onUpdate: (p: PathConfig) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const specialty = SPECIALTIES[path.specialtyKey];
  const grouped = SPECIALTY_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = Object.entries(SPECIALTIES).filter(([, s]) => s.category === cat);
      return acc;
    },
    {} as Record<string, [string, typeof specialty][]>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold">
            {index + 1}
          </span>
          <input
            type="text"
            value={path.label}
            onChange={(e) => onUpdate({ ...path, label: e.target.value })}
            className="text-lg font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none px-1 transition-colors"
          />
        </div>
        {canRemove && (
          <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors p-1">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Specialty</label>
        <select
          value={path.specialtyKey}
          onChange={(e) => {
            const newSpec = SPECIALTIES[e.target.value];
            onUpdate({
              ...path,
              specialtyKey: e.target.value,
              label: newSpec?.name || path.label,
              overrides: undefined,
            });
          }}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
        >
          {Object.entries(grouped).map(([cat, specs]) =>
            specs.length > 0 ? (
              <optgroup key={cat} label={cat}>
                {specs.map(([key, s]) => (
                  <option key={key} value={key}>
                    {s.name} ({s.totalTrainingYears}yr training)
                  </option>
                ))}
              </optgroup>
            ) : null
          )}
        </select>
      </div>

      {specialty && (
        <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <div className="font-semibold text-slate-700">{specialty.totalTrainingYears}yr</div>
            <div><LabelWithTip label="Training" tip={`${specialty.residencyYears > 0 ? `${specialty.residencyYears}yr residency` : 'No residency'}${specialty.fellowshipYears > 0 ? ` + ${specialty.fellowshipYears}yr fellowship` : ''}. During training you earn $63-75K/yr. The longer the training, the later you start earning the big attending salary.`} /></div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <div className="font-semibold text-slate-700">${(specialty.attendingSalaryYear1 / 1000).toFixed(0)}K</div>
            <div><LabelWithTip label="Starting" tip={TIPS.attendingSalary} /></div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <div className="font-semibold text-slate-700">${(specialty.attendingSalaryCap / 1000).toFixed(0)}K</div>
            <div><LabelWithTip label="Cap" tip={TIPS.salaryCap} /></div>
          </div>
        </div>
      )}

      <div className="space-y-1">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 flex-1 hover:bg-slate-100 transition-colors">
          <input
            type="checkbox"
            checked={path.includeBusiness}
            onChange={(e) => onUpdate({ ...path, includeBusiness: e.target.checked })}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <Briefcase size={14} />
          Include Side Business
        </label>
        {path.includeBusiness && (
          <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-[11px] text-amber-700 leading-relaxed">
            <Info size={12} className="shrink-0 mt-0.5" />
            <span>This adds side business income on top of your medical salary. Configure revenue projections in the <strong>Assumptions → Side Business</strong> section. The business starts generating income after med school.</span>
          </div>
        )}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        Advanced Overrides
      </button>

      {expanded && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          {[
            { label: "Attending Salary", field: "attendingSalaryYear1", default: specialty?.attendingSalaryYear1 },
            { label: "Salary Growth", field: "attendingSalaryGrowthRate", default: specialty?.attendingSalaryGrowthRate },
            { label: "Salary Cap", field: "attendingSalaryCap", default: specialty?.attendingSalaryCap },
            { label: "Moonlighting", field: "moonlightingIncome", default: specialty?.moonlightingIncome },
            { label: "Signing Bonus", field: "signingBonus", default: specialty?.signingBonus },
            { label: "Malpractice", field: "malpracticeInsurance", default: specialty?.malpracticeInsurance },
          ].map((item) => (
            <div key={item.field} className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">{item.label}</label>
              <input
                type="number"
                placeholder={`${item.default}`}
                value={(path.overrides as Record<string, number | undefined>)?.[item.field] ?? ""}
                onChange={(e) => {
                  const val = e.target.value ? parseFloat(e.target.value) : undefined;
                  onUpdate({
                    ...path,
                    overrides: {
                      ...path.overrides,
                      [item.field]: val,
                    },
                  });
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:border-blue-500 outline-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PathsPanel({ paths, onChange }: Props) {
  const updatePath = (index: number, updated: PathConfig) => {
    const newPaths = [...paths];
    newPaths[index] = updated;
    onChange(newPaths);
  };

  const removePath = (index: number) => {
    onChange(paths.filter((_, i) => i !== index));
  };

  const addPath = () => {
    if (paths.length >= 6) return;
    onChange([...paths, createNewPath(paths.length + 1)]);
  };

  return (
    <div className="space-y-4">
      {/* Guidance for new users */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-indigo-900 mb-1">🤔 Not sure which paths to compare?</h3>
        <p className="text-xs text-indigo-700 leading-relaxed">
          Start with the specialties you&apos;re most interested in. The key trade-off is <strong>training length vs earning potential</strong>:
          shorter training (like EM, 3 years) means you start earning sooner, while longer training (like Cards or Neurosurgery, 6-8 years)
          means a higher salary but years of delayed earnings. Add a path with &quot;Include Side Business&quot; to see how entrepreneurship changes the picture.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Configure up to 6 career paths to compare side by side.
        </p>
        <button
          onClick={addPath}
          disabled={paths.length >= 6}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={16} />
          Add Path
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {paths.map((path, i) => (
          <PathCard
            key={path.id}
            path={path}
            index={i}
            onUpdate={(p) => updatePath(i, p)}
            onRemove={() => removePath(i)}
            canRemove={paths.length > 1}
          />
        ))}
      </div>
    </div>
  );
}
