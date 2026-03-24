'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import Header from '@/components/Header'

interface Fellowship {
  id: string
  name: string
  parentSpecialty: string
  duration: string
  positions: number
  competitiveness: 'Very High' | 'High' | 'Moderate' | 'Low'
  salaryRange: string
  description: string
  requirements: string[]
  topPrograms: string[]
}

const fellowshipData: Fellowship[] = [
  {
    id: 'cards', name: 'Cardiovascular Disease', parentSpecialty: 'Internal Medicine', duration: '3 years',
    positions: 870, competitiveness: 'Very High', salaryRange: '$75K-$95K',
    description: 'Training in diagnosis and management of heart and vascular diseases. Subspecialties include interventional, electrophysiology, and advanced heart failure.',
    requirements: ['IM residency completion', 'Strong letters (3-4 from cardiologists)', 'Research publications preferred', 'USMLE Step 3 passed'],
    topPrograms: ['Cleveland Clinic', 'Mayo Clinic', 'Massachusetts General', 'Johns Hopkins', 'UCSF']
  },
  {
    id: 'gi', name: 'Gastroenterology', parentSpecialty: 'Internal Medicine', duration: '3 years',
    positions: 580, competitiveness: 'Very High', salaryRange: '$75K-$90K',
    description: 'Diagnosis and treatment of digestive system disorders. High-demand fellowship with excellent job market and compensation upon completion.',
    requirements: ['IM residency completion', 'Research experience highly valued', 'Strong procedural interest', 'USMLE Step 3 passed'],
    topPrograms: ['Mayo Clinic', 'MGH', 'UCSF', 'Johns Hopkins', 'University of Michigan']
  },
  {
    id: 'pulm-cc', name: 'Pulmonary & Critical Care', parentSpecialty: 'Internal Medicine', duration: '3 years',
    positions: 620, competitiveness: 'High', salaryRange: '$70K-$90K',
    description: 'Management of lung diseases and critically ill patients. Combined training in pulmonary medicine and ICU critical care.',
    requirements: ['IM residency completion', 'ICU rotation experience', 'Research encouraged', 'USMLE Step 3 passed'],
    topPrograms: ['UCSF', 'Johns Hopkins', 'University of Pittsburgh', 'Northwestern', 'Columbia']
  },
  {
    id: 'heme-onc', name: 'Hematology/Oncology', parentSpecialty: 'Internal Medicine', duration: '3 years',
    positions: 580, competitiveness: 'Very High', salaryRange: '$75K-$95K',
    description: 'Diagnosis and treatment of blood disorders and cancers. Growing field with expanding treatment options and research opportunities.',
    requirements: ['IM residency completion', 'Research experience strongly preferred', 'Publications expected', 'USMLE Step 3 passed'],
    topPrograms: ['Dana-Farber/Harvard', 'MD Anderson', 'Memorial Sloan Kettering', 'Mayo Clinic', 'UCSF']
  },
  {
    id: 'endo', name: 'Endocrinology', parentSpecialty: 'Internal Medicine', duration: '2 years',
    positions: 280, competitiveness: 'Moderate', salaryRange: '$70K-$85K',
    description: 'Management of hormonal and metabolic disorders including diabetes, thyroid disease, and osteoporosis.',
    requirements: ['IM residency completion', 'Interest in chronic disease management', 'Research helpful but not required'],
    topPrograms: ['Mayo Clinic', 'UCSF', 'MGH', 'University of Michigan', 'Johns Hopkins']
  },
  {
    id: 'rheum', name: 'Rheumatology', parentSpecialty: 'Internal Medicine', duration: '2 years',
    positions: 220, competitiveness: 'Moderate', salaryRange: '$70K-$85K',
    description: 'Diagnosis and treatment of autoimmune and inflammatory diseases including RA, lupus, and vasculitis.',
    requirements: ['IM residency completion', 'Interest in complex diagnostics', 'Research experience helpful'],
    topPrograms: ['HSS/Cornell', 'Johns Hopkins', 'Mayo Clinic', 'UCSF', 'Brigham & Women\'s']
  },
  {
    id: 'id', name: 'Infectious Disease', parentSpecialty: 'Internal Medicine', duration: '2 years',
    positions: 380, competitiveness: 'Low', salaryRange: '$65K-$80K',
    description: 'Management of complex infections, antimicrobial stewardship, and public health. Positions widely available.',
    requirements: ['IM residency completion', 'Interest in complex diagnostics', 'Research opportunities abundant'],
    topPrograms: ['UCSF', 'Johns Hopkins', 'Emory', 'University of Washington', 'MGH']
  },
  {
    id: 'nephro', name: 'Nephrology', parentSpecialty: 'Internal Medicine', duration: '2 years',
    positions: 430, competitiveness: 'Low', salaryRange: '$70K-$85K',
    description: 'Management of kidney diseases, dialysis, and transplant medicine. High demand for nephrologists nationwide.',
    requirements: ['IM residency completion', 'Interest in physiology', 'Procedural skills helpful'],
    topPrograms: ['UCSF', 'Johns Hopkins', 'Brigham & Women\'s', 'University of Pennsylvania', 'Mayo Clinic']
  },
  {
    id: 'sports', name: 'Sports Medicine', parentSpecialty: 'Multiple (FM, IM, EM, PM&R)', duration: '1 year',
    positions: 260, competitiveness: 'Moderate', salaryRange: '$65K-$80K',
    description: 'Non-operative management of musculoskeletal injuries and sports-related conditions.',
    requirements: ['Residency in FM, IM, EM, or PM&R', 'Interest in MSK medicine', 'Procedural interest helpful'],
    topPrograms: ['Andrews Institute', 'Hospital for Special Surgery', 'Mayo Clinic', 'Stanford', 'Duke']
  },
  {
    id: 'interventional-cards', name: 'Interventional Cardiology', parentSpecialty: 'Cardiology', duration: '1 year',
    positions: 250, competitiveness: 'Very High', salaryRange: '$80K-$100K',
    description: 'Advanced catheter-based treatments for coronary and structural heart disease. Highest-compensated cardiology subspecialty.',
    requirements: ['General cardiology fellowship', 'Strong procedural skills', 'Research publications', 'Excellent cath lab evaluations'],
    topPrograms: ['Cleveland Clinic', 'Columbia', 'Emory', 'Cedars-Sinai', 'Mayo Clinic']
  },
  {
    id: 'ep', name: 'Electrophysiology', parentSpecialty: 'Cardiology', duration: '1-2 years',
    positions: 200, competitiveness: 'High', salaryRange: '$80K-$100K',
    description: 'Diagnosis and treatment of cardiac arrhythmias using ablation, device implantation, and other advanced techniques.',
    requirements: ['General cardiology fellowship', 'Interest in arrhythmia management', 'Research helpful'],
    topPrograms: ['University of Pennsylvania', 'Cleveland Clinic', 'Mayo Clinic', 'Duke', 'MGH']
  },
  {
    id: 'surgical-onc', name: 'Surgical Oncology', parentSpecialty: 'General Surgery', duration: '2 years',
    positions: 90, competitiveness: 'Very High', salaryRange: '$70K-$85K',
    description: 'Complex cancer operations including hepatobiliary, peritoneal, and melanoma surgery.',
    requirements: ['General surgery residency', 'Strong research track record', 'Publications expected', 'Cancer research experience'],
    topPrograms: ['MD Anderson', 'Memorial Sloan Kettering', 'Johns Hopkins', 'University of Pittsburgh', 'Moffitt']
  },
  {
    id: 'mfm', name: 'Maternal-Fetal Medicine', parentSpecialty: 'OB/GYN', duration: '3 years',
    positions: 160, competitiveness: 'High', salaryRange: '$70K-$90K',
    description: 'Management of high-risk pregnancies, prenatal diagnosis, and fetal therapy.',
    requirements: ['OB/GYN residency', 'Research experience', 'Interest in high-risk obstetrics'],
    topPrograms: ['UCSF', 'Columbia', 'University of Pennsylvania', 'Baylor', 'Johns Hopkins']
  },
  {
    id: 'neonatal', name: 'Neonatology', parentSpecialty: 'Pediatrics', duration: '3 years',
    positions: 340, competitiveness: 'Moderate', salaryRange: '$70K-$85K',
    description: 'Intensive care of premature and critically ill newborns. Strong job market with flexible practice settings.',
    requirements: ['Pediatrics residency', 'NICU rotation experience', 'Research encouraged'],
    topPrograms: ['Cincinnati Children\'s', 'Children\'s Hospital of Philadelphia', 'Nationwide Children\'s', 'Boston Children\'s', 'UCSF']
  },
]

