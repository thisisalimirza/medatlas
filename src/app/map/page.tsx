'use client'

import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Header from '@/components/Header'

export default function MemberMapPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
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
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📍</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Member Map</h1>
          <p className="text-xl text-gray-600">
            Discover MedAtlas members near you and around the world
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center">
            <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">🗺️</span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Interactive Member Map Coming Soon!</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're developing an interactive world map that will show you where MedAtlas members are located, 
              helping you connect with students and physicians in your area.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-blue-50 rounded-lg p-6">
                  <span className="text-3xl block mb-3">🎓</span>
                  <h3 className="font-semibold text-gray-900 mb-2">Find Students</h3>
                  <p className="text-sm text-gray-600">
                    Connect with pre-med and medical students at schools near you
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-50 rounded-lg p-6">
                  <span className="text-3xl block mb-3">🏥</span>
                  <h3 className="font-semibold text-gray-900 mb-2">Meet Residents</h3>
                  <p className="text-sm text-gray-600">
                    Network with residents in your specialty or location
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-green-50 rounded-lg p-6">
                  <span className="text-3xl block mb-3">👩‍⚕️</span>
                  <h3 className="font-semibold text-gray-900 mb-2">Connect with Attendings</h3>
                  <p className="text-sm text-gray-600">
                    Find mentors and colleagues in your field
                  </p>
                </div>
              </div>
            </div>

            {/* Mock Map Preview */}
            <div className="bg-gray-100 rounded-lg p-12 mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-green-400 to-blue-500 opacity-20"></div>
              <div className="relative">
                <h3 className="font-semibold text-gray-900 mb-4">Preview: Interactive Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <span className="text-red-500">📍</span> 2,847 Members
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <span className="text-blue-500">🏫</span> 450+ Schools
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <span className="text-green-500">🌍</span> 50 States
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <span className="text-purple-500">🔗</span> Easy Connect
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">🔒 Privacy First</h3>
              <p className="text-gray-600 text-sm mb-4">
                Your privacy is important to us. The member map will only show:
              </p>
              <ul className="text-sm text-gray-600 text-left max-w-md mx-auto space-y-1">
                <li>• General location (city/state level, not exact address)</li>
                <li>• Only members who opt-in to being discoverable</li>
                <li>• Public profile information you choose to share</li>
                <li>• Full control over your visibility settings</li>
              </ul>
            </div>

            <div className="text-sm text-gray-500">
              <p>
                <strong>Estimated Launch:</strong> Q1 2025 • 
                <strong> Privacy Controls:</strong> Full customization available
              </p>
            </div>
          </div>
        </div>

        {/* Current Community Stats */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">🌎 Current MedAtlas Community</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-brand-red">2,847+</div>
              <div className="text-sm text-gray-600">Total Members</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-blue-600">450+</div>
              <div className="text-sm text-gray-600">Schools Represented</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-green-600">50</div>
              <div className="text-sm text-gray-600">US States</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-purple-600">15+</div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <a
              href="https://t.me/+666ywZFkke5lMjQx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-brand-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              <span>💬</span>
              <span>Join Our Community Today</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}