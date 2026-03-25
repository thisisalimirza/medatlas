'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import ComparisonTool from '@/components/ComparisonTool'

interface TopSchool {
  slug: string
  name: string
}

export default function ComparePage() {
  const [isOpen, setIsOpen] = useState(true)
  const [topSchools, setTopSchools] = useState<TopSchool[]>([])

  useEffect(() => {
    fetch('/api/places?limit=20')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setTopSchools(data.data.map((p: any) => ({ slug: p.slug, name: p.name })))
        }
      })
      .catch(() => {})
  }, [])

  // Generate some popular comparison pairs from top schools
  const comparisonPairs = topSchools.length >= 6
    ? [
        [topSchools[0], topSchools[1]],
        [topSchools[0], topSchools[2]],
        [topSchools[1], topSchools[3]],
        [topSchools[2], topSchools[4]],
        [topSchools[3], topSchools[5]],
        [topSchools[0], topSchools[4]],
      ]
    : []

  function makeSlug(a: string, b: string) {
    const [first, second] = [a, b].sort()
    return `${first}-vs-${second}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ComparisonTool
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
      {!isOpen && (
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Program Comparison</h1>
            <p className="text-gray-600 mb-6">Compare medical schools side by side or browse popular comparisons</p>
            <button
              onClick={() => setIsOpen(true)}
              className="btn-red"
            >
              Open Comparison Tool
            </button>
          </div>

          {/* Popular Comparisons */}
          {comparisonPairs.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Popular Comparisons</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {comparisonPairs.map(([a, b], i) => (
                  <Link
                    key={i}
                    href={`/vs/${makeSlug(a.slug, b.slug)}`}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:border-brand-red hover:shadow-sm transition-all"
                  >
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">
                      {a.name}
                    </div>
                    <div className="text-xs text-gray-400 my-1">vs</div>
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">
                      {b.name}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
