'use client'

import { useState } from 'react'
import Header from '@/components/Header'

interface TestEntry {
  name: string
  sensitivity: number
  specificity: number
  notes?: string
}

interface ConditionEntry {
  condition: string
  prevalence: number
  prevalenceContext: string
  tests: TestEntry[]
}

interface CategoryEntry {
  category: string
  emoji: string
  conditions: ConditionEntry[]
}

const DATA: CategoryEntry[] = [
  {
    category: 'Cardiology',
    emoji: '❤️',
    conditions: [
      {
        condition: 'Acute MI (AMI)',
        prevalence: 0.12,
        prevalenceContext: 'ED patients presenting with chest pain',
        tests: [
          { name: 'High-sensitivity Troponin I', sensitivity: 0.92, specificity: 0.80 },
          { name: 'Standard Troponin T', sensitivity: 0.84, specificity: 0.90 },
          { name: 'ECG (ST elevation)', sensitivity: 0.45, specificity: 0.98, notes: 'Very specific but only detects STEMI — misses most MIs' },
          { name: 'CK-MB', sensitivity: 0.60, specificity: 0.87 },
        ],
      },
      {
        condition: 'Heart Failure',
        prevalence: 0.35,
        prevalenceContext: 'ED patients presenting with dyspnea',
        tests: [
          { name: 'BNP >100 pg/mL', sensitivity: 0.90, specificity: 0.73 },
          { name: 'NT-proBNP >900 pg/mL', sensitivity: 0.90, specificity: 0.84 },
        ],
      },
      {
        condition: 'Pulmonary Embolism (PE)',
        prevalence: 0.25,
        prevalenceContext: 'Patients with moderate pre-test probability (Wells score)',
        tests: [
          { name: 'D-dimer (ELISA)', sensitivity: 0.96, specificity: 0.45, notes: 'Best for ruling OUT — low specificity means many false positives' },
          { name: 'CT Pulmonary Angiography (CTPA)', sensitivity: 0.83, specificity: 0.96 },
          { name: 'V/Q Scan (high probability read)', sensitivity: 0.41, specificity: 0.97 },
        ],
      },
    ],
  },
  {
    category: 'Infectious Disease',
    emoji: '🦠',
    conditions: [
      {
        condition: 'Strep Pharyngitis',
        prevalence: 0.25,
        prevalenceContext: 'Adults presenting with pharyngitis symptoms',
        tests: [
          { name: 'Rapid Antigen Test (RADT)', sensitivity: 0.80, specificity: 0.97 },
          { name: 'Throat Culture', sensitivity: 0.90, specificity: 0.95, notes: 'Gold standard — results take 24–48h' },
        ],
      },
      {
        condition: 'UTI (uncomplicated, women)',
        prevalence: 0.50,
        prevalenceContext: 'Women with dysuria and urinary frequency',
        tests: [
          { name: 'Dipstick — Leukocyte Esterase', sensitivity: 0.75, specificity: 0.82 },
          { name: 'Dipstick — Nitrite', sensitivity: 0.47, specificity: 0.95 },
          { name: 'Urinalysis (pyuria >5 WBC/hpf)', sensitivity: 0.82, specificity: 0.83 },
          { name: 'Urine Culture', sensitivity: 0.85, specificity: 0.90, notes: 'Gold standard' },
        ],
      },
      {
        condition: 'COVID-19',
        prevalence: 0.15,
        prevalenceContext: 'Symptomatic outpatients (adjust to your community prevalence)',
        tests: [
          { name: 'Rapid Antigen Test', sensitivity: 0.72, specificity: 0.99 },
          { name: 'RT-PCR', sensitivity: 0.95, specificity: 0.99, notes: 'Gold standard' },
        ],
      },
      {
        condition: 'Influenza',
        prevalence: 0.20,
        prevalenceContext: 'Symptomatic patients during flu season',
        tests: [
          { name: 'Rapid Influenza Test (RIDT)', sensitivity: 0.62, specificity: 0.98 },
          { name: 'Rapid Molecular Assay (LAMP)', sensitivity: 0.89, specificity: 0.99 },
          { name: 'RT-PCR', sensitivity: 0.92, specificity: 0.99 },
        ],
      },
      {
        condition: 'HIV',
        prevalence: 0.003,
        prevalenceContext: 'General US adult population — routine screening',
        tests: [
          { name: '4th Gen Ag/Ab Combination Test', sensitivity: 0.997, specificity: 0.995, notes: 'Detects p24 antigen + HIV-1/2 antibodies' },
          { name: 'HIV RNA Viral Load', sensitivity: 0.999, specificity: 0.997 },
        ],
      },
      {
        condition: 'C. difficile Infection',
        prevalence: 0.15,
        prevalenceContext: 'Hospitalized patients with diarrhea after antibiotics',
        tests: [
          { name: 'GDH Antigen Test', sensitivity: 0.92, specificity: 0.80, notes: 'Good screening test — confirm positives with toxin assay' },
          { name: 'EIA Toxin A/B', sensitivity: 0.72, specificity: 0.97 },
          { name: 'NAAT / PCR', sensitivity: 0.94, specificity: 0.95 },
        ],
      },
      {
        condition: 'Lyme Disease',
        prevalence: 0.10,
        prevalenceContext: 'Patients in endemic area with compatible symptoms',
        tests: [
          { name: 'ELISA (first-tier screening)', sensitivity: 0.85, specificity: 0.72 },
          { name: 'Western Blot (second-tier)', sensitivity: 0.80, specificity: 0.97 },
          { name: 'Two-tier (ELISA + Western Blot)', sensitivity: 0.76, specificity: 0.99 },
        ],
      },
    ],
  },
  {
    category: 'Cancer Screening',
    emoji: '🔬',
    conditions: [
      {
        condition: 'Breast Cancer',
        prevalence: 0.01,
        prevalenceContext: 'Average-risk women aged 40–75 in routine screening',
        tests: [
          { name: '2D Mammography', sensitivity: 0.83, specificity: 0.90 },
          { name: '3D Mammography (Tomosynthesis)', sensitivity: 0.87, specificity: 0.91 },
          { name: 'Breast MRI', sensitivity: 0.94, specificity: 0.79, notes: 'Typically for high-risk patients (BRCA+, dense breasts)' },
        ],
      },
      {
        condition: 'Prostate Cancer',
        prevalence: 0.10,
        prevalenceContext: 'Men aged 50–69 in PSA screening programs',
        tests: [
          { name: 'PSA >4.0 ng/mL', sensitivity: 0.80, specificity: 0.70 },
          { name: 'PSA >2.5 ng/mL (lower threshold)', sensitivity: 0.90, specificity: 0.55 },
        ],
      },
      {
        condition: 'Colorectal Cancer',
        prevalence: 0.005,
        prevalenceContext: 'Average-risk adults aged 50+ in routine screening',
        tests: [
          { name: 'FIT (Fecal Immunochemical Test)', sensitivity: 0.79, specificity: 0.94 },
          { name: 'Stool DNA / Cologuard', sensitivity: 0.92, specificity: 0.87 },
          { name: 'Colonoscopy', sensitivity: 0.95, specificity: 0.99, notes: 'Gold standard and therapeutic' },
        ],
      },
      {
        condition: 'Cervical Cancer',
        prevalence: 0.001,
        prevalenceContext: 'Average-risk women in routine Pap screening',
        tests: [
          { name: 'PAP smear (LSIL or higher threshold)', sensitivity: 0.53, specificity: 0.97 },
          { name: 'hrHPV co-test', sensitivity: 0.94, specificity: 0.94 },
          { name: 'Primary HPV testing', sensitivity: 0.95, specificity: 0.93 },
        ],
      },
      {
        condition: 'Lung Cancer',
        prevalence: 0.012,
        prevalenceContext: 'High-risk adults (50+, ≥20 pack-year smoking history)',
        tests: [
          { name: 'Low-dose CT (LDCT)', sensitivity: 0.93, specificity: 0.77, notes: 'USPSTF recommended for high-risk smokers' },
        ],
      },
    ],
  },
  {
    category: 'Neurology',
    emoji: '🧠',
    conditions: [
      {
        condition: 'Acute Ischemic Stroke',
        prevalence: 0.20,
        prevalenceContext: 'ED patients with acute focal neurological deficits',
        tests: [
          { name: 'Non-contrast CT head', sensitivity: 0.39, specificity: 0.96, notes: 'Poor for early ischemia — excellent for ruling out hemorrhage' },
          { name: 'MRI DWI (diffusion-weighted)', sensitivity: 0.80, specificity: 0.97 },
          { name: 'CT Angiography (large vessel occlusion)', sensitivity: 0.95, specificity: 0.95 },
        ],
      },
      {
        condition: 'Bacterial Meningitis',
        prevalence: 0.05,
        prevalenceContext: 'Patients with fever, headache, and neck stiffness',
        tests: [
          { name: 'CSF WBC >100 cells/µL', sensitivity: 0.79, specificity: 0.93 },
          { name: 'CSF Protein >220 mg/dL', sensitivity: 0.82, specificity: 0.98 },
          { name: 'CSF Gram Stain', sensitivity: 0.60, specificity: 0.99, notes: 'Highly specific when positive' },
          { name: 'CSF Culture', sensitivity: 0.80, specificity: 0.99, notes: 'Gold standard — takes 24–72h' },
        ],
      },
    ],
  },
  {
    category: 'Endocrinology',
    emoji: '⚗️',
    conditions: [
      {
        condition: 'Type 2 Diabetes',
        prevalence: 0.10,
        prevalenceContext: 'Average-risk adults in routine screening',
        tests: [
          { name: 'Fasting Plasma Glucose ≥126 mg/dL', sensitivity: 0.45, specificity: 0.99 },
          { name: 'HbA1c ≥6.5%', sensitivity: 0.45, specificity: 0.99 },
          { name: '2-hour OGTT ≥200 mg/dL', sensitivity: 0.80, specificity: 0.98, notes: 'Gold standard but less practical' },
        ],
      },
      {
        condition: 'Hypothyroidism',
        prevalence: 0.04,
        prevalenceContext: 'General adult population in routine screening',
        tests: [
          { name: 'TSH elevated (>4.5 mIU/L)', sensitivity: 0.96, specificity: 0.92 },
          { name: 'Free T4 low', sensitivity: 0.85, specificity: 0.95, notes: 'Confirms overt hypothyroidism' },
        ],
      },
    ],
  },
  {
    category: 'Gastroenterology',
    emoji: '🩺',
    conditions: [
      {
        condition: 'Appendicitis',
        prevalence: 0.20,
        prevalenceContext: 'ED patients with right lower quadrant pain',
        tests: [
          { name: 'Ultrasound', sensitivity: 0.76, specificity: 0.93 },
          { name: 'CT Abdomen/Pelvis', sensitivity: 0.94, specificity: 0.95, notes: 'First-line imaging in adults' },
          { name: 'MRI Abdomen', sensitivity: 0.96, specificity: 0.96, notes: 'Preferred in pregnancy' },
          { name: 'Alvarado Score ≥7', sensitivity: 0.72, specificity: 0.83 },
        ],
      },
      {
        condition: 'Cirrhosis / Advanced Fibrosis',
        prevalence: 0.30,
        prevalenceContext: 'Patients with chronic liver disease (HCV, NASH, ALD)',
        tests: [
          { name: 'FIB-4 Score >2.67', sensitivity: 0.75, specificity: 0.90 },
          { name: 'Transient Elastography (FibroScan)', sensitivity: 0.88, specificity: 0.82, notes: 'Non-invasive reference standard' },
          { name: 'Liver Biopsy', sensitivity: 0.94, specificity: 0.98, notes: 'Invasive gold standard' },
        ],
      },
      {
        condition: 'C. difficile Infection',
        prevalence: 0.15,
        prevalenceContext: 'Hospitalized patients with diarrhea after antibiotics',
        tests: [
          { name: 'GDH Antigen Test', sensitivity: 0.92, specificity: 0.80, notes: 'Good screening — confirm positives with toxin assay' },
          { name: 'EIA Toxin A/B', sensitivity: 0.72, specificity: 0.97 },
          { name: 'NAAT / PCR', sensitivity: 0.94, specificity: 0.95 },
        ],
      },
    ],
  },
  {
    category: 'Musculoskeletal',
    emoji: '🦴',
    conditions: [
      {
        condition: 'DVT (Deep Vein Thrombosis)',
        prevalence: 0.20,
        prevalenceContext: 'Patients with unilateral leg swelling and/or pain',
        tests: [
          { name: 'Compression Ultrasound (proximal)', sensitivity: 0.95, specificity: 0.96 },
          { name: 'D-dimer (low pre-test prob only)', sensitivity: 0.96, specificity: 0.45, notes: 'Best for ruling out in low-risk patients' },
        ],
      },
      {
        condition: 'Fracture Detection',
        prevalence: 0.30,
        prevalenceContext: 'Patients with trauma and localized pain/swelling',
        tests: [
          { name: 'Plain X-ray', sensitivity: 0.76, specificity: 0.93 },
          { name: 'CT scan', sensitivity: 0.98, specificity: 0.98, notes: 'Best for complex or occult fractures' },
          { name: 'MRI', sensitivity: 0.97, specificity: 0.96, notes: 'Best for stress fractures and soft tissue injury' },
        ],
      },
    ],
  },
]

