'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import Header from '@/components/Header'
import ComparisonTool from '@/components/ComparisonTool'

export default function ComparePage() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(true)

  if (!user || !user.is_paid) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-6xl mb-6">📊</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Program Comparison Tool
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Compare up to 5 medical schools side-by-side with detailed metrics and insights
            </p>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    <span>Side-by-side comparison of key metrics</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    <span>Tuition, MCAT, GPA, and acceptance rates</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    <span>Match rates and board pass rates</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    <span>Export data to CSV for analysis</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    <span>Save comparisons for later review</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    <span>Access to all 450+ programs</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="btn-red text-lg px-8 py-3">
              Upgrade to Pro to Compare Schools
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ComparisonTool
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
      {!isOpen && (
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Program Comparison</h1>
          <button
            onClick={() => setIsOpen(true)}
            className="btn-red"
          >
            Open Comparison Tool
          </button>
        </div>
      )}
    </div>
  )
}