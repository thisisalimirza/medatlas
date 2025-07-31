'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'

interface School {
  id: string
  name: string
  location: string
  type: 'public' | 'private'
  tuition_in_state?: number
  tuition_out_state?: number
  acceptance_rate: number
  mcat_avg: number
  gpa_avg: number
  class_size: number
  match_rate: number
  ranking: number
  research_opportunities: 'High' | 'Medium' | 'Low'
  clinical_training: 'Excellent' | 'Good' | 'Average'
  specialty_strengths: string[]
  pros: string[]
  cons: string[]
}

const sampleSchools: School[] = [
  {
    id: '1',
    name: 'Harvard Medical School',
    location: 'Boston, MA',
    type: 'private',
    tuition_out_state: 67360,
    acceptance_rate: 3.3,
    mcat_avg: 521,
    gpa_avg: 3.93,
    class_size: 165,
    match_rate: 99,
    ranking: 1,
    research_opportunities: 'High',
    clinical_training: 'Excellent',
    specialty_strengths: ['Research', 'Academic Medicine', 'All Specialties'],
    pros: ['World-renowned faculty', 'Extensive research opportunities', 'Strong alumni network'],
    cons: ['Extremely competitive', 'Very expensive', 'High pressure environment']
  },
  {
    id: '2',
    name: 'University of Washington',
    location: 'Seattle, WA',
    type: 'public',
    tuition_in_state: 37635,
    tuition_out_state: 69588,
    acceptance_rate: 4.9,
    mcat_avg: 514,
    gpa_avg: 3.84,
    class_size: 270,
    match_rate: 98,
    ranking: 8,
    research_opportunities: 'High',
    clinical_training: 'Excellent',
    specialty_strengths: ['Primary Care', 'Rural Medicine', 'Public Health'],
    pros: ['Strong primary care focus', 'Great location', 'Good value for residents'],
    cons: ['Limited out-of-state acceptance', 'Rainy weather', 'Competitive research positions']
  },
  {
    id: '3',
    name: 'University of Texas Southwestern',
    location: 'Dallas, TX',
    type: 'public',
    tuition_in_state: 20903,
    tuition_out_state: 34003,
    acceptance_rate: 8.7,
    mcat_avg: 517,
    gpa_avg: 3.89,
    class_size: 230,
    match_rate: 97,
    ranking: 23,
    research_opportunities: 'High',
    clinical_training: 'Excellent',
    specialty_strengths: ['Surgery', 'Internal Medicine', 'Radiology'],
    pros: ['Excellent value', 'Strong clinical training', 'Good weather'],
    cons: ['Texas residency preference', 'Limited financial aid', 'Large class size']
  }
]

const comparisonCategories = [
  { key: 'academics', label: 'Academics', weight: 0.3 },
  { key: 'cost', label: 'Cost & Value', weight: 0.25 },
  { key: 'location', label: 'Location & Life', weight: 0.2 },
  { key: 'opportunities', label: 'Opportunities', weight: 0.15 },
  { key: 'outcomes', label: 'Outcomes', weight: 0.1 }
]

