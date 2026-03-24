'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import ComparisonTool from '@/components/ComparisonTool'
import PremiumGate from '@/components/PremiumGate'

export default function ComparePage() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PremiumGate featureName="Program Comparison" previewHeight={500}>
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
      </PremiumGate>
    </div>
  )
}