export default function FellowshipFinderPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'browse' | 'compare'>('browse')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterParent, setFilterParent] = useState('all')
  const [filterComp, setFilterComp] = useState('all')
  const [expandedFellowship, setExpandedFellowship] = useState<string | null>(null)
  const [compareList, setCompareList] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'positions' | 'competitiveness'>('name')

  if (!user || !user.is_paid) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-6xl mb-6">🏛️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Fellowship Finder</h1>
            <p className="text-lg text-gray-600 mb-8">
              Explore medical fellowship programs across specialties with competitiveness data, requirements, and top programs.
            </p>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {['Browse 14+ fellowship specialties', 'Competitiveness ratings and position counts', 'Requirements and top program listings', 'Side-by-side fellowship comparison', 'Salary ranges and training duration', 'Parent specialty filtering'].map(f => (
                  <div key={f} className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-3">✓</span><span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => window.location.href = '/'} className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors text-lg">
              Upgrade to Pro — $99 Lifetime
            </button>
          </div>
        </div>
      </div>
    )
  }

  const parentSpecialties = ['all', ...Array.from(new Set(fellowshipData.map(f => f.parentSpecialty)))]
  const compLevels = ['all', 'Very High', 'High', 'Moderate', 'Low']

  let filtered = fellowshipData.filter(f => {
    if (searchTerm && !f.name.toLowerCase().includes(searchTerm.toLowerCase()) && !f.parentSpecialty.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (filterParent !== 'all' && f.parentSpecialty !== filterParent) return false
    if (filterComp !== 'all' && f.competitiveness !== filterComp) return false
    return true
  })

  const compOrder = { 'Very High': 4, 'High': 3, 'Moderate': 2, 'Low': 1 }
  filtered = filtered.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'positions') return b.positions - a.positions
    return compOrder[b.competitiveness] - compOrder[a.competitiveness]
  })

  const toggleCompare = (id: string) => {
    setCompareList(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev)
  }

  const compareItems = fellowshipData.filter(f => compareList.includes(f.id))

  const tabs = [
    { key: 'browse', label: 'Browse Fellowships' },
    { key: 'compare', label: `Compare (${compareList.length})` },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🏛️</span>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Fellowship Finder</h1>
              <p className="text-red-100 mt-1">Explore fellowship programs and plan your subspecialty training</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{fellowshipData.length}</div>
              <div className="text-xs text-red-100">Fellowships</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{fellowshipData.reduce((n, f) => n + f.positions, 0).toLocaleString()}</div>
              <div className="text-xs text-red-100">Total Positions</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{parentSpecialties.length - 1}</div>
              <div className="text-xs text-red-100">Parent Specialties</div>
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
        <div className="flex gap-2 overflow-x-auto pb-2">
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
        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search fellowships..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <select value={filterParent} onChange={e => setFilterParent(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                {parentSpecialties.map(p => <option key={p} value={p}>{p === 'all' ? 'All Parent Specialties' : p}</option>)}
              </select>
              <select value={filterComp} onChange={e => setFilterComp(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                {compLevels.map(c => <option key={c} value={c}>{c === 'all' ? 'All Competitiveness' : c}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as 'name' | 'positions' | 'competitiveness')} className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                <option value="name">Sort by Name</option>
                <option value="positions">Sort by Positions</option>
                <option value="competitiveness">Sort by Competitiveness</option>
              </select>
            </div>

            <div className="space-y-4">
              {filtered.map(fellowship => (
                <div key={fellowship.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-gray-900 cursor-pointer hover:text-red-600" onClick={() => setExpandedFellowship(expandedFellowship === fellowship.id ? null : fellowship.id)}>
                            {fellowship.name}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            fellowship.competitiveness === 'Very High' ? 'bg-red-100 text-red-700' :
                            fellowship.competitiveness === 'High' ? 'bg-orange-100 text-orange-700' :
                            fellowship.competitiveness === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {fellowship.competitiveness}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{fellowship.parentSpecialty} · {fellowship.duration} · {fellowship.positions} positions/yr · {fellowship.salaryRange}/yr</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => toggleCompare(fellowship.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                            compareList.includes(fellowship.id)
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                          }`}
                        >
                          {compareList.includes(fellowship.id) ? 'Added' : 'Compare'}
                        </button>
                        <button onClick={() => setExpandedFellowship(expandedFellowship === fellowship.id ? null : fellowship.id)} className="text-gray-400 hover:text-gray-600">
                          {expandedFellowship === fellowship.id ? '▲' : '▼'}
                        </button>
                      </div>
                    </div>

                    {expandedFellowship === fellowship.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 mb-4">{fellowship.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-2">Requirements</h4>
                            <ul className="space-y-1">
                              {fellowship.requirements.map((req, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                  <span className="text-red-500 mt-0.5">•</span>
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-2">Top Programs</h4>
                            <ol className="space-y-1">
                              {fellowship.topPrograms.map((prog, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                  <span className="w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                                  <span>{prog}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-500">No fellowships match your filters.</div>
              )}
            </div>
          </div>
        )}

        {/* Compare Tab */}
        {activeTab === 'compare' && (
          <div>
            {compareItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Select up to 4 fellowships to compare side by side.</p>
                <button onClick={() => setActiveTab('browse')} className="text-red-600 font-medium hover:underline">Browse Fellowships</button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 min-w-[140px]">Attribute</th>
                        {compareItems.map(f => (
                          <th key={f.id} className="text-left px-4 py-3 font-semibold text-gray-900 min-w-[180px]">
                            {f.name}
                            <button onClick={() => toggleCompare(f.id)} className="ml-2 text-xs text-red-500 hover:underline">Remove</button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'Parent Specialty', key: 'parentSpecialty' },
                        { label: 'Duration', key: 'duration' },
                        { label: 'Positions/Year', key: 'positions' },
                        { label: 'Competitiveness', key: 'competitiveness' },
                        { label: 'Salary Range', key: 'salaryRange' },
                      ].map((row, i) => (
                        <tr key={row.key} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="px-4 py-3 font-medium text-gray-700">{row.label}</td>
                          {compareItems.map(f => (
                            <td key={f.id} className="px-4 py-3 text-gray-600">
                              {row.key === 'competitiveness' ? (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  f.competitiveness === 'Very High' ? 'bg-red-100 text-red-700' :
                                  f.competitiveness === 'High' ? 'bg-orange-100 text-orange-700' :
                                  f.competitiveness === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>{f.competitiveness}</span>
                              ) : (
                                String((f as unknown as Record<string, string | number>)[row.key])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-700">Top Programs</td>
                        {compareItems.map(f => (
                          <td key={f.id} className="px-4 py-3 text-gray-600">
                            <ol className="space-y-0.5">
                              {f.topPrograms.slice(0, 3).map((p, i) => (
                                <li key={i} className="text-xs">{i + 1}. {p}</li>
                              ))}
                            </ol>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SEO Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Medical Fellowship Guide</h2>
          <div className="text-sm text-gray-500 space-y-3 max-w-3xl">
            <p>Medical fellowships provide subspecialty training after residency, typically lasting 1-3 years. Choosing the right fellowship depends on your career goals, lifestyle preferences, and competitive profile.</p>
            <p>Factors to consider include program reputation, case volume, research opportunities, faculty mentorship, geographic preferences, and post-fellowship job market strength for that subspecialty.</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-xs text-gray-400">Fellowship data is compiled from NRMP, FREIDA, and publicly available program information. Position counts and competitiveness ratings are approximations based on recent match data. Verify specific program details with official sources.</p>
        </div>
      </div>
    </div>
  )
}
