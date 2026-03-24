'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import Header from '@/components/Header'
import PremiumGate from '@/components/PremiumGate'

interface ContractClause {
  id: string
  category: string
  name: string
  description: string
  redFlags: string[]
  greenFlags: string[]
  negotiable: 'high' | 'medium' | 'low'
  importance: 'critical' | 'important' | 'standard'
}

const contractClauses: ContractClause[] = [
  {
    id: 'comp', category: 'Compensation', name: 'Base Compensation',
    description: 'Your guaranteed annual salary or the compensation formula (salary + productivity bonus, pure RVU, etc.).',
    redFlags: ['Below 25th percentile for specialty/region', 'Pure RVU with no base guarantee', 'Compensation tied to collections rather than wRVUs', 'No annual increase mechanism'],
    greenFlags: ['At or above median for specialty/region', 'Base salary with productivity bonus', 'Annual CPI or fixed percentage increases', 'Clear wRVU thresholds and rates'],
    negotiable: 'high', importance: 'critical'
  },
  {
    id: 'noncomp', category: 'Restrictive Covenants', name: 'Non-Compete Clause',
    description: 'Restricts where you can practice after leaving. Defines geographic radius and time period.',
    redFlags: ['Radius > 30 miles', 'Duration > 2 years', 'Applies even if employer terminates without cause', 'Covers all medical practice, not just your specialty', 'No buyout option'],
    greenFlags: ['Radius ≤ 15 miles', 'Duration ≤ 1 year', 'Waived if terminated without cause', 'Limited to your specific specialty', 'Reasonable buyout clause included'],
    negotiable: 'high', importance: 'critical'
  },
  {
    id: 'term', category: 'Term & Termination', name: 'Termination Clauses',
    description: 'How either party can end the contract, including notice periods and consequences.',
    redFlags: ['Employer can terminate without cause with < 90 days notice', 'Signing bonus repayment if terminated without cause', 'No mutual termination rights', 'Vague "cause" definition'],
    greenFlags: ['Mutual without-cause termination with 90-180 day notice', 'Signing bonus prorated if terminated without cause', 'Clear definition of "cause"', 'Cure period before termination for cause'],
    negotiable: 'medium', importance: 'critical'
  },
  {
    id: 'malpractice', category: 'Malpractice', name: 'Malpractice Insurance & Tail Coverage',
    description: 'Who pays for malpractice insurance and, critically, tail coverage when you leave.',
    redFlags: ['You pay for tail coverage (can be $50K-200K+)', 'Claims-made policy with no tail discussion', 'Low coverage limits for your specialty', 'No legal defense provisions'],
    greenFlags: ['Employer pays tail coverage', 'Occurrence-based policy (no tail needed)', 'Coverage limits appropriate for specialty', 'Employer provides legal defense'],
    negotiable: 'high', importance: 'critical'
  },
  {
    id: 'benefits', category: 'Benefits', name: 'Benefits Package',
    description: 'Health insurance, retirement contributions, disability, life insurance, and other benefits.',
    redFlags: ['No employer retirement match', 'No disability insurance or own-occ rider', 'Benefits start after probation period', 'High employee premium contributions'],
    greenFlags: ['Employer match ≥ 4-6%', 'Own-occupation disability insurance included', 'Benefits start day one', 'Comprehensive health/dental/vision'],
    negotiable: 'medium', importance: 'important'
  },
  {
    id: 'call', category: 'Work Requirements', name: 'Call & Schedule',
    description: 'Expected work hours, call frequency, weekend coverage, and compensation for extra call.',
    redFlags: ['Undefined call expectations', 'No additional pay for extra call', 'Unreasonable call frequency (>1:3)', 'No cap on patient volume'],
    greenFlags: ['Call frequency and compensation clearly defined', 'Extra call compensated separately', 'Reasonable call schedule (1:4 or less)', 'Patient volume expectations stated'],
    negotiable: 'medium', importance: 'important'
  },
  {
    id: 'cme', category: 'Professional Development', name: 'CME & Time Off',
    description: 'Continuing medical education allowance, conference time, PTO, and sabbatical options.',
    redFlags: ['CME allowance < $2,000/year', 'CME time comes out of PTO', 'PTO < 3 weeks', 'No parental leave policy'],
    greenFlags: ['CME allowance ≥ $3,000-5,000/year', 'Separate CME days (5-7/year)', 'PTO ≥ 4 weeks', 'Paid parental leave included'],
    negotiable: 'medium', importance: 'standard'
  },
  {
    id: 'partnership', category: 'Career Path', name: 'Partnership / Equity Track',
    description: 'For private practice: timeline and terms for becoming a partner or equity holder.',
    redFlags: ['No clear timeline to partnership', 'Buy-in > 2x annual salary', 'Buy-in terms can change at partner discretion', 'No guaranteed partnership after track completion'],
    greenFlags: ['Clear 2-3 year partnership timeline', 'Reasonable buy-in with financing options', 'Fixed buy-in terms at signing', 'Guaranteed partnership if metrics met'],
    negotiable: 'medium', importance: 'important'
  },
]

