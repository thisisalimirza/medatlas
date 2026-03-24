'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import Header from '@/components/Header'

interface Interview {
  id: string
  programName: string
  specialty: string
  city: string
  state: string
  date: string
  format: 'in-person' | 'virtual' | 'hybrid'
  status: 'invited' | 'scheduled' | 'completed' | 'declined' | 'waitlisted'
  impression: number // 1-5
  notes: string
  questions: string[]
  pros: string[]
  cons: string[]
  rank?: number
  travelCost?: number
}

const SPECIALTIES = [
  'Internal Medicine', 'Surgery', 'Pediatrics', 'OB/GYN', 'Psychiatry',
  'Family Medicine', 'Emergency Medicine', 'Anesthesiology', 'Radiology',
  'Neurology', 'Orthopedic Surgery', 'Dermatology', 'Ophthalmology',
  'Otolaryngology', 'Urology', 'Neurosurgery', 'Plastic Surgery',
  'Pathology', 'PM&R', 'Radiation Oncology', 'Other'
]

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']

function generateId() { return Math.random().toString(36).substring(2, 9) }

export default function InterviewTrackerPage() {
  const { user } = useAuth()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [newInterview, setNewInterview] = useState({
    programName: '', specialty: 'Internal Medicine', city: '', state: 'NY',
    date: '', format: 'virtual' as Interview['format'], notes: ''
  })
  const [aiSpecialty, setAiSpecialty] = useState('Internal Medicine')
  const [aiQuestionType, setAiQuestionType] = useState('mixed')
  const [aiQuestions, setAiQuestions] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const generateQuestions = async () => {
    setAiLoading(true)
    setAiError('')
    setAiQuestions('')
    try {
      const res = await fetch('/api/ai/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialty: aiSpecialty, questionType: aiQuestionType, userEmail: user?.email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setAiQuestions(data.questions)
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Failed to generate questions.')
    } finally {
      setAiLoading(false)
    }
  }

  const addInterview = () => {
    if (!newInterview.programName) return
    const interview: Interview = {
      id: generateId(),
      ...newInterview,
      status: newInterview.date ? 'scheduled' : 'invited',
      impression: 0, questions: [], pros: [], cons: [],
    }
    setInterviews([...interviews, interview])
    setNewInterview({ programName: '', specialty: 'Internal Medicine', city: '', state: 'NY', date: '', format: 'virtual', notes: '' })
    setShowForm(false)
  }

  const updateInterview = (id: string, updates: Partial<Interview>) => {
    setInterviews(interviews.map(i => i.id === id ? { ...i, ...updates } : i))
    if (selectedInterview?.id === id) setSelectedInterview({ ...selectedInterview, ...updates })
  }

  const deleteInterview = (id: string) => {
    setInterviews(interviews.filter(i => i.id !== id))
    if (selectedInterview?.id === id) setSelectedInterview(null)
  }

  const filtered = filterStatus === 'all' ? interviews : interviews.filter(i => i.status === filterStatus)
  const totalCost = interviews.reduce((s, i) => s + (i.travelCost || 0), 0)
  const statusCounts = {
    invited: interviews.filter(i => i.status === 'invited').length,
    scheduled: interviews.filter(i => i.status === 'scheduled').length,
    completed: interviews.filter(i => i.status === 'completed').length,
    declined: interviews.filter(i => i.status === 'declined').length,
  }

  // Detail view
  if (selectedInterview) {
    const iv = interviews.find(i => i.id === selectedInterview.id) || selectedInterview
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button onClick={() => setSelectedInterview(null)} className="text-sm text-gray-600 hover:text-red-600 mb-4">← Back</button>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{iv.programName}</h1>
                <p className="text-gray-500 text-sm">{iv.city}, {iv.state} · {iv.specialty}</p>
              </div>
              <select
                value={iv.status}
                onChange={(e) => updateInterview(iv.id, { status: e.target.value as Interview['status'] })}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
              >
                <option value="invited">Invited</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="declined">Declined</option>
                <option value="waitlisted">Waitlisted</option>
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Date</label>
                <input type="date" value={iv.date} onChange={(e) => updateInterview(iv.id, { date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Format</label>
                <select value={iv.format} onChange={(e) => updateInterview(iv.id, { format: e.target.value as Interview['format'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="in-person">In-Person</option>
                  <option value="virtual">Virtual</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Travel Cost</label>
                <input type="number" value={iv.travelCost || ''} onChange={(e) => updateInterview(iv.id, { travelCost: Number(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="$0" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Impression (1-5)</label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => updateInterview(iv.id, { impression: n })}
                      className={`w-8 h-8 rounded-lg text-sm font-bold ${n <= iv.impression ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pros/Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {(['pros', 'cons'] as const).map(type => (
                <div key={type}>
                  <label className="text-xs text-gray-500 block mb-2">{type === 'pros' ? '✅ Pros' : '❌ Cons'}</label>
                  {iv[type].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-700 flex-1">{item}</span>
                      <button onClick={() => updateInterview(iv.id, { [type]: iv[type].filter((_, j) => j !== i) })} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                    </div>
                  ))}
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const input = e.currentTarget.elements.namedItem('item') as HTMLInputElement
                    if (input.value.trim()) {
                      updateInterview(iv.id, { [type]: [...iv[type], input.value.trim()] })
                      input.value = ''
                    }
                  }}>
                    <input name="item" placeholder={`Add ${type === 'pros' ? 'pro' : 'con'}...`}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm mt-1" />
                  </form>
                </div>
              ))}
            </div>

            {/* Interview Questions */}
            <div className="mb-6">
              <label className="text-xs text-gray-500 block mb-2">📝 Interview Questions Asked</label>
              {iv.questions.map((q, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-700 flex-1">• {q}</span>
                  <button onClick={() => updateInterview(iv.id, { questions: iv.questions.filter((_, j) => j !== i) })} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                </div>
              ))}
              <form onSubmit={(e) => {
                e.preventDefault()
                const input = e.currentTarget.elements.namedItem('question') as HTMLInputElement
                if (input.value.trim()) {
                  updateInterview(iv.id, { questions: [...iv.questions, input.value.trim()] })
                  input.value = ''
                }
              }}>
                <input name="question" placeholder="Add question that was asked..."
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm mt-1" />
              </form>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Notes</label>
              <textarea value={iv.notes} onChange={(e) => updateInterview(iv.id, { notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-24 resize-none"
                placeholder="Overall thoughts, culture fit, red/green flags..." />
            </div>
          </div>

          <button onClick={() => deleteInterview(iv.id)} className="text-sm text-red-500 hover:text-red-700">
            Delete this interview
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 md:p-8 text-white shadow-xl mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">📝 Interview Tracker</h1>
          <p className="text-red-100 text-sm md:text-base max-w-2xl">
            Track residency interview invitations, schedule dates, record impressions, and log questions asked.
            Build your rank list with organized notes on every program.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {['Interview Calendar', 'Pro/Con Lists', 'Question Bank', 'Travel Costs', 'Impression Ratings'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">{tag}</span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total', value: interviews.length, color: 'text-gray-900' },
            { label: 'Invited', value: statusCounts.invited, color: 'text-blue-600' },
            { label: 'Scheduled', value: statusCounts.scheduled, color: 'text-yellow-600' },
            { label: 'Completed', value: statusCounts.completed, color: 'text-green-600' },
            { label: 'Travel Cost', value: `$${totalCost.toLocaleString()}`, color: 'text-red-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500">{stat.label}</div>
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['all', 'invited', 'scheduled', 'completed', 'declined'].map(status => (
            <button key={status} onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${filterStatus === status ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Add Form */}
        {!showForm ? (
          <button onClick={() => setShowForm(true)}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-red-400 hover:text-red-600 transition-all mb-6 font-medium">
            + Add Interview
          </button>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Add Interview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Program Name</label>
                <input value={newInterview.programName} onChange={(e) => setNewInterview({ ...newInterview, programName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g., Johns Hopkins IM" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Specialty</label>
                <select value={newInterview.specialty} onChange={(e) => setNewInterview({ ...newInterview, specialty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">City</label>
                  <input value={newInterview.city} onChange={(e) => setNewInterview({ ...newInterview, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Baltimore" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">State</label>
                  <select value={newInterview.state} onChange={(e) => setNewInterview({ ...newInterview, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    {US_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Interview Date</label>
                  <input type="date" value={newInterview.date} onChange={(e) => setNewInterview({ ...newInterview, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Format</label>
                  <select value={newInterview.format} onChange={(e) => setNewInterview({ ...newInterview, format: e.target.value as Interview['format'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="in-person">In-Person</option>
                    <option value="virtual">Virtual</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addInterview} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Add</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 text-sm">Cancel</button>
            </div>
          </div>
        )}

        {/* Interview List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{interviews.length === 0 ? 'No interviews yet' : 'No interviews match this filter'}</h3>
            <p className="text-gray-600 text-sm">Add your interview invitations as they come in to stay organized.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.sort((a, b) => (a.date || '').localeCompare(b.date || '')).map(iv => (
              <div key={iv.id} onClick={() => setSelectedInterview(iv)}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-red-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-4">
                <div className={`w-2 h-full min-h-[40px] rounded-full flex-shrink-0 ${
                  iv.status === 'completed' ? 'bg-green-500' : iv.status === 'scheduled' ? 'bg-yellow-500' :
                  iv.status === 'declined' ? 'bg-gray-400' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 truncate">{iv.programName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      iv.format === 'virtual' ? 'bg-purple-100 text-purple-700' :
                      iv.format === 'in-person' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                    }`}>{iv.format}</span>
                  </div>
                  <p className="text-xs text-gray-500">{iv.city}, {iv.state} · {iv.specialty}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {iv.date && <div className="text-sm font-medium text-gray-900">{new Date(iv.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>}
                  {iv.impression > 0 && (
                    <div className="flex gap-0.5 justify-end mt-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <div key={n} className={`w-1.5 h-1.5 rounded-full ${n <= iv.impression ? 'bg-red-500' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Interview Prep Section */}
        {user?.is_paid && (
          <div className="mt-12 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">✨</span>
              <h2 className="text-lg font-bold text-gray-900">AI Mock Interview Questions</h2>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Pro</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">Generate specialty-specific practice questions with tips on how to answer them.</p>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <select value={aiSpecialty} onChange={e => setAiSpecialty(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm">
                {SPECIALTIES.filter(s => s !== 'Other').map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={aiQuestionType} onChange={e => setAiQuestionType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="mixed">Mixed Questions</option>
                <option value="behavioral">Behavioral</option>
                <option value="clinical">Clinical Scenarios</option>
                <option value="program">Why This Specialty</option>
              </select>
              <button
                onClick={generateQuestions}
                disabled={aiLoading}
                className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                  aiLoading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {aiLoading ? 'Generating...' : 'Generate Questions'}
              </button>
            </div>
            {aiError && <p className="text-sm text-red-600 mb-3">{aiError}</p>}
            {aiLoading && (
              <div className="py-6 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm text-gray-500">Generating practice questions...</p>
              </div>
            )}
            {aiQuestions && (
              <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans bg-gray-50 rounded-lg p-4 mt-2">{aiQuestions}</pre>
            )}
          </div>
        )}

        {!user?.is_paid && (
          <div className="mt-12 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200 p-6 text-center">
            <span className="text-2xl">✨</span>
            <h3 className="font-bold text-gray-900 mt-2">AI Mock Interview Questions</h3>
            <p className="text-sm text-gray-600 mt-1 mb-3">Generate specialty-specific practice questions with AI. Available for Pro members.</p>
            <button onClick={() => window.location.href = '/'} className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700">
              Upgrade to Pro
            </button>
          </div>
        )}

        <div className="mt-12 border-t border-gray-200 pt-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Residency Interview Season Tips</h2>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            Track every interview invitation, record your impressions immediately after each interview, and keep detailed
            pro/con lists for each program. This data will be invaluable when it comes time to build your rank list for the Match.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-8 text-center text-xs text-gray-400">
          <p>Data stored locally. Sign up for MedStack Pro to sync across devices.</p>
        </div>
      </div>
    </div>
  )
}
