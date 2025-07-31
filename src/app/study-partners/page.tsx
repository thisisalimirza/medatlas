'use client'

import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Header from '@/components/Header'

export default function StudyPartnersPage() {
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
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧑‍🤝‍🧑</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Study Partners</h1>
          <p className="text-xl text-gray-600">
            Connect with fellow students for study sessions and collaboration
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center">
            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">🚧</span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon!</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're building an amazing study partner matching system that will help you find study buddies based on:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-3">🎯 Smart Matching</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Location and time zone</li>
                  <li>• Study schedule preferences</li>
                  <li>• Academic stage and goals</li>
                  <li>• Subject focus areas</li>
                </ul>
              </div>
              
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-3">💬 Easy Communication</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Built-in messaging system</li>
                  <li>• Study session scheduling</li>
                  <li>• Progress tracking together</li>
                  <li>• Group study formation</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">📋 Want early access?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Join our community chat to connect with other students and get notified when Study Partners launches!
              </p>
              <a
                href="https://t.me/+666ywZFkke5lMjQx"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>💬</span>
                <span>Join Community Chat</span>
              </a>
            </div>

            <div className="text-sm text-gray-500">
              <p>
                <strong>Estimated Launch:</strong> Q2 2025 • 
                <strong> Notify me:</strong> Already enabled for all Pro users
              </p>
            </div>
          </div>
        </div>

        {/* Current Alternatives */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">📚 Study with others today:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://t.me/+666ywZFkke5lMjQx"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <span className="text-2xl block mb-2">💬</span>
                <h4 className="font-medium text-gray-900">Community Chat</h4>
                <p className="text-sm text-gray-600">Connect with 2,800+ students</p>
              </div>
            </a>
            
            <a
              href="/tools/premed-timeline"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <span className="text-2xl block mb-2">🗓️</span>
                <h4 className="font-medium text-gray-900">Study Timeline</h4>
                <p className="text-sm text-gray-600">Plan your study schedule</p>
              </div>
            </a>
            
            <a
              href="/tools/mcat-calculator"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <span className="text-2xl block mb-2">🧮</span>
                <h4 className="font-medium text-gray-900">MCAT Tools</h4>
                <p className="text-sm text-gray-600">Track progress together</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}