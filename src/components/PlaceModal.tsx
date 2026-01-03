'use client'

import { Place } from '@/types'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import AuthModal from './AuthModal'
import ReviewForm from './ReviewForm'

interface PlaceModalProps {
  place: Place | null
  isOpen: boolean
  onClose: () => void
}

export default function PlaceModal({ place, isOpen, onClose }: PlaceModalProps) {
  const [activeTab, setActiveTab] = useState('scores')
  const [placeData, setPlaceData] = useState<any>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewStats, setReviewStats] = useState<any>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [isInSchoolList, setIsInSchoolList] = useState(false)
  const [schoolListLoading, setSchoolListLoading] = useState(false)
  const [showSchoolListModal, setShowSchoolListModal] = useState(false)
  const { user } = useAuth()

  // Sample medical school images from Unsplash (same as PlaceCard)
  const getSampleImage = (placeName: string) => {
    const medicalImages = [
      { 
        url: 'https://images.unsplash.com/photo-1576091160399-112ba8d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        credit: 'Photo by Martha Dominguez de Gouveia on Unsplash'
      },
      { 
        url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
        credit: 'Photo by National Cancer Institute on Unsplash'
      },
      { 
        url: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        credit: 'Photo by Hush Naidoo Jade Photography on Unsplash'
      },
      { 
        url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2274&q=80',
        credit: 'Photo by Piron Guillaume on Unsplash'
      },
      { 
        url: 'https://images.unsplash.com/photo-1581594549595-35f6edc7b762?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        credit: 'Photo by Olga Guryanova on Unsplash'
      },
      { 
        url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2128&q=80',
        credit: 'Photo by Online Marketing on Unsplash'
      }
    ]
    
    // Use place name to consistently select same image for same place
    const hash = placeName.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return medicalImages[hash % medicalImages.length]
  }

  const sampleImage = getSampleImage(place?.name || '')
  
  // Check if photo_url is a valid, non-placeholder URL
  const isValidPhotoUrl = place?.photo_url && 
    !place.photo_url.includes('example.com') && 
    !place.photo_url.includes('placeholder') &&
    place.photo_url.startsWith('http')
  
  const imageUrl = isValidPhotoUrl ? place.photo_url! : sampleImage.url
  const shouldShowCredit = !isValidPhotoUrl

  useEffect(() => {
    if (place && isOpen) {
      // Fetch place data
      fetch(`/api/places/${place.slug}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPlaceData(data.data)
          }
        })
        .catch(console.error)

      // Fetch reviews
      fetch(`/api/reviews?place_id=${place.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setReviews(data.data.reviews)
            setReviewStats(data.data.stats)
          }
        })
        .catch(console.error)
    }
  }, [place, isOpen])

  // Separate effect for user-dependent data to avoid unnecessary refetches
  useEffect(() => {
    if (place && isOpen && user && user.is_paid) {
      checkIfFavorited()
      checkIfInSchoolList()
    }
  }, [place?.id, isOpen, user?.id, user?.is_paid])

  const checkIfFavorited = async () => {
    if (!place) return
    try {
      const response = await fetch('/api/favorites')
      const data = await response.json()
      if (data.success) {
        const favoriteExists = data.data.some((fav: any) => fav.place.id === place.id)
        setIsFavorited(favoriteExists)
      }
    } catch (error) {
      console.error('Failed to check favorites:', error)
    }
  }

  const toggleFavorite = async () => {
    if (!place || !user || !user.is_paid || favoritesLoading) return
    
    setFavoritesLoading(true)
    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?place_id=${place.id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setIsFavorited(false)
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ place_id: place.id })
        })
        if (response.ok) {
          setIsFavorited(true)
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    } finally {
      setFavoritesLoading(false)
    }
  }

  const checkIfInSchoolList = async () => {
    if (!place) return
    try {
      const response = await fetch('/api/supabase/user/school-list')
      const data = await response.json()
      if (data.success) {
        const inList = data.data.some((item: any) => item.place_id === place.id)
        setIsInSchoolList(inList)
      }
    } catch (error) {
      console.error('Failed to check school list:', error)
    }
  }

  const addToSchoolList = async (category: 'reach' | 'target' | 'safety', notes = '') => {
    if (!place || !user || !user.is_paid || schoolListLoading) return
    
    setSchoolListLoading(true)
    try {
      const response = await fetch('/api/supabase/user/school-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          place_id: place.id, 
          category,
          notes 
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setIsInSchoolList(true)
        setShowSchoolListModal(false)
      } else {
        console.error('Failed to add to school list:', data.error)
      }
    } catch (error) {
      console.error('Failed to add to school list:', error)
    } finally {
      setSchoolListLoading(false)
    }
  }

  const refreshReviews = () => {
    if (place) {
      fetch(`/api/reviews?place_id=${place.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setReviews(data.data.reviews)
            setReviewStats(data.data.stats)
            setShowReviewForm(false)
          }
        })
        .catch(console.error)
    }
  }

  if (!isOpen || !place) return null

  const tabs = [
    { id: 'scores', label: 'Scores', free: true },
    { id: 'guide', label: 'Guide', free: true },
    { id: 'pros-cons', label: 'Pros & Cons', free: false },
    { id: 'reviews', label: 'Reviews', free: false },
    { id: 'costs', label: 'Costs', free: false },
    { id: 'people', label: 'People', free: false },
  ]

  const canAccessTab = (tab: any) => {
    // Free users can now view all tabs, but premium content will have interaction prompts
    return true
  }

  const canInteractWithPremiumContent = () => {
    return user && user.is_paid
  }

  const handleTabClick = (tabId: string) => {
    // Allow all users to view all tabs
    setActiveTab(tabId)
  }

  const handlePremiumInteraction = () => {
    setIsAuthModalOpen(true)
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500'
    if (score >= 6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const renderScoreBar = (label: string, score: number, emoji: string, description?: string) => (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-base">{emoji}</span>
          <span className="text-sm font-medium text-gray-900">{label}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900">{score}/10</span>
          <div className={`w-2 h-2 rounded-full ${getScoreColor(score)}`}></div>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${getScoreColor(score)}`}
          style={{ width: `${score * 10}%` }}
        ></div>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1 ml-6">{description}</p>
      )}
    </div>
  )

  const renderTabContent = () => {
    if (!placeData) return <div className="p-6">Loading...</div>

    switch (activeTab) {
      case 'scores':
        return (
          <div className="p-6">
            {/* Overall Score like nomad */}
            <div className="mb-8 p-6 bg-gradient-to-r from-brand-red to-red-600 rounded-xl text-white">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {((place.scores.quality_of_training + place.scores.match_strength + place.scores.community_score + place.scores.lifestyle) / 4).toFixed(1)}
                </div>
                <div className="text-lg font-medium opacity-90">Overall Score</div>
                <div className="text-sm opacity-75 mt-1">Based on 4 key factors</div>
              </div>
            </div>

            {/* Individual Scores */}
            <div className="space-y-6">
              {renderScoreBar('Quality of Training', place.scores.quality_of_training, '🎓', 'Clinical education and academic reputation')}
              {renderScoreBar('Match Strength', place.scores.match_strength, '🎯', 'Residency match success rate and outcomes')}
              {renderScoreBar('Community Score', place.scores.community_score, '👥', 'Student support and collaborative environment')}
              {renderScoreBar('Lifestyle Balance', place.scores.lifestyle, '⚖️', 'Work-life balance and student wellbeing')}
              {renderScoreBar('Low Burnout', 10 - place.scores.burnout, '🧘', 'Stress management and mental health support')}
            </div>

            {/* Quick Info Card */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-brand-red">{(place.metrics.tuition || 0) === 0 ? 'Free' : `$${Math.round((place.metrics.tuition || 0) / 1000)}K`}</div>
                <div className="text-sm text-gray-600">Annual Tuition</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-brand-red">${Math.round(place.metrics.col_index || 0)}</div>
                <div className="text-sm text-gray-600">Cost of Living (monthly)</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-brand-red">#{place.rank_overall ? Math.round(place.rank_overall * 10) : '?'}</div>
                <div className="text-sm text-gray-600">National Ranking</div>
              </div>
            </div>
          </div>
        )

      case 'guide':
        return (
          <div className="p-6">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-4">What to Expect</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Overview</h4>
                  <p className="text-gray-700">{placeData.guide?.overview}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Curriculum</h4>
                  <p className="text-gray-700">{placeData.guide?.curriculum}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Clinical Rotations</h4>
                  <p className="text-gray-700">{placeData.guide?.rotations}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Residency Matching</h4>
                  <p className="text-gray-700">{placeData.guide?.residencyMatching}</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'pros-cons':
        return (
          <div className="p-6">
            {/* Free users see this with upgrade prompts */}
            {!canInteractWithPremiumContent() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600">⭐</span>
                  <div>
                    <p className="text-yellow-800 font-medium">Premium Content Preview</p>
                    <p className="text-yellow-700 text-sm">You can view this content, but click any item to unlock full insights and add your own reviews.</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-green-700 flex items-center">
                  👍 Pros
                  {!canInteractWithPremiumContent() && (
                    <button 
                      onClick={handlePremiumInteraction}
                      className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full hover:bg-yellow-600 transition-colors"
                    >
                      Upgrade to Add ⭐
                    </button>
                  )}
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <button 
                      className="text-left text-gray-700 hover:text-green-700 transition-colors"
                      onClick={canInteractWithPremiumContent() ? undefined : handlePremiumInteraction}
                    >
                      Excellent clinical training reputation
                    </button>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <button 
                      className="text-left text-gray-700 hover:text-green-700 transition-colors"
                      onClick={canInteractWithPremiumContent() ? undefined : handlePremiumInteraction}
                    >
                      Strong research opportunities
                    </button>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <button 
                      className="text-left text-gray-700 hover:text-green-700 transition-colors"
                      onClick={canInteractWithPremiumContent() ? undefined : handlePremiumInteraction}
                    >
                      Diverse patient population for clinical experience
                    </button>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <button 
                      className="text-left text-gray-700 hover:text-green-700 transition-colors"
                      onClick={canInteractWithPremiumContent() ? undefined : handlePremiumInteraction}
                    >
                      Strong alumni network and mentorship programs
                    </button>
                  </li>
                  {!canInteractWithPremiumContent() && (
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <button 
                        className="text-left text-gray-500 italic"
                        onClick={handlePremiumInteraction}
                      >
                        + 6 more insights from current students...
                      </button>
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-red-700 flex items-center">
                  👎 Cons
                  {!canInteractWithPremiumContent() && (
                    <button 
                      onClick={handlePremiumInteraction}
                      className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full hover:bg-yellow-600 transition-colors"
                    >
                      Upgrade to Add ⭐
                    </button>
                  )}
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">×</span>
                    <button 
                      className="text-left text-gray-700 hover:text-red-700 transition-colors"
                      onClick={canInteractWithPremiumContent() ? undefined : handlePremiumInteraction}
                    >
                      High cost of living in the area
                    </button>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">×</span>
                    <button 
                      className="text-left text-gray-700 hover:text-red-700 transition-colors"
                      onClick={canInteractWithPremiumContent() ? undefined : handlePremiumInteraction}
                    >
                      Very competitive internal atmosphere
                    </button>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">×</span>
                    <button 
                      className="text-left text-gray-700 hover:text-red-700 transition-colors"
                      onClick={canInteractWithPremiumContent() ? undefined : handlePremiumInteraction}
                    >
                      Limited parking and transportation challenges
                    </button>
                  </li>
                  {!canInteractWithPremiumContent() && (
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">×</span>
                      <button 
                        className="text-left text-gray-500 italic"
                        onClick={handlePremiumInteraction}
                      >
                        + 4 more concerns from residents...
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )

      case 'reviews':
        return (
          <div className="p-6">
            {/* Free users see this with upgrade prompts */}
            {!canInteractWithPremiumContent() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600">⭐</span>
                  <div>
                    <p className="text-yellow-800 font-medium">Premium Reviews Preview</p>
                    <p className="text-yellow-700 text-sm">Read student reviews, but upgrade to write your own and access the full database.</p>
                  </div>
                </div>
              </div>
            )}
            {/* Review Stats */}
            {reviewStats && reviewStats.total > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-yellow-800">
                      {reviewStats.total} Reviews • {reviewStats.average_rating}/5 Average
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex text-yellow-400">
                        {'★'.repeat(Math.round(reviewStats.average_rating))}{'☆'.repeat(5 - Math.round(reviewStats.average_rating))}
                      </div>
                      <span className="text-sm text-yellow-700">
                        Based on {reviewStats.total} student{reviewStats.total !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={canInteractWithPremiumContent() ? () => setShowReviewForm(!showReviewForm) : handlePremiumInteraction}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      canInteractWithPremiumContent() 
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-gray-200 hover:bg-yellow-500 text-gray-700 hover:text-white'
                    }`}
                  >
                    {canInteractWithPremiumContent() 
                      ? (showReviewForm ? 'Cancel' : 'Write Review')
                      : 'Upgrade to Review ⭐'
                    }
                  </button>
                </div>
              </div>
            )}

            {/* Review Form */}
            {showReviewForm && (
              <div className="mb-6">
                <ReviewForm
                  placeId={place.id}
                  placeName={place.name}
                  onSuccess={refreshReviews}
                />
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                  <p className="text-gray-600 mb-4">Be the first to share your experience at {place.name}</p>
                  <button
                    onClick={canInteractWithPremiumContent() ? () => setShowReviewForm(true) : handlePremiumInteraction}
                    className="btn-red"
                  >
                    {canInteractWithPremiumContent() ? 'Write the First Review' : 'Upgrade to Write Reviews ⭐'}
                  </button>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                          {review.author.display_name ? review.author.display_name[0].toUpperCase() : review.author.stage[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">
                            {review.is_anonymous ? `Anonymous ${review.author.stage.toUpperCase()}` : review.author.display_name || `${review.author.stage.toUpperCase()} Student`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex text-yellow-400 text-lg">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {review.body}
                    </p>
                    
                    {review.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {review.tags.map((tag: string) => (
                          <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            {tag.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Empty state for first review */}
            {reviews.length === 0 && !showReviewForm && (
              <div className="mt-6">
                <ReviewForm
                  placeId={place.id}
                  placeName={place.name}
                  onSuccess={refreshReviews}
                />
              </div>
            )}
          </div>
        )

      case 'costs':
        return (
          <div className="p-6">
            {!canInteractWithPremiumContent() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600">⭐</span>
                  <div>
                    <p className="text-yellow-800 font-medium">Premium Cost Analysis</p>
                    <p className="text-yellow-700 text-sm">View basic costs here, upgrade for detailed breakdowns, budgeting tools, and cost comparisons.</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  💰 Tuition & Fees
                  {!canInteractWithPremiumContent() && (
                    <button 
                      onClick={handlePremiumInteraction}
                      className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full hover:bg-yellow-600 transition-colors"
                    >
                      Full Analysis ⭐
                    </button>
                  )}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>In-State Tuition</span>
                    <button 
                      className="font-medium text-right hover:text-brand-red transition-colors"
                      onClick={canInteractWithPremiumContent() ? undefined : handlePremiumInteraction}
                    >
                      $45,000
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span>Out-of-State Tuition</span>
                    <button 
                      className="font-medium text-right hover:text-brand-red transition-colors"
                      onClick={canInteractWithPremiumContent() ? undefined : handlePremiumInteraction}
                    >
                      $65,000
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span>Living Expenses</span>
                    <button 
                      className="font-medium text-right hover:text-brand-red transition-colors"
                      onClick={canInteractWithPremiumContent() ? undefined : handlePremiumInteraction}
                    >
                      $18,000
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span>Books & Supplies</span>
                    <button 
                      className="font-medium text-right hover:text-brand-red transition-colors"
                      onClick={canInteractWithPremiumContent() ? undefined : handlePremiumInteraction}
                    >
                      $2,500
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  🏠 Cost of Living
                  {!canInteractWithPremiumContent() && (
                    <button 
                      onClick={handlePremiumInteraction}
                      className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full hover:bg-yellow-600 transition-colors"
                    >
                      Area Guide ⭐
                    </button>
                  )}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Rent (1BR)</span>
                    <button 
                      className="font-medium text-right hover:text-brand-red transition-colors"
                      onClick={canInteractWithPremiumContent() ? undefined : handlePremiumInteraction}
                    >
                      $1,200/mo
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span>Food & Groceries</span>
                    <button 
                      className="font-medium text-right hover:text-brand-red transition-colors"
                      onClick={canInteractWithPremiumContent() ? undefined : handlePremiumInteraction}
                    >
                      $400/mo
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span>Transportation</span>
                    <button 
                      className="font-medium text-right hover:text-brand-red transition-colors"
                      onClick={canInteractWithPremiumContent() ? undefined : handlePremiumInteraction}
                    >
                      $150/mo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'people':
        return (
          <div className="p-6">
            {!canInteractWithPremiumContent() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600">⭐</span>
                  <div>
                    <p className="text-yellow-800 font-medium">Premium Student Network</p>
                    <p className="text-yellow-700 text-sm">See student profiles here, upgrade to message them and join study groups.</p>
                  </div>
                </div>
              </div>
            )}
            
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              👥 Connect with Students
              {!canInteractWithPremiumContent() && (
                <button 
                  onClick={handlePremiumInteraction}
                  className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full hover:bg-yellow-600 transition-colors"
                >
                  Message Students ⭐
                </button>
              )}
            </h3>
            
            {/* Student profiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                className="border border-gray-200 rounded-lg p-4 text-left hover:border-brand-red hover:shadow-sm transition-all duration-200"
                onClick={canInteractWithPremiumContent() ? undefined : handlePremiumInteraction}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    A
                  </div>
                  <div>
                    <div className="font-medium">MS2 Student</div>
                    <div className="text-sm text-gray-500">Class of 2026</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Looking for study partners for boards prep...</p>
              </button>
              
              <button 
                className="border border-gray-200 rounded-lg p-4 text-left hover:border-brand-red hover:shadow-sm transition-all duration-200"
                onClick={canInteractWithPremiumContent() ? undefined : handlePremiumInteraction}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                    B
                  </div>
                  <div>
                    <div className="font-medium">MS3 Student</div>
                    <div className="text-sm text-gray-500">Class of 2025</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Happy to help with clinical rotations advice...</p>
              </button>
              
              <button 
                className="border border-gray-200 rounded-lg p-4 text-left hover:border-brand-red hover:shadow-sm transition-all duration-200"
                onClick={canInteractWithPremiumContent() ? undefined : handlePremiumInteraction}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    C
                  </div>
                  <div>
                    <div className="font-medium">MS4 Student</div>
                    <div className="text-sm text-gray-500">Class of 2024</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Matched into internal medicine, AMA about Match...</p>
              </button>
              
              {!canInteractWithPremiumContent() && (
                <button 
                  onClick={handlePremiumInteraction}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-yellow-500 hover:bg-yellow-50 transition-all duration-200"
                >
                  <div className="text-gray-500">
                    <div className="text-2xl mb-2">+</div>
                    <div className="font-medium">24 more students</div>
                    <div className="text-xs">Upgrade to connect</div>
                  </div>
                </button>
              )}
            </div>
          </div>
        )

      default:
        return (
          <div className="p-6">
            {/* Generic teaser for other tabs */}
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🏥</div>
              <h3 className="text-lg font-semibold mb-2">More Information Available</h3>
              <p className="text-gray-600 mb-6">
                Get access to detailed insights about {place.name}
              </p>
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-red"
              >
                Join MedAtlas →
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header - Cleaner, nomad-style */}
        <div className="sticky top-0 bg-white border-b border-gray-200">
          {/* Image Section */}
          <div className="relative h-48 bg-gray-200 overflow-hidden">
            <Image
              src={imageUrl}
              alt={place.name}
              fill
              className="object-cover"
            />
            {/* Overlay with basic info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-6 text-white">
              <h1 className="text-3xl font-bold mb-1">{place.name}</h1>
              <p className="text-lg opacity-90">{place.city}, {place.state}</p>
              <p className="text-sm opacity-75">{place.institution}</p>
            </div>
            {/* Image credit */}
            {shouldShowCredit && (
              <div className="absolute bottom-2 right-2 text-xs text-white/60">
                {sampleImage.credit}
              </div>
            )}
          </div>

          {/* Title Section */}
          <div className="px-6 pt-4 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {user && user.is_paid && (
                  <button
                    onClick={toggleFavorite}
                    disabled={favoritesLoading}
                    className={`p-2 rounded-full transition-all duration-200 hover:bg-red-50 group ${
                      isFavorited
                        ? 'text-red-500 hover:text-red-600'
                        : 'text-gray-400 hover:text-red-500'
                    } ${favoritesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform inline-block">
                      {favoritesLoading ? '⏳' : isFavorited ? '❤️' : '🤍'}
                    </span>
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {!user ? (
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-brand-red hover:bg-red-600 text-white font-medium px-4 py-2 rounded-full text-sm transition-colors"
                  >
                    Join community in {place.city}
                  </button>
                ) : !user.is_paid ? (
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-brand-red hover:bg-red-600 text-white font-medium px-4 py-2 rounded-full text-sm transition-colors"
                  >
                    Upgrade to Pro
                  </button>
                ) : (
                  <>
                    {!isInSchoolList ? (
                      <button 
                        onClick={() => setShowSchoolListModal(true)}
                        disabled={schoolListLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-full text-sm transition-colors disabled:opacity-50"
                      >
                        {schoolListLoading ? '⏳' : '📋 Add to School List'}
                      </button>
                    ) : (
                      <div className="bg-blue-50 text-blue-700 font-medium px-3 py-1 rounded-full text-sm">
                        ✓ In School List
                      </div>
                    )}
                    <div className="bg-green-50 text-green-700 font-medium px-3 py-1 rounded-full text-sm">
                      ✓ Pro Member
                    </div>
                  </>
                )}
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all duration-200 group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform inline-block">×</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Tabs - Cleaner design */}
          <div className="px-6">
            <div className="flex overflow-x-auto border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`relative whitespace-nowrap px-4 py-3 transition-all duration-200 font-medium text-sm group ${
                    activeTab === tab.id
                      ? 'text-brand-red border-b-2 border-brand-red -mb-px'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                  {!tab.free && !canInteractWithPremiumContent() && (
                    <span className="ml-1 text-xs text-yellow-500 group-hover:scale-110 transition-transform inline-block">⭐</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] overscroll-contain">
          {renderTabContent()}
        </div>
      </div>

      {/* School List Modal */}
      {showSchoolListModal && (
        <div className="modal-overlay" onClick={() => setShowSchoolListModal(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add to School List</h2>
              <p className="text-gray-600 mb-6">
                Categorize {place.name} in your application list
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => addToSchoolList('safety')}
                  disabled={schoolListLoading}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-green-700">🟢 Safety School</div>
                      <div className="text-sm text-gray-600">High chance of acceptance</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => addToSchoolList('target')}
                  disabled={schoolListLoading}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all duration-200 disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-yellow-700">🟡 Target School</div>
                      <div className="text-sm text-gray-600">Good match for your stats</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => addToSchoolList('reach')}
                  disabled={schoolListLoading}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-red-700">🔴 Reach School</div>
                      <div className="text-sm text-gray-600">Competitive choice</div>
                    </div>
                  </div>
                </button>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowSchoolListModal(false)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signup"
      />
    </div>
  )
}