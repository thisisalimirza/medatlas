'use client'

import { useState, useEffect } from 'react'
import { Place } from '@/types'
import PlaceCard from '@/components/PlaceCard'
import FilterSidebar from '@/components/FilterSidebar'
import PlaceModal from '@/components/PlaceModal'
import Header from '@/components/Header'

export default function SchoolsPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<any>({})
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(false)

  useEffect(() => {
    fetchSchools()
  }, [searchQuery, filters])

  const fetchSchools = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('type', 'school')
      if (searchQuery) queryParams.append('q', searchQuery)

      const response = await fetch(`/api/supabase/places?${queryParams.toString()}`)
      const data = await response.json()

      if (data.success) {
        setPlaces(data.data)
      }
    } catch (error) {
      console.error('Error fetching schools:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place)
    setIsModalOpen(true)
    window.history.pushState({}, '', `/place/${place.slug}`)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPlace(null)
    window.history.pushState({}, '', '/schools')
  }

  const filteredPlaces = places.filter(place => {
    const tuition = place.metrics.tuition || 0
    const researchOutput = place.metrics.research_output || 0

    if (filters.tuition === 'free' && tuition !== 0) return false
    if (filters.tuition === 'low' && tuition > 20000) return false
    if (filters.tuition === 'medium' && tuition > 40000) return false
    if (filters.tuition === 'high' && tuition > 60000) return false

    if (filters.research === 'low' && researchOutput > 4) return false
    if (filters.research === 'medium' && (researchOutput <= 4 || researchOutput > 7)) return false
    if (filters.research === 'high' && researchOutput <= 7) return false

    if (filters.img_friendly && !place.metrics.img_friendly) return false
    if (filters.location_type && !place.tags.includes(filters.location_type)) return false
    if (filters.institution_type && !place.tags.includes(filters.institution_type)) return false

    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex relative">
        {/* Mobile sidebar overlay */}
        {isFiltersSidebarOpen && (
          <div
            className="fixed inset-0 top-14 sm:top-16 bg-black/30 z-20 md:bg-transparent md:pointer-events-none"
            onClick={() => setIsFiltersSidebarOpen(false)}
          />
        )}

        {/* Sidebar — overlay on mobile, inline on desktop */}
        {isFiltersSidebarOpen && (
          <div className="fixed md:relative top-14 sm:top-16 md:top-0 bottom-0 left-0 z-30 md:z-auto">
            <FilterSidebar
              onFiltersChange={setFilters}
              currentFilters={filters}
              onClose={() => setIsFiltersSidebarOpen(false)}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Page Header */}
          <div className="bg-white border-b border-gray-200 p-3 sm:p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center space-x-2 mb-3 text-sm">
                <a href="/" className="text-gray-500 hover:text-gray-700">All</a>
                <span className="text-gray-300">/</span>
                <span className="font-semibold text-brand-red">Medical Schools</span>
              </div>

              <h1 className="text-xl sm:text-3xl font-bold mb-4">
                Medical Schools 🏥
              </h1>

              <div className="flex items-center gap-2">
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
                    placeholder="Search medical schools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-red focus:border-transparent text-sm"
                  />
                  <div className="absolute right-3 top-2.5 text-gray-400">🔍</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <p className="text-gray-600 text-sm sm:text-base">
                  {loading ? 'Loading...' : `${filteredPlaces.length} medical schools found`}
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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
                  <div className="text-4xl mb-4">🏥</div>
                  <h3 className="text-lg font-medium mb-2">No medical schools found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search query</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <PlaceModal
          place={selectedPlace}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  )
}
