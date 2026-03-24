'use client'

import { useState } from 'react'

interface Program {
  id: string
  rank: number
  programName: string
  specialty: string
  city: string
  state: string
  region: string
  interviewDate?: string
  impression: number // 1-5
  academicRep: number // 1-5
  clinicalTraining: number // 1-5
  location: number // 1-5
  culture: number // 1-5
  research: number // 1-5
  compensation: number // 1-5
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

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

function RatingStars({ value, onChange, size = 'md' }: { value: number; onChange?: (v: number) => void; size?: 'sm' | 'md' }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          onClick={() => onChange?.(i)}
          disabled={!onChange}
          className={`${size === 'sm' ? 'text-sm' : 'text-lg'} transition-colors ${i <= value ? 'text-yellow-400' : 'text-gray-700'} ${onChange ? 'hover:text-yellow-300 cursor-pointer' : 'cursor-default'}`}
        >
          ★
        </button>
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

  // New program form state
  const [form, setForm] = useState({
    programName: '', specialty: 'Internal Medicine', city: '', state: '', region: 'Northeast',
    interviewDate: '', impression: 3, academicRep: 3, clinicalTraining: 3, location: 3,
    culture: 3, research: 3, compensation: 3, pros: [''], cons: [''], notes: '', doNotRank: false
  })

  const addProgram = () => {
    if (!form.programName || !form.city) return
    const newProgram: Program = {
      ...form,
      id: generateId(),
      rank: programs.filter(p => !p.doNotRank).length + 1,
      pros: form.pros.filter(p => p.trim()),
      cons: form.cons.filter(c => c.trim()),
    }
    setPrograms(prev => [...prev, newProgram])
    setForm({
      programName: '', specialty: form.specialty, city: '', state: '', region: 'Northeast',
      interviewDate: '', impression: 3, academicRep: 3, clinicalTraining: 3, location: 3,
      culture: 3, research: 3, compensation: 3, pros: [''], cons: [''], notes: '', doNotRank: false
    })
    setActiveTab('rank-list')
  }

  const moveProgram = (id: string, direction: 'up' | 'down') => {
    setPrograms(prev => {
      const ranked = prev.filter(p => !p.doNotRank).sort((a, b) => a.rank - b.rank)
      const unranked = prev.filter(p => p.doNotRank)
      const idx = ranked.findIndex(p => p.id === id)
      if (idx === -1) return prev
      if (direction === 'up' && idx > 0) {
        [ranked[idx], ranked[idx - 1]] = [ranked[idx - 1], ranked[idx]]
      } else if (direction === 'down' && idx < ranked.length - 1) {
        [ranked[idx], ranked[idx + 1]] = [ranked[idx + 1], ranked[idx]]
      }
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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-gray-950 to-purple-900/20" />
        <div className="relative max-w-6xl mx-auto px-4 pt-24 pb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">Rank List Builder</span>
          </h1>
          <p className="text-gray-400 max-w-2xl">Organize your residency rank list with structured program evaluations and side-by-side comparisons.</p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30">
              <div className="text-2xl font-bold text-violet-400">{rankedPrograms.length}</div>
              <div className="text-xs text-gray-500">Ranked Programs</div>
            </div>
            <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30">
              <div className="text-2xl font-bold text-white">{dnrPrograms.length}</div>
              <div className="text-xs text-gray-500">Do Not Rank</div>
            </div>
            <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30">
              <div className="text-2xl font-bold text-yellow-400">{usedSpecialties.length}</div>
              <div className="text-xs text-gray-500">Specialties</div>
            </div>
            <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30">
              <div className="text-2xl font-bold text-purple-400">
                {rankedPrograms.length > 0 ? CompositeScore(rankedPrograms.sort((a, b) => parseFloat(CompositeScore(b)) - parseFloat(CompositeScore(a)))[0]) : '—'}
              </div>
              <div className="text-xs text-gray-500">Top Score</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-800 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedProgram(null) }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-violet-400 text-violet-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}
            </button>
          ))}
        </div>

        {/* Rank List Tab */}
        {activeTab === 'rank-list' && !selectedProgram && (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex gap-2 flex-wrap">
                {usedSpecialties.length > 1 && (
                  <>
                    <button onClick={() => setFilterSpecialty('all')} className={`px-3 py-1.5 text-xs rounded-lg ${filterSpecialty === 'all' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'}`}>All</button>
                    {usedSpecialties.map(s => (
                      <button key={s} onClick={() => setFilterSpecialty(s)} className={`px-3 py-1.5 text-xs rounded-lg ${filterSpecialty === s ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'}`}>{s}</button>
                    ))}
                  </>
                )}
              </div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white">
                <option value="rank">By Rank</option>
                <option value="score">By Score</option>
                <option value="name">By Name</option>
              </select>
            </div>

            {filteredRanked.length === 0 && dnrPrograms.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="text-4xl mb-3">🎯</div>
                <p>No programs added yet. Start building your rank list!</p>
                <button onClick={() => setActiveTab('add')} className="mt-4 px-6 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg text-sm">Add Your First Program</button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {filteredRanked.map(program => (
                    <div key={program.id} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:border-violet-500/50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <button onClick={() => moveProgram(program.id, 'up')} className="text-gray-600 hover:text-white text-xs">▲</button>
                          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm">{program.rank}</div>
                          <button onClick={() => moveProgram(program.id, 'down')} className="text-gray-600 hover:text-white text-xs">▼</button>
                        </div>
                        <button onClick={() => setSelectedProgram(program)} className="flex-1 text-left">
                          <h3 className="text-white font-medium">{program.programName}</h3>
                          <div className="text-xs text-gray-500 mt-0.5">{program.city}, {program.state} • {program.specialty}</div>
                        </button>
                        <div className="text-right hidden sm:block">
                          <div className="text-lg font-bold text-violet-400">{CompositeScore(program)}</div>
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
                        <div key={program.id} className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-3 flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-400 line-through">{program.programName}</span>
                            <span className="text-xs text-gray-600 ml-2">{program.city}, {program.state}</span>
                          </div>
                          <button onClick={() => toggleDoNotRank(program.id)} className="text-xs text-violet-400 hover:text-violet-300">Restore</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <p className="text-xs text-gray-600 mt-6 text-center">Data stored locally. Sign up for MedAtlas Pro to sync across devices.</p>
          </div>
        )}

        {/* Selected Program Detail */}
        {activeTab === 'rank-list' && selectedProgram && (
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setSelectedProgram(null)} className="text-sm text-gray-400 hover:text-white">← Back to List</button>
              <div className="flex gap-2">
                <button onClick={() => toggleDoNotRank(selectedProgram.id)} className="text-xs text-yellow-400 hover:text-yellow-300 px-3 py-1 border border-yellow-500/30 rounded-lg">
                  {selectedProgram.doNotRank ? 'Restore to Rank' : 'Do Not Rank'}
                </button>
                <button onClick={() => deleteProgram(selectedProgram.id)} className="text-xs text-red-400 hover:text-red-300 px-3 py-1 border border-red-500/30 rounded-lg">Delete</button>
              </div>
            </div>

            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedProgram.programName}</h2>
                <p className="text-sm text-gray-400">{selectedProgram.city}, {selectedProgram.state} • {selectedProgram.region}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedProgram.specialty}</p>
              </div>
              {!selectedProgram.doNotRank && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-violet-400">#{selectedProgram.rank}</div>
                  <div className="text-xs text-gray-500">Current Rank</div>
                </div>
              )}
            </div>

            {/* Factor Ratings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {FACTORS.map(factor => (
                <div key={factor.key} className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
                  <span className="text-sm text-gray-400">{factor.icon} {factor.label}</span>
                  <RatingStars value={selectedProgram[factor.key]} size="sm" />
                </div>
              ))}
              <div className="flex items-center justify-between bg-violet-900/20 rounded-lg p-3 border border-violet-500/20">
                <span className="text-sm text-violet-300 font-medium">Composite Score</span>
                <span className="text-lg font-bold text-violet-400">{CompositeScore(selectedProgram)}/5.0</span>
              </div>
            </div>

            {/* Pros/Cons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {selectedProgram.pros.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-green-400 mb-2">Pros</h4>
                  <ul className="space-y-1">
                    {selectedProgram.pros.map((p, i) => <li key={i} className="text-sm text-gray-400 flex gap-2"><span className="text-green-500">+</span>{p}</li>)}
                  </ul>
                </div>
              )}
              {selectedProgram.cons.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-red-400 mb-2">Cons</h4>
                  <ul className="space-y-1">
                    {selectedProgram.cons.map((c, i) => <li key={i} className="text-sm text-gray-400 flex gap-2"><span className="text-red-500">−</span>{c}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {selectedProgram.notes && (
              <div className="bg-gray-900/50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Notes</h4>
                <p className="text-sm text-gray-500">{selectedProgram.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Add Program Tab */}
        {activeTab === 'add' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Add Program to Rank List</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Program Name</label>
                  <input type="text" value={form.programName} onChange={e => setForm(p => ({ ...p, programName: e.target.value }))} placeholder="e.g., Massachusetts General Hospital" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Specialty</label>
                    <select value={form.specialty} onChange={e => setForm(p => ({ ...p, specialty: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
                      {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Region</label>
                    <select value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">City</label>
                    <input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Boston" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">State</label>
                    <input type="text" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} placeholder="MA" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Interview Date</label>
                  <input type="date" value={form.interviewDate} onChange={e => setForm(p => ({ ...p, interviewDate: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>

                {/* Factor Ratings */}
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Rate This Program</label>
                  <div className="space-y-2">
                    {FACTORS.map(factor => (
                      <div key={factor.key} className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
                        <span className="text-sm text-gray-400">{factor.icon} {factor.label}</span>
                        <RatingStars value={form[factor.key]} onChange={v => setForm(p => ({ ...p, [factor.key]: v }))} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pros */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Pros</label>
                  {form.pros.map((pro, i) => (
                    <div key={i} className="flex gap-2 mb-1">
                      <input type="text" value={pro} onChange={e => { const newPros = [...form.pros]; newPros[i] = e.target.value; setForm(p => ({ ...p, pros: newPros })) }} placeholder="Something great about this program" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white" />
                      {i === form.pros.length - 1 && <button onClick={() => setForm(p => ({ ...p, pros: [...p.pros, ''] }))} className="text-green-400 text-sm px-2">+</button>}
                    </div>
                  ))}
                </div>

                {/* Cons */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Cons</label>
                  {form.cons.map((con, i) => (
                    <div key={i} className="flex gap-2 mb-1">
                      <input type="text" value={con} onChange={e => { const newCons = [...form.cons]; newCons[i] = e.target.value; setForm(p => ({ ...p, cons: newCons })) }} placeholder="Something to consider" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white" />
                      {i === form.cons.length - 1 && <button onClick={() => setForm(p => ({ ...p, cons: [...p.cons, ''] }))} className="text-red-400 text-sm px-2">+</button>}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white resize-none" />
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setActiveTab('rank-list')} className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm">Cancel</button>
                  <button onClick={addProgram} disabled={!form.programName || !form.city} className="flex-1 px-4 py-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white rounded-lg text-sm">Add to Rank List</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compare Tab */}
        {activeTab === 'compare' && (
          <div>
            {rankedPrograms.length < 2 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="text-4xl mb-3">📊</div>
                <p>Add at least 2 programs to compare them side by side.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-2 text-gray-500 font-medium sticky left-0 bg-gray-950">Factor</th>
                      {rankedPrograms.slice(0, 6).map(p => (
                        <th key={p.id} className="text-center py-3 px-3 min-w-[140px]">
                          <div className="text-violet-400 font-bold">#{p.rank}</div>
                          <div className="text-white text-xs font-medium truncate max-w-[140px]">{p.programName}</div>
                          <div className="text-gray-600 text-xs">{p.city}, {p.state}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FACTORS.map(factor => (
                      <tr key={factor.key} className="border-b border-gray-800/50">
                        <td className="py-3 px-2 text-gray-400 sticky left-0 bg-gray-950">{factor.icon} {factor.label}</td>
                        {rankedPrograms.slice(0, 6).map(p => {
                          const val = p[factor.key]
                          return (
                            <td key={p.id} className="text-center py-3 px-3">
                              <span className={`font-bold ${val >= 4 ? 'text-green-400' : val >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>{val}/5</span>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                    <tr className="border-t-2 border-violet-500/30">
                      <td className="py-3 px-2 text-violet-300 font-medium sticky left-0 bg-gray-950">Composite</td>
                      {rankedPrograms.slice(0, 6).map(p => (
                        <td key={p.id} className="text-center py-3 px-3">
                          <span className="text-lg font-bold text-violet-400">{CompositeScore(p)}</span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SEO Content */}
        <div className="mt-16 mb-12 border-t border-gray-800 pt-8">
          <h2 className="text-xl font-bold text-gray-300 mb-4">Residency Rank List Strategy</h2>
          <div className="prose prose-invert prose-sm max-w-none text-gray-500 space-y-3">
            <p>Building your residency rank list is one of the most important decisions in your medical career. The NRMP Match algorithm is applicant-proposing, which means you should rank programs in your true order of preference — not based on where you think you will match. Our Rank List Builder helps you evaluate programs across multiple dimensions including academic reputation, clinical training quality, location, culture, research opportunities, and compensation.</p>
            <p>Use the structured scoring system to compare programs objectively. Rate each program on seven key factors, track your pros and cons from interview day, and see composite scores to identify which programs truly align with your priorities. The side-by-side comparison view makes it easy to see how your top choices stack up against each other.</p>
            <p>Remember that the Match algorithm guarantees the best possible outcome when you rank honestly by preference. Focus on where you would be happiest for 3-7 years of training, considering factors like call schedule, resident wellness, mentorship, geographic preferences, and partner or family considerations alongside academic factors.</p>
          </div>
        </div>

        <div className="pb-8">
          <p className="text-xs text-gray-600 text-center">This tool is for personal organization only. Not affiliated with NRMP, ERAS, or any residency program. Rank list decisions are yours alone.</p>
        </div>
      </div>
    </div>
  )
}
