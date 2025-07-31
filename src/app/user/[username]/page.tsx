'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'

interface PublicProfile {
  id: string
  username: string
  display_name: string
  stage: string
  bio: string
  location_city: string
  location_state: string
  undergraduate_school: string
  medical_school: string
  graduation_year: number
  created_at: string
}

export default function PublicProfilePage() {
  const params = useParams()
  const username = params?.username as string
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const medicalStages = [
    { value: 'premed', label: 'Pre-med Student', emoji: '📚' },
    { value: 'ms1', label: 'MS1 (First Year)', emoji: '👨‍⚕️' },
    { value: 'ms2', label: 'MS2 (Second Year)', emoji: '👩‍⚕️' },
    { value: 'ms3', label: 'MS3 (Third Year)', emoji: '🏥' },
    { value: 'ms4', label: 'MS4 (Fourth Year)', emoji: '🎓' },
    { value: 'resident', label: 'Resident', emoji: '👨‍⚕️' },
    { value: 'attending', label: 'Attending', emoji: '🩺' },
  ]

  useEffect(() => {
    if (username) {
      fetchProfile()
    }
  }, [username])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile/public/${username}`)
      const data = await response.json()
      
      if (data.success) {
        setProfile(data.profile)
      } else {
        setError(data.error || 'Profile not found')
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const getStageLabel = (stage: string) => {
    const stageData = medicalStages.find(s => s.value === stage)
    return stageData ? `${stageData.emoji} ${stageData.label}` : stage
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="text-6xl mb-4">👤</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
            <p className="text-gray-600 mb-6">
              The user @{username} doesn't exist or their profile is private.
            </p>
            <a href="/" className="btn-red">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {profile.display_name ? profile.display_name.charAt(0).toUpperCase() : profile.username.charAt(0).toUpperCase()}
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.display_name || `@${profile.username}`}
                </h1>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {getStageLabel(profile.stage)}
                </span>
              </div>
              
              <p className="text-gray-600 mb-2">@{profile.username}</p>
              
              {(profile.location_city && profile.location_state) && (
                <div className="flex items-center space-x-1 text-gray-600 mb-2">
                  <span>📍</span>
                  <span>{profile.location_city}, {profile.location_state}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1 text-gray-500 text-sm">
                <span>📅</span>
                <span>Joined {formatJoinDate(profile.created_at)}</span>
              </div>
            </div>
          </div>
          
          {/* Bio */}
          {profile.bio && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>

        {/* Education & Background */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Education & Background</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.undergraduate_school && (
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Undergraduate</h3>
                <p className="text-gray-900">{profile.undergraduate_school}</p>
              </div>
            )}
            
            {profile.medical_school && (
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Medical School</h3>
                <p className="text-gray-900">
                  {profile.medical_school}
                  {profile.graduation_year && (
                    <span className="text-gray-600 ml-2">• Class of {profile.graduation_year}</span>
                  )}
                </p>
              </div>
            )}
          </div>
          
          {!profile.undergraduate_school && !profile.medical_school && (
            <p className="text-gray-500 italic">No education information provided yet.</p>
          )}
        </div>

        {/* Future: Reviews, Activity, etc. */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity</h2>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🏗️</div>
            <p className="text-gray-600">Coming soon: Reviews, contributions, and activity timeline</p>
          </div>
        </div>

        {/* Connect */}
        <div className="mt-6 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium mb-2">Want to connect with {profile.display_name || profile.username}?</p>
            <p className="text-blue-700 text-sm">
              Join MedAtlas to message other students and share experiences
            </p>
            <a href="/" className="btn-red mt-3 inline-block">
              Join MedAtlas
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}