function calcPPV(sens: number, spec: number, prev: number): number {
  const tp = sens * prev
  const fp = (1 - spec) * (1 - prev)
  return tp / (tp + fp)
}

function calcNPV(sens: number, spec: number, prev: number): number {
  const tn = spec * (1 - prev)
  const fn = (1 - sens) * prev
  return tn / (tn + fn)
}

function ppvStyle(ppv: number) {
  if (ppv >= 0.85) return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800', label: 'Highly reliable' }
  if (ppv >= 0.65) return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800', label: 'Moderately reliable' }
  if (ppv >= 0.40) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800', label: 'Somewhat unreliable' }
  return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800', label: 'Often a false positive' }
}

function npvStyle(npv: number) {
  if (npv >= 0.97) return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800', label: 'Strong rule-out' }
  if (npv >= 0.85) return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', label: 'Good rule-out' }
  if (npv >= 0.70) return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800', label: 'Moderate rule-out' }
  return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800', label: 'Weak rule-out' }
}

export default function TestPredictorPage() {
  const [catIdx, setCatIdx] = useState<number | ''>('')
  const [condIdx, setCondIdx] = useState<number | ''>('')
  const [testIdx, setTestIdx] = useState<number | ''>('')
  const [pretestPct, setPretestPct] = useState<string>('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [customSens, setCustomSens] = useState<string>('')
  const [customSpec, setCustomSpec] = useState<string>('')

  const category = catIdx !== '' ? DATA[catIdx] : null
  const condition = category && condIdx !== '' ? category.conditions[condIdx] : null
  const test = condition && testIdx !== '' ? condition.tests[testIdx] : null

  const handleCategoryChange = (val: string) => {
    setCatIdx(val === '' ? '' : Number(val))
    setCondIdx('')
    setTestIdx('')
    setPretestPct('')
    setCustomSens('')
    setCustomSpec('')
  }

  const handleConditionChange = (val: string) => {
    const idx = val === '' ? '' : Number(val)
    setCondIdx(idx)
    setTestIdx('')
    setCustomSens('')
    setCustomSpec('')
    if (idx !== '' && category) {
      setPretestPct((category.conditions[idx].prevalence * 100).toFixed(1))
    }
  }

  const handleTestChange = (val: string) => {
    const idx = val === '' ? '' : Number(val)
    setTestIdx(idx)
    if (idx !== '' && condition) {
      const t = condition.tests[idx]
      setCustomSens((t.sensitivity * 100).toFixed(0))
      setCustomSpec((t.specificity * 100).toFixed(0))
    }
  }

  const sens = parseFloat(customSens) / 100
  const spec = parseFloat(customSpec) / 100
  const prev = parseFloat(pretestPct) / 100

  const isReady =
    !isNaN(sens) && !isNaN(spec) && !isNaN(prev) &&
    sens > 0 && sens < 1 &&
    spec > 0 && spec < 1 &&
    prev > 0 && prev < 1

  const ppv = isReady ? calcPPV(sens, spec, prev) : null
  const npv = isReady ? calcNPV(sens, spec, prev) : null

  const ppvS = ppv !== null ? ppvStyle(ppv) : null
  const npvS = npv !== null ? npvStyle(npv) : null

  const sliderVal = parseFloat(pretestPct) || (condition ? condition.prevalence * 100 : 10)

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🧪</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Value Predictor</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Your patient just got a result. <strong className="text-gray-700">How much should you actually trust it?</strong> Get the real probability — fast.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Left: Configuration ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Step 1 */}
            <div className="card p-6">
              <div className="flex items-start gap-3 mb-5">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: '#ff5e5b' }}
                >1</span>
                <div>
                  <h2 className="font-semibold text-gray-900 text-lg">Which test are you interpreting?</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Select from the database to auto-fill values, or enter them manually below</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Clinical Area</label>
                  <select
                    value={catIdx}
                    onChange={e => handleCategoryChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white"
                  >
                    <option value="">— Choose a category —</option>
                    {DATA.map((cat, i) => (
                      <option key={i} value={i}>{cat.emoji} {cat.category}</option>
                    ))}
                  </select>
                </div>

                {category && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Condition / Diagnosis</label>
                    <select
                      value={condIdx}
                      onChange={e => handleConditionChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white"
                    >
                      <option value="">— Select a condition —</option>
                      {category.conditions.map((c, i) => (
                        <option key={i} value={i}>{c.condition}</option>
                      ))}
                    </select>
                  </div>
                )}

                {condition && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Diagnostic Test</label>
                    <select
                      value={testIdx}
                      onChange={e => handleTestChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white"
                    >
                      <option value="">— Select a test —</option>
                      {condition.tests.map((t, i) => (
                        <option key={i} value={i}>{t.name}</option>
                      ))}
                    </select>
                    {test?.notes && (
                      <div className="mt-2 flex items-start gap-2 bg-blue-50 text-blue-800 text-sm rounded-lg px-3 py-2.5">
                        <span className="flex-shrink-0">💡</span>
                        <span>{test.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Advanced override / manual entry */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                {test ? (
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1.5"
                  >
                    <span className="text-xs">{showAdvanced ? '▼' : '▶'}</span>
                    {showAdvanced ? 'Hide' : 'Override'} sensitivity &amp; specificity
                  </button>
                ) : (
                  !showAdvanced && (
                    <button
                      onClick={() => setShowAdvanced(true)}
                      className="text-sm font-medium text-red-500 hover:text-red-700"
                    >
                      Know your test values? Enter them manually →
                    </button>
                  )
                )}

                {showAdvanced && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sensitivity (%)
                        <span className="ml-1 text-xs font-normal text-gray-400">— true positive rate</span>
                      </label>
                      <input
                        type="number" min="1" max="99.9" step="0.1"
                        value={customSens}
                        onChange={e => setCustomSens(e.target.value)}
                        placeholder="e.g. 80"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specificity (%)
                        <span className="ml-1 text-xs font-normal text-gray-400">— true negative rate</span>
                      </label>
                      <input
                        type="number" min="1" max="99.9" step="0.1"
                        value={customSpec}
                        onChange={e => setCustomSpec(e.target.value)}
                        placeholder="e.g. 95"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Pre-test probability */}
            {(condition || showAdvanced) && (
              <div className="card p-6">
                <div className="flex items-start gap-3 mb-2">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: '#ff5e5b' }}
                  >2</span>
                  <div>
                    <h2 className="font-semibold text-gray-900 text-lg">Before the test — how likely was it?</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {condition
                        ? <>Default is based on published data for <em>{condition.prevalenceContext.toLowerCase()}</em>. Adjust for your patient.</>
                        : 'Your estimate of the disease probability before the test result.'}
                    </p>
                  </div>
                </div>

                {/* Quick presets */}
                {condition && (
                  <div className="flex flex-wrap gap-2 mt-4 mb-5">
                    {[
                      { label: 'Low risk', emoji: '🟢', val: Math.max(condition.prevalence * 0.25, 0.01) },
                      { label: 'Typical', emoji: '🟡', val: condition.prevalence },
                      { label: 'High risk', emoji: '🔴', val: Math.min(condition.prevalence * 3, 0.85) },
                    ].map(preset => (
                      <button
                        key={preset.label}
                        onClick={() => setPretestPct((preset.val * 100).toFixed(1))}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                          Math.abs(parseFloat(pretestPct) - preset.val * 100) < 1
                            ? 'border-red-400 bg-red-50 text-red-700 font-medium'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {preset.emoji} {preset.label} (~{(preset.val * 100).toFixed(0)}%)
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex-1">
                    <input
                      type="range" min="1" max="99" step="0.5"
                      value={sliderVal}
                      onChange={e => setPretestPct(e.target.value)}
                      className="w-full h-2 rounded-full cursor-pointer accent-red-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Very unlikely</span>
                      <span>50/50</span>
                      <span>Very likely</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input
                      type="number" min="0.1" max="99.9" step="0.1"
                      value={pretestPct}
                      onChange={e => setPretestPct(e.target.value)}
                      placeholder={condition ? (condition.prevalence * 100).toFixed(0) : '15'}
                      className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                    />
                    <span className="text-gray-500 font-semibold text-lg">%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Results ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              {!isReady ? (
                <div className="card p-8 text-center">
                  <div className="text-5xl mb-4">📊</div>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Select a test and set the pre-test probability to see results.
                  </p>
                  {!category && (
                    <p className="text-xs text-gray-400 mt-3">
                      Start by choosing a clinical area on the left.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {/* PPV result */}
                  <div className={`rounded-xl p-5 border ${ppvS!.border} ${ppvS!.bg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">If test is POSITIVE</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ppvS!.badge}`}>
                        {ppvS!.label}
                      </span>
                    </div>
                    <div className={`text-6xl font-black leading-none ${ppvS!.color} mb-1`}>
                      {(ppv! * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      chance patient <strong>truly has</strong> the condition
                    </p>
                    <div className="w-full bg-white/70 rounded-full h-2.5 mb-3">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          ppv! >= 0.85 ? 'bg-green-500' :
                          ppv! >= 0.65 ? 'bg-yellow-500' :
                          ppv! >= 0.40 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(ppv! * 100).toFixed(1)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      ~{Math.round(ppv! * 100)} of 100 positives are real &bull; ~{100 - Math.round(ppv! * 100)} are false alarms
                    </p>
                  </div>

                  {/* NPV result */}
                  <div className={`rounded-xl p-5 border ${npvS!.border} ${npvS!.bg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">If test is NEGATIVE</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${npvS!.badge}`}>
                        {npvS!.label}
                      </span>
                    </div>
                    <div className={`text-6xl font-black leading-none ${npvS!.color} mb-1`}>
                      {(npv! * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      chance patient <strong>truly doesn&apos;t have</strong> the condition
                    </p>
                    <div className="w-full bg-white/70 rounded-full h-2.5 mb-3">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          npv! >= 0.97 ? 'bg-green-500' :
                          npv! >= 0.85 ? 'bg-blue-500' :
                          npv! >= 0.70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(npv! * 100).toFixed(1)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      ~{Math.round(npv! * 100)} of 100 negatives are truly clear &bull; ~{100 - Math.round(npv! * 100)} may be missed
                    </p>
                  </div>

                  {/* Parameters summary */}
                  <div className="card p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Values Used</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-base font-bold text-gray-900">{(sens * 100).toFixed(0)}%</div>
                        <div className="text-xs text-gray-500">Sensitivity</div>
                      </div>
                      <div>
                        <div className="text-base font-bold text-gray-900">{(spec * 100).toFixed(0)}%</div>
                        <div className="text-xs text-gray-500">Specificity</div>
                      </div>
                      <div>
                        <div className="text-base font-bold text-gray-900">{(prev * 100).toFixed(1)}%</div>
                        <div className="text-xs text-gray-500">Pre-test prob.</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Educational section */}
        <div className="mt-10 bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-4">📚 How to read these numbers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            <div>
              <p className="font-semibold text-blue-900">Positive Predictive Value (PPV)</p>
              <p className="text-blue-700 mt-1">When a test is positive, PPV is the probability the patient actually has the condition. Even excellent tests can have low PPV when the disease is rare — the core reason screening generates false positives.</p>
            </div>
            <div>
              <p className="font-semibold text-blue-900">Negative Predictive Value (NPV)</p>
              <p className="text-blue-700 mt-1">When a test is negative, NPV is the probability the patient is truly clear. Tests with very high NPV (like D-dimer for PE in low-risk patients) are powerful for ruling out disease.</p>
            </div>
            <div>
              <p className="font-semibold text-blue-900">Pre-Test Probability</p>
              <p className="text-blue-700 mt-1">Your clinical estimate of likelihood before the result. This is the most impactful variable — the same positive result means something very different in a high-risk vs. low-risk patient.</p>
            </div>
            <div>
              <p className="font-semibold text-blue-900">The Practical Takeaway</p>
              <p className="text-blue-700 mt-1">A positive test does not equal disease. Adjust your pre-test probability up and down to see how context changes everything. Use results to decide whether further workup is warranted.</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6 max-w-2xl mx-auto">
          Sensitivity and specificity values are derived from published literature and represent typical ranges. Values vary by population, assay, and clinical setting. For educational use only — clinical judgment always takes precedence.
        </p>
      </main>
    </>
  )
}
