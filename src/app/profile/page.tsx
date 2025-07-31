'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

interface UserProfile {
  id: string
  email: string
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

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<UserProfile>>({})
  const [saving, setSaving] = useState(false)
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
    if (!authLoading && !user) {
      router.push('/')
      return
    }

    if (user) {
      fetchProfile()
    }
  }, [user, authLoading, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()
      
      if (data.success) {
        setProfile(data.profile)
        setFormData(data.profile)
      } else {
        setError(data.error || 'Failed to load profile')
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (data.success) {
        setProfile(data.profile)
        setEditing(false)
      } else {
        setError(data.error || 'Failed to save profile')
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      setError('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getStageLabel = (stage: string) => {
    const stageData = medicalStages.find(s => s.value === stage)
    return stageData ? `${stageData.emoji} ${stageData.label}` : stage
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
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
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">Manage your public profile and account settings</p>
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="btn-red"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditing(false)
                    setFormData(profile || {})
                    setError('')
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-red disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {profile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Display Name</label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.display_name || ''}
                        onChange={(e) => handleInputChange('display_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                        placeholder="How should others see your name?"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.display_name || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.username || ''}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                        placeholder="Choose a unique username"
                      />
                    ) : (
                      <p className="text-gray-900">@{profile.username || 'not-set'}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      This will be your public URL: medatlas.com/user/{formData.username || profile.username || 'username'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Stage</label>
                    {editing ? (
                      <select
                        value={formData.stage || ''}
                        onChange={(e) => handleInputChange('stage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      >
                        {medicalStages.map(stage => (
                          <option key={stage.value} value={stage.value}>
                            {stage.emoji} {stage.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">{getStageLabel(profile.stage)}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    {editing ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={formData.location_city || ''}
                          onChange={(e) => handleInputChange('location_city', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                          placeholder="City"
                        />
                        <input
                          type="text"
                          value={formData.location_state || ''}
                          onChange={(e) => handleInputChange('location_state', e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                          placeholder="State"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-900">
                        {profile.location_city && profile.location_state 
                          ? `${profile.location_city}, ${profile.location_state}` 
                          : 'Not set'
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Education</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Undergraduate School</label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.undergraduate_school || ''}
                        onChange={(e) => handleInputChange('undergraduate_school', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                        placeholder="University name"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.undergraduate_school || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Medical School</label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.medical_school || ''}
                        onChange={(e) => handleInputChange('medical_school', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                        placeholder="Medical school name"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.medical_school || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Graduation Year</label>
                    {editing ? (
                      <input
                        type="number"
                        value={formData.graduation_year || ''}
                        onChange={(e) => handleInputChange('graduation_year', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                        placeholder="2025"
                        min="2020"
                        max="2040"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.graduation_year || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-3">About</h3>
                {editing ? (
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    rows={4}
                    placeholder="Tell others about yourself, your interests, career goals, etc."
                  />
                ) : (
                  <p className="text-gray-900 leading-relaxed">
                    {profile.bio || 'No bio added yet. Click "Edit Profile" to add a description about yourself.'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Public Profile Link */}
        {profile && profile.username && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">🌐</span>
              <div>
                <p className="font-medium text-blue-800">Your Public Profile</p>
                <p className="text-blue-700 text-sm">
                  Others can view your profile at: 
                  <a 
                    href={`/user/${profile.username}`}
                    className="ml-1 underline hover:no-underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    medatlas.com/user/{profile.username}
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}