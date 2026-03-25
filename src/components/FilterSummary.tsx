'use client'

import { useAuth } from '@/contexts/SupabaseAuthContext'

interface FilterSummaryProps {
  filters: any
  onFilterChange: (key: string, value: any) => void
  onFiltersChange: (filters: any) => void
  onClearFilters: () => void
  resultsCount: number
}

export default function FilterSummary({ filters, onFilterChange, onClearFilters, resultsCount }: FilterSummaryProps) {
  const { user } = useAuth()
  
  const activeFilters = Object.entries(filters).filter(([key, value]) => 
    value !== null && value !== undefined && value !== false && value !== ''
  )

  const getFilterLabel = (key: string, value: any) => {
    const filterLabels: Record<string, Record<string, string>> = {
      mcat_range: {
        'below-avg': 'MCAT 500-510',
        'avg': 'MCAT 511-515',
        'above-avg': 'MCAT 516-520',
        'exceptional': 'MCAT 521+'
      },
      gpa_range: {
        'low': 'GPA 3.0-3.5',
        'avg': 'GPA 3.5-3.7',
        'high': 'GPA 3.7-3.9',
        'exceptional': 'GPA 3.9+'
      },
      acceptance_rate: {
        'very-competitive': '<5% Acceptance',
        'competitive': '5-15% Acceptance',
        'moderate': '15-30% Acceptance',
        'accessible': '>30% Acceptance'
      },
      match_rate: {
        'excellent': '>95% Match Rate',
        'very-good': '90-95% Match Rate',
        'good': '85-90% Match Rate',
        'below-avg': '<85% Match Rate'
      },
      tuition_range: {
        'free': 'Free Tuition',
        'low': '<$20K Tuition',
        'medium': '$20K-40K Tuition',
        'high': '$40K-60K Tuition',
        'very-high': '>$60K Tuition'
      },
      location_type: {
        'urban': 'Urban',
        'suburban': 'Suburban',
        'rural': 'Rural'
      },
      institution_type: {
        'public': 'Public',
        'private': 'Private',
        'research': 'Research-Heavy',
        'teaching': 'Community-Focused'
      },
      region: {
        'northeast': 'Northeast',
        'southeast': 'Southeast',
        'midwest': 'Midwest',
        'southwest': 'Southwest',
        'west': 'West Coast'
      }
    }

    const booleanLabels: Record<string, string> = {
      img_friendly: 'IMG-Friendly',
      financial_aid: 'Financial Aid',
      strong_research: 'Strong Research',
      primary_care: 'Primary Care Focus',
      rural_medicine: 'Rural Medicine',
      small_class: 'Small Class Size',
      highly_rated: 'Highly Rated'
    }

    if (typeof value === 'boolean' && value) {
      return booleanLabels[key] || key
    }

    return filterLabels[key]?.[value] || `${key}: ${value}`
  }

  const smartSuggestions = [
    {
      label: '🌟 Top Ranked Schools',
      filters: { mcat_range: 'above-avg', acceptance_rate: 'very-competitive' },
      description: 'Most competitive medical schools'
    },
    {
      label: '💰 Affordable Options',
      filters: { tuition_range: 'low', financial_aid: true },
      description: 'Budget-friendly schools with aid'
    },
    {
      label: '🌍 IMG-Friendly Schools',
      filters: { img_friendly: true },
      description: 'Welcoming to international students'
    },
    {
      label: '🔬 Research Powerhouses',
      filters: { strong_research: true, institution_type: 'research' },
      description: 'Top research opportunities'
    },
    {
      label: '🏥 Primary Care Track',
      filters: { primary_care: true, match_rate: 'excellent' },
      description: 'Strong primary care programs'
    }
  ]

  const applySuggestion = (suggestion: any) => {
    onFiltersChange(suggestion.filters)
  }

  return (
    <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-2 sm:py-3">
      <div className="max-w-6xl mx-auto">
        {/* Smart Suggestions — compact horizontal scroll on mobile, card grid on desktop */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide md:hidden pb-1">
          <span className="text-xs text-gray-400 flex-shrink-0">Quick:</span>
          {smartSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => applySuggestion(suggestion)}
              className="flex-shrink-0 px-2.5 py-1 border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:border-brand-red hover:bg-red-50 hover:text-brand-red transition-colors"
            >
              {suggestion.label}
            </button>
          ))}
        </div>

        {/* Desktop: card grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
          {smartSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => applySuggestion(suggestion)}
              className="text-left p-3 border border-gray-200 rounded-lg hover:border-brand-red hover:bg-red-50 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="font-medium text-sm text-gray-900 group-hover:text-brand-red mb-1">
                {suggestion.label}
              </div>
              <div className="text-xs text-gray-600">
                {suggestion.description}
              </div>
            </button>
          ))}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between pt-1.5 sm:pt-3 sm:border-t sm:border-gray-100">
          <div className="text-xs sm:text-sm text-gray-600">
            {resultsCount === 0 ? (
              'No schools match'
            ) : (
              <>
                <span className="font-medium text-gray-900">{resultsCount}</span>
                <span className="hidden sm:inline"> medical school{resultsCount !== 1 ? 's' : ''} found</span>
                <span className="sm:hidden"> programs</span>
                {activeFilters.length > 0 && (
                  <span className="text-gray-500 hidden sm:inline"> with {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} applied</span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeFilters.length > 0 && (
              <button
                onClick={onClearFilters}
                className="text-xs text-red-600 hover:text-red-800 hover:bg-red-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium transition-all duration-200"
              >
                Clear filters
              </button>
            )}
            {user && user.is_paid && resultsCount > 0 && (
              <div className="text-xs text-gray-500 hidden sm:block">
                💡 Add schools to favorites to track applications
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}