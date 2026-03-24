'use client'

import { useState } from 'react'
import Header from '@/components/Header'

// NRMP Match data (2024 approximate data from public NRMP reports)
interface SpecialtyMatchData {
  specialty: string
  totalPositions: number
  usMdApplicants: number
  usDoApplicants: number
  imgApplicants: number
  usMdMatchRate: number
  usDoMatchRate: number
  imgMatchRate: number
  avgStep1: string // P/F since 2022
  avgStep2: number
  avgResearchExp: number // research experiences
  avgVolunteerExp: number
  avgPubs: number
  meanPrograms: number // avg programs ranked
  competitiveness: 'Low' | 'Medium' | 'High' | 'Very High'
}

const MATCH_DATA: SpecialtyMatchData[] = [
  { specialty: 'Internal Medicine', totalPositions: 9500, usMdApplicants: 5200, usDoApplicants: 2100, imgApplicants: 8500, usMdMatchRate: 96, usDoMatchRate: 92, imgMatchRate: 52, avgStep1: 'P/F', avgStep2: 235, avgResearchExp: 3, avgVolunteerExp: 5, avgPubs: 2, meanPrograms: 12, competitiveness: 'Low' },
  { specialty: 'Family Medicine', totalPositions: 4800, usMdApplicants: 1800, usDoApplicants: 1900, imgApplicants: 4200, usMdMatchRate: 95, usDoMatchRate: 93, imgMatchRate: 51, avgStep1: 'P/F', avgStep2: 228, avgResearchExp: 2, avgVolunteerExp: 5, avgPubs: 1, meanPrograms: 10, competitiveness: 'Low' },
  { specialty: 'Pediatrics', totalPositions: 2900, usMdApplicants: 2100, usDoApplicants: 600, imgApplicants: 1800, usMdMatchRate: 92, usDoMatchRate: 88, imgMatchRate: 48, avgStep1: 'P/F', avgStep2: 233, avgResearchExp: 3, avgVolunteerExp: 6, avgPubs: 2, meanPrograms: 11, competitiveness: 'Low' },
  { specialty: 'Psychiatry', totalPositions: 2100, usMdApplicants: 1800, usDoApplicants: 700, imgApplicants: 2500, usMdMatchRate: 90, usDoMatchRate: 85, imgMatchRate: 45, avgStep1: 'P/F', avgStep2: 232, avgResearchExp: 3, avgVolunteerExp: 4, avgPubs: 2, meanPrograms: 12, competitiveness: 'Medium' },
  { specialty: 'Emergency Medicine', totalPositions: 2700, usMdApplicants: 2800, usDoApplicants: 1100, imgApplicants: 600, usMdMatchRate: 85, usDoMatchRate: 82, imgMatchRate: 38, avgStep1: 'P/F', avgStep2: 237, avgResearchExp: 3, avgVolunteerExp: 5, avgPubs: 2, meanPrograms: 12, competitiveness: 'Medium' },
  { specialty: 'Anesthesiology', totalPositions: 1900, usMdApplicants: 1700, usDoApplicants: 500, imgApplicants: 1200, usMdMatchRate: 89, usDoMatchRate: 84, imgMatchRate: 42, avgStep1: 'P/F', avgStep2: 240, avgResearchExp: 3, avgVolunteerExp: 4, avgPubs: 3, meanPrograms: 13, competitiveness: 'Medium' },
  { specialty: 'OB/GYN', totalPositions: 1500, usMdApplicants: 1600, usDoApplicants: 400, imgApplicants: 500, usMdMatchRate: 87, usDoMatchRate: 80, imgMatchRate: 35, avgStep1: 'P/F', avgStep2: 239, avgResearchExp: 4, avgVolunteerExp: 5, avgPubs: 3, meanPrograms: 13, competitiveness: 'Medium' },
  { specialty: 'Neurology', totalPositions: 1000, usMdApplicants: 800, usDoApplicants: 250, imgApplicants: 900, usMdMatchRate: 91, usDoMatchRate: 86, imgMatchRate: 46, avgStep1: 'P/F', avgStep2: 236, avgResearchExp: 4, avgVolunteerExp: 4, avgPubs: 3, meanPrograms: 12, competitiveness: 'Medium' },
  { specialty: 'Radiology', totalPositions: 1200, usMdApplicants: 1400, usDoApplicants: 350, imgApplicants: 400, usMdMatchRate: 86, usDoMatchRate: 78, imgMatchRate: 35, avgStep1: 'P/F', avgStep2: 245, avgResearchExp: 5, avgVolunteerExp: 4, avgPubs: 4, meanPrograms: 14, competitiveness: 'High' },
  { specialty: 'General Surgery', totalPositions: 1500, usMdApplicants: 1800, usDoApplicants: 400, imgApplicants: 600, usMdMatchRate: 82, usDoMatchRate: 72, imgMatchRate: 30, avgStep1: 'P/F', avgStep2: 243, avgResearchExp: 5, avgVolunteerExp: 4, avgPubs: 5, meanPrograms: 14, competitiveness: 'High' },
  { specialty: 'Pathology', totalPositions: 600, usMdApplicants: 350, usDoApplicants: 120, imgApplicants: 500, usMdMatchRate: 92, usDoMatchRate: 87, imgMatchRate: 48, avgStep1: 'P/F', avgStep2: 235, avgResearchExp: 4, avgVolunteerExp: 3, avgPubs: 4, meanPrograms: 10, competitiveness: 'Low' },
  { specialty: 'PM&R', totalPositions: 500, usMdApplicants: 400, usDoApplicants: 200, imgApplicants: 350, usMdMatchRate: 88, usDoMatchRate: 83, imgMatchRate: 40, avgStep1: 'P/F', avgStep2: 234, avgResearchExp: 3, avgVolunteerExp: 4, avgPubs: 2, meanPrograms: 11, competitiveness: 'Medium' },
  { specialty: 'Orthopedic Surgery', totalPositions: 870, usMdApplicants: 1200, usDoApplicants: 250, imgApplicants: 100, usMdMatchRate: 72, usDoMatchRate: 55, imgMatchRate: 15, avgStep1: 'P/F', avgStep2: 252, avgResearchExp: 7, avgVolunteerExp: 5, avgPubs: 8, meanPrograms: 16, competitiveness: 'Very High' },
  { specialty: 'Dermatology', totalPositions: 600, usMdApplicants: 900, usDoApplicants: 150, imgApplicants: 100, usMdMatchRate: 68, usDoMatchRate: 45, imgMatchRate: 12, avgStep1: 'P/F', avgStep2: 255, avgResearchExp: 8, avgVolunteerExp: 5, avgPubs: 12, meanPrograms: 15, competitiveness: 'Very High' },
  { specialty: 'Ophthalmology', totalPositions: 520, usMdApplicants: 700, usDoApplicants: 100, imgApplicants: 80, usMdMatchRate: 73, usDoMatchRate: 50, imgMatchRate: 14, avgStep1: 'P/F', avgStep2: 250, avgResearchExp: 7, avgVolunteerExp: 5, avgPubs: 7, meanPrograms: 14, competitiveness: 'Very High' },
  { specialty: 'Otolaryngology', totalPositions: 380, usMdApplicants: 550, usDoApplicants: 80, imgApplicants: 40, usMdMatchRate: 70, usDoMatchRate: 48, imgMatchRate: 12, avgStep1: 'P/F', avgStep2: 251, avgResearchExp: 7, avgVolunteerExp: 5, avgPubs: 8, meanPrograms: 15, competitiveness: 'Very High' },
  { specialty: 'Urology', totalPositions: 380, usMdApplicants: 500, usDoApplicants: 80, imgApplicants: 40, usMdMatchRate: 75, usDoMatchRate: 52, imgMatchRate: 15, avgStep1: 'P/F', avgStep2: 248, avgResearchExp: 6, avgVolunteerExp: 5, avgPubs: 7, meanPrograms: 14, competitiveness: 'Very High' },
  { specialty: 'Neurosurgery', totalPositions: 240, usMdApplicants: 380, usDoApplicants: 40, imgApplicants: 30, usMdMatchRate: 62, usDoMatchRate: 35, imgMatchRate: 10, avgStep1: 'P/F', avgStep2: 252, avgResearchExp: 9, avgVolunteerExp: 4, avgPubs: 12, meanPrograms: 15, competitiveness: 'Very High' },
  { specialty: 'Plastic Surgery', totalPositions: 220, usMdApplicants: 350, usDoApplicants: 30, imgApplicants: 20, usMdMatchRate: 60, usDoMatchRate: 30, imgMatchRate: 8, avgStep1: 'P/F', avgStep2: 253, avgResearchExp: 8, avgVolunteerExp: 4, avgPubs: 10, meanPrograms: 14, competitiveness: 'Very High' },
  { specialty: 'Radiation Oncology', totalPositions: 200, usMdApplicants: 250, usDoApplicants: 30, imgApplicants: 40, usMdMatchRate: 78, usDoMatchRate: 55, imgMatchRate: 20, avgStep1: 'P/F', avgStep2: 248, avgResearchExp: 7, avgVolunteerExp: 3, avgPubs: 8, meanPrograms: 12, competitiveness: 'High' },
]

