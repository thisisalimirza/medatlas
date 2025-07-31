'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import AuthModal from '@/components/AuthModal'

interface UserStats {
  mcat: number | null
  gpa: number | null
  state: string
  research_months: number
  clinical_hours: number
  volunteer_hours: number
  shadowing_hours: number
  leadership: boolean
  publications: number
  specialty_interest: string
}

interface SchoolListItem {
  id: number
  school_name: string
  category: 'reach' | 'target' | 'safety'
  acceptance_odds: number
  notes: string
  application_status: 'planning' | 'primary_submitted' | 'secondary_received' | 'secondary_submitted' | 'interview_invite' | 'interviewed' | 'accepted' | 'waitlisted' | 'rejected'
  added_date: string
}

export default function SchoolListPage() {
  const { user } = useAuth()
  const [userStats, setUserStats] = useState<UserStats>({
    mcat: null,
    gpa: null,
    state: '',
    research_months: 0,
    clinical_hours: 0,
    volunteer_hours: 0,
    shadowing_hours: 0,
    leadership: false,
    publications: 0,
    specialty_interest: ''
  })
  const [schoolList, setSchoolList] = useState<SchoolListItem[]>([])
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<'all' | 'reach' | 'target' | 'safety'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.is_paid) {
      loadUserData()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadUserData = async () => {
    try {
      // Load user stats and school list from API
      const [statsResponse, listResponse] = await Promise.all([
        fetch('/api/supabase/user/stats'),
        fetch('/api/supabase/user/school-list')
      ])
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setUserStats(statsData.data || userStats)
      }
      
      if (listResponse.ok) {
        const listData = await listResponse.json()
        setSchoolList(listData.data || [])
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCompetitivenessScore = () => {
    if (!userStats.mcat || !userStats.gpa) return 0
    
    // Simple competitiveness algorithm
    const mcatScore = Math.min(userStats.mcat / 528 * 100, 100)
    const gpaScore = Math.min(userStats.gpa / 4.0 * 100, 100)
    const experienceScore = Math.min(
      (userStats.research_months * 2 + 
       userStats.clinical_hours / 50 + 
       userStats.volunteer_hours / 100 + 
       userStats.shadowing_hours / 20 +
       (userStats.leadership ? 10 : 0) +
       userStats.publications * 5) / 2, 100
    )
    
    return Math.round((mcatScore * 0.4 + gpaScore * 0.4 + experienceScore * 0.2))
  }

  const getCategoryStats = () => {
    const reach = schoolList.filter(s => s.category === 'reach').length
    const target = schoolList.filter(s => s.category === 'target').length
    const safety = schoolList.filter(s => s.category === 'safety').length
    return { reach, target, safety, total: reach + target + safety }
  }

  const filteredList = activeCategory === 'all' 
    ? schoolList 
    : schoolList.filter(school => school.category === activeCategory)

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h1 className="text-2xl font-bold mb-2">School List Builder</h1>
              <p className="text-gray-600 mb-6">
                Build and manage your medical school application list with AI-powered recommendations
              </p>
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-red w-full"
              >
                Sign Up to Build Your List
              </button>
            </div>
          </div>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode="signup"
        />
      </div>
    )
  }

  if (!user.is_paid) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h1 className="text-2xl font-bold mb-2">Premium Feature</h1>
              <p className="text-gray-600 mb-6">
                The School List Builder is available for MedAtlas Pro members. Build smart lists with competitiveness analysis.
              </p>
              <div className="space-y-3 mb-6 text-left">
                <div className="flex items-center text-sm text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>AI-powered reach/target/safety categorization</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Application status tracking</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Personalized acceptance odds</span>
                </div>
              </div>
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-red w-full"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode="signup"
        />
      </div>
    )
  }

  const competitivenessScore = getCompetitivenessScore()
  const categoryStats = getCategoryStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <span>📋</span>
                <span>My School List</span>
              </h1>
              <p className="text-gray-600 mt-1">
                Build and track your medical school application list
              </p>
            </div>
            {(!userStats.mcat || !userStats.gpa) && (
              <button
                onClick={() => setIsStatsModalOpen(true)}
                className="bg-brand-red hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Add Your Stats
              </button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border">
            <div className="text-2xl font-bold text-brand-red">{categoryStats.total}</div>
            <div className="text-sm text-gray-500">Total Schools</div>
          </div>
          <div className="bg-white rounded-lg p-6 border">
            <div className="text-2xl font-bold text-green-600">{categoryStats.safety}</div>
            <div className="text-sm text-gray-500">Safety Schools</div>
          </div>
          <div className="bg-white rounded-lg p-6 border">
            <div className="text-2xl font-bold text-yellow-600">{categoryStats.target}</div>
            <div className="text-sm text-gray-500">Target Schools</div>
          </div>
          <div className="bg-white rounded-lg p-6 border">
            <div className="text-2xl font-bold text-red-600">{categoryStats.reach}</div>
            <div className="text-sm text-gray-500">Reach Schools</div>
          </div>
        </div>

        {/* Competitiveness Score */}
        {userStats.mcat && userStats.gpa && (
          <div className="bg-white rounded-lg p-6 border mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Your Competitiveness Score</h3>
                <p className="text-gray-600 text-sm">Based on MCAT {userStats.mcat}, GPA {userStats.gpa}, and experiences</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-brand-red">{competitivenessScore}/100</div>
                <button
                  onClick={() => setIsStatsModalOpen(true)}
                  className="text-sm text-brand-red hover:text-red-600"
                >
                  Update Stats
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex space-x-2 mb-6">
          {(['all', 'safety', 'target', 'reach'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-brand-red text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border'
              }`}
            >
              {category === 'all' ? 'All Schools' : `${category.charAt(0).toUpperCase() + category.slice(1)} (${
                category === 'safety' ? categoryStats.safety :
                category === 'target' ? categoryStats.target :
                categoryStats.reach
              })`}
            </button>
          ))}
        </div>

        {/* School List */}
        <div className="bg-white rounded-lg border">
          {filteredList.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">🏫</div>
              <h3 className="text-lg font-medium mb-2">No schools in your list yet</h3>
              <p className="text-gray-600 mb-6">
                {!userStats.mcat || !userStats.gpa 
                  ? "Add your MCAT and GPA first to get personalized school recommendations"
                  : "Start building your list by browsing medical schools"
                }
              </p>
              <div className="space-x-3">
                {(!userStats.mcat || !userStats.gpa) && (
                  <button
                    onClick={() => setIsStatsModalOpen(true)}
                    className="btn-red"
                  >
                    Add Your Stats
                  </button>
                )}
                <button
                  onClick={() => window.location.href = '/'}
                  className="btn-outline"
                >
                  Browse Schools
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {filteredList.map((school) => (
                <div key={school.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900">{school.school_name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          school.category === 'safety' ? 'bg-green-100 text-green-800' :
                          school.category === 'target' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {school.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          {school.acceptance_odds}% acceptance odds
                        </span>
                      </div>
                      {school.notes && (
                        <p className="text-sm text-gray-600 mt-1">{school.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={school.application_status}
                        className="text-sm border rounded px-2 py-1"
                        onChange={(e) => {
                          // Update status logic here
                        }}
                      >
                        <option value="planning">Planning</option>
                        <option value="primary_submitted">Primary Submitted</option>
                        <option value="secondary_received">Secondary Received</option>
                        <option value="secondary_submitted">Secondary Submitted</option>
                        <option value="interview_invite">Interview Invite</option>
                        <option value="interviewed">Interviewed</option>
                        <option value="accepted">Accepted</option>
                        <option value="waitlisted">Waitlisted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <button className="text-gray-400 hover:text-red-500">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Modal - We'll build this next */}
      {isStatsModalOpen && (
        <div className="modal-overlay" onClick={() => setIsStatsModalOpen(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Update Your Stats</h2>
              <p className="text-gray-600 mb-6">Help us give you better school recommendations</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">MCAT Score</label>
                    <input
                      type="number"
                      min="472"
                      max="528"
                      value={userStats.mcat || ''}
                      onChange={(e) => setUserStats({...userStats, mcat: parseInt(e.target.value) || null})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g. 515"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Overall GPA</label>
                    <input
                      type="number"
                      min="0"
                      max="4"
                      step="0.01"
                      value={userStats.gpa || ''}
                      onChange={(e) => setUserStats({...userStats, gpa: parseFloat(e.target.value) || null})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g. 3.75"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">State Residency</label>
                  <select
                    value={userStats.state}
                    onChange={(e) => setUserStats({...userStats, state: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select State</option>
                    <option value="CA">California</option>
                    <option value="TX">Texas</option>
                    <option value="NY">New York</option>
                    <option value="FL">Florida</option>
                    {/* Add more states */}
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setIsStatsModalOpen(false)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/supabase/user/stats', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(userStats)
                      })
                      
                      if (response.ok) {
                        setIsStatsModalOpen(false)
                        await loadUserData() // Refresh data
                      } else {
                        console.error('Failed to save stats')
                      }
                    } catch (error) {
                      console.error('Failed to save stats:', error)
                    }
                  }}
                  className="flex-1 btn-red"
                >
                  Save Stats
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}