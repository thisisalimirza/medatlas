'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useRouter } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-server'
import Header from '@/components/Header'

interface SchoolSuggestion {
  id: number
  user_id: string
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

export default function AdminSchoolSuggestionsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [suggestions, setSuggestions] = useState<SchoolSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  // Check if user is admin (you'll need to update this with actual admin logic)
  const isAdmin = user?.email === 'admin@medatlas.com' || user?.email?.includes('@medatlas.com')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }

    if (!authLoading && user && !isAdmin) {
      router.push('/dashboard')
      return
    }

    if (user && isAdmin) {
      fetchSuggestions()
    }
  }, [user, authLoading, isAdmin, filter])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/school-suggestions?status=${filter === 'all' ? '' : filter}`)
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

  const updateSuggestionStatus = async (id: number, status: 'approved' | 'rejected', adminNotes?: string) => {
    try {
      const response = await fetch('/api/admin/school-suggestions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status,
          admin_notes: adminNotes
        })
      })

      const data = await response.json()

      if (data.success) {
        // Update the suggestion in the list
        setSuggestions(prev => 
          prev.map(suggestion => 
            suggestion.id === id 
              ? { ...suggestion, status, admin_notes: adminNotes || '', updated_at: new Date().toISOString() }
              : suggestion
          )
        )
      } else {
        setError(data.error || 'Failed to update suggestion')
      }
    } catch (error) {
      console.error('Error updating suggestion:', error)
      setError('Network error')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin panel...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">School Suggestions Admin</h1>
          <p className="text-gray-600 mt-2">Review and manage school suggestions from users</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'pending', label: 'Pending', count: suggestions.filter(s => s.status === 'pending').length },
                { key: 'approved', label: 'Approved', count: suggestions.filter(s => s.status === 'approved').length },
                { key: 'rejected', label: 'Rejected', count: suggestions.filter(s => s.status === 'rejected').length },
                { key: 'all', label: 'All', count: suggestions.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    filter === tab.key
                      ? 'border-brand-red text-brand-red'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Suggestions List */}
        <div className="space-y-4">
          {suggestions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No suggestions found for the selected filter.</p>
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <div key={suggestion.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{suggestion.school_name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        suggestion.school_type === 'medical' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {suggestion.school_type === 'medical' ? 'Medical School' : 'University'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        suggestion.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        suggestion.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
                      </span>
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
                        <p className="text-sm font-medium text-gray-700 mb-1">Admin Notes</p>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">{suggestion.admin_notes}</p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Submitted on {new Date(suggestion.created_at).toLocaleDateString()} • 
                      Last updated {new Date(suggestion.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  {suggestion.status === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => updateSuggestionStatus(suggestion.id, 'approved')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Rejection reason (optional):')
                          updateSuggestionStatus(suggestion.id, 'rejected', notes || undefined)
                        }}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}