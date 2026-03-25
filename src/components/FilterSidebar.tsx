'use client'

import { useState } from 'react'

interface FilterSidebarProps {
  onFiltersChange: (filters: any) => void
  currentFilters: any
  onClose?: () => void
}

export default function FilterSidebar({ onFiltersChange, currentFilters, onClose }: FilterSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...currentFilters,
      [key]: value
    })
  }

  const tuitionRanges = [
    { label: 'Free', value: 'free', min: 0, max: 0 },
    { label: '<$20K/yr', value: 'low', min: 0, max: 20000 },
    { label: '<$40K/yr', value: 'medium', min: 20000, max: 40000 },
    { label: '<$60K/yr', value: 'high', min: 40000, max: 60000 },
    { label: '>$60K/yr', value: 'very-high', min: 60000, max: 999999 },
  ]

  const mcatRanges = [
    { label: '500-510', value: 'below-avg', min: 500, max: 510 },
    { label: '511-515', value: 'avg', min: 511, max: 515 },
    { label: '516-520', value: 'above-avg', min: 516, max: 520 },
    { label: '521+', value: 'exceptional', min: 521, max: 528 },
  ]

  const gpaRanges = [
    { label: '3.0-3.5', value: 'low', min: 3.0, max: 3.5 },
    { label: '3.5-3.7', value: 'avg', min: 3.5, max: 3.7 },
    { label: '3.7-3.9', value: 'high', min: 3.7, max: 3.9 },
    { label: '3.9+', value: 'exceptional', min: 3.9, max: 4.0 },
  ]

  const acceptanceRates = [
    { label: '<5% (Very Competitive)', value: 'very-competitive', min: 0, max: 5 },
    { label: '5-15% (Competitive)', value: 'competitive', min: 5, max: 15 },
    { label: '15-30% (Moderate)', value: 'moderate', min: 15, max: 30 },
    { label: '>30% (Less Competitive)', value: 'accessible', min: 30, max: 100 },
  ]

  const matchRates = [
    { label: '>95% (Excellent)', value: 'excellent', min: 95, max: 100 },
    { label: '90-95% (Very Good)', value: 'very-good', min: 90, max: 95 },
    { label: '85-90% (Good)', value: 'good', min: 85, max: 90 },
    { label: '<85% (Below Average)', value: 'below-avg', min: 0, max: 85 },
  ]

  const filterSections = [
    {
      title: 'COMPETITIVENESS',
      description: 'Filter by admissions stats and match outcomes',
      filters: [
        {
          type: 'chips',
          label: '📊 MCAT Range',
          key: 'mcat_range',
          options: mcatRanges
        },
        {
          type: 'chips',
          label: '🎓 GPA Range',
          key: 'gpa_range',
          options: gpaRanges
        },
        {
          type: 'chips',
          label: '📈 Acceptance Rate',
          key: 'acceptance_rate',
          options: acceptanceRates
        },
        {
          type: 'chips',
          label: '🏥 Match Rate',
          key: 'match_rate',
          options: matchRates
        }
      ]
    },
    {
      title: 'COST & ACCESSIBILITY',
      description: 'Narrow by tuition, financial aid, and IMG status',
      filters: [
        {
          type: 'chips',
          label: '💸 Tuition Range',
          key: 'tuition_range',
          options: tuitionRanges
        },
        {
          type: 'toggle',
          label: '🌍 IMG-Friendly',
          key: 'img_friendly'
        },
        {
          type: 'toggle',
          label: '💰 Financial Aid Available',
          key: 'financial_aid'
        }
      ]
    },
    {
      title: 'LOCATION & TYPE',
      description: 'Find schools by region, setting, or institution type',
      filters: [
        {
          type: 'chips',
          label: '🌆 Location Type',
          key: 'location_type',
          options: [
            { label: 'Urban', value: 'urban' },
            { label: 'Suburban', value: 'suburban' },
            { label: 'Rural', value: 'rural' }
          ]
        },
        {
          type: 'chips',
          label: '🏛️ Institution Type',
          key: 'institution_type',
          options: [
            { label: 'Public', value: 'public' },
            { label: 'Private', value: 'private' },
            { label: 'Research-Heavy', value: 'research' },
            { label: 'Community-Focused', value: 'teaching' }
          ]
        },
        {
          type: 'chips',
          label: '🗺️ Region',
          key: 'region',
          options: [
            { label: 'Northeast', value: 'northeast' },
            { label: 'Southeast', value: 'southeast' },
            { label: 'Midwest', value: 'midwest' },
            { label: 'Southwest', value: 'southwest' },
            { label: 'West Coast', value: 'west' }
          ]
        }
      ]
    },
    {
      title: 'SPECIALIZATION',
      description: 'Highlight programs with specific strengths',
      filters: [
        {
          type: 'toggle',
          label: '🔬 Strong Research Program',
          key: 'strong_research'
        },
        {
          type: 'toggle',
          label: '🏥 Primary Care Focus',
          key: 'primary_care'
        },
        {
          type: 'toggle',
          label: '🧑‍⚕️ Rural Medicine Track',
          key: 'rural_medicine'
        },
        {
          type: 'toggle',
          label: '👥 Small Class Size (<100)',
          key: 'small_class'
        },
        {
          type: 'toggle',
          label: '🔥 Highly Rated by Students',
          key: 'highly_rated'
        }
      ]
    }
  ]

  const activeFilterCount = Object.values(currentFilters).filter(v => v !== null && v !== undefined && v !== false).length

  return (
    <div className="w-[85vw] max-w-80 md:w-80 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto overscroll-contain">
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 flex items-center space-x-2">
            <span>🔧</span>
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-brand-red text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {activeFilterCount}
              </span>
            )}
          </h2>
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <button
                onClick={() => onFiltersChange({})}
                className="text-xs text-brand-red hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded font-medium transition-all duration-200"
              >
                Clear all
              </button>
            )}
            {/* Close button - visible on ALL screens */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close filters"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-6">
          {filterSections.map((section) => (
            <div key={section.title}>
              <div className="mb-3 border-b border-gray-100 pb-2">
                <h3 className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h3>
                {section.description && (
                  <p className="text-xs text-gray-400 mt-0.5">{section.description}</p>
                )}
              </div>
              
              <div className="space-y-4">
                {section.filters.map((filter) => (
                  <div key={filter.key}>
                    <div className="text-sm font-medium mb-2 text-gray-800">
                      {filter.label}
                    </div>
                    
                    {filter.type === 'chips' && (
                      <div className="flex flex-wrap gap-1.5">
                        {filter.options?.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleFilterChange(filter.key, 
                              currentFilters[filter.key] === option.value ? null : option.value
                            )}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 focus:outline-none ${
                              currentFilters[filter.key] === option.value
                                ? 'bg-red-600 text-white shadow-lg border-2 border-red-600 transform scale-105 font-semibold'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {filter.type === 'toggle' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Enable filter</span>
                        <button
                          onClick={() => handleFilterChange(filter.key, !currentFilters[filter.key])}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-opacity-50 ${
                            currentFilters[filter.key] ? 'bg-brand-red' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              currentFilters[filter.key] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}