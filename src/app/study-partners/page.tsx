'use client'

import Header from '@/components/Header'
import PremiumGate from '@/components/PremiumGate'
import { useRouter } from 'next/navigation'

export default function StudyPartnersPage() {
  const router = useRouter()

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

        <PremiumGate featureName="Study Partners" previewHeight={300}>
          {/* Community Access Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center">
              <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">💬</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Find Study Partners in Our Community</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                MedStack Pro members get access to our private community where you can find study partners,
                form study groups, share resources, and connect with students at every stage of their medical journey.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="text-2xl block mb-2">🎯</span>
                  <h3 className="font-semibold text-gray-900 mb-1">Find Partners</h3>
                  <p className="text-sm text-gray-600">Match with students studying the same subjects</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="text-2xl block mb-2">📚</span>
                  <h3 className="font-semibold text-gray-900 mb-1">Study Groups</h3>
                  <p className="text-sm text-gray-600">Join or create groups for exams and boards</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="text-2xl block mb-2">🌍</span>
                  <h3 className="font-semibold text-gray-900 mb-1">Network</h3>
                  <p className="text-sm text-gray-600">Connect with 2,800+ med students & residents</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-blue-900 font-medium mb-1">How it works</p>
                <p className="text-blue-700 text-sm">
                  Upgrade to MedStack Pro to get instant access to our private community.
                  Introduce yourself, share what you're studying, and connect with partners right away.
                </p>
              </div>
            </div>
          </div>

          {/* Related Tools */}
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">📚 Study tools available now:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/tools/premed-timeline')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="text-center">
                  <span className="text-2xl block mb-2">🗓️</span>
                  <h4 className="font-medium text-gray-900">Study Timeline</h4>
                  <p className="text-sm text-gray-600">Plan your study schedule</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/tools/mcat-calculator')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="text-center">
                  <span className="text-2xl block mb-2">🧮</span>
                  <h4 className="font-medium text-gray-900">MCAT Calculator</h4>
                  <p className="text-sm text-gray-600">Track your practice scores</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/step1-prep')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="text-center">
                  <span className="text-2xl block mb-2">📖</span>
                  <h4 className="font-medium text-gray-900">Board Exam Prep</h4>
                  <p className="text-sm text-gray-600">Step 1 study resources</p>
                </div>
              </button>
            </div>
          </div>
        </PremiumGate>
      </div>
    </div>
  )
}
