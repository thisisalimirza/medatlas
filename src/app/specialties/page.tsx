'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/Header'
import { specialties, Specialty, formatSalary, getCompetitivenessLabel, getLifestyleLabel } from '@/lib/specialties/data'

type SortKey = 'name' | 'avgSalary' | 'competitiveness' | 'lifestyle' | 'matchRate2024' | 'avgHoursPerWeek' | 'residencyLength'
type FilterCategory = 'all' | 'surgical' | 'medical' | 'diagnostic' | 'support'
type View = 'grid' | 'compare' | 'detail'

function RatingDots({ value, max = 5, color = 'bg-red-500' }: { value: number; max?: number; color?: string }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < value ? color : 'bg-gray-200'}`} />
      ))}
    </div>
  )
}

function StatBar({ label, value, max, format = 'number' }: { label: string; value: number; max: number; format?: 'number' | 'salary' | 'percent' | 'hours' }) {
  const pct = Math.min((value / max) * 100, 100)
  const display = format === 'salary' ? formatSalary(value) :
    format === 'percent' ? `${value}%` :
    format === 'hours' ? `${value}h/wk` : value.toString()
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{display}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function SpecialtyCard({ specialty, onSelect, isCompareSelected, onToggleCompare }: {
  specialty: Specialty
  onSelect: () => void
  isCompareSelected: boolean
  onToggleCompare: () => void
}) {
  const categoryColors = {
    surgical: 'bg-red-50 text-red-700 border-red-200',
    medical: 'bg-blue-50 text-blue-700 border-blue-200',
    diagnostic: 'bg-purple-50 text-purple-700 border-purple-200',
    support: 'bg-green-50 text-green-700 border-green-200',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-200 overflow-hidden group">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryColors[specialty.category]}`}>
                {specialty.category}
              </span>
              {specialty.imgFriendly && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">
                  IMG-OK
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-red-600 transition-colors cursor-pointer" onClick={onSelect}>
              {specialty.name}
            </h3>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleCompare() }}
            className={`ml-2 p-1.5 rounded-lg border transition-all text-xs font-medium ${
              isCompareSelected
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-gray-400 border-gray-200 hover:border-red-300 hover:text-red-500'
            }`}
            title={isCompareSelected ? 'Remove from comparison' : 'Add to comparison'}
          >
            {isCompareSelected ? '✓' : '+'}
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{specialty.description}</p>

        <div className="space-y-2.5">
          <StatBar label="Avg Salary" value={specialty.avgSalary} max={900000} format="salary" />
          <StatBar label="Match Rate" value={specialty.matchRate2024} max={100} format="percent" />
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Competitiveness</div>
            <RatingDots value={specialty.competitiveness} />
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Lifestyle</div>
            <RatingDots value={specialty.lifestyle} color="bg-green-500" />
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Procedural</div>
            <RatingDots value={specialty.procedural} color="bg-blue-500" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <span>{specialty.residencyLength}yr residency</span>
          <span>{specialty.avgHoursPerWeek}h/week</span>
          <span>{specialty.positions2024.toLocaleString()} spots</span>
        </div>
      </div>
    </div>
  )
}

