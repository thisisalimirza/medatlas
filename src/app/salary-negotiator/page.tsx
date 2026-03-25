'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import PremiumGate from '@/components/PremiumGate'

interface SpecialtySalary {
  specialty: string
  median: number
  p25: number
  p75: number
  academic: number
  private: number
  employed: number
  locum: number
  growth: string
}

const salaryData: SpecialtySalary[] = [
  { specialty: 'Orthopedic Surgery', median: 611000, p25: 480000, p75: 770000, academic: 450000, private: 720000, employed: 580000, locum: 350, growth: '+4.2%' },
  { specialty: 'Cardiology (Invasive)', median: 590000, p25: 460000, p75: 740000, academic: 420000, private: 690000, employed: 560000, locum: 340, growth: '+3.8%' },
  { specialty: 'Gastroenterology', median: 530000, p25: 410000, p75: 670000, academic: 380000, private: 630000, employed: 500000, locum: 310, growth: '+3.5%' },
  { specialty: 'Urology', median: 505000, p25: 400000, p75: 640000, academic: 370000, private: 610000, employed: 480000, locum: 300, growth: '+3.1%' },
  { specialty: 'Dermatology', median: 480000, p25: 370000, p75: 620000, academic: 350000, private: 590000, employed: 450000, locum: 280, growth: '+2.9%' },
  { specialty: 'Radiology', median: 470000, p25: 380000, p75: 580000, academic: 360000, private: 560000, employed: 450000, locum: 290, growth: '+3.3%' },
  { specialty: 'Anesthesiology', median: 450000, p25: 370000, p75: 560000, academic: 350000, private: 530000, employed: 430000, locum: 275, growth: '+2.7%' },
  { specialty: 'General Surgery', median: 440000, p25: 350000, p75: 560000, academic: 330000, private: 520000, employed: 420000, locum: 270, growth: '+3.0%' },
  { specialty: 'Emergency Medicine', median: 370000, p25: 310000, p75: 440000, academic: 290000, private: 410000, employed: 360000, locum: 240, growth: '+1.8%' },
  { specialty: 'Pulm/Critical Care', median: 418000, p25: 340000, p75: 520000, academic: 310000, private: 490000, employed: 400000, locum: 260, growth: '+3.6%' },
  { specialty: 'Oncology', median: 440000, p25: 350000, p75: 560000, academic: 330000, private: 530000, employed: 420000, locum: 265, growth: '+3.4%' },
  { specialty: 'Neurology', median: 340000, p25: 270000, p75: 420000, academic: 260000, private: 400000, employed: 320000, locum: 230, growth: '+4.0%' },
  { specialty: 'OB/GYN', median: 360000, p25: 290000, p75: 450000, academic: 270000, private: 430000, employed: 340000, locum: 235, growth: '+2.5%' },
  { specialty: 'Psychiatry', median: 310000, p25: 250000, p75: 380000, academic: 240000, private: 360000, employed: 300000, locum: 220, growth: '+5.1%' },
  { specialty: 'Internal Medicine', median: 290000, p25: 240000, p75: 350000, academic: 220000, private: 340000, employed: 280000, locum: 200, growth: '+2.2%' },
  { specialty: 'Family Medicine', median: 265000, p25: 220000, p75: 320000, academic: 210000, private: 310000, employed: 255000, locum: 190, growth: '+2.4%' },
  { specialty: 'Pediatrics', median: 260000, p25: 215000, p75: 315000, academic: 200000, private: 300000, employed: 250000, locum: 185, growth: '+2.0%' },
]

const regionMultipliers: Record<string, number> = {
  'Northeast': 1.05,
  'Southeast': 0.92,
  'Midwest': 0.95,
  'Southwest': 0.97,
  'West Coast': 1.12,
  'Mountain West': 0.98,
  'Pacific Northwest': 1.08,
  'Rural (any)': 1.15,
}

const negotiationTips = [
  { title: 'Know Your Market Value', desc: 'Research specialty-specific salary data for your region. MGMA, Doximity, and Medscape reports are the gold standard.', priority: 'high' },
  { title: 'Negotiate Total Compensation', desc: 'Base salary is only part of the package. Include signing bonus, relocation, CME, retirement match, loan repayment, and partnership track.', priority: 'high' },
  { title: 'Get Everything in Writing', desc: 'Verbal promises mean nothing. Every benefit, timeline, and condition should be in the contract.', priority: 'high' },
  { title: 'Understand RVU Thresholds', desc: 'If compensation is RVU-based, know the median wRVUs for your specialty and negotiate the per-RVU rate and threshold.', priority: 'medium' },
  { title: 'Ask About Partnership Track', desc: 'For private practice, understand buy-in costs, timeline to partnership, and revenue sharing structure.', priority: 'medium' },
  { title: 'Negotiate Non-Compete Carefully', desc: 'Non-compete clauses can limit your future options. Push for shorter duration (1 year) and smaller radius (15-25 miles).', priority: 'high' },
  { title: 'Tail Coverage is Critical', desc: 'Ensure the contract specifies who pays for malpractice tail coverage if you leave. This can cost $50K-200K+.', priority: 'high' },
  { title: 'Leverage Multiple Offers', desc: "Having competing offers is your strongest negotiation tool. Don't bluff — actually pursue multiple opportunities.", priority: 'medium' },
]

