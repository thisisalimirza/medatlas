'use client'

import { useState } from 'react'
import Header from '@/components/Header'

interface Rotation {
  id: string
  name: string
  site: string
  specialty: string
  startDate: string
  endDate: string
  hours: number
  procedures: ProcedureLog[]
  evaluation: number // 1-5
  shelfScore?: number
  notes: string
  status: 'upcoming' | 'current' | 'completed'
}

interface ProcedureLog {
  id: string
  name: string
  count: number
  role: 'observed' | 'assisted' | 'performed'
}

const CORE_ROTATIONS = [
  'Internal Medicine', 'Surgery', 'Pediatrics', 'OB/GYN',
  'Psychiatry', 'Family Medicine', 'Neurology', 'Emergency Medicine'
]

const COMMON_PROCEDURES: Record<string, string[]> = {
  'Internal Medicine': ['Arterial Blood Gas', 'IV Placement', 'NG Tube', 'Lumbar Puncture', 'Paracentesis', 'Thoracentesis', 'Central Line (observed)'],
  'Surgery': ['Suturing', 'Wound Care', 'Foley Catheter', 'NG Tube', 'Chest Tube (observed)', 'Appendectomy (assist)', 'Cholecystectomy (assist)', 'Hernia Repair (assist)'],
  'Pediatrics': ['Newborn Exam', 'Well-Child Check', 'Developmental Screening', 'Vaccine Administration', 'Ear Exam/Tympanometry'],
  'OB/GYN': ['Pelvic Exam', 'Pap Smear', 'Fetal Heart Monitoring', 'Vaginal Delivery (assist)', 'C-Section (assist)', 'Ultrasound'],
  'Psychiatry': ['Mental Status Exam', 'Suicide Risk Assessment', 'Psychiatric Interview', 'Cognitive Testing'],
  'Family Medicine': ['Skin Biopsy', 'Joint Injection', 'Pap Smear', 'Wound Care', 'Spirometry', 'EKG Interpretation'],
  'Neurology': ['Neurological Exam', 'Lumbar Puncture', 'EEG Interpretation', 'Stroke Assessment (NIHSS)'],
  'Emergency Medicine': ['Suturing', 'Splinting', 'IV Access', 'Intubation (observed)', 'Central Line (observed)', 'Chest Tube (observed)', 'FAST Exam'],
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export default function RotationTrackerPage() {
  const [rotations, setRotations] = useState<Rotation[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedRotation, setSelectedRotation] = useState<Rotation | null>(null)
  const [newRotation, setNewRotation] = useState({
    name: '', site: '', specialty: 'Internal Medicine', startDate: '', endDate: '', notes: ''
  })

  const addRotation = () => {
    if (!newRotation.name || !newRotation.startDate) return
    const today = new Date().toISOString().split('T')[0]
    const status: Rotation['status'] = newRotation.startDate > today ? 'upcoming' :
      (newRotation.endDate && newRotation.endDate < today) ? 'completed' : 'current'

    const procedures = (COMMON_PROCEDURES[newRotation.specialty] || []).map(name => ({
      id: generateId(), name, count: 0, role: 'observed' as const
    }))

    const rotation: Rotation = {
      id: generateId(),
      name: newRotation.name,
      site: newRotation.site,
      specialty: newRotation.specialty,
      startDate: newRotation.startDate,
      endDate: newRotation.endDate,
      hours: 0,
      procedures,
      evaluation: 0,
      notes: newRotation.notes,
      status
    }
    setRotations([...rotations, rotation])
    setNewRotation({ name: '', site: '', specialty: 'Internal Medicine', startDate: '', endDate: '', notes: '' })
    setShowAddForm(false)
  }

  const updateRotation = (id: string, updates: Partial<Rotation>) => {
    setRotations(rotations.map(r => r.id === id ? { ...r, ...updates } : r))
    if (selectedRotation?.id === id) {
      setSelectedRotation({ ...selectedRotation, ...updates })
    }
  }

  const updateProcedure = (rotationId: string, procId: string, updates: Partial<ProcedureLog>) => {
    setRotations(rotations.map(r => {
      if (r.id !== rotationId) return r
      return {
        ...r,
        procedures: r.procedures.map(p => p.id === procId ? { ...p, ...updates } : p)
      }
    }))
  }

  const addCustomProcedure = (rotationId: string, name: string) => {
    if (!name.trim()) return
    setRotations(rotations.map(r => {
      if (r.id !== rotationId) return r
      return {
        ...r,
        procedures: [...r.procedures, { id: generateId(), name: name.trim(), count: 0, role: 'observed' }]
      }
    }))
  }

  const totalHours = rotations.reduce((sum, r) => sum + r.hours, 0)
  const totalProcedures = rotations.reduce((sum, r) => sum + r.procedures.reduce((s, p) => s + p.count, 0), 0)
  const completedRotations = rotations.filter(r => r.status === 'completed').length

  // Detail View
  if (selectedRotation) {
    const rotation = rotations.find(r => r.id === selectedRotation.id) || selectedRotation
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button onClick={() => setSelectedRotation(null)} className="text-sm text-gray-600 hover:text-red-600 mb-4 transition-colors">
            ← Back to all rotations
          </button>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{rotation.name}</h1>
                <p className="text-gray-500 text-sm">{rotation.site} · {rotation.specialty}</p>
                <p className="text-gray-400 text-xs mt-1">{rotation.startDate} → {rotation.endDate || 'Ongoing'}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                rotation.status === 'current' ? 'bg-green-100 text-green-700' :
                rotation.status === 'completed' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {rotation.status}
              </span>
            </div>

            {/* Hours & Shelf Score */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Clinical Hours</label>
                <input
                  type="number"
                  value={rotation.hours || ''}
                  onChange={(e) => updateRotation(rotation.id, { hours: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Shelf Exam Score</label>
                <input
                  type="number"
                  value={rotation.shelfScore || ''}
                  onChange={(e) => updateRotation(rotation.id, { shelfScore: Number(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Percentile"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Self-Evaluation (1-5)</label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => updateRotation(rotation.id, { evaluation: n })}
                      className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                        n <= rotation.evaluation ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="text-xs text-gray-500 block mb-1">Notes</label>
              <textarea
                value={rotation.notes}
                onChange={(e) => updateRotation(rotation.id, { notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-20 resize-none"
                placeholder="Attending names, key learnings, tips for future students..."
              />
            </div>
          </div>

          {/* Procedure Log */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Procedure Log</h2>
            <div className="space-y-3">
              {rotation.procedures.map(proc => (
                <div key={proc.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                  <span className="flex-1 text-sm text-gray-900">{proc.name}</span>
                  <select
                    value={proc.role}
                    onChange={(e) => updateProcedure(rotation.id, proc.id, { role: e.target.value as ProcedureLog['role'] })}
                    className="text-xs border border-gray-300 rounded-lg px-2 py-1"
                  >
                    <option value="observed">Observed</option>
                    <option value="assisted">Assisted</option>
                    <option value="performed">Performed</option>
                  </select>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateProcedure(rotation.id, proc.id, { count: Math.max(0, proc.count - 1) })}
                      className="w-7 h-7 rounded bg-gray-100 text-gray-600 text-sm hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{proc.count}</span>
                    <button
                      onClick={() => updateProcedure(rotation.id, proc.id, { count: proc.count + 1 })}
                      className="w-7 h-7 rounded bg-red-100 text-red-600 text-sm hover:bg-red-200"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add custom procedure */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <form onSubmit={(e) => {
                e.preventDefault()
                const input = e.currentTarget.elements.namedItem('procName') as HTMLInputElement
                addCustomProcedure(rotation.id, input.value)
                input.value = ''
              }} className="flex gap-2">
                <input
                  name="procName"
                  type="text"
                  placeholder="Add custom procedure..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                  Add
                </button>
              </form>
            </div>
          </div>
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">🧾 Rotation Tracker</h1>
          <p className="text-red-100 text-sm md:text-base max-w-2xl">
            Track your clinical rotations, log procedures, record hours, and monitor your progress
            through clerkships. Keep everything organized for your MSPE and residency applications.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {['Hour Logging', 'Procedure Tracking', 'Shelf Scores', 'Self-Evaluations', 'Notes & Tips'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">{tag}</span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500">Total Rotations</div>
            <div className="text-2xl font-bold text-gray-900">{rotations.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500">Completed</div>
            <div className="text-2xl font-bold text-green-600">{completedRotations}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500">Clinical Hours</div>
            <div className="text-2xl font-bold text-gray-900">{totalHours.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-500">Procedures Logged</div>
            <div className="text-2xl font-bold text-gray-900">{totalProcedures}</div>
          </div>
        </div>

        {/* Add Rotation */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-red-400 hover:text-red-600 transition-all mb-6 font-medium"
          >
            + Add Rotation
          </button>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Add New Rotation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Rotation Name</label>
                <input
                  value={newRotation.name}
                  onChange={(e) => setNewRotation({ ...newRotation, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="e.g., Internal Medicine Clerkship"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Hospital/Site</label>
                <input
                  value={newRotation.site}
                  onChange={(e) => setNewRotation({ ...newRotation, site: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="e.g., University Hospital"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Specialty</label>
                <select
                  value={newRotation.specialty}
                  onChange={(e) => setNewRotation({ ...newRotation, specialty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {CORE_ROTATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newRotation.startDate}
                    onChange={(e) => setNewRotation({ ...newRotation, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={newRotation.endDate}
                    onChange={(e) => setNewRotation({ ...newRotation, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addRotation} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                Add Rotation
              </button>
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Rotation Cards */}
        {rotations.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🧾</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No rotations added yet</h3>
            <p className="text-gray-600 text-sm">Add your first clinical rotation to start tracking hours, procedures, and evaluations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rotations.map(rotation => (
              <div
                key={rotation.id}
                onClick={() => setSelectedRotation(rotation)}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-red-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{rotation.name}</h3>
                    <p className="text-xs text-gray-500">{rotation.site}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    rotation.status === 'current' ? 'bg-green-100 text-green-700' :
                    rotation.status === 'completed' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {rotation.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span>{rotation.hours}h logged</span>
                  <span>{rotation.procedures.reduce((s, p) => s + p.count, 0)} procedures</span>
                  {rotation.shelfScore && <span>Shelf: {rotation.shelfScore}</span>}
                </div>
                {rotation.evaluation > 0 && (
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} className={`w-2 h-2 rounded-full ${n <= rotation.evaluation ? 'bg-red-500' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SEO Content */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Why Track Your Clinical Rotations?</h2>
            <p className="text-gray-600 text-sm leading-relaxed text-center">
              Clinical rotation tracking is essential for your MSPE (Medical Student Performance Evaluation), residency applications,
              and meeting graduation requirements. Log your hours, procedures, and shelf scores in one place to build a comprehensive
              record of your clinical training. Many residency programs ask about specific procedures and clinical experiences during interviews.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-8 text-center text-xs text-gray-400">
          <p>Data is stored locally in your browser. Sign up for MedStack Pro to save across devices.</p>
        </div>
      </div>
    </div>
  )
}