function SpecialtyDetail({ specialty, onBack }: { specialty: Specialty; onBack: () => void }) {
  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 mb-6 transition-colors">
        ← Back to all specialties
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 md:p-8 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
              {specialty.category}
            </span>
            {specialty.imgFriendly && (
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-400/30">
                IMG-Friendly
              </span>
            )}
            <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              specialty.growthOutlook === 'rapid-growth' ? 'bg-green-400/30' :
              specialty.growthOutlook === 'growing' ? 'bg-blue-400/30' :
              specialty.growthOutlook === 'stable' ? 'bg-yellow-400/30' : 'bg-red-400/30'
            }`}>
              {specialty.growthOutlook.replace('-', ' ')}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{specialty.name}</h1>
          <p className="text-red-100 text-sm md:text-base max-w-2xl">{specialty.description}</p>
        </div>

        <div className="p-6 md:p-8">
          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Avg Salary', value: formatSalary(specialty.avgSalary), sub: `${formatSalary(specialty.salaryRange[0])} – ${formatSalary(specialty.salaryRange[1])}` },
              { label: 'Match Rate', value: `${specialty.matchRate2024}%`, sub: `${specialty.positions2024.toLocaleString()} positions` },
              { label: 'Residency', value: `${specialty.residencyLength} years`, sub: specialty.fellowshipLength ? `+${specialty.fellowshipLength}yr fellowship` : 'No fellowship required' },
              { label: 'Hours/Week', value: `${specialty.avgHoursPerWeek}h`, sub: specialty.callFrequency },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Ratings */}
          <h2 className="text-lg font-bold text-gray-900 mb-4">Specialty Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[
              { label: 'Competitiveness', value: specialty.competitiveness, desc: getCompetitivenessLabel(specialty.competitiveness), color: 'bg-red-500' },
              { label: 'Lifestyle', value: specialty.lifestyle, desc: getLifestyleLabel(specialty.lifestyle), color: 'bg-green-500' },
              { label: 'Research Importance', value: specialty.researchImportance, desc: ['', 'Minimal', 'Low', 'Moderate', 'Important', 'Critical'][specialty.researchImportance], color: 'bg-purple-500' },
              { label: 'Patient Contact', value: specialty.patientContact, desc: ['', 'Minimal', 'Low', 'Moderate', 'High', 'Very High'][specialty.patientContact], color: 'bg-blue-500' },
              { label: 'Procedural', value: specialty.procedural, desc: ['', 'Non-procedural', 'Light', 'Moderate', 'Heavy', 'Primarily procedural'][specialty.procedural], color: 'bg-orange-500' },
            ].map((rating) => (
              <div key={rating.label} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">{rating.label}</div>
                  <div className="text-xs text-gray-500">{rating.desc}</div>
                </div>
                <RatingDots value={rating.value} color={rating.color} />
              </div>
            ))}
          </div>

          {/* Day in the Life */}
          <h2 className="text-lg font-bold text-gray-900 mb-3">A Day in the Life</h2>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 mb-8 leading-relaxed">{specialty.dayInLife}</p>

          {/* Additional Stats */}
          <h2 className="text-lg font-bold text-gray-900 mb-4">Demographics & Wellness</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Burnout Rate</div>
              <div className="text-xl font-bold text-gray-900">{specialty.burnoutRate}%</div>
              <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div className={`h-full rounded-full ${specialty.burnoutRate > 50 ? 'bg-red-500' : specialty.burnoutRate > 40 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${specialty.burnoutRate}%` }} />
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Gender Split</div>
              <div className="text-sm font-semibold text-gray-900 mt-1">♂ {specialty.genderDistribution.male}% / ♀ {specialty.genderDistribution.female}%</div>
              <div className="flex h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-400 h-full" style={{ width: `${specialty.genderDistribution.male}%` }} />
                <div className="bg-pink-400 h-full" style={{ width: `${specialty.genderDistribution.female}%` }} />
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Avg Step 2 CK Score</div>
              <div className="text-xl font-bold text-gray-900">{specialty.avgStepScore}</div>
              <div className="text-xs text-gray-500 mt-1">For matched applicants</div>
            </div>
          </div>

          {/* Fellowships */}
          {specialty.topFellowships.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Fellowship Opportunities</h2>
              <div className="flex flex-wrap gap-2">
                {specialty.topFellowships.map((f) => (
                  <span key={f} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Key Characteristics</h2>
            <div className="flex flex-wrap gap-2">
              {specialty.tags.map((tag) => (
                <span key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CompareView({ selected, onRemove, onBack }: { selected: Specialty[]; onRemove: (id: string) => void; onBack: () => void }) {
  if (selected.length < 2) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">⚖️</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Select at least 2 specialties to compare</h3>
        <p className="text-gray-600 text-sm mb-4">Use the + button on specialty cards to add them</p>
        <button onClick={onBack} className="text-red-600 text-sm font-medium hover:underline">← Back to grid</button>
      </div>
    )
  }

  const rows: { label: string; render: (s: Specialty) => React.ReactNode }[] = [
    { label: 'Category', render: (s) => <span className="capitalize">{s.category}</span> },
    { label: 'Avg Salary', render: (s) => <span className="font-bold text-green-700">{formatSalary(s.avgSalary)}</span> },
    { label: 'Salary Range', render: (s) => `${formatSalary(s.salaryRange[0])} – ${formatSalary(s.salaryRange[1])}` },
    { label: 'Match Rate', render: (s) => `${s.matchRate2024}%` },
    { label: 'Positions', render: (s) => s.positions2024.toLocaleString() },
    { label: 'Residency', render: (s) => `${s.residencyLength} years` },
    { label: 'Hours/Week', render: (s) => `${s.avgHoursPerWeek}h` },
    { label: 'Avg Step 2 CK', render: (s) => s.avgStepScore.toString() },
    { label: 'Competitiveness', render: (s) => <RatingDots value={s.competitiveness} /> },
    { label: 'Lifestyle', render: (s) => <RatingDots value={s.lifestyle} color="bg-green-500" /> },
    { label: 'Research', render: (s) => <RatingDots value={s.researchImportance} color="bg-purple-500" /> },
    { label: 'Patient Contact', render: (s) => <RatingDots value={s.patientContact} color="bg-blue-500" /> },
    { label: 'Procedural', render: (s) => <RatingDots value={s.procedural} color="bg-orange-500" /> },
    { label: 'Burnout Rate', render: (s) => `${s.burnoutRate}%` },
    { label: 'Call', render: (s) => s.callFrequency },
    { label: 'IMG-Friendly', render: (s) => s.imgFriendly ? '✅ Yes' : '❌ No' },
    { label: 'Growth', render: (s) => <span className="capitalize">{s.growthOutlook.replace('-', ' ')}</span> },
  ]

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 mb-4 transition-colors">
        ← Back to all specialties
      </button>
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left p-3 bg-gray-50 rounded-tl-lg font-medium text-gray-600 sticky left-0 bg-gray-50 min-w-[120px]">Metric</th>
              {selected.map((s) => (
                <th key={s.id} className="p-3 bg-gray-50 text-left min-w-[180px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{s.name}</span>
                    <button onClick={() => onRemove(s.id)} className="text-gray-400 hover:text-red-500 text-xs ml-2">✕</button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="p-3 font-medium text-gray-600 sticky left-0 bg-inherit">{row.label}</td>
                {selected.map((s) => (
                  <td key={s.id} className="p-3 text-gray-900">{row.render(s)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function SpecialtyExplorerPage() {
  const [view, setView] = useState<View>('grid')
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null)
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortKey>('avgSalary')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterIMG, setFilterIMG] = useState(false)

  const filteredSpecialties = useMemo(() => {
    let result = [...specialties]

    if (filterCategory !== 'all') {
      result = result.filter(s => s.category === filterCategory)
    }
    if (filterIMG) {
      result = result.filter(s => s.imgFriendly)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.includes(q)) ||
        s.topFellowships.some(f => f.toLowerCase().includes(q))
      )
    }

    result.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'desc' ? bVal - aVal : aVal - bVal
      }
      return sortDir === 'desc'
        ? String(bVal).localeCompare(String(aVal))
        : String(aVal).localeCompare(String(bVal))
    })

    return result
  }, [filterCategory, filterIMG, searchQuery, sortBy, sortDir])

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < 5) next.add(id)
      return next
    })
  }

  const handleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(key); setSortDir('desc') }
  }

  // Detail view
  if (view === 'detail' && selectedSpecialty) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SpecialtyDetail specialty={selectedSpecialty} onBack={() => { setView('grid'); setSelectedSpecialty(null) }} />
        </div>
      </div>
    )
  }

  // Compare view
  if (view === 'compare') {
    const selectedSpecs = specialties.filter(s => compareIds.has(s.id))
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">⚖️ Specialty Comparison</h1>
          <p className="text-gray-600 mb-6">Side-by-side comparison of {selectedSpecs.length} specialties</p>
          <CompareView
            selected={selectedSpecs}
            onRemove={(id) => toggleCompare(id)}
            onBack={() => setView('grid')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">🎓 Specialty Explorer</h1>
            <p className="text-red-100 text-sm md:text-base max-w-2xl">
              Compare {specialties.length} medical specialties by salary, competitiveness, lifestyle, match rates, and more.
              Built from NRMP Match data, AAMC surveys, and Medscape compensation reports.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Match Data', 'Salary Ranges', 'Lifestyle Ratings', 'IMG Info', 'Fellowship Paths', 'Side-by-Side Compare'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search specialties, fellowships, tags..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'surgical', 'medical', 'diagnostic', 'support'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filterCategory === cat
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* IMG filter */}
            <button
              onClick={() => setFilterIMG(!filterIMG)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                filterIMG
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
              }`}
            >
              🌍 IMG-Friendly
            </button>
          </div>

          {/* Sort controls */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Sort by:</span>
            {([
              ['avgSalary', 'Salary'],
              ['competitiveness', 'Competitiveness'],
              ['lifestyle', 'Lifestyle'],
              ['matchRate2024', 'Match Rate'],
              ['avgHoursPerWeek', 'Hours'],
              ['residencyLength', 'Training Length'],
              ['name', 'Name'],
            ] as [SortKey, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => handleSort(key)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  sortBy === key ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {label} {sortBy === key && (sortDir === 'desc' ? '↓' : '↑')}
              </button>
            ))}
          </div>
        </div>

        {/* Compare bar */}
        {compareIds.size > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-red-800">{compareIds.size} selected for comparison</span>
              <button onClick={() => setCompareIds(new Set())} className="text-xs text-red-600 hover:underline">(clear)</button>
            </div>
            <button
              onClick={() => setView('compare')}
              className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Compare Now →
            </button>
          </div>
        )}

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">{filteredSpecialties.length} specialties found</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredSpecialties.map(specialty => (
            <SpecialtyCard
              key={specialty.id}
              specialty={specialty}
              onSelect={() => { setSelectedSpecialty(specialty); setView('detail') }}
              isCompareSelected={compareIds.has(specialty.id)}
              onToggleCompare={() => toggleCompare(specialty.id)}
            />
          ))}
        </div>

        {filteredSpecialties.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium mb-2">No specialties match your filters</h3>
            <p className="text-gray-600 text-sm">Try adjusting your search or filters</p>
          </div>
        )}

        {/* SEO Content */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Choose a Medical Specialty</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Choosing a medical specialty is one of the most important decisions in your medical career. Consider factors like
              lifestyle preferences, salary expectations, patient interaction style, procedural vs. cognitive work, training length,
              and job market demand. Use our Specialty Explorer to compare {specialties.length} specialties across all these dimensions.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Data sources include NRMP Match statistics, AAMC faculty salary surveys, Medscape Physician Compensation Reports,
              and AMA Physician Practice Benchmarks. All figures are approximate and updated regularly.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-8 text-center text-xs text-gray-400">
          <p>Data based on 2024-2025 NRMP Match statistics and compensation surveys. For informational purposes only.</p>
        </div>
      </div>
    </div>
  )
}
