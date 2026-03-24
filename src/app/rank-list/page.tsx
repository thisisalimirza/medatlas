'use client'

import { useState } from 'react'
import Header from '@/components/Header'

interface Program {
  id: string
  rank: number
  programName: string
  specialty: string
  city: string
  state: string
  region: string
  interviewDate?: string
  impression: number
  academicRep: number
  clinicalTraining: number
  location: number
  culture: number
  research: number
  compensation: number
  pros: string[]
  cons: string[]
  notes: string
  doNotRank: boolean
}

const REGIONS = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West Coast', 'Northwest']
const SPECIALTIES = [
  'Internal Medicine', 'Surgery', 'Pediatrics', 'OB/GYN', 'Family Medicine',
  'Emergency Medicine', 'Psychiatry', 'Anesthesiology', 'Radiology', 'Pathology',
  'Neurology', 'Dermatology', 'Orthopedic Surgery', 'Ophthalmology', 'Urology',
  'Otolaryngology', 'Neurosurgery', 'Plastic Surgery', 'PM&R', 'Radiation Oncology'
]

const FACTORS = [
  { key: 'impression' as const, label: 'Overall Impression', icon: '💫' },
  { key: 'academicRep' as const, label: 'Academic Reputation', icon: '🎓' },
  { key: 'clinicalTraining' as const, label: 'Clinical Training', icon: '🏥' },
  { key: 'location' as const, label: 'Location', icon: '📍' },
  { key: 'culture' as const, label: 'Culture & Fit', icon: '🤝' },
  { key: 'research' as const, label: 'Research Opportunities', icon: '🔬' },
  { key: 'compensation' as const, label: 'Compensation & Benefits', icon: '💰' },
]

function generateId() { return Date.now().toString(36) + Math.random().toString(36).substring(2) }

function RatingStars({ value, onChange, size = 'md' }: { value: number; onChange?: (v: number) => void; size?: 'sm' | 'md' }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} onClick={() => onChange?.(i)} disabled={!onChange}
          className={`${size === 'sm' ? 'text-sm' : 'text-lg'} transition-colors ${i <= value ? 'text-yellow-500' : 'text-gray-300'} ${onChange ? 'hover:text-yellow-400 cursor-pointer' : 'cursor-default'}`}>★</button>
      ))}
    </div>
  )
}

function CompositeScore(program: Program) {
  const scores = FACTORS.map(f => program[f.key])
  return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
}

