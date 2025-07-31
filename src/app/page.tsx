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
  const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(false) // Default closed on mobile
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)

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
      const tuition = place.tuition_in_state || place.tuition_out_state || 0
      const range = [
        { value: 'free', min: 0, max: 0 },
        { value: 'low', min: 0, max: 20000 },
        { value: 'medium', min: 20000, max: 40000 },
        { value: 'high', min: 40000, max: 60000 },
        { value: 'very-high', min: 60000, max: 999999 }
      ].find(r => r.value === filters.tuition_range)
      
      if (range) {
        if (range.value === 'free' && tuition !== 0) return false
        if (range.value !== 'free' && (tuition < range.min || tuition > range.max)) return false
      }
    }
    
    // IMG friendly filter
    if (filters.img_friendly && !place.img_friendly) return false
    
    // Location type filter
    if (filters.location_type && !place.tags.includes(filters.location_type)) return false
    
    // Institution type filter
    if (filters.institution_type && !place.tags.includes(filters.institution_type)) return false
    
    // Region filter
    if (filters.region && !place.tags.includes(filters.region)) return false
    
    // Specialization filters (these would typically be based on place.tags or metrics)
    if (filters.strong_research && !place.tags.includes('research-focused')) return false
    if (filters.primary_care && !place.tags.includes('primary-care')) return false
    if (filters.rural_medicine && !place.tags.includes('rural-medicine')) return false
    if (filters.small_class && place.metrics.class_size && place.metrics.class_size >= 100) return false
    if (filters.highly_rated && place.scores.community_score < 8) return false
    
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
              <div className="font-semibold text-green-800 text-sm sm:text-base">Welcome to MedAtlas Pro!</div>
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

      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isFiltersSidebarOpen={isFiltersSidebarOpen}
        onToggleFiltersSidebar={() => setIsFiltersSidebarOpen(!isFiltersSidebarOpen)}
      />
      
      <div className="flex relative">
        {/* Mobile Sidebar Overlay */}
        {isFiltersSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsFiltersSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar - Conditionally shown */}
        {isFiltersSidebarOpen && (
          <div className="fixed md:relative inset-y-0 left-0 z-40 md:z-auto">
            <FilterSidebar 
              onFiltersChange={setFilters}
              currentFilters={filters}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Page Header */}
          <div className="bg-white border-b border-gray-200 p-3 sm:p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center space-x-2 sm:space-x-3">
                    <span>🏥</span>
                    <span>Medical Schools & Programs</span>
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    Find your path to becoming a physician • Real insights from current students & residents
                  </p>
                </div>
                
                {/* Stats - Show on mobile as horizontal row */}
                <div className="flex md:hidden items-center justify-between space-x-4 mb-2">
                  <div className="text-center">
                    <div className="text-sm font-bold text-brand-red">2,847+</div>
                    <div className="text-xs text-gray-500">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-brand-red">450+</div>
                    <div className="text-xs text-gray-500">Programs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-brand-red">95%</div>
                    <div className="text-xs text-gray-500">Match Rate</div>
                  </div>
                </div>
                
                {/* Stats - Desktop version */}
                <div className="hidden md:flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-brand-red">2,847+</div>
                    <div className="text-xs text-gray-500">Med Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-brand-red">450+</div>
                    <div className="text-xs text-gray-500">Programs Tracked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-brand-red">95%</div>
                    <div className="text-xs text-gray-500">Match Success</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Filter Summary */}
        <FilterSummary
          filters={filters}
          onFilterChange={(key, value) => setFilters({...filters, [key]: value})}
          onClearFilters={() => setFilters({})}
          resultsCount={filteredPlaces.length}
        />

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
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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