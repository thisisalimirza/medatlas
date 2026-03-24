'use client'

import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useState } from 'react'
import AuthModal from './AuthModal'

interface PremiumGateProps {
  children: React.ReactNode
  /** How many pixels of content to show before the fade (default: 400) */
  previewHeight?: number
  /** Feature name shown in the CTA */
  featureName?: string
}

/**
 * Newspaper-style paywall: renders all children but fades out after
 * `previewHeight` pixels with a gradient overlay and upgrade CTA.
 * Paid users see everything normally.
 */
export default function PremiumGate({
  children,
  previewHeight = 400,
  featureName = 'this feature',
}: PremiumGateProps) {
  const { user } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Paid users see everything
  if (user?.is_paid) {
    return <>{children}</>
  }

  return (
    <>
      <div className="relative">
        {/* Content preview — clipped and faded */}
        <div
          className="overflow-hidden relative"
          style={{ maxHeight: `${previewHeight}px` }}
        >
          {children}

          {/* Gradient fade overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{ height: `${Math.min(previewHeight, 200)}px` }}
          >
            <div className="w-full h-full bg-gradient-to-t from-white via-white/90 to-transparent" />
          </div>
        </div>

        {/* Paywall CTA */}
        <div className="relative -mt-4 bg-white border-t border-gray-100 pt-8 pb-12 px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-brand-red/10 text-brand-red px-3 py-1 rounded-full text-sm font-medium mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              MedStack Pro
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Unlock {featureName}
            </h3>

            <div className="flex flex-col gap-2 mb-6 text-sm text-left max-w-xs mx-auto">
              <div className="flex items-center gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                <span className="text-gray-700"><strong>Community & networking</strong> — connect with students, residents & doctors</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                <span className="text-gray-700"><strong>Detailed data</strong> — full metrics, reviews, and in-depth analysis</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                <span className="text-gray-700"><strong>Save & track</strong> — favorites, comparisons, and progress over time</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-red px-6 py-2.5 text-sm font-semibold w-full sm:w-auto"
              >
                Upgrade to Pro — from $20/yr
              </button>
              {!user && (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
                >
                  Already a member? Log in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={user ? 'signup' : 'signup'}
      />
    </>
  )
}
