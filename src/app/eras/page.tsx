'use client'

import { useState } from 'react'
import Header from '@/components/Header'

interface Application {
  id: string
  programName: string
  specialty: string
  city: string
  state: string
  status: 'drafting' | 'submitted' | 'complete' | 'withdrawn'
  dateSubmitted?: string
  lor1: boolean
  lor2: boolean
  lor3: boolean
  personalStatement: boolean
  mspe: boolean
  transcript: boolean
  notes: string
}

interface TimelineItem {
  date: string
  title: string
  description: string
  category: 'deadline' | 'milestone' | 'tip'
}

const ERAS_TIMELINE: TimelineItem[] = [
  { date: 'Jun 1', title: 'ERAS Opens for Registration', description: 'Create your MyERAS account and begin building your application.', category: 'deadline' },
  { date: 'Jul-Aug', title: 'Build Application', description: 'Complete CV, personal statement, and request letters of recommendation.', category: 'milestone' },
  { date: 'Sep 1', title: 'Programs Can View Applications', description: 'Programs begin reviewing applications. Early submission is advantageous.', category: 'deadline' },
  { date: 'Sep 15', title: 'MSPE Release Date', description: 'Medical Student Performance Evaluations are released to programs.', category: 'deadline' },
  { date: 'Oct-Nov', title: 'Interview Invitations Begin', description: 'Programs send interview invitations. Respond promptly — spots fill quickly.', category: 'milestone' },
  { date: 'Oct-Feb', title: 'Interview Season', description: 'Attend interviews (virtual and in-person). Track impressions for rank list.', category: 'milestone' },
  { date: 'Late Feb', title: 'Rank Order List Deadline', description: 'Submit your certified rank order list to NRMP. No changes after this date.', category: 'deadline' },
  { date: 'Mid Mar', title: 'Match Day', description: 'Results released. Matched applicants learn their program. Unmatched enter SOAP.', category: 'deadline' },
  { date: 'Mid Mar', title: 'SOAP (if needed)', description: 'Supplemental Offer and Acceptance Program for unmatched applicants.', category: 'tip' },
  { date: 'Jul 1', title: 'Residency Begins', description: 'Start date for most residency programs nationwide.', category: 'milestone' },
]

const SPECIALTIES = [
  'Internal Medicine', 'Surgery', 'Pediatrics', 'OB/GYN', 'Family Medicine',
  'Emergency Medicine', 'Psychiatry', 'Anesthesiology', 'Radiology', 'Pathology',
  'Neurology', 'Dermatology', 'Orthopedic Surgery', 'Ophthalmology', 'Urology'
]

const APPLICATION_COSTS = [
  { item: 'ERAS Token (Registration)', cost: '$180' },
  { item: 'First 30 Programs', cost: '$11 each ($330)' },
  { item: 'Programs 31-40', cost: '$16 each' },
  { item: 'Programs 41-50', cost: '$21 each' },
  { item: 'Programs 51+', cost: '$26 each' },
  { item: 'USMLE Transcript', cost: '$80' },
  { item: 'NRMP Registration', cost: '$85' },
]

function generateId() { return Date.now().toString(36) + Math.random().toString(36).substring(2) }

