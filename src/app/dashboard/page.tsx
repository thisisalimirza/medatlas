'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface Favorite {
  favorite_id: number
  notes: string | null
  application_deadline: string | null
  created_at: string
  place: {
    id: number
    name: string
    location_city: string
    location_state: string
    location_country: string
    type: string
    tuition_in_state: number | null
    tuition_out_state: number | null
    mcat_avg: number | null
    gpa_avg: number | null
    acceptance_rate: number | null
    img_friendly: boolean
  }
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [editingNotes, setEditingNotes] = useState<number | null>(null)
  const [editingDeadline, setEditingDeadline] = useState<number | null>(null)
  const [tempNotes, setTempNotes] = useState('')
  const [tempDeadline, setTempDeadline] = useState('')

  useEffect(() => {
    if (!authLoading && (!user || !user.is_paid)) {
      router.push('/')
      return
    }

    if (user && user.is_paid) {
      fetchFavorites()
    }
  }, [user, authLoading, router])

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      const data = await response.json()
      
      if (data.success) {
        setFavorites(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFavorite = async (placeId: number, notes?: string, deadline?: string) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_id: placeId,
          notes: notes || null,
          application_deadline: deadline || null
        })
      })

      if (response.ok) {
        fetchFavorites() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to update favorite:', error)
    }
  }

  const removeFavorite = async (placeId: number) => {
    try {
      const response = await fetch(`/api/favorites?place_id=${placeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setFavorites(prev => prev.filter(fav => fav.place.id !== placeId))
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error)
    }
  }

  const startEditingNotes = (favoriteId: number, currentNotes: string) => {
    setEditingNotes(favoriteId)
    setTempNotes(currentNotes || '')
  }

  const saveNotes = async (placeId: number, currentDeadline?: string) => {
    await updateFavorite(placeId, tempNotes, currentDeadline)
    setEditingNotes(null)
    setTempNotes('')
  }

  const startEditingDeadline = (favoriteId: number, currentDeadline: string) => {
    setEditingDeadline(favoriteId)
    setTempDeadline(currentDeadline || '')
  }

  const saveDeadline = async (placeId: number, currentNotes?: string) => {
    await updateFavorite(placeId, currentNotes, tempDeadline)
    setEditingDeadline(null)
    setTempDeadline('')
  }

  const formatTuition = (inState: number | null, outState: number | null) => {
    if (!inState && !outState) return 'Not available'
    if (inState && outState) {
      return `$${inState.toLocaleString()} / $${outState.toLocaleString()}`
    }
    return `$${(inState || outState)?.toLocaleString()}`
  }

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null
    const date = new Date(deadline)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days ago`, color: 'text-red-600' }
    } else if (diffDays === 0) {
      return { text: 'Today', color: 'text-red-600 font-bold' }
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days left`, color: 'text-orange-600 font-medium' }
    } else if (diffDays <= 30) {
      return { text: `${diffDays} days left`, color: 'text-yellow-600' }
    } else {
      return { text: `${diffDays} days left`, color: 'text-gray-600' }
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !user.is_paid) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your applications and manage your favorites</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="btn-outline"
            >
              Back to Explore
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">❤️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
                <p className="text-2xl font-bold text-gray-900">
                  {favorites.filter(fav => {
                    if (!fav.application_deadline) return false
                    const deadline = new Date(fav.application_deadline)
                    const now = new Date()
                    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    return diffDays >= 0 && diffDays <= 30
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">With Notes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {favorites.filter(fav => fav.notes?.trim()).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Favorites List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Favorite Programs</h2>
            <p className="text-gray-600 mt-1">Track applications, add notes, and manage deadlines</p>
          </div>

          {favorites.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-6xl mb-4 block">❤️</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
              <p className="text-gray-600 mb-6">Start exploring schools and add them to your favorites to track your applications.</p>
              <button
                onClick={() => router.push('/')}
                className="btn-red"
              >
                Explore Schools
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {favorites.map((favorite) => (
                <div key={favorite.favorite_id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* School Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {favorite.place.name}
                          </h3>
                          <p className="text-gray-600">
                            {favorite.place.location_city}, {favorite.place.location_state} • {favorite.place.type}
                          </p>
                          {favorite.place.img_friendly && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                              IMG Friendly
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeFavorite(favorite.place.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                          title="Remove from favorites"
                        >
                          <span className="text-lg">🗑️</span>
                        </button>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500">Tuition (In/Out)</span>
                          <p className="font-medium">{formatTuition(favorite.place.tuition_in_state, favorite.place.tuition_out_state)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Avg MCAT</span>
                          <p className="font-medium">{favorite.place.mcat_avg || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Avg GPA</span>
                          <p className="font-medium">{favorite.place.gpa_avg || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Acceptance Rate</span>
                          <p className="font-medium">{favorite.place.acceptance_rate ? `${favorite.place.acceptance_rate}%` : 'N/A'}</p>
                        </div>
                      </div>

                      {/* Notes Section */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">Notes</label>
                          {editingNotes !== favorite.favorite_id && (
                            <button
                              onClick={() => startEditingNotes(favorite.favorite_id, favorite.notes || '')}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              {favorite.notes ? 'Edit' : 'Add notes'}
                            </button>
                          )}
                        </div>
                        
                        {editingNotes === favorite.favorite_id ? (
                          <div className="space-y-2">
                            <textarea
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                              rows={3}
                              placeholder="Add your notes about this program..."
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => saveNotes(favorite.place.id, favorite.application_deadline || undefined)}
                                className="btn-red btn-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingNotes(null)
                                  setTempNotes('')
                                }}
                                className="btn-outline btn-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 min-h-[60px]">
                            {favorite.notes || 'No notes yet. Click "Add notes" to get started.'}
                          </div>
                        )}
                      </div>

                      {/* Deadline Section */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">Application Deadline</label>
                          {editingDeadline !== favorite.favorite_id && (
                            <button
                              onClick={() => startEditingDeadline(favorite.favorite_id, favorite.application_deadline || '')}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              {favorite.application_deadline ? 'Edit' : 'Add deadline'}
                            </button>
                          )}
                        </div>

                        {editingDeadline === favorite.favorite_id ? (
                          <div className="space-y-2">
                            <input
                              type="date"
                              value={tempDeadline}
                              onChange={(e) => setTempDeadline(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => saveDeadline(favorite.place.id, favorite.notes || undefined)}
                                className="btn-red btn-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingDeadline(null)
                                  setTempDeadline('')
                                }}
                                className="btn-outline btn-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm">
                            {favorite.application_deadline ? (
                              <span className={formatDeadline(favorite.application_deadline)?.color}>
                                {new Date(favorite.application_deadline).toLocaleDateString()} 
                                {formatDeadline(favorite.application_deadline) && (
                                  <span className="ml-2">
                                    ({formatDeadline(favorite.application_deadline)?.text})
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-gray-500">No deadline set</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}