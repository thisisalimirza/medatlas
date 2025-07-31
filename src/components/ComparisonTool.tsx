'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'

interface Place {
  id: number
  name: string
  location_city: string
  location_state: string
  type: string
  tuition_in_state: number | null
  tuition_out_state: number | null
  mcat_avg: number | null
  gpa_avg: number | null
  acceptance_rate: number | null
  img_friendly: boolean
  usmle_step1_pass_rate: number | null
  match_rate: number | null
}

interface ComparisonToolProps {
  isOpen: boolean
  onClose: () => void
  initialPlaces?: Place[]
}

export default function ComparisonTool({ isOpen, onClose, initialPlaces = [] }: ComparisonToolProps) {
  const { user } = useAuth()
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>(initialPlaces)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchPlaces()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const searchPlaces = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/places?search=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      if (data.success) {
        // Filter out already selected places
        const filtered = data.data.filter((place: Place) => 
          !selectedPlaces.some(selected => selected.id === place.id)
        )
        setSearchResults(filtered.slice(0, 10)) // Limit to 10 results
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const addPlace = (place: Place) => {
    if (selectedPlaces.length < 5 && !selectedPlaces.some(p => p.id === place.id)) {
      setSelectedPlaces([...selectedPlaces, place])
      setSearchQuery('')
      setSearchResults([])
    }
  }

  const removePlace = (placeId: number) => {
    setSelectedPlaces(selectedPlaces.filter(p => p.id !== placeId))
  }

  const formatTuition = (inState: number | null, outState: number | null) => {
    if (!inState && !outState) return 'N/A'
    if (inState && outState) {
      return `$${(inState / 1000).toFixed(0)}k / $${(outState / 1000).toFixed(0)}k`
    }
    return `$${((inState || outState)! / 1000).toFixed(0)}k`
  }

  const formatPercentage = (value: number | null) => {
    return value ? `${value}%` : 'N/A'
  }

  const formatScore = (value: number | null) => {
    return value ? value.toString() : 'N/A'
  }

  if (!isOpen) return null

  // Require authentication for comparison tool
  if (!user || !user.is_paid) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="p-6 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-xl font-bold mb-2">Program Comparison</h2>
            <p className="text-gray-600 mb-6">
              Compare up to 5 medical schools side-by-side with detailed metrics and insights
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                <span>Side-by-side comparison of key metrics</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                <span>Tuition, MCAT, GPA, and acceptance rates</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                <span>Match rates and board pass rates</span>
              </div>
            </div>
            <button onClick={onClose} className="btn-red w-full">
              Upgrade to Access
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-7xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Program Comparison</h2>
                <p className="text-gray-600 mt-1">
                  Compare up to 5 programs side-by-side ({selectedPlaces.length}/5 selected)
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Search to Add Programs */}
            {selectedPlaces.length < 5 && (
              <div className="mt-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for medical schools to add..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  />
                  {loading && (
                    <div className="absolute right-3 top-2">
                      <div className="animate-spin h-5 w-5 border-2 border-brand-red border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto overscroll-contain">
                    {searchResults.map((place) => (
                      <button
                        key={place.id}
                        onClick={() => addPlace(place)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{place.name}</div>
                        <div className="text-sm text-gray-600">
                          {place.location_city}, {place.location_state} • {place.type}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comparison Content */}
          <div className="p-6">
            {selectedPlaces.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-medium mb-2">No Programs Selected</h3>
                <p className="text-gray-600 mb-4">Search and add programs above to start comparing</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left py-3 pr-4 font-medium text-gray-900 border-b border-gray-200">
                        Metric
                      </th>
                      {selectedPlaces.map((place) => (
                        <th key={place.id} className="text-center py-3 px-4 font-medium border-b border-gray-200 min-w-[200px]">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 text-left">
                              <div className="font-semibold text-gray-900">{place.name}</div>
                              <div className="text-xs text-gray-600 font-normal">
                                {place.location_city}, {place.location_state}
                              </div>
                            </div>
                            <button
                              onClick={() => removePlace(place.id)}
                              className="text-gray-400 hover:text-red-500 ml-2"
                              title="Remove from comparison"
                            >
                              ×
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* School Type */}
                    <tr className="border-b border-gray-100">
                      <td className="py-3 pr-4 font-medium text-gray-700">School Type</td>
                      {selectedPlaces.map((place) => (
                        <td key={place.id} className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {place.type}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* IMG Friendly */}
                    <tr className="border-b border-gray-100">
                      <td className="py-3 pr-4 font-medium text-gray-700">IMG Friendly</td>
                      {selectedPlaces.map((place) => (
                        <td key={place.id} className="py-3 px-4 text-center">
                          {place.img_friendly ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Yes
                            </span>
                          ) : (
                            <span className="text-gray-500">No</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Tuition */}
                    <tr className="border-b border-gray-100">
                      <td className="py-3 pr-4 font-medium text-gray-700">Tuition (In/Out)</td>
                      {selectedPlaces.map((place) => (
                        <td key={place.id} className="py-3 px-4 text-center font-mono text-sm">
                          {formatTuition(place.tuition_in_state, place.tuition_out_state)}
                        </td>
                      ))}
                    </tr>

                    {/* MCAT Average */}
                    <tr className="border-b border-gray-100">
                      <td className="py-3 pr-4 font-medium text-gray-700">Avg MCAT</td>
                      {selectedPlaces.map((place) => (
                        <td key={place.id} className="py-3 px-4 text-center font-mono text-sm">
                          {formatScore(place.mcat_avg)}
                        </td>
                      ))}
                    </tr>

                    {/* GPA Average */}
                    <tr className="border-b border-gray-100">
                      <td className="py-3 pr-4 font-medium text-gray-700">Avg GPA</td>
                      {selectedPlaces.map((place) => (
                        <td key={place.id} className="py-3 px-4 text-center font-mono text-sm">
                          {formatScore(place.gpa_avg)}
                        </td>
                      ))}
                    </tr>

                    {/* Acceptance Rate */}
                    <tr className="border-b border-gray-100">
                      <td className="py-3 pr-4 font-medium text-gray-700">Acceptance Rate</td>
                      {selectedPlaces.map((place) => (
                        <td key={place.id} className="py-3 px-4 text-center font-mono text-sm">
                          {formatPercentage(place.acceptance_rate)}
                        </td>
                      ))}
                    </tr>

                    {/* Match Rate */}
                    <tr className="border-b border-gray-100">
                      <td className="py-3 pr-4 font-medium text-gray-700">Match Rate</td>
                      {selectedPlaces.map((place) => (
                        <td key={place.id} className="py-3 px-4 text-center font-mono text-sm">
                          {formatPercentage(place.match_rate)}
                        </td>
                      ))}
                    </tr>

                    {/* USMLE Step 1 Pass Rate */}
                    <tr className="border-b border-gray-100">
                      <td className="py-3 pr-4 font-medium text-gray-700">Step 1 Pass Rate</td>
                      {selectedPlaces.map((place) => (
                        <td key={place.id} className="py-3 px-4 text-center font-mono text-sm">
                          {formatPercentage(place.usmle_step1_pass_rate)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          {selectedPlaces.length > 0 && (
            <div className="border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Comparing {selectedPlaces.length} program{selectedPlaces.length !== 1 ? 's' : ''}
                </p>
                <div className="space-x-3">
                  <button
                    onClick={() => setSelectedPlaces([])}
                    className="btn-outline"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => {
                      const dataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(
                        generateCSV(selectedPlaces)
                      )}`
                      const link = document.createElement('a')
                      link.href = dataUrl
                      link.download = 'medatlas-comparison.csv'
                      link.click()
                    }}
                    className="btn-red"
                  >
                    Export CSV
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function generateCSV(places: Place[]): string {
  const headers = [
    'School Name',
    'Location',
    'Type', 
    'IMG Friendly',
    'Tuition In-State',
    'Tuition Out-State',
    'Avg MCAT',
    'Avg GPA',
    'Acceptance Rate %',
    'Match Rate %',
    'Step 1 Pass Rate %'
  ]
  
  const rows = places.map(place => [
    place.name,
    `${place.location_city}, ${place.location_state}`,
    place.type,
    place.img_friendly ? 'Yes' : 'No',
    place.tuition_in_state || '',
    place.tuition_out_state || '',
    place.mcat_avg || '',
    place.gpa_avg || '',
    place.acceptance_rate || '',
    place.match_rate || '',
    place.usmle_step1_pass_rate || ''
  ])
  
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}