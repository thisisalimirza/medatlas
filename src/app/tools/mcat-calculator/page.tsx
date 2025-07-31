'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'

interface McatSection {
  name: string
  key: string
  maxScore: number
  minScore: number
}

export default function McatCalculatorPage() {
  const [scores, setScores] = useState({
    'chem-phys': '',
    'cars': '',
    'bio-biochem': '',
    'psych-soc': ''
  })
  
  const [totalScore, setTotalScore] = useState(0)
  const [percentile, setPercentile] = useState(0)
  const [competitiveness, setCompetitiveness] = useState('')

  const sections: McatSection[] = [
    { name: 'Chemical and Physical Foundations', key: 'chem-phys', maxScore: 132, minScore: 118 },
    { name: 'Critical Analysis and Reasoning Skills (CARS)', key: 'cars', maxScore: 132, minScore: 118 },
    { name: 'Biological and Biochemical Foundations', key: 'bio-biochem', maxScore: 132, minScore: 118 },
    { name: 'Psychological, Social, and Biological Foundations', key: 'psych-soc', maxScore: 132, minScore: 118 }
  ]

  // MCAT percentile data (approximate)
  const getPercentile = (score: number) => {
    if (score >= 528) return 100
    if (score >= 522) return 99
    if (score >= 520) return 97
    if (score >= 518) return 94
    if (score >= 516) return 90
    if (score >= 514) return 85
    if (score >= 512) return 78
    if (score >= 510) return 69
    if (score >= 508) return 60
    if (score >= 506) return 50
    if (score >= 504) return 39
    if (score >= 502) return 30
    if (score >= 500) return 21
    if (score >= 498) return 14
    if (score >= 496) return 8
    if (score >= 494) return 4
    if (score >= 492) return 2
    return 1
  }

  const getCompetitiveness = (score: number) => {
    if (score >= 520) return { level: 'Exceptional', color: 'text-purple-600', bg: 'bg-purple-50', description: 'Top-tier medical schools' }
    if (score >= 515) return { level: 'Highly Competitive', color: 'text-green-600', bg: 'bg-green-50', description: 'Most medical schools' }
    if (score >= 510) return { level: 'Competitive', color: 'text-blue-600', bg: 'bg-blue-50', description: 'Many medical schools' }
    if (score >= 505) return { level: 'Above Average', color: 'text-yellow-600', bg: 'bg-yellow-50', description: 'Some medical schools' }
    if (score >= 500) return { level: 'Average', color: 'text-orange-600', bg: 'bg-orange-50', description: 'Consider retaking' }
    return { level: 'Below Average', color: 'text-red-600', bg: 'bg-red-50', description: 'Retake recommended' }
  }

  useEffect(() => {
    const validScores = Object.values(scores).filter(score => score && !isNaN(Number(score)))
    if (validScores.length === 4) {
      const total = Object.values(scores).reduce((sum, score) => sum + Number(score), 0)
      setTotalScore(total)
      setPercentile(getPercentile(total))
      setCompetitiveness(getCompetitiveness(total).level)
    } else {
      setTotalScore(0)
      setPercentile(0)
      setCompetitiveness('')
    }
  }, [scores])

  const handleScoreChange = (section: string, value: string) => {
    // Validate input
    const numValue = Number(value)
    if (value === '' || (numValue >= 118 && numValue <= 132)) {
      setScores(prev => ({ ...prev, [section]: value }))
    }
  }

  const resetCalculator = () => {
    setScores({
      'chem-phys': '',
      'cars': '',
      'bio-biochem': '',
      'psych-soc': ''
    })
  }

  const competitivenessData = totalScore > 0 ? getCompetitiveness(totalScore) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            🧮 MCAT Score Calculator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calculate your total MCAT score, see your percentile ranking, and understand how competitive 
            your score is for medical school admissions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Score Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Enter Your Section Scores</h2>
              
              <div className="space-y-6">
                {sections.map((section) => (
                  <div key={section.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {section.name}
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        min={section.minScore}
                        max={section.maxScore}
                        value={scores[section.key as keyof typeof scores]}
                        onChange={(e) => handleScoreChange(section.key, e.target.value)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent text-center font-medium"
                        placeholder="125"
                      />
                      <span className="text-sm text-gray-500">
                        (Range: {section.minScore}-{section.maxScore})
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={resetCalculator}
                  className="btn-outline"
                >
                  Reset Calculator
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Results</h2>
              
              {totalScore > 0 ? (
                <div className="space-y-6">
                  {/* Total Score */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-brand-red mb-2">
                      {totalScore}
                    </div>
                    <div className="text-sm text-gray-600">Total MCAT Score</div>
                    <div className="text-xs text-gray-500 mt-1">(out of 528)</div>
                  </div>

                  {/* Percentile */}
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {percentile}%
                    </div>
                    <div className="text-sm text-blue-700">
                      Percentile Ranking
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Better than {percentile}% of test takers
                    </div>
                  </div>

                  {/* Competitiveness */}
                  {competitivenessData && (
                    <div className={`${competitivenessData.bg} rounded-lg p-4 text-center`}>
                      <div className={`text-lg font-bold ${competitivenessData.color} mb-1`}>
                        {competitivenessData.level}
                      </div>
                      <div className={`text-sm ${competitivenessData.color}`}>
                        {competitivenessData.description}
                      </div>
                    </div>
                  )}

                  {/* Section Breakdown */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Section Breakdown</h3>
                    <div className="space-y-2">
                      {sections.map((section) => {
                        const score = scores[section.key as keyof typeof scores]
                        return (
                          <div key={section.key} className="flex justify-between text-sm">
                            <span className="text-gray-600 truncate">
                              {section.name.split(' ')[0]} {section.name.includes('CARS') ? '(CARS)' : ''}
                            </span>
                            <span className="font-medium">
                              {score || '-'}/132
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-gray-600">
                    Enter all four section scores to see your results
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 MCAT Score Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Score Ranges</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• <strong>520+:</strong> Top 3% - Elite medical schools</li>
                <li>• <strong>515-519:</strong> Top 10% - Highly competitive</li>
                <li>• <strong>510-514:</strong> Top 22% - Competitive</li>
                <li>• <strong>505-509:</strong> Top 50% - Above average</li>
                <li>• <strong>500-504:</strong> Below 50% - Consider retaking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Tips for Success</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Aim for balanced scores across all sections</li>
                <li>• CARS is often the most challenging section</li>
                <li>• Consider your target schools' average MCAT scores</li>
                <li>• Retaking can improve your chances significantly</li>
                <li>• Practice with full-length practice tests</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}