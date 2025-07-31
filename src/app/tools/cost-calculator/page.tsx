'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'

interface CostBreakdown {
  tuition: number
  fees: number
  housing: number
  meals: number
  books: number
  supplies: number
  transportation: number
  personal: number
  insurance: number
  total: number
}

interface SchoolType {
  value: string
  label: string
  tuitionRange: { min: number; max: number }
}

const schoolTypes: SchoolType[] = [
  { value: 'public-in-state', label: 'Public (In-State)', tuitionRange: { min: 25000, max: 45000 } },
  { value: 'public-out-state', label: 'Public (Out-of-State)', tuitionRange: { min: 45000, max: 65000 } },
  { value: 'private', label: 'Private', tuitionRange: { min: 50000, max: 70000 } },
  { value: 'caribbean', label: 'Caribbean', tuitionRange: { min: 35000, max: 55000 } }
]

const locationTypes = [
  { value: 'low-cost', label: 'Low Cost of Living Area', multiplier: 0.8 },
  { value: 'average', label: 'Average Cost of Living', multiplier: 1.0 },
  { value: 'high-cost', label: 'High Cost of Living Area', multiplier: 1.3 },
  { value: 'very-high', label: 'Very High (NYC, SF, etc.)', multiplier: 1.6 }
]

export default function CostCalculatorPage() {
  const [schoolType, setSchoolType] = useState('public-in-state')
  const [location, setLocation] = useState('average')
  const [livingArrangement, setLivingArrangement] = useState('campus')
  const [hasInsurance, setHasInsurance] = useState(false)
  const [years, setYears] = useState(4)
  const [costs, setCosts] = useState<CostBreakdown>({
    tuition: 35000,
    fees: 2000,
    housing: 12000,
    meals: 4000,
    books: 1500,
    supplies: 1000,
    transportation: 2000,
    personal: 3000,
    insurance: 3000,
    total: 0
  })

  useEffect(() => {
    calculateCosts()
  }, [schoolType, location, livingArrangement, hasInsurance])

  const calculateCosts = () => {
    const selectedSchool = schoolTypes.find(s => s.value === schoolType)!
    const selectedLocation = locationTypes.find(l => l.value === location)!
    
    // Base tuition (average of range)
    const baseTuition = (selectedSchool.tuitionRange.min + selectedSchool.tuitionRange.max) / 2
    
    // Base living costs adjusted by location
    const baseHousing = livingArrangement === 'campus' ? 12000 : 
                      livingArrangement === 'apartment' ? 15000 : 8000
    const baseMeals = livingArrangement === 'campus' ? 4000 :
                     livingArrangement === 'apartment' ? 3000 : 2000
    
    const newCosts = {
      tuition: Math.round(baseTuition),
      fees: Math.round(2000 * selectedLocation.multiplier),
      housing: Math.round(baseHousing * selectedLocation.multiplier),
      meals: Math.round(baseMeals * selectedLocation.multiplier),
      books: 1500,
      supplies: Math.round(1000 * selectedLocation.multiplier),
      transportation: Math.round(2000 * selectedLocation.multiplier),
      personal: Math.round(3000 * selectedLocation.multiplier),
      insurance: hasInsurance ? 0 : 3000,
      total: 0
    }
    
    newCosts.total = Object.entries(newCosts)
      .filter(([key]) => key !== 'total')
      .reduce((sum, [, value]) => sum + value, 0)
    
    setCosts(newCosts)
  }

  const getTotalForYears = () => costs.total * years

  const getFinancingBreakdown = () => {
    const totalCost = getTotalForYears()
    return {
      federal_loans: Math.min(totalCost * 0.6, 138500), // Federal loan limits
      private_loans: Math.max(0, totalCost * 0.3 - 40000),
      scholarships: totalCost * 0.1,
      family_contribution: Math.max(0, totalCost - 138500 - (totalCost * 0.3) - (totalCost * 0.1))
    }
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0 
    }).format(amount)

  const financing = getFinancingBreakdown()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            💰 Medical School Cost Calculator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calculate the total cost of medical school including tuition, living expenses, and 
            understand your financing options. Plan your investment in becoming a physician.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">School & Location Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Type
                  </label>
                  <select
                    value={schoolType}
                    onChange={(e) => setSchoolType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  >
                    {schoolTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} ({formatCurrency(type.tuitionRange.min)} - {formatCurrency(type.tuitionRange.max)})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Cost of Living
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  >
                    {locationTypes.map(loc => (
                      <option key={loc.value} value={loc.value}>
                        {loc.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Living Arrangement
                  </label>
                  <select
                    value={livingArrangement}
                    onChange={(e) => setLivingArrangement(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  >
                    <option value="campus">On-Campus Housing</option>
                    <option value="apartment">Off-Campus Apartment</option>
                    <option value="family">Living with Family</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years to Calculate
                  </label>
                  <select
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  >
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                    <option value="3">3 Years</option>
                    <option value="4">4 Years (Complete MD)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hasInsurance}
                    onChange={(e) => setHasInsurance(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">I have health insurance (reduces costs by $3,000/year)</span>
                </label>
              </div>
            </div>

            {/* Annual Cost Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Annual Cost Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(costs).filter(([key]) => key !== 'total').map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <span className="font-medium">{formatCurrency(value)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 border-t-2 border-gray-300 text-lg font-semibold">
                  <span>Annual Total</span>
                  <span className="text-brand-red">{formatCurrency(costs.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Total Investment</h2>
              
              {/* Total Cost */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-brand-red mb-2">
                  {formatCurrency(getTotalForYears())}
                </div>
                <div className="text-sm text-gray-600">
                  Total for {years} year{years !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Financing Breakdown */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Typical Financing</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Federal Loans</span>
                    <span className="font-medium">{formatCurrency(financing.federal_loans)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Private Loans</span>
                    <span className="font-medium">{formatCurrency(financing.private_loans)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Scholarships/Grants</span>
                    <span className="font-medium text-green-600">{formatCurrency(financing.scholarships)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Family Contribution</span>
                    <span className="font-medium">{formatCurrency(financing.family_contribution)}</span>
                  </div>
                </div>
              </div>

              {/* ROI Information */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">📊 Return on Investment</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <div>• Average physician salary: $200K-$400K</div>
                  <div>• Loan repayment: 10-25 years</div>
                  <div>• Break-even: 8-12 years post-graduation</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Cost Saving Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">During Medical School</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Apply for merit-based scholarships early</li>
                <li>• Consider service commitment programs (HPSP, NHSC)</li>
                <li>• Live with roommates to reduce housing costs</li>
                <li>• Buy used textbooks or use digital versions</li>
                <li>• Cook meals at home instead of eating out</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Long-term Planning</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Maximize federal loans before private loans</li>
                <li>• Consider income-driven repayment plans</li>
                <li>• Look into loan forgiveness programs</li>
                <li>• Start building credit early for better rates</li>
                <li>• Research state-specific loan repayment programs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}