function BarChart({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${(value / max) * 100}%` }} />
    </div>
  )
}

function CompetitivenessTag({ level }: { level: string }) {
  const colors: Record<string, string> = {
    'Low': 'bg-green-100 text-green-700',
    'Medium': 'bg-yellow-100 text-yellow-700',
    'High': 'bg-orange-100 text-orange-700',
    'Very High': 'bg-red-100 text-red-700',
  }
  return <span className={`text-xs px-2 py-0.5 rounded-full ${colors[level] || 'bg-gray-500/20 text-gray-500'}`}>{level}</span>
}

export default function MatchStatsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'compare' | 'calculator'>('overview')
  const [sortBy, setSortBy] = useState<'specialty' | 'matchRate' | 'competitiveness' | 'positions' | 'step2'>('competitiveness')
  const [applicantType, setApplicantType] = useState<'usMd' | 'usDo' | 'img'>('usMd')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])

  // Calculator state
  const [calcSpecialty, setCalcSpecialty] = useState('Internal Medicine')
  const [calcType, setCalcType] = useState<'usMd' | 'usDo' | 'img'>('usMd')
  const [calcStep2, setCalcStep2] = useState('')
  const [calcPubs, setCalcPubs] = useState('')
  const [calcResearch, setCalcResearch] = useState('')

  const sortedData = [...MATCH_DATA].sort((a, b) => {
    if (sortBy === 'specialty') return a.specialty.localeCompare(b.specialty)
    if (sortBy === 'matchRate') {
      const rateKey = applicantType === 'usMd' ? 'usMdMatchRate' : applicantType === 'usDo' ? 'usDoMatchRate' : 'imgMatchRate'
      return b[rateKey] - a[rateKey]
    }
    if (sortBy === 'positions') return b.totalPositions - a.totalPositions
    if (sortBy === 'step2') return b.avgStep2 - a.avgStep2
    // competitiveness
    const order = { 'Very High': 4, 'High': 3, 'Medium': 2, 'Low': 1 }
    return order[b.competitiveness] - order[a.competitiveness]
  })

  const toggleSpecialty = (s: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : prev.length < 4 ? [...prev, s] : prev
    )
  }

  // Simple match probability estimate
  const calcProbability = () => {
    const data = MATCH_DATA.find(d => d.specialty === calcSpecialty)
    if (!data) return null
    const baseRate = calcType === 'usMd' ? data.usMdMatchRate : calcType === 'usDo' ? data.usDoMatchRate : data.imgMatchRate

    let modifier = 0
    const step2 = parseInt(calcStep2)
    if (step2) {
      if (step2 > data.avgStep2 + 10) modifier += 5
      else if (step2 > data.avgStep2) modifier += 2
      else if (step2 < data.avgStep2 - 10) modifier -= 8
      else if (step2 < data.avgStep2) modifier -= 3
    }

    const pubs = parseInt(calcPubs)
    if (pubs) {
      if (pubs > data.avgPubs + 3) modifier += 4
      else if (pubs > data.avgPubs) modifier += 2
      else if (pubs < data.avgPubs - 2) modifier -= 3
    }

    const research = parseInt(calcResearch)
    if (research) {
      if (research > data.avgResearchExp + 2) modifier += 3
      else if (research > data.avgResearchExp) modifier += 1
      else if (research < data.avgResearchExp - 2) modifier -= 2
    }

    return Math.min(99, Math.max(5, baseRate + modifier))
  }

  const probability = calcProbability()

  const tabs = [
    { id: 'overview' as const, label: 'Match Data Overview' },
    { id: 'compare' as const, label: 'Compare Specialties' },
    { id: 'calculator' as const, label: 'Match Calculator' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">📈 Match Analytics</h1>
            <p className="text-red-100 text-sm md:text-base max-w-2xl">Explore residency match statistics across 20 specialties. Compare match rates, Step 2 averages, research expectations, and more.</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['20 Specialties', 'Match Rates', 'Step 2 Averages', 'IMG Data', 'Match Calculator'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">20</div>
            <div className="text-xs text-gray-500">Specialties Tracked</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{MATCH_DATA.reduce((s, d) => s + d.totalPositions, 0).toLocaleString()}</div>
            <div className="text-xs text-gray-500">Total Positions</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">2024</div>
            <div className="text-xs text-gray-500">Data Year</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">3</div>
            <div className="text-xs text-gray-500">Applicant Types</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex gap-0 border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'usMd' as const, label: 'US MD' },
                  { key: 'usDo' as const, label: 'US DO' },
                  { key: 'img' as const, label: 'IMG' },
                ].map(t => (
                  <button key={t.key} onClick={() => setApplicantType(t.key)} className={`px-3 py-1.5 text-xs rounded-md transition-colors ${applicantType === t.key ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}>{t.label}</button>
                ))}
              </div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs">
                <option value="competitiveness">Sort by Competitiveness</option>
                <option value="matchRate">Sort by Match Rate</option>
                <option value="positions">Sort by Positions</option>
                <option value="step2">Sort by Avg Step 2</option>
                <option value="specialty">Sort by Name</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="text-left py-3 px-2 font-medium">Specialty</th>
                    <th className="text-center py-3 px-2 font-medium">Positions</th>
                    <th className="text-center py-3 px-2 font-medium">Match Rate</th>
                    <th className="text-center py-3 px-2 font-medium hidden sm:table-cell">Avg Step 2</th>
                    <th className="text-center py-3 px-2 font-medium hidden md:table-cell">Avg Pubs</th>
                    <th className="text-center py-3 px-2 font-medium hidden md:table-cell">Programs Ranked</th>
                    <th className="text-center py-3 px-2 font-medium">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map(d => {
                    const matchRate = applicantType === 'usMd' ? d.usMdMatchRate : applicantType === 'usDo' ? d.usDoMatchRate : d.imgMatchRate
                    return (
                      <tr key={d.specialty} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium text-gray-900">{d.specialty}</td>
                        <td className="text-center py-3 px-2 text-gray-500">{d.totalPositions.toLocaleString()}</td>
                        <td className="text-center py-3 px-2">
                          <span className={`font-bold ${matchRate >= 85 ? 'text-green-600' : matchRate >= 70 ? 'text-yellow-600' : matchRate >= 50 ? 'text-orange-600' : 'text-red-600'}`}>{matchRate}%</span>
                        </td>
                        <td className="text-center py-3 px-2 text-gray-500 hidden sm:table-cell">{d.avgStep2}</td>
                        <td className="text-center py-3 px-2 text-gray-500 hidden md:table-cell">{d.avgPubs}</td>
                        <td className="text-center py-3 px-2 text-gray-500 hidden md:table-cell">{d.meanPrograms}</td>
                        <td className="text-center py-3 px-2"><CompetitivenessTag level={d.competitiveness} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Compare Tab */}
        {activeTab === 'compare' && (
          <div>
            <p className="text-sm text-gray-500 mb-4">Select up to 4 specialties to compare side-by-side.</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {MATCH_DATA.map(d => (
                <button
                  key={d.specialty}
                  onClick={() => toggleSpecialty(d.specialty)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    selectedSpecialties.includes(d.specialty)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {d.specialty}
                </button>
              ))}
            </div>

            {selectedSpecialties.length < 2 ? (
              <div className="text-center py-12 text-gray-500">Select at least 2 specialties to compare.</div>
            ) : (
              <div className="space-y-6">
                {/* Match Rates Comparison */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">Match Rates by Applicant Type</h3>
                  <div className="space-y-4">
                    {selectedSpecialties.map(s => {
                      const d = MATCH_DATA.find(x => x.specialty === s)!
                      return (
                        <div key={s}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white font-medium">{s}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <div className="flex justify-between text-xs text-gray-500 mb-0.5"><span>US MD</span><span>{d.usMdMatchRate}%</span></div>
                              <BarChart value={d.usMdMatchRate} max={100} color="bg-blue-500" />
                            </div>
                            <div>
                              <div className="flex justify-between text-xs text-gray-500 mb-0.5"><span>US DO</span><span>{d.usDoMatchRate}%</span></div>
                              <BarChart value={d.usDoMatchRate} max={100} color="bg-green-500" />
                            </div>
                            <div>
                              <div className="flex justify-between text-xs text-gray-500 mb-0.5"><span>IMG</span><span>{d.imgMatchRate}%</span></div>
                              <BarChart value={d.imgMatchRate} max={100} color="bg-orange-500" />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Stats Comparison Table */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 overflow-x-auto">
                  <h3 className="text-lg font-bold mb-4">Detailed Comparison</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2 text-gray-500">Metric</th>
                        {selectedSpecialties.map(s => (
                          <th key={s} className="text-center py-2 px-3 text-red-600 font-medium">{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {[
                        { label: 'Total Positions', key: 'totalPositions', fmt: (v: number) => v.toLocaleString() },
                        { label: 'Avg Step 2', key: 'avgStep2', fmt: (v: number) => v.toString() },
                        { label: 'Avg Publications', key: 'avgPubs', fmt: (v: number) => v.toString() },
                        { label: 'Avg Research Exp', key: 'avgResearchExp', fmt: (v: number) => v.toString() },
                        { label: 'Programs Ranked', key: 'meanPrograms', fmt: (v: number) => v.toString() },
                        { label: 'US MD Match Rate', key: 'usMdMatchRate', fmt: (v: number) => `${v}%` },
                        { label: 'US DO Match Rate', key: 'usDoMatchRate', fmt: (v: number) => `${v}%` },
                        { label: 'IMG Match Rate', key: 'imgMatchRate', fmt: (v: number) => `${v}%` },
                      ].map(row => (
                        <tr key={row.label} className="border-b border-gray-100">
                          <td className="py-2 px-2 text-gray-500">{row.label}</td>
                          {selectedSpecialties.map(s => {
                            const d = MATCH_DATA.find(x => x.specialty === s)!
                            return <td key={s} className="text-center py-2 px-3">{row.fmt((d as unknown as Record<string, number>)[row.key])}</td>
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-1">Match Probability Estimator</h2>
              <p className="text-xs text-gray-500 mb-6">Get a rough estimate of your competitiveness. This is for guidance only — many factors influence match outcomes.</p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Target Specialty</label>
                  <select value={calcSpecialty} onChange={e => setCalcSpecialty(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent">
                    {MATCH_DATA.map(d => <option key={d.specialty} value={d.specialty}>{d.specialty}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">Applicant Type</label>
                  <div className="flex gap-2">
                    {[
                      { key: 'usMd' as const, label: 'US MD' },
                      { key: 'usDo' as const, label: 'US DO' },
                      { key: 'img' as const, label: 'IMG' },
                    ].map(t => (
                      <button key={t.key} onClick={() => setCalcType(t.key)} className={`flex-1 py-2 rounded-lg text-sm transition-colors ${calcType === t.key ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>{t.label}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">Step 2 CK Score</label>
                  <input type="number" value={calcStep2} onChange={e => setCalcStep2(e.target.value)} placeholder={`Avg for ${calcSpecialty}: ${MATCH_DATA.find(d => d.specialty === calcSpecialty)?.avgStep2}`} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Number of Publications</label>
                    <input type="number" value={calcPubs} onChange={e => setCalcPubs(e.target.value)} placeholder={`Avg: ${MATCH_DATA.find(d => d.specialty === calcSpecialty)?.avgPubs}`} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Research Experiences</label>
                    <input type="number" value={calcResearch} onChange={e => setCalcResearch(e.target.value)} placeholder={`Avg: ${MATCH_DATA.find(d => d.specialty === calcSpecialty)?.avgResearchExp}`} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                </div>

                {/* Result */}
                {probability !== null && (
                  <div className="mt-4 bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Estimated Match Probability</div>
                    <div className={`text-5xl font-bold mb-2 ${probability >= 80 ? 'text-green-600' : probability >= 60 ? 'text-yellow-600' : probability >= 40 ? 'text-orange-600' : 'text-red-600'}`}>
                      {probability}%
                    </div>
                    <div className="text-xs text-gray-500">for {calcSpecialty} as {calcType === 'usMd' ? 'US MD' : calcType === 'usDo' ? 'US DO' : 'IMG'}</div>
                    <BarChart value={probability} max={100} color={probability >= 80 ? 'bg-green-500' : probability >= 60 ? 'bg-yellow-500' : probability >= 40 ? 'bg-orange-500' : 'bg-red-500'} />
                  </div>
                )}

                <p className="text-xs text-gray-600 text-center">This is a simplified estimate. Actual match outcomes depend on many factors including letters of rec, personal statement, interview performance, and program preferences.</p>
              </div>
            </div>
          </div>
        )}

        </div>
        </div>

        {/* SEO Content */}
        <div className="mt-12 mb-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Understanding the Residency Match</h2>
          <div className="text-sm text-gray-600 space-y-3">
            <p>The NRMP Main Residency Match is the process through which medical school graduates secure residency positions in the United States. Understanding match statistics is crucial for making informed decisions about your medical career. Our Match Analytics tool provides comprehensive data on match rates, average Step 2 CK scores, research expectations, and competitiveness levels across 20 medical specialties.</p>
            <p>Match rates vary significantly by applicant type. US MD graduates generally have the highest match rates, followed by US DO graduates. International Medical Graduates (IMGs) face additional challenges but can successfully match in many specialties, particularly in primary care fields like Internal Medicine and Family Medicine. Knowing these statistics helps you set realistic expectations and strengthen your application accordingly.</p>
            <p>Step 2 CK scores have become increasingly important since Step 1 transitioned to Pass/Fail in January 2022. Competitive specialties like Dermatology, Orthopedic Surgery, and Neurosurgery typically require scores well above 250, along with significant research publications and clinical experience. Use our Match Probability Calculator to get a rough estimate of your competitiveness for your target specialty.</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center pb-8">Data is approximate and based on publicly available NRMP reports. Not affiliated with NRMP, AAMC, or ERAS. For official match data, visit nrmp.org.</p>
      </div>
    </div>
  )
}