export default function SchoolComparisonPage() {
  const [selectedSchools, setSelectedSchools] = useState<School[]>([sampleSchools[0], sampleSchools[1]])
  const [availableSchools] = useState<School[]>(sampleSchools)
  const [comparisonView, setComparisonView] = useState<'overview' | 'detailed' | 'scoring'>('overview')
  const [userWeights, setUserWeights] = useState<Record<string, number>>({
    academics: 0.3,
    cost: 0.25,
    location: 0.2,
    opportunities: 0.15,
    outcomes: 0.1
  })

  const addSchool = (schoolId: string) => {
    const school = availableSchools.find(s => s.id === schoolId)
    if (school && selectedSchools.length < 4 && !selectedSchools.find(s => s.id === schoolId)) {
      setSelectedSchools([...selectedSchools, school])
    }
  }

  const removeSchool = (schoolId: string) => {
    if (selectedSchools.length > 1) {
      setSelectedSchools(selectedSchools.filter(s => s.id !== schoolId))
    }
  }

  const calculateScore = (school: School): number => {
    // Normalize scores (0-100 scale)
    const academicsScore = Math.min(100, ((school.mcat_avg - 490) / 38 * 50) + (school.gpa_avg * 25))
    const costScore = school.type === 'public' ? 
      (school.tuition_in_state ? Math.max(0, 100 - (school.tuition_in_state / 1000)) : 70) :
      Math.max(0, 100 - (school.tuition_out_state! / 1000))
    const opportunitiesScore = school.research_opportunities === 'High' ? 90 : 
                             school.research_opportunities === 'Medium' ? 60 : 30
    const outcomesScore = school.match_rate
    const locationScore = 75 // Placeholder - would be based on user preferences

    return (
      academicsScore * userWeights.academics +
      costScore * userWeights.cost +
      locationScore * userWeights.location +
      opportunitiesScore * userWeights.opportunities +
      outcomesScore * userWeights.outcomes
    )
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0 
    }).format(amount)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 70) return 'text-blue-600 bg-blue-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            ⚖️ Medical School Comparison Tool
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Compare medical schools side-by-side across key metrics. Customize weightings 
            based on your priorities to find your best fit.
          </p>
        </div>

        {/* School Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Selected Schools ({selectedSchools.length}/4)</h2>
            <div className="flex items-center space-x-4">
              <select
                onChange={(e) => e.target.value && addSchool(e.target.value)}
                value=""
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent text-sm"
              >
                <option value="">Add a school...</option>
                {availableSchools
                  .filter(school => !selectedSchools.find(s => s.id === school.id))
                  .map(school => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedSchools.map(school => (
              <div key={school.id} className="border border-gray-200 rounded-lg p-4 relative">
                {selectedSchools.length > 1 && (
                  <button
                    onClick={() => removeSchool(school.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    ×
                  </button>
                )}
                <h3 className="font-semibold text-gray-900 mb-2 pr-6">{school.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{school.location}</p>
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getScoreColor(calculateScore(school))}`}>
                  Score: {calculateScore(school).toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-2 mb-6">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'detailed', label: 'Detailed Comparison' },
            { key: 'scoring', label: 'Custom Scoring' }
          ].map(view => (
            <button
              key={view.key}
              onClick={() => setComparisonView(view.key as any)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                comparisonView === view.key
                  ? 'bg-brand-red text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>

        {/* Overview Comparison */}
        {comparisonView === 'overview' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-900 min-w-32">Metric</th>
                    {selectedSchools.map(school => (
                      <th key={school.id} className="text-center p-4 font-semibold text-gray-900 min-w-48">
                        {school.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-4 font-medium text-gray-700">Ranking</td>
                    {selectedSchools.map(school => (
                      <td key={school.id} className="p-4 text-center">#{school.ranking}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-gray-700">Acceptance Rate</td>
                    {selectedSchools.map(school => (
                      <td key={school.id} className="p-4 text-center">{school.acceptance_rate}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-gray-700">Average MCAT</td>
                    {selectedSchools.map(school => (
                      <td key={school.id} className="p-4 text-center font-semibold">{school.mcat_avg}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-gray-700">Average GPA</td>
                    {selectedSchools.map(school => (
                      <td key={school.id} className="p-4 text-center font-semibold">{school.gpa_avg}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-gray-700">Tuition</td>
                    {selectedSchools.map(school => (
                      <td key={school.id} className="p-4 text-center">
                        <div className="text-sm">
                          {school.tuition_in_state && (
                            <div>In-state: {formatCurrency(school.tuition_in_state)}</div>
                          )}
                          <div>Out-of-state: {formatCurrency(school.tuition_out_state!)}</div>
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-gray-700">Class Size</td>
                    {selectedSchools.map(school => (
                      <td key={school.id} className="p-4 text-center">{school.class_size}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-gray-700">Match Rate</td>
                    {selectedSchools.map(school => (
                      <td key={school.id} className="p-4 text-center">{school.match_rate}%</td>
                    ))}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-semibold text-gray-900">Overall Score</td>
                    {selectedSchools.map(school => (
                      <td key={school.id} className="p-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full font-semibold ${getScoreColor(calculateScore(school))}`}>
                          {calculateScore(school).toFixed(0)}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Comparison */}
        {comparisonView === 'detailed' && (
          <div className="space-y-6">
            {selectedSchools.map(school => (
              <div key={school.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{school.name}</h3>
                  <span className={`px-3 py-1 rounded-full font-semibold text-sm ${getScoreColor(calculateScore(school))}`}>
                    Score: {calculateScore(school).toFixed(0)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">📊 Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div>Location: {school.location}</div>
                      <div>Type: {school.type}</div>
                      <div>Ranking: #{school.ranking}</div>
                      <div>Acceptance Rate: {school.acceptance_rate}%</div>
                      <div>MCAT Average: {school.mcat_avg}</div>
                      <div>GPA Average: {school.gpa_avg}</div>
                      <div>Class Size: {school.class_size}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">✅ Strengths</h4>
                    <ul className="space-y-1 text-sm text-green-700">
                      {school.pros.map((pro, index) => (
                        <li key={index}>• {pro}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">⚠️ Considerations</h4>
                    <ul className="space-y-1 text-sm text-red-600">
                      {school.cons.map((con, index) => (
                        <li key={index}>• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">🎯 Specialty Strengths</h4>
                  <div className="flex flex-wrap gap-2">
                    {school.specialty_strengths.map((specialty, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Scoring */}
        {comparisonView === 'scoring' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Customize Your Priorities</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Adjust Category Weights</h4>
                <div className="space-y-4">
                  {comparisonCategories.map(category => (
                    <div key={category.key}>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">
                          {category.label}
                        </label>
                        <span className="text-sm text-gray-500">
                          {Math.round(userWeights[category.key] * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.5"
                        step="0.05"
                        value={userWeights[category.key]}
                        onChange={(e) => setUserWeights({
                          ...userWeights,
                          [category.key]: parseFloat(e.target.value)
                        })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Updated Rankings</h4>
                <div className="space-y-3">
                  {selectedSchools
                    .sort((a, b) => calculateScore(b) - calculateScore(a))
                    .map((school, index) => (
                      <div key={school.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-gray-600">#{index + 1}</span>
                          <span className="font-medium text-gray-900">{school.name}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full font-semibold text-sm ${getScoreColor(calculateScore(school))}`}>
                          {calculateScore(school).toFixed(0)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}