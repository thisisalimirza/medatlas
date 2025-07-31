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
      
      <div className="flex">
        <FilterSidebar 
          onFiltersChange={setFilters}
          currentFilters={filters}
        />

        <div className="flex-1">
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center space-x-4 mb-4">
              <a href="/" className="text-gray-500 hover:text-gray-700">All</a>
              <span className="text-gray-300">/</span>
              <span className="font-semibold text-brand-red">Medical Schools</span>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">
              Medical Schools 🏥
            </h1>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search medical schools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-red focus:border-transparent"
              />
              <div className="absolute right-3 top-2.5 text-gray-400">🔍</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {loading ? 'Loading...' : `${filteredPlaces.length} medical schools found`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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