const glossaryTerms = [
  { term: 'wRVU', definition: 'Work Relative Value Unit — a measure of physician productivity used to calculate compensation. Each procedure/visit has an assigned wRVU value.' },
  { term: 'Tail Coverage', definition: 'Extended malpractice insurance that covers claims filed after you leave a position for incidents that occurred during your employment.' },
  { term: 'Claims-Made Policy', definition: 'Malpractice policy that covers claims only if both the incident and the claim filing happen during the policy period. Requires tail coverage when leaving.' },
  { term: 'Occurrence-Based Policy', definition: 'Malpractice policy that covers any incident during the policy period regardless of when the claim is filed. No tail coverage needed.' },
  { term: 'Non-Compete (Restrictive Covenant)', definition: 'Contract clause preventing you from practicing within a certain geographic radius for a specified time after leaving.' },
  { term: 'Without Cause Termination', definition: 'Either party can end the contract without stating a reason, typically with a notice period (90-180 days).' },
  { term: 'For Cause Termination', definition: 'Contract termination due to specific reasons like license loss, felony conviction, or breach of contract terms.' },
  { term: 'Sign-on Bonus Clawback', definition: 'Requirement to repay part or all of a signing bonus if you leave before a specified period (typically 2-3 years).' },
  { term: 'Production Bonus', definition: 'Additional compensation earned when you exceed a baseline wRVU or collections threshold.' },
  { term: 'Own-Occupation Disability', definition: 'Insurance that pays if you cannot perform the duties of your specific specialty, even if you could work in another capacity.' },
]

