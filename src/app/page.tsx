'use client'

import { useState, useEffect } from 'react'
import { Place } from '@/types'
import PlaceCard from '@/components/PlaceCard'
import FilterSidebar from '@/components/FilterSidebar'
import FilterSummary from '@/components/FilterSummary'
import PlaceModal from '@/components/PlaceModal'
import ComparisonTool from '@/components/ComparisonTool'
import Header from '@/components/Header'

export default function HomePage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<any>({})
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isComparisonOpen, setIsComparisonOpen] = useState(false)
  const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(false) // Default closed; users open via filter button
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)

  useEffect(() => {
    fetchPlaces()
    
    // Check for payment success parameter
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('payment') === 'success') {
      setShowPaymentSuccess(true)
      // Clean up URL
      window.history.replaceState({}, '', '/')
      // Hide success message after 5 seconds
      setTimeout(() => setShowPaymentSuccess(false), 5000)
    }
  }, [searchQuery, filters])

  const fetchPlaces = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (searchQuery) queryParams.append('q', searchQuery)
      
      const response = await fetch(`/api/supabase/places?${queryParams.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setPlaces(data.data)
      }
    } catch (error) {
      console.error('Error fetching places:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place)
    setIsModalOpen(true)
    // Update URL without navigation
    window.history.pushState({}, '', `/place/${place.slug}`)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPlace(null)
    // Reset URL
    window.history.pushState({}, '', '/')
  }

  const handleFiltersChange = (newFilters: any) => {
    setIsFiltering(true)
    setFilters(newFilters)
    // Reset filtering state after a short delay to show skeleton
    setTimeout(() => setIsFiltering(false), 300)
  }

  const filteredPlaces = places.filter(place => {
    // Apply smart filters
    
    // MCAT range filter
    if (filters.mcat_range) {
      const mcat = place.mcat_avg
      const range = [
        { value: 'below-avg', min: 500, max: 510 },
        { value: 'avg', min: 511, max: 515 },
        { value: 'above-avg', min: 516, max: 520 },
        { value: 'exceptional', min: 521, max: 528 }
      ].find(r => r.value === filters.mcat_range)
      
      if (range && mcat && (mcat < range.min || mcat > range.max)) return false
    }
    
    // GPA range filter
    if (filters.gpa_range) {
      const gpa = place.gpa_avg
      const range = [
        { value: 'low', min: 3.0, max: 3.5 },
        { value: 'avg', min: 3.5, max: 3.7 },
        { value: 'high', min: 3.7, max: 3.9 },
        { value: 'exceptional', min: 3.9, max: 4.0 }
      ].find(r => r.value === filters.gpa_range)
      
      if (range && gpa && (gpa < range.min || gpa > range.max)) return false
    }
    
    // Acceptance rate filter
    if (filters.acceptance_rate) {
      const rate = place.acceptance_rate
      const range = [
        { value: 'very-competitive', min: 0, max: 5 },
        { value: 'competitive', min: 5, max: 15 },
        { value: 'moderate', min: 15, max: 30 },
        { value: 'accessible', min: 30, max: 100 }
      ].find(r => r.value === filters.acceptance_rate)
      
      if (range && rate && (rate < range.min || rate > range.max)) return false
    }
    
    // Match rate filter
    if (filters.match_rate) {
      const rate = place.match_rate
      const range = [
        { value: 'excellent', min: 95, max: 100 },
        { value: 'very-good', min: 90, max: 95 },
        { value: 'good', min: 85, max: 90 },
        { value: 'below-avg', min: 0, max: 85 }
      ].find(r => r.value === filters.match_rate)
      
      if (range && rate && (rate < range.min || rate > range.max)) return false
    }
    
    // Tuition range filter
    if (filters.tuition_range) {
      // metrics.tuition is the primary field; tuition_in_state/out_state are aliases
      const tuition = place.tuition_in_state ?? place.tuition_out_state ?? (place.metrics as any)?.tuition ?? null
      const range = [
        { value: 'free', min: 0, max: 0 },
        { value: 'low', min: 0, max: 20000 },
        { value: 'medium', min: 20000, max: 40000 },
        { value: 'high', min: 40000, max: 60000 },
        { value: 'very-high', min: 60000, max: 999999 }
      ].find(r => r.value === filters.tuition_range)

      if (range) {
        if (range.value === 'free') {
          if (tuition !== 0) return false
        } else {
          if (tuition === null || tuition < range.min || tuition > range.max) return false
        }
      }
    }
    
    // Financial aid filter — proxy: free tuition (metrics.financial_aid not yet in DB)
    if (filters.financial_aid) {
      const tuition = (place.metrics as any)?.tuition ?? place.tuition_in_state ?? null
      if (!((place.metrics as any)?.financial_aid || tuition === 0)) return false
    }

    // IMG friendly filter
    if (filters.img_friendly && !place.img_friendly) return false

    // Location type filter
    if (filters.location_type && !place.tags.includes(filters.location_type)) return false

    // Institution type filter — map UI values to actual tags in DB
    if (filters.institution_type) {
      const tagMap: Record<string, string> = {
        public: 'public',
        private: 'private',
        research: 'research-heavy',
        teaching: 'community-focused',
      }
      const tag = tagMap[filters.institution_type] || filters.institution_type
      if (!place.tags.includes(tag)) return false
    }

    // Region filter — derive from state (no region tags in DB)
    if (filters.region) {
      const regionMap: Record<string, string[]> = {
        northeast: ['ME','NH','VT','MA','RI','CT','NY','NJ','PA','MD','DE','DC'],
        southeast: ['VA','WV','NC','SC','GA','FL','AL','MS','TN','KY','LA','AR'],
        midwest:   ['OH','IN','IL','MI','WI','MN','IA','MO','ND','SD','NE','KS'],
        southwest: ['TX','OK','NM','AZ'],
        west:      ['CA','OR','WA','ID','MT','WY','CO','UT','NV','AK','HI'],
      }
      const states = regionMap[filters.region] || []
      if (!states.includes(place.state)) return false
    }

    // Specialization filters — use actual tags present in DB
    if (filters.strong_research && !place.tags.includes('research-heavy')) return false
    if (filters.primary_care && !place.tags.includes('community-focused')) return false
    if (filters.rural_medicine && !place.tags.includes('rural')) return false
    // small_class: class_size not in DB yet — skip to avoid blocking all results
    if (filters.highly_rated && (place.scores.community_score ?? 0) < 8) return false
    
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Payment Success Notification */}
      {showPaymentSuccess && (
        <div className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg border border-green-200 p-3 sm:p-4 max-w-sm sm:max-w-md mx-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="text-xl sm:text-2xl">🎉</div>
            <div className="flex-1">
              <div className="font-semibold text-green-800 text-sm sm:text-base">Welcome to MedStack Pro!</div>
              <div className="text-xs sm:text-sm text-green-600">Your payment was successful. You now have full access!</div>
            </div>
            <button 
              onClick={() => setShowPaymentSuccess(false)}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-all duration-200 group flex-shrink-0"
            >
              <span className="group-hover:scale-110 transition-transform inline-block">×</span>
            </button>
          </div>
        </div>
      )}

      <Header />
      
      <div className="flex relative">
        {/* Sidebar Overlay — click to close on all screen sizes */}
        {isFiltersSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 md:bg-transparent md:pointer-events-none"
            onClick={() => setIsFiltersSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Conditionally shown */}
        {isFiltersSidebarOpen && (
          <div className="fixed md:relative top-0 bottom-0 left-0 z-50 md:z-auto">
            <FilterSidebar
              onFiltersChange={handleFiltersChange}
              currentFilters={filters}
              onClose={() => setIsFiltersSidebarOpen(false)}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Page Header — scrolls away */}
          <div className="bg-white p-3 sm:p-4 md:p-6 pb-0 sm:pb-0 md:pb-0">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-2 md:mb-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center space-x-2 sm:space-x-3">
                    <span>🏥</span>
                    <span>Medical Schools & Programs</span>
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    Find your path to becoming a physician • Real insights from current students & residents
                  </p>
                </div>

                {/* Stats - Show on mobile as horizontal row */}
                <div className="flex md:hidden items-center space-x-4 mt-2 mb-1">
                  <div className="text-center">
                    <div className="text-sm font-bold text-brand-red">208+</div>
                    <div className="text-xs text-gray-500">Programs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-brand-red">50+</div>
                    <div className="text-xs text-gray-500">States</div>
                  </div>
                </div>

                {/* Stats - Desktop version */}
                <div className="hidden md:flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-brand-red">208+</div>
                    <div className="text-xs text-gray-500">Programs Tracked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-brand-red">50+</div>
                    <div className="text-xs text-gray-500">States Covered</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Search + Filter Bar */}
          <div className="sticky top-14 sm:top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setIsFiltersSidebarOpen(!isFiltersSidebarOpen)}
                  className={`flex-shrink-0 flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors rounded-lg border ${
                    isFiltersSidebarOpen
                      ? 'bg-brand-red text-white border-brand-red'
                      : 'text-brand-red border-brand-red hover:bg-red-50'
                  }`}
                >
                  <span>🔧</span>
                  <span className="hidden sm:inline">{isFiltersSidebarOpen ? 'Hide Filters' : 'Filters'}</span>
                </button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search schools by name, city, or state..."
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 text-base sm:text-sm"
                  />
                  <div className="absolute right-3 top-2.5 text-gray-400 text-sm">🔍</div>
                </div>
              </div>
            </div>
            {/* Filter Summary lives inside the sticky bar */}
            <FilterSummary
              filters={filters}
              onFilterChange={(key, value) => handleFiltersChange({...filters, [key]: value})}
              onClearFilters={() => handleFiltersChange({})}
              resultsCount={filteredPlaces.length}
            />
          </div>

          {/* Content Area */}
          <div className="p-3 sm:p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <p className="text-gray-600 font-medium text-sm sm:text-base">
                    {loading ? 'Loading programs...' : `${filteredPlaces.length} medical programs`}
                  </p>
                  {!loading && filteredPlaces.length > 0 && (
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                      <span className="hidden sm:inline">•</span>
                      <span>Avg MCAT: {Math.round(filteredPlaces.reduce((acc, p) => acc + (p.mcat_avg || 0), 0) / filteredPlaces.length)}</span>
                      <span>•</span>
                      <span>Avg GPA: {(filteredPlaces.reduce((acc, p) => acc + (p.gpa_avg || 0), 0) / filteredPlaces.length).toFixed(1)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between sm:justify-end space-x-2">
                  <button 
                    onClick={() => setIsComparisonOpen(true)}
                    className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-red-600 text-white rounded-full hover:bg-red-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 shadow-md border border-red-700"
                  >
                    <span className="group-hover:scale-110 transition-transform">📊</span>
                    <span>Compare</span>
                  </button>
                  <button 
                    onClick={() => {
                      // Sort by rank and scroll to top
                      const sortedPlaces = [...filteredPlaces].sort((a, b) => (a.rank_overall || 1) - (b.rank_overall || 1))
                      setPlaces([...places.filter(p => !filteredPlaces.includes(p)), ...sortedPlaces])
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold rounded-full border-2 border-gray-400 text-gray-700 hover:border-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    <span className="flex items-center space-x-1">
                      <span className="group-hover:scale-110 transition-transform">🏆</span>
                      <span className="hidden xs:inline">By Rank</span>
                      <span className="xs:hidden">Rank</span>
                    </span>
                  </button>
                  <button 
                    onClick={() => {
                      alert('🗺️ Map view coming soon! This will show all medical schools on an interactive map.')
                    }}
                    className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold rounded-full border-2 border-gray-400 text-gray-700 hover:border-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    <span className="flex items-center space-x-1">
                      <span className="group-hover:scale-110 transition-transform">📍</span>
                      <span className="hidden xs:inline">Map View</span>
                      <span className="xs:hidden">Map</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Places Grid */}
              {loading || isFiltering ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {filteredPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onClick={() => handlePlaceClick(place)}
                  />
                ))}
              </div>
            )}

            {filteredPlaces.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium mb-2">No places found</h3>
                <p className="text-gray-600">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Place Modal */}
      <PlaceModal
        place={selectedPlace}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Comparison Tool */}
      <ComparisonTool
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
      />
      </div>
    </div>
  )
}