export default function RankListBuilderPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [activeTab, setActiveTab] = useState<'rank-list' | 'add' | 'compare'>('rank-list')
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [sortBy, setSortBy] = useState<'rank' | 'score' | 'name'>('rank')
  const [filterSpecialty, setFilterSpecialty] = useState('all')

  const [form, setForm] = useState({
    programName: '', specialty: 'Internal Medicine', city: '', state: '', region: 'Northeast',
    interviewDate: '', impression: 3, academicRep: 3, clinicalTraining: 3, location: 3,
    culture: 3, research: 3, compensation: 3, pros: [''], cons: [''], notes: '', doNotRank: false
  })

  const addProgram = () => {
    if (!form.programName || !form.city) return
    const newProgram: Program = { ...form, id: generateId(), rank: programs.filter(p => !p.doNotRank).length + 1, pros: form.pros.filter(p => p.trim()), cons: form.cons.filter(c => c.trim()) }
    setPrograms(prev => [...prev, newProgram])
    setForm({ programName: '', specialty: form.specialty, city: '', state: '', region: 'Northeast', interviewDate: '', impression: 3, academicRep: 3, clinicalTraining: 3, location: 3, culture: 3, research: 3, compensation: 3, pros: [''], cons: [''], notes: '', doNotRank: false })
    setActiveTab('rank-list')
  }

  const moveProgram = (id: string, direction: 'up' | 'down') => {
    setPrograms(prev => {
      const ranked = prev.filter(p => !p.doNotRank).sort((a, b) => a.rank - b.rank)
      const unranked = prev.filter(p => p.doNotRank)
      const idx = ranked.findIndex(p => p.id === id)
      if (idx === -1) return prev
      if (direction === 'up' && idx > 0) { [ranked[idx], ranked[idx - 1]] = [ranked[idx - 1], ranked[idx]] }
      else if (direction === 'down' && idx < ranked.length - 1) { [ranked[idx], ranked[idx + 1]] = [ranked[idx + 1], ranked[idx]] }
      return [...ranked.map((p, i) => ({ ...p, rank: i + 1 })), ...unranked]
    })
  }

  const toggleDoNotRank = (id: string) => {
    setPrograms(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, doNotRank: !p.doNotRank } : p)
      const ranked = updated.filter(p => !p.doNotRank).sort((a, b) => a.rank - b.rank)
      return [...ranked.map((p, i) => ({ ...p, rank: i + 1 })), ...updated.filter(p => p.doNotRank)]
    })
  }

  const deleteProgram = (id: string) => {
    setPrograms(prev => {
      const remaining = prev.filter(p => p.id !== id)
      const ranked = remaining.filter(p => !p.doNotRank).sort((a, b) => a.rank - b.rank)
      return [...ranked.map((p, i) => ({ ...p, rank: i + 1 })), ...remaining.filter(p => p.doNotRank)]
    })
    setSelectedProgram(null)
  }

  const rankedPrograms = programs.filter(p => !p.doNotRank).sort((a, b) => {
    if (sortBy === 'score') return parseFloat(CompositeScore(b)) - parseFloat(CompositeScore(a))
    if (sortBy === 'name') return a.programName.localeCompare(b.programName)
    return a.rank - b.rank
  })
  const dnrPrograms = programs.filter(p => p.doNotRank)
  const filteredRanked = filterSpecialty === 'all' ? rankedPrograms : rankedPrograms.filter(p => p.specialty === filterSpecialty)
  const usedSpecialties = [...new Set(programs.map(p => p.specialty))]

  const tabs = [
    { id: 'rank-list' as const, label: 'Rank List', count: rankedPrograms.length },
    { id: 'add' as const, label: '+ Add Program' },
    { id: 'compare' as const, label: 'Compare' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">🎯 Rank List Builder</h1>
            <p className="text-red-100 text-sm md:text-base max-w-2xl">Organize your residency rank list with structured program evaluations and side-by-side comparisons.</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Program Scoring', 'Side-by-Side Compare', 'Drag to Reorder', 'Do Not Rank'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">{rankedPrograms.length}</div>
            <div className="text-xs text-gray-500">Ranked Programs</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{dnrPrograms.length}</div>
            <div className="text-xs text-gray-500">Do Not Rank</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{usedSpecialties.length}</div>
            <div className="text-xs text-gray-500">Specialties</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">{rankedPrograms.length > 0 ? CompositeScore(rankedPrograms.sort((a, b) => parseFloat(CompositeScore(b)) - parseFloat(CompositeScore(a)))[0]) : '—'}</div>
            <div className="text-xs text-gray-500">Top Score</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex gap-0 border-b border-gray-200">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedProgram(null) }}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            {/* Rank List Tab */}
            {activeTab === 'rank-list' && !selectedProgram && (
              <div>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex gap-1.5 flex-wrap">
                    {usedSpecialties.length > 1 && (
                      <>
                        <button onClick={() => setFilterSpecialty('all')} className={`px-3 py-1.5 text-xs rounded-full font-medium ${filterSpecialty === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>All</button>
                        {usedSpecialties.map(s => (
                          <button key={s} onClick={() => setFilterSpecialty(s)} className={`px-3 py-1.5 text-xs rounded-full font-medium ${filterSpecialty === s ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{s}</button>
                        ))}
                      </>
                    )}
                  </div>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs">
                    <option value="rank">By Rank</option><option value="score">By Score</option><option value="name">By Name</option>
                  </select>
                </div>

                {filteredRanked.length === 0 && dnrPrograms.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <div className="text-4xl mb-3">🎯</div>
                    <p>No programs added yet. Start building your rank list!</p>
                    <button onClick={() => setActiveTab('add')} className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Add Your First Program</button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {filteredRanked.map(program => (
                        <div key={program.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <button onClick={() => moveProgram(program.id, 'up')} className="text-gray-400 hover:text-gray-700 text-xs">▲</button>
                              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">{program.rank}</div>
                              <button onClick={() => moveProgram(program.id, 'down')} className="text-gray-400 hover:text-gray-700 text-xs">▼</button>
                            </div>
                            <button onClick={() => setSelectedProgram(program)} className="flex-1 text-left">
                              <h3 className="text-gray-900 font-medium">{program.programName}</h3>
                              <div className="text-xs text-gray-500 mt-0.5">{program.city}, {program.state} • {program.specialty}</div>
                            </button>
                            <div className="text-right hidden sm:block">
                              <div className="text-lg font-bold text-red-600">{CompositeScore(program)}</div>
                              <div className="text-xs text-gray-500">composite</div>
                            </div>
                            <RatingStars value={program.impression} size="sm" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {dnrPrograms.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Do Not Rank ({dnrPrograms.length})</h3>
                        <div className="space-y-2 opacity-60">
                          {dnrPrograms.map(program => (
                            <div key={program.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between">
                              <div>
                                <span className="text-sm text-gray-400 line-through">{program.programName}</span>
                                <span className="text-xs text-gray-400 ml-2">{program.city}, {program.state}</span>
                              </div>
                              <button onClick={() => toggleDoNotRank(program.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">Restore</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                <p className="text-xs text-gray-400 mt-6 text-center">Data stored locally. Sign up for MedAtlas Pro to sync across devices.</p>
              </div>
            )}

            {/* Selected Program Detail */}
            {activeTab === 'rank-list' && selectedProgram && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setSelectedProgram(null)} className="text-sm text-gray-500 hover:text-gray-900">← Back to List</button>
                  <div className="flex gap-2">
                    <button onClick={() => toggleDoNotRank(selectedProgram.id)} className="text-xs text-yellow-600 hover:text-yellow-700 px-3 py-1 border border-yellow-300 rounded-lg">{selectedProgram.doNotRank ? 'Restore to Rank' : 'Do Not Rank'}</button>
                    <button onClick={() => deleteProgram(selectedProgram.id)} className="text-xs text-red-500 hover:text-red-700 px-3 py-1 border border-red-200 rounded-lg">Delete</button>
                  </div>
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedProgram.programName}</h2>
                    <p className="text-sm text-gray-500">{selectedProgram.city}, {selectedProgram.state} • {selectedProgram.region}</p>
                    <p className="text-xs text-gray-400 mt-1">{selectedProgram.specialty}</p>
                  </div>
                  {!selectedProgram.doNotRank && (
                    <div className="text-center"><div className="text-3xl font-bold text-red-600">#{selectedProgram.rank}</div><div className="text-xs text-gray-500">Current Rank</div></div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {FACTORS.map(factor => (
                    <div key={factor.key} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <span className="text-sm text-gray-600">{factor.icon} {factor.label}</span>
                      <RatingStars value={selectedProgram[factor.key]} size="sm" />
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-red-50 rounded-lg p-3 border border-red-200">
                    <span className="text-sm text-red-700 font-medium">Composite Score</span>
                    <span className="text-lg font-bold text-red-600">{CompositeScore(selectedProgram)}/5.0</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {selectedProgram.pros.length > 0 && (
                    <div><h4 className="text-sm font-medium text-green-700 mb-2">Pros</h4>
                      <ul className="space-y-1">{selectedProgram.pros.map((p, i) => <li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-green-600">+</span>{p}</li>)}</ul>
                    </div>
                  )}
                  {selectedProgram.cons.length > 0 && (
                    <div><h4 className="text-sm font-medium text-red-700 mb-2">Cons</h4>
                      <ul className="space-y-1">{selectedProgram.cons.map((c, i) => <li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-red-600">−</span>{c}</li>)}</ul>
                    </div>
                  )}
                </div>
                {selectedProgram.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                    <p className="text-sm text-gray-600">{selectedProgram.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Add Program Tab */}
            {activeTab === 'add' && (
              <div className="max-w-2xl mx-auto space-y-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Program Name</label>
                  <input type="text" value={form.programName} onChange={e => setForm(p => ({ ...p, programName: e.target.value }))} placeholder="e.g., Massachusetts General Hospital" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500 block mb-1">Specialty</label><select value={form.specialty} onChange={e => setForm(p => ({ ...p, specialty: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">{SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div><label className="text-xs text-gray-500 block mb-1">Region</label><select value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">{REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500 block mb-1">City</label><input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Boston" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="text-xs text-gray-500 block mb-1">State</label><input type="text" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} placeholder="MA" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                </div>
                <div><label className="text-xs text-gray-500 block mb-1">Interview Date</label><input type="date" value={form.interviewDate} onChange={e => setForm(p => ({ ...p, interviewDate: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Rate This Program</label>
                  <div className="space-y-2">
                    {FACTORS.map(factor => (
                      <div key={factor.key} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <span className="text-sm text-gray-600">{factor.icon} {factor.label}</span>
                        <RatingStars value={form[factor.key]} onChange={v => setForm(p => ({ ...p, [factor.key]: v }))} />
                      </div>
                    ))}
                  </div>
                </div>
                <div><label className="text-xs text-gray-500 block mb-1">Pros</label>
                  {form.pros.map((pro, i) => (<div key={i} className="flex gap-2 mb-1"><input type="text" value={pro} onChange={e => { const newPros = [...form.pros]; newPros[i] = e.target.value; setForm(p => ({ ...p, pros: newPros })) }} placeholder="Something great about this program" className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />{i === form.pros.length - 1 && <button onClick={() => setForm(p => ({ ...p, pros: [...p.pros, ''] }))} className="text-green-600 text-sm px-2">+</button>}</div>))}
                </div>
                <div><label className="text-xs text-gray-500 block mb-1">Cons</label>
                  {form.cons.map((con, i) => (<div key={i} className="flex gap-2 mb-1"><input type="text" value={con} onChange={e => { const newCons = [...form.cons]; newCons[i] = e.target.value; setForm(p => ({ ...p, cons: newCons })) }} placeholder="Something to consider" className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />{i === form.cons.length - 1 && <button onClick={() => setForm(p => ({ ...p, cons: [...p.cons, ''] }))} className="text-red-600 text-sm px-2">+</button>}</div>))}
                </div>
                <div><label className="text-xs text-gray-500 block mb-1">Notes</label><textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" /></div>
                <div className="flex gap-2">
                  <button onClick={() => setActiveTab('rank-list')} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">Cancel</button>
                  <button onClick={addProgram} disabled={!form.programName || !form.city} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium">Add to Rank List</button>
                </div>
              </div>
            )}

            {/* Compare Tab */}
            {activeTab === 'compare' && (
              <div>
                {rankedPrograms.length < 2 ? (
                  <div className="text-center py-16 text-gray-500"><div className="text-4xl mb-3">📊</div><p>Add at least 2 programs to compare them side by side.</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 text-gray-500 font-medium sticky left-0 bg-white">Factor</th>
                          {rankedPrograms.slice(0, 6).map(p => (
                            <th key={p.id} className="text-center py-3 px-3 min-w-[140px]">
                              <div className="text-red-600 font-bold">#{p.rank}</div>
                              <div className="text-gray-900 text-xs font-medium truncate max-w-[140px]">{p.programName}</div>
                              <div className="text-gray-400 text-xs">{p.city}, {p.state}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {FACTORS.map(factor => (
                          <tr key={factor.key} className="border-b border-gray-100">
                            <td className="py-3 px-2 text-gray-600 sticky left-0 bg-white">{factor.icon} {factor.label}</td>
                            {rankedPrograms.slice(0, 6).map(p => {
                              const val = p[factor.key]
                              return <td key={p.id} className="text-center py-3 px-3"><span className={`font-bold ${val >= 4 ? 'text-green-600' : val >= 3 ? 'text-yellow-600' : 'text-red-600'}`}>{val}/5</span></td>
                            })}
                          </tr>
                        ))}
                        <tr className="border-t-2 border-red-200">
                          <td className="py-3 px-2 text-red-700 font-medium sticky left-0 bg-white">Composite</td>
                          {rankedPrograms.slice(0, 6).map(p => (
                            <td key={p.id} className="text-center py-3 px-3"><span className="text-lg font-bold text-red-600">{CompositeScore(p)}</span></td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-12 mb-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Residency Rank List Strategy</h2>
          <div className="text-sm text-gray-600 space-y-3">
            <p>Building your residency rank list is one of the most important decisions in your medical career. The NRMP Match algorithm is applicant-proposing, which means you should rank programs in your true order of preference — not based on where you think you will match. Our Rank List Builder helps you evaluate programs across multiple dimensions including academic reputation, clinical training quality, location, culture, research opportunities, and compensation.</p>
            <p>Use the structured scoring system to compare programs objectively. Rate each program on seven key factors, track your pros and cons from interview day, and see composite scores to identify which programs truly align with your priorities. The side-by-side comparison view makes it easy to see how your top choices stack up against each other.</p>
            <p>Remember that the Match algorithm guarantees the best possible outcome when you rank honestly by preference. Focus on where you would be happiest for 3-7 years of training, considering factors like call schedule, resident wellness, mentorship, geographic preferences, and partner or family considerations alongside academic factors.</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center pb-8">This tool is for personal organization only. Not affiliated with NRMP, ERAS, or any residency program. Rank list decisions are yours alone.</p>
      </div>
    </div>
  )
}