export default function ERASManagerPage() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'tracker' | 'checklist' | 'costs'>('timeline')
  const [applications, setApplications] = useState<Application[]>([])
  const [showAddApp, setShowAddApp] = useState(false)
  const [newApp, setNewApp] = useState({ programName: '', specialty: 'Internal Medicine', city: '', state: '' })

  const addApplication = () => {
    if (!newApp.programName) return
    setApplications(prev => [...prev, {
      ...newApp, id: generateId(), status: 'drafting',
      lor1: false, lor2: false, lor3: false, personalStatement: false, mspe: false, transcript: false, notes: ''
    }])
    setNewApp({ programName: '', specialty: newApp.specialty, city: '', state: '' })
    setShowAddApp(false)
  }

  const updateStatus = (id: string, status: Application['status']) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status, dateSubmitted: status === 'submitted' ? new Date().toISOString().split('T')[0] : a.dateSubmitted } : a))
  }

  const toggleDoc = (id: string, doc: string) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, [doc]: !(a as unknown as Record<string, boolean | string>)[doc] } : a))
  }

  const deleteApp = (id: string) => {
    setApplications(prev => prev.filter(a => a.id !== id))
  }

  const submitted = applications.filter(a => a.status === 'submitted').length
  const complete = applications.filter(a => a.status === 'complete').length

  // Checklist items
  const checklistItems = [
    { category: 'Before ERAS Opens (Jun)', items: [
      'Register for USMLE/COMLEX and pass required exams',
      'Request official USMLE/COMLEX transcripts',
      'Identify 3-4 letter writers and request LORs early',
      'Draft personal statement (start by May)',
      'Prepare CV with all experiences, publications, presentations',
      'Take professional headshot for ERAS photo',
      'Research programs and build a target list',
    ]},
    { category: 'Application Building (Jun-Aug)', items: [
      'Complete ERAS application demographics and education',
      'Enter all work, volunteer, and research experiences',
      'List publications, presentations, and awards',
      'Finalize and upload personal statement',
      'Assign letters of recommendation to programs',
      'Review MSPE with dean of students',
      'Set application budget and program count',
    ]},
    { category: 'Submission & Beyond (Sep-Mar)', items: [
      'Submit applications by September 1 (or earlier if possible)',
      'Monitor email for interview invitations daily',
      'Schedule interviews promptly as invitations arrive',
      'Send thank you notes after each interview',
      'Create rank list using structured evaluation criteria',
      'Certify rank order list before NRMP deadline',
      'Prepare SOAP materials as a backup plan',
    ]},
  ]

  const tabs = [
    { id: 'timeline' as const, label: 'ERAS Timeline' },
    { id: 'tracker' as const, label: `Application Tracker (${applications.length})` },
    { id: 'checklist' as const, label: 'Checklist' },
    { id: 'costs' as const, label: 'Cost Calculator' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">💼 ERAS Manager</h1>
            <p className="text-red-100 text-sm md:text-base max-w-2xl">Manage your ERAS application process with timeline tracking, application status management, checklists, and cost estimation.</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Application Timeline', 'Program Tracker', 'Document Checklist', 'Cost Calculator'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">{applications.length}</div>
            <div className="text-xs text-gray-500">Programs</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{submitted}</div>
            <div className="text-xs text-gray-500">Submitted</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">{complete}</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">${applications.length <= 30 ? (180 + applications.length * 11 + 80 + 85).toLocaleString() : (180 + 30 * 11 + Math.min(applications.length - 30, 10) * 16 + Math.min(Math.max(applications.length - 40, 0), 10) * 21 + Math.max(applications.length - 50, 0) * 26 + 80 + 85).toLocaleString()}</div>
            <div className="text-xs text-gray-500">Est. Cost</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex gap-0 border-b border-gray-200 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-6">ERAS Application Timeline</h2>
                <div className="space-y-3">
                  {ERAS_TIMELINE.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-20 text-right">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          item.category === 'deadline' ? 'bg-red-100 text-red-700' :
                          item.category === 'milestone' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{item.date}</span>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <h3 className="font-medium text-gray-900 text-sm">{item.title}</h3>
                        <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tracker Tab */}
            {activeTab === 'tracker' && (
              <div>
                <div className="flex justify-end mb-4">
                  <button onClick={() => setShowAddApp(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium">+ Add Program</button>
                </div>

                {applications.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <div className="text-4xl mb-3">💼</div>
                    <p>No applications tracked yet. Add programs you&apos;re applying to.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map(app => (
                      <div key={app.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{app.programName}</h3>
                            <p className="text-xs text-gray-500">{app.city}, {app.state} • {app.specialty}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <select value={app.status} onChange={e => updateStatus(app.id, e.target.value as Application['status'])} className="text-xs border border-gray-300 rounded-lg px-2 py-1">
                              <option value="drafting">Drafting</option>
                              <option value="submitted">Submitted</option>
                              <option value="complete">Complete</option>
                              <option value="withdrawn">Withdrawn</option>
                            </select>
                            <button onClick={() => deleteApp(app.id)} className="text-xs text-red-500 hover:text-red-700">×</button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { key: 'personalStatement', label: 'PS' },
                            { key: 'lor1', label: 'LOR 1' },
                            { key: 'lor2', label: 'LOR 2' },
                            { key: 'lor3', label: 'LOR 3' },
                            { key: 'mspe', label: 'MSPE' },
                            { key: 'transcript', label: 'Transcript' },
                          ].map(doc => (
                            <button key={doc.key} onClick={() => toggleDoc(app.id, doc.key)}
                              className={`text-xs px-2 py-1 rounded-full transition-colors ${(app as unknown as Record<string, boolean | string>)[doc.key] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {(app as unknown as Record<string, boolean | string>)[doc.key] ? '✓' : '○'} {doc.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showAddApp && (
                  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAddApp(false)}>
                    <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Add Program</h3>
                      <div className="space-y-3">
                        <div><label className="text-xs text-gray-500 block mb-1">Program Name</label>
                          <input type="text" value={newApp.programName} onChange={e => setNewApp(p => ({ ...p, programName: e.target.value }))} placeholder="e.g., Mass General" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" /></div>
                        <div><label className="text-xs text-gray-500 block mb-1">Specialty</label>
                          <select value={newApp.specialty} onChange={e => setNewApp(p => ({ ...p, specialty: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">{SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="text-xs text-gray-500 block mb-1">City</label><input type="text" value={newApp.city} onChange={e => setNewApp(p => ({ ...p, city: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                          <div><label className="text-xs text-gray-500 block mb-1">State</label><input type="text" value={newApp.state} onChange={e => setNewApp(p => ({ ...p, state: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => setShowAddApp(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">Cancel</button>
                        <button onClick={addApplication} disabled={!newApp.programName} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium">Add Program</button>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-6 text-center">Data stored locally. Sign up for MedAtlas Pro to sync across devices.</p>
              </div>
            )}

            {/* Checklist Tab */}
            {activeTab === 'checklist' && (
              <div className="space-y-6">
                {checklistItems.map(section => (
                  <div key={section.category}>
                    <h3 className="text-sm font-bold text-red-600 mb-3">{section.category}</h3>
                    <div className="space-y-2">
                      {section.items.map((item, i) => (
                        <label key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200 cursor-pointer hover:bg-gray-100">
                          <input type="checkbox" className="mt-0.5 accent-red-600" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Costs Tab */}
            {activeTab === 'costs' && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">ERAS Application Costs</h2>
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-100">
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Item</th>
                        <th className="text-right py-3 px-4 text-gray-600 font-medium">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {APPLICATION_COSTS.map(item => (
                        <tr key={item.item} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-700">{item.item}</td>
                          <td className="py-3 px-4 text-right font-medium text-gray-900">{item.cost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <h3 className="font-bold text-yellow-800 mb-2">Cost Estimation Examples</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="bg-white rounded-lg p-3 border border-yellow-200">
                      <div className="font-medium text-gray-900">30 Programs</div>
                      <div className="text-xs text-gray-500">Conservative</div>
                      <div className="text-lg font-bold text-red-600 mt-1">~$675</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-yellow-200">
                      <div className="font-medium text-gray-900">75 Programs</div>
                      <div className="text-xs text-gray-500">Average</div>
                      <div className="text-lg font-bold text-red-600 mt-1">~$1,600</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-yellow-200">
                      <div className="font-medium text-gray-900">200 Programs</div>
                      <div className="text-xs text-gray-500">IMG/Competitive</div>
                      <div className="text-lg font-bold text-red-600 mt-1">~$5,100</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-12 mb-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">ERAS Application Guide</h2>
          <div className="text-sm text-gray-600 space-y-3">
            <p>The Electronic Residency Application Service (ERAS) is the centralized platform used by medical students and graduates to apply to residency programs in the United States. Managing your ERAS application effectively is critical to a successful Match outcome. Our ERAS Manager helps you track deadlines, organize documents, monitor application status, and estimate costs.</p>
            <p>Timing is everything in the ERAS process. Applications open in June, and programs begin reviewing them on September 1st. Submitting your application early — ideally on the first day — gives you a significant advantage, as many programs review applications on a rolling basis and may fill interview slots quickly. Your MSPE is released on September 15th, so everything else should be ready before then.</p>
            <p>Application costs add up quickly. Between ERAS fees, USMLE transcripts, and NRMP registration, even a moderate application to 50 programs costs over $1,000. For competitive specialties or IMGs applying broadly to 150+ programs, costs can exceed $4,000 in application fees alone, not counting interview travel expenses.</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center pb-8">This tool is for personal organization only. Not affiliated with ERAS, AAMC, or NRMP. Check official ERAS website for current fees and deadlines.</p>
      </div>
    </div>
  )
}