function formatSalary(amount: number): string {
  return '$' + amount.toLocaleString()
}

export default function SalaryNegotiatorPage() {
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'calculator' | 'tips'>('benchmarks')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('Midwest')
  const [practiceType, setPracticeType] = useState<'academic' | 'private' | 'employed'>('employed')
  const [sortBy, setSortBy] = useState<'specialty' | 'median'>('median')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // Calculator state
  const [baseSalary, setBaseSalary] = useState('')
  const [signingBonus, setSigningBonus] = useState('')
  const [relocation, setRelocation] = useState('')
  const [cmeAllowance, setCmeAllowance] = useState('')
  const [retirementMatch, setRetirementMatch] = useState('')
  const [loanRepayment, setLoanRepayment] = useState('')
  const [ptoWeeks, setPtoWeeks] = useState('4')

  const sorted = [...salaryData].sort((a, b) => {
    if (sortBy === 'specialty') return sortDir === 'asc' ? a.specialty.localeCompare(b.specialty) : b.specialty.localeCompare(a.specialty)
    return sortDir === 'asc' ? a.median - b.median : b.median - a.median
  })

  const multiplier = regionMultipliers[selectedRegion] || 1
  const spec = salaryData.find(s => s.specialty === selectedSpecialty)

  const totalComp = (() => {
    const base = parseInt(baseSalary) || 0
    const signing = parseInt(signingBonus) || 0
    const relo = parseInt(relocation) || 0
    const cme = parseInt(cmeAllowance) || 0
    const retirement = base * ((parseInt(retirementMatch) || 0) / 100)
    const loan = parseInt(loanRepayment) || 0
    return { base, signing, relo, cme, retirement, loan, total: base + signing + relo + cme + retirement + loan, annual: base + cme + retirement + loan }
  })()

  const tabs = [
    { key: 'benchmarks', label: 'Salary Benchmarks' },
    { key: 'calculator', label: 'Total Comp Calculator' },
    { key: 'tips', label: 'Negotiation Playbook' },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PremiumGate featureName="Salary Negotiator" previewHeight={500}>

      {/* Hero */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">💰</span>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Salary Negotiator</h1>
              <p className="text-red-100 mt-1">Data-driven compensation benchmarks and negotiation strategies</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{salaryData.length}</div>
              <div className="text-xs text-red-100">Specialties</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{Object.keys(regionMultipliers).length}</div>
              <div className="text-xs text-red-100">Regions</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">2025</div>
              <div className="text-xs text-red-100">Data Year</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">⭐</div>
              <div className="text-xs text-red-100">Pro Feature</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 -mt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-red-600 shadow-md border border-gray-200'
                  : 'bg-white/60 text-gray-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Benchmarks Tab */}
        {activeTab === 'benchmarks' && (
          <div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                {Object.keys(regionMultipliers).map(r => <option key={r} value={r}>{r} ({regionMultipliers[r] >= 1 ? '+' : ''}{((regionMultipliers[r] - 1) * 100).toFixed(0)}%)</option>)}
              </select>
              <select value={practiceType} onChange={e => setPracticeType(e.target.value as 'academic' | 'private' | 'employed')} className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                <option value="employed">Employed Practice</option>
                <option value="academic">Academic Medicine</option>
                <option value="private">Private Practice</option>
              </select>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 cursor-pointer hover:text-red-600" onClick={() => { setSortBy('specialty'); setSortDir(sortBy === 'specialty' && sortDir === 'asc' ? 'desc' : 'asc') }}>
                        Specialty {sortBy === 'specialty' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700 cursor-pointer hover:text-red-600" onClick={() => { setSortBy('median'); setSortDir(sortBy === 'median' && sortDir === 'desc' ? 'asc' : 'desc') }}>
                        {practiceType === 'academic' ? 'Academic' : practiceType === 'private' ? 'Private' : 'Employed'} {sortBy === 'median' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell">Region Adjusted</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">25th %ile</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">75th %ile</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">YoY Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((s, i) => {
                      const baseVal = practiceType === 'academic' ? s.academic : practiceType === 'private' ? s.private : s.employed
                      const adjusted = Math.round(baseVal * multiplier)
                      return (
                        <tr key={s.specialty} className={`border-b border-gray-100 hover:bg-red-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="px-4 py-3 font-medium text-gray-900">{s.specialty}</td>
                          <td className="px-4 py-3 text-right font-mono text-gray-700">{formatSalary(baseVal)}</td>
                          <td className="px-4 py-3 text-right font-mono text-red-600 font-semibold hidden sm:table-cell">{formatSalary(adjusted)}</td>
                          <td className="px-4 py-3 text-right font-mono text-gray-500 hidden md:table-cell">{formatSalary(Math.round(s.p25 * multiplier))}</td>
                          <td className="px-4 py-3 text-right font-mono text-gray-500 hidden md:table-cell">{formatSalary(Math.round(s.p75 * multiplier))}</td>
                          <td className="px-4 py-3 text-right hidden lg:table-cell">
                            <span className="text-green-600 font-medium">{s.growth}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Sources: MGMA, Doximity, Medscape Physician Compensation Reports. Data reflects 2024-2025 survey averages. Regional adjustments are approximations.</p>
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Enter Your Offer Details</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Compare to Specialty Benchmark</label>
                <select value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Select specialty...</option>
                  {salaryData.map(s => <option key={s.specialty} value={s.specialty}>{s.specialty}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Base Salary ($)', value: baseSalary, set: setBaseSalary, placeholder: 'e.g. 350000' },
                  { label: 'Signing Bonus ($)', value: signingBonus, set: setSigningBonus, placeholder: 'e.g. 25000' },
                  { label: 'Relocation Allowance ($)', value: relocation, set: setRelocation, placeholder: 'e.g. 10000' },
                  { label: 'Annual CME Allowance ($)', value: cmeAllowance, set: setCmeAllowance, placeholder: 'e.g. 3000' },
                  { label: 'Employer Retirement Match (%)', value: retirementMatch, set: setRetirementMatch, placeholder: 'e.g. 5' },
                  { label: 'Annual Loan Repayment ($)', value: loanRepayment, set: setLoanRepayment, placeholder: 'e.g. 20000' },
                  { label: 'PTO Weeks per Year', value: ptoWeeks, set: setPtoWeeks, placeholder: 'e.g. 4' },
                ].map(field => (
                  <div key={field.label}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    <input
                      type="number"
                      value={field.value}
                      onChange={e => field.set(e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Total Compensation Summary</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Base Salary', value: totalComp.base },
                    { label: 'Signing Bonus (Year 1)', value: totalComp.signing },
                    { label: 'Relocation (Year 1)', value: totalComp.relo },
                    { label: 'CME Allowance', value: totalComp.cme },
                    { label: 'Retirement Match', value: Math.round(totalComp.retirement) },
                    { label: 'Loan Repayment', value: totalComp.loan },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className="font-mono text-sm font-medium">{formatSalary(item.value)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Year 1 Total</span>
                      <span className="font-mono text-lg font-bold text-red-600">{formatSalary(totalComp.total)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-500">Ongoing Annual</span>
                      <span className="font-mono text-sm font-medium text-gray-700">{formatSalary(totalComp.annual)}</span>
                    </div>
                  </div>
                </div>

                {parseInt(ptoWeeks) > 0 && totalComp.base > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Effective Hourly Rate</div>
                    <div className="text-xl font-bold text-gray-900">
                      ${Math.round(totalComp.base / ((52 - parseInt(ptoWeeks)) * 40)).toLocaleString()}/hr
                    </div>
                    <div className="text-xs text-gray-400">Based on {52 - parseInt(ptoWeeks)} working weeks, 40 hrs/week</div>
                  </div>
                )}
              </div>

              {spec && totalComp.base > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-3">vs. {spec.specialty} Benchmarks</h3>
                  <div className="space-y-2">
                    {[
                      { label: '25th Percentile', value: spec.p25 },
                      { label: 'Median', value: spec.median },
                      { label: '75th Percentile', value: spec.p75 },
                    ].map(bench => {
                      const diff = totalComp.base - bench.value
                      return (
                        <div key={bench.label} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{bench.label}: {formatSalary(bench.value)}</span>
                          <span className={`font-medium ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {diff >= 0 ? '+' : ''}{formatSalary(diff)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Negotiation Tips Tab */}
        {activeTab === 'tips' && (
          <div className="space-y-4">
            {negotiationTips.map((tip, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                    tip.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{tip.title}</h3>
                      {tip.priority === 'high' && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Critical</span>}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mt-8">
              <h3 className="font-bold text-red-800 mb-2">Contract Review Checklist</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-red-700">
                {[
                  'Base compensation structure (salary vs RVU)',
                  'Signing bonus and repayment terms',
                  'Non-compete clause (duration & radius)',
                  'Tail coverage responsibility',
                  'Call schedule and compensation',
                  'Partnership track and buy-in terms',
                  'Termination clauses (with/without cause)',
                  'Benefits: health, dental, disability, life',
                  'Malpractice insurance type and limits',
                  'CME time and allowance',
                ].map(item => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="mt-0.5">☐</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEO Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Physician Salary Negotiation Guide</h2>
          <div className="text-sm text-gray-500 space-y-3 max-w-3xl">
            <p>Understanding physician compensation is critical for new attendings entering the job market. Salary varies dramatically by specialty, practice type, and geographic region.</p>
            <p>Key factors affecting physician pay include practice setting (academic vs. private vs. employed), geographic location, call burden, RVU productivity, and years of experience. Our benchmarks draw from major compensation surveys to help you evaluate offers.</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-xs text-gray-400">Salary data is compiled from publicly available physician compensation surveys and may not reflect your specific situation. This tool is for informational purposes only and does not constitute financial or legal advice. Consult with a healthcare attorney or financial advisor for personalized guidance.</p>
        </div>
      </div>
      </PremiumGate>
    </div>
  )
}
