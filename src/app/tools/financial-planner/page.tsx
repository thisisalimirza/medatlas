'use client'

import React, { useState, useCallback } from 'react'
import Header from '@/components/Header'
import { Assumptions, PathConfig, PathResult } from '@/lib/finplanner/types'
import { DEFAULT_ASSUMPTIONS, DEFAULT_PATHS } from '@/lib/finplanner/defaults'
import { runProjection } from '@/lib/finplanner/calculations'
import AssumptionsPanel from '@/components/finplanner/AssumptionsPanel'
import PathsPanel from '@/components/finplanner/PathsPanel'
import Dashboard from '@/components/finplanner/Dashboard'
import YearlyTable from '@/components/finplanner/YearlyTable'
import GoalCalculator from '@/components/finplanner/GoalCalculator'
import {
  Settings, Route, BarChart3, Table2, Play,
  GraduationCap, ChevronRight, Target,
} from 'lucide-react'

type Tab = 'assumptions' | 'paths' | 'dashboard' | 'goals' | 'details'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'assumptions', label: 'Assumptions', icon: <Settings size={16} /> },
  { id: 'paths', label: 'Career Paths', icon: <Route size={16} /> },
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={16} /> },
  { id: 'goals', label: 'Goal Calc', icon: <Target size={16} /> },
  { id: 'details', label: 'Year-by-Year', icon: <Table2 size={16} /> },
]

export default function FinancialPlannerPage() {
  const [assumptions, setAssumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS)
  const [paths, setPaths] = useState<PathConfig[]>(DEFAULT_PATHS)
  const [activeTab, setActiveTab] = useState<Tab>('paths')
  const [results, setResults] = useState<PathResult[]>([])
  const [calculated, setCalculated] = useState(false)

  const calculate = useCallback(() => {
    const newResults = paths.map((p) => runProjection(p, assumptions))
    setResults(newResults)
    setCalculated(true)
    setActiveTab('dashboard')
  }, [paths, assumptions])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title + Calculate Button */}
        <div className="flex items-start sm:items-center justify-between mb-6 gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              📊 Financial Planner
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Compare medical career paths side-by-side with 30-year financial projections.
              Model specialty salaries, loan repayment, taxes, investments, and side income.
            </p>
          </div>
          <button
            onClick={calculate}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 shadow-lg shadow-red-500/25 transition-all active:scale-[0.98] shrink-0"
          >
            <Play size={16} fill="white" />
            Calculate
          </button>
        </div>

        {/* Hero section (shown before first calculation) */}
        {!calculated && activeTab === 'paths' && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
              <div className="flex items-start gap-4">
                <div className="hidden md:block p-3 bg-white/10 rounded-xl">
                  <GraduationCap size={32} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">What will your financial future look like?</h2>
                  <p className="text-red-100 text-sm leading-relaxed max-w-2xl">
                    Compare up to 6 medical career paths side-by-side. Model 30-year projections including
                    specialty salaries, loan repayment strategies (Standard vs PSLF), taxes, investments,
                    and even side business income. Customize everything to your situation.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['20+ Specialties', 'Loan Strategies', 'Tax Modeling', 'Business Income', 'NPV Analysis'].map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm text-red-200">
                <span className="font-medium text-white">Get started:</span>
                <span>Configure your paths below</span>
                <ChevronRight size={14} />
                <span>Adjust assumptions</span>
                <ChevronRight size={14} />
                <span>Hit Calculate</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab nav */}
        <nav className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto max-w-full mb-6 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 flex-shrink-0 px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-red-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="pb-12">
          {activeTab === 'assumptions' && (
            <AssumptionsPanel assumptions={assumptions} onChange={setAssumptions} />
          )}
          {activeTab === 'paths' && (
            <PathsPanel paths={paths} onChange={setPaths} assumptions={assumptions} />
          )}
          {activeTab === 'dashboard' && <Dashboard results={results} />}
          {activeTab === 'goals' && (
            <GoalCalculator paths={paths} assumptions={assumptions} results={results} />
          )}
          {activeTab === 'details' && (
            <div className="space-y-8">
              {results.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <p>Click Calculate to generate year-by-year projections.</p>
                </div>
              ) : (
                results.map((r) => <YearlyTable key={r.config.id} result={r} />)
              )}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
          <p>This is a planning tool, not financial advice. Consult a financial advisor for personalized guidance.</p>
        </div>
      </div>
    </div>
  )
}
