'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

interface SchoolSuggestion {
  id: number
  school_name: string
  school_type: 'undergraduate' | 'medical'
  location_city: string
  location_state: string
  website_url: string
  additional_info: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string
  created_at: string
  updated_at: string
}

export default function MySuggestionsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [suggestions, setSuggestions] = useState<SchoolSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }

    if (user) {
      fetchSuggestions()
    }
  }, [user, authLoading])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/school-suggestions')
      const data = await response.json()

      if (data.success) {
        setSuggestions(data.suggestions)
      } else {
        setError(data.error || 'Failed to fetch suggestions')
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'approved':
        return '✅'
      case 'rejected':
        return '❌'
      default:
        return '❓'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your suggestions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My School Suggestions</h1>
          <p className="text-gray-600 mt-2">Track the status of schools you've suggested to be added to our database</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Suggestions List */}
        {suggestions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏫</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions yet</h3>
            <p className="text-gray-500 mb-6">
              When you suggest schools from your profile page, they'll appear here for you to track their status.
            </p>
            <button
              onClick={() => router.push('/profile')}
              className="btn-red"
            >
              Go to Profile
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{suggestion.school_name}</h3>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        suggestion.school_type === 'medical' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {suggestion.school_type === 'medical' ? 'Medical School' : 'University'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getStatusColor(suggestion.status)}`}>
                        <span>{getStatusIcon(suggestion.status)}</span>
                        <span>{suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {suggestion.location_city && suggestion.location_state && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-sm text-gray-600">{suggestion.location_city}, {suggestion.location_state}</p>
                    </div>
                  )}
                  {suggestion.website_url && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Website</p>
                      <a 
                        href={suggestion.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        {suggestion.website_url}
                      </a>
                    </div>
                  )}
                </div>

                {suggestion.additional_info && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Additional Information</p>
                    <p className="text-sm text-gray-600">{suggestion.additional_info}</p>
                  </div>
                )}

                {suggestion.admin_notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Admin Response</p>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">{suggestion.admin_notes}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Submitted on {new Date(suggestion.created_at).toLocaleDateString()}</span>
                  {suggestion.updated_at !== suggestion.created_at && (
                    <span>Updated {new Date(suggestion.updated_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}