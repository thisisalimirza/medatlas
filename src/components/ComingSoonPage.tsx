'use client'

import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Header from '@/components/Header'

interface ComingSoonPageProps {
  title: string
  description: string
  icon: string
  estimatedLaunch: string
  requiresAuth?: boolean
  requiresPaid?: boolean
  features?: string[]
  currentAlternatives?: Array<{
    title: string
    description: string
    icon: string
    href: string
  }>
}

export default function ComingSoonPage({
  title,
  description,
  icon,
  estimatedLaunch,
  requiresAuth = false,
  requiresPaid = false,
  features = [],
  currentAlternatives = []
}: ComingSoonPageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && requiresAuth && !user) {
      router.push('/')
    }
  }, [user, loading, requiresAuth, router])

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

  if (requiresAuth && !user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{icon}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-xl text-gray-600">{description}</p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center">
            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">🚧</span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon!</h2>
            <p className="text-gray-600 mb-6">
              We're working hard to bring you this feature. Here's what to expect:
            </p>

            {features.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">🎯 Planned Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="text-left bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">• {feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">📋 Want updates?</h3>
              <p className="text-gray-600 text-sm mb-4">
                {requiresPaid 
                  ? "This feature will be included in your MedAtlas Pro subscription. You'll be notified when it's ready!"
                  : "Join our community to get notified when this feature launches!"
                }
              </p>
              <a
                href="https://t.me/+666ywZFkke5lMjQx"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>💬</span>
                <span>Join Community</span>
              </a>
            </div>

            <div className="text-sm text-gray-500">
              <p>
                <strong>Estimated Launch:</strong> {estimatedLaunch}
                {requiresPaid && (
                  <>
                    {' • '}
                    <strong>Included in:</strong> MedAtlas Pro
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Current Alternatives */}
        {currentAlternatives.length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">🔧 Available now:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentAlternatives.map((alternative, index) => (
                <a
                  key={index}
                  href={alternative.href}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-center">
                    <span className="text-2xl block mb-2">{alternative.icon}</span>
                    <h4 className="font-medium text-gray-900">{alternative.title}</h4>
                    <p className="text-sm text-gray-600">{alternative.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade Prompt for Non-Paid Users */}
        {requiresPaid && user && !user.is_paid && (
          <div className="mt-8 bg-brand-red text-white rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold mb-2">🌟 Upgrade to MedAtlas Pro</h3>
            <p className="mb-4 text-red-100">
              This feature will be included in MedAtlas Pro. Upgrade now for lifetime access to all premium tools!
            </p>
            <button 
              onClick={() => window.location.href = '/?upgrade=true'}
              className="bg-white text-brand-red px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Upgrade Now - $99 Lifetime
            </button>
          </div>
        )}
      </div>
    </div>
  )
}