export default function ContractAnalyzerPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'clauses' | 'checklist' | 'glossary' | 'ai'>('clauses')
  const [expandedClause, setExpandedClause] = useState<string | null>(null)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [filterCategory, setFilterCategory] = useState('all')
  const [contractText, setContractText] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const categories = ['all', ...Array.from(new Set(contractClauses.map(c => c.category)))]
  const filtered = filterCategory === 'all' ? contractClauses : contractClauses.filter(c => c.category === filterCategory)

  const checklistItems = contractClauses.flatMap(clause => [
    ...clause.redFlags.map(rf => ({ clauseId: clause.id, clauseName: clause.name, item: rf, type: 'red' as const })),
    ...clause.greenFlags.map(gf => ({ clauseId: clause.id, clauseName: clause.name, item: gf, type: 'green' as const })),
  ])

  const checkedCount = Object.values(checkedItems).filter(Boolean).length

  const analyzeContract = async () => {
    if (!contractText.trim() || contractText.length < 50) {
      setAiError('Please paste at least 50 characters of contract text.')
      return
    }
    setAiLoading(true)
    setAiError('')
    setAiAnalysis('')
    try {
      const res = await fetch('/api/ai/analyze-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText, userEmail: user?.email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setAiAnalysis(data.analysis)
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const tabs = [
    { key: 'clauses', label: 'Contract Clauses' },
    { key: 'ai', label: 'AI Analysis ✨' },
    { key: 'checklist', label: 'Review Checklist' },
    { key: 'glossary', label: 'Legal Glossary' },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PremiumGate featureName="Contract Analyzer" previewHeight={500}>

      {/* Hero */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">📋</span>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Contract Analyzer</h1>
              <p className="text-red-100 mt-1">Understand every clause in your physician employment contract</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{contractClauses.length}</div>
              <div className="text-xs text-red-100">Key Clauses</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{contractClauses.reduce((n, c) => n + c.redFlags.length, 0)}</div>
              <div className="text-xs text-red-100">Red Flags</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{glossaryTerms.length}</div>
              <div className="text-xs text-red-100">Glossary Terms</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">⭐</div>
              <div className="text-xs text-red-100">Pro Feature</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 -mt-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-red-600 shadow-md border border-gray-200'
                  : 'bg-white/60 text-gray-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Clauses Tab */}
        {activeTab === 'clauses' && (
          <div>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    filterCategory === cat ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
                  }`}
                >
                  {cat === 'all' ? 'All Clauses' : cat}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filtered.map(clause => (
                <div key={clause.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div
                    className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedClause(expandedClause === clause.id ? null : clause.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          clause.importance === 'critical' ? 'bg-red-100 text-red-700' :
                          clause.importance === 'important' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {clause.importance.toUpperCase()}
                        </span>
                        <h3 className="font-bold text-gray-900">{clause.name}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          clause.negotiable === 'high' ? 'bg-green-100 text-green-700' :
                          clause.negotiable === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {clause.negotiable} negotiability
                        </span>
                        <span className="text-gray-400">{expandedClause === clause.id ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{clause.description}</p>
                  </div>

                  {expandedClause === clause.id && (
                    <div className="border-t border-gray-100 p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-red-700 text-sm mb-2 flex items-center gap-1">🚩 Red Flags</h4>
                          <ul className="space-y-2">
                            {clause.redFlags.map((rf, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
                                <span>{rf}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-700 text-sm mb-2 flex items-center gap-1">✅ Green Flags</h4>
                          <ul className="space-y-2">
                            {clause.greenFlags.map((gf, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                <span>{gf}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">Contract Review Progress</h2>
                  <p className="text-sm text-gray-500">{checkedCount} of {checklistItems.length} items reviewed</p>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full transition-all" style={{ width: `${checklistItems.length > 0 ? (checkedCount / checklistItems.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            {contractClauses.map(clause => {
              const items = checklistItems.filter(i => i.clauseId === clause.id)
              return (
                <div key={clause.id} className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">{clause.name}</h3>
                  <div className="space-y-2">
                    {items.map((item, i) => {
                      const key = `${clause.id}-${i}`
                      return (
                        <label
                          key={key}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            checkedItems[key]
                              ? 'bg-gray-50 border-gray-200 opacity-60'
                              : item.type === 'red'
                                ? 'bg-red-50 border-red-200 hover:bg-red-100'
                                : 'bg-green-50 border-green-200 hover:bg-green-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checkedItems[key] || false}
                            onChange={() => setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }))}
                            className="mt-0.5 accent-red-600"
                          />
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                              item.type === 'red' ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'
                            }`}>
                              {item.type === 'red' ? 'RED FLAG' : 'GREEN FLAG'}
                            </span>
                            <span className="text-sm text-gray-700">{item.item}</span>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* AI Analysis Tab */}
        {activeTab === 'ai' && (
          <div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">✨</span>
                <h2 className="text-lg font-bold text-gray-900">AI-Powered Contract Analysis</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">Paste sections of your physician employment contract below and get AI-powered analysis identifying red flags, green flags, and negotiation recommendations.</p>
              <textarea
                value={contractText}
                onChange={e => setContractText(e.target.value)}
                placeholder="Paste your contract text here (compensation section, non-compete clause, termination terms, etc.)..."
                className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg text-sm resize-y focus:ring-2 focus:ring-red-500 focus:border-red-500"
                maxLength={15000}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">{contractText.length}/15,000 characters</span>
                <button
                  onClick={analyzeContract}
                  disabled={aiLoading || contractText.length < 50}
                  className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    aiLoading || contractText.length < 50
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {aiLoading ? 'Analyzing...' : 'Analyze Contract'}
                </button>
              </div>
              {aiError && <p className="text-sm text-red-600 mt-3">{aiError}</p>}
            </div>

            {aiLoading && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                <div className="animate-spin w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-500">Analyzing your contract with AI...</p>
                <p className="text-xs text-gray-400 mt-1">This may take 10-20 seconds</p>
              </div>
            )}

            {aiAnalysis && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">📋</span>
                  <h3 className="font-bold text-gray-900">Analysis Results</h3>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">{aiAnalysis}</pre>
                <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-700">This AI analysis is for informational purposes only and is not legal advice. Always have a healthcare attorney review your contract before signing.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Glossary Tab */}
        {activeTab === 'glossary' && (
          <div className="space-y-4">
            {glossaryTerms.map(term => (
              <div key={term.term} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-1">{term.term}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{term.definition}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEO Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding Physician Employment Contracts</h2>
          <div className="text-sm text-gray-500 space-y-3 max-w-3xl">
            <p>Physician employment contracts are complex legal documents with significant financial implications. Understanding key clauses like non-compete restrictions, tail coverage, and compensation structures is essential before signing.</p>
            <p>Common pitfalls include accepting below-market compensation, overlooking tail coverage responsibilities, and agreeing to overly restrictive non-compete clauses. Always have a healthcare attorney review your contract before signing.</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-xs text-gray-400">This tool provides general information about physician employment contracts and is not a substitute for legal advice. Always consult with a healthcare attorney before signing any employment contract.</p>
        </div>
      </div>
      </PremiumGate>
    </div>
  )
}
