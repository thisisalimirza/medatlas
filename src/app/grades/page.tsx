'use client'

import { useState } from 'react'

// Types
interface Course {
  id: string
  name: string
  year: string
  type: 'preclinical' | 'clerkship' | 'elective'
  gradingSystem: 'letter' | 'pass-fail' | 'honors'
  grade: string
  credits: number
  date: string
  notes: string
}

interface ExamScore {
  id: string
  exam: string
  score: string
  date: string
  percentile?: string
  passed: boolean
  notes: string
}

const YEAR_OPTIONS = ['MS1', 'MS2', 'MS3', 'MS4', 'Other']

const GRADING_SYSTEMS = {
  'letter': { label: 'Letter Grade', options: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'] },
  'pass-fail': { label: 'Pass/Fail', options: ['Pass', 'Fail'] },
  'honors': { label: 'Honors/HP/P/F', options: ['Honors', 'High Pass', 'Pass', 'Fail'] },
}

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0,
  'Honors': 4.0, 'High Pass': 3.5, 'Pass': 3.0, 'Fail': 0.0,
}

const EXAM_OPTIONS = [
  'USMLE Step 1', 'USMLE Step 2 CK', 'USMLE Step 3',
  'COMLEX Level 1', 'COMLEX Level 2-CE', 'COMLEX Level 3',
  'NBME Shelf - Medicine', 'NBME Shelf - Surgery', 'NBME Shelf - Pediatrics',
  'NBME Shelf - OB/GYN', 'NBME Shelf - Psychiatry', 'NBME Shelf - Family Medicine',
  'NBME Shelf - Neurology', 'NBME CBSE (Practice)',
  'Other'
]

const COMMON_COURSES: Record<string, string[]> = {
  MS1: ['Anatomy', 'Biochemistry', 'Histology', 'Embryology', 'Physiology', 'Behavioral Science', 'Immunology', 'Genetics'],
  MS2: ['Pathology', 'Pharmacology', 'Microbiology', 'Pathophysiology', 'Clinical Skills', 'Neuroscience'],
  MS3: ['Internal Medicine Clerkship', 'Surgery Clerkship', 'Pediatrics Clerkship', 'OB/GYN Clerkship', 'Psychiatry Clerkship', 'Family Medicine Clerkship', 'Neurology Clerkship'],
  MS4: ['Emergency Medicine', 'Sub-Internship', 'ICU Rotation', 'Radiology', 'Anesthesiology', 'Research Elective'],
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

function GradeCard({ course, onClick }: { course: Course; onClick: () => void }) {
  const gradeColor = () => {
    const g = course.grade
    if (['A+', 'A', 'A-', 'Honors'].includes(g)) return 'text-green-400'
    if (['B+', 'B', 'B-', 'High Pass'].includes(g)) return 'text-blue-400'
    if (['C+', 'C', 'C-', 'Pass'].includes(g)) return 'text-yellow-400'
    if (['D', 'F', 'Fail'].includes(g)) return 'text-red-400'
    return 'text-gray-400'
  }

  return (
    <button onClick={onClick} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-left hover:border-blue-500/50 transition-all w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400">{course.year}</span>
        <span className={`text-lg font-bold ${gradeColor()}`}>{course.grade}</span>
      </div>
      <h3 className="text-white font-medium text-sm">{course.name}</h3>
      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
        <span>{course.credits} credits</span>
        <span>•</span>
        <span>{GRADING_SYSTEMS[course.gradingSystem].label}</span>
      </div>
    </button>
  )
}

export default function GradeTrackerPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [exams, setExams] = useState<ExamScore[]>([])
  const [activeTab, setActiveTab] = useState<'courses' | 'exams' | 'analytics'>('courses')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedExam, setSelectedExam] = useState<ExamScore | null>(null)
  const [showAddCourse, setShowAddCourse] = useState(false)
  const [showAddExam, setShowAddExam] = useState(false)
  const [filterYear, setFilterYear] = useState<string>('all')

  // New course form
  const [newCourse, setNewCourse] = useState({
    name: '', year: 'MS1', type: 'preclinical' as Course['type'],
    gradingSystem: 'letter' as Course['gradingSystem'],
    grade: 'A', credits: 3, date: '', notes: ''
  })

  // New exam form
  const [newExam, setNewExam] = useState({
    exam: 'USMLE Step 1', score: '', date: '', percentile: '', passed: true, notes: ''
  })

  const addCourse = () => {
    if (!newCourse.name) return
    setCourses(prev => [...prev, { ...newCourse, id: generateId() }])
    setNewCourse({ name: '', year: 'MS1', type: 'preclinical', gradingSystem: 'letter', grade: 'A', credits: 3, date: '', notes: '' })
    setShowAddCourse(false)
  }

  const addExam = () => {
    if (!newExam.score) return
    setExams(prev => [...prev, { ...newExam, id: generateId() }])
    setNewExam({ exam: 'USMLE Step 1', score: '', date: '', percentile: '', passed: true, notes: '' })
    setShowAddExam(false)
  }

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id))
    setSelectedCourse(null)
  }

  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id))
    setSelectedExam(null)
  }

  // Analytics calculations
  const calcGPA = (courseList: Course[]) => {
    const gradeable = courseList.filter(c => c.gradingSystem !== 'pass-fail' && GRADE_POINTS[c.grade] !== undefined)
    if (gradeable.length === 0) return null
    const totalPoints = gradeable.reduce((sum, c) => sum + (GRADE_POINTS[c.grade] || 0) * c.credits, 0)
    const totalCredits = gradeable.reduce((sum, c) => sum + c.credits, 0)
    return totalCredits > 0 ? totalPoints / totalCredits : null
  }

  const overallGPA = calcGPA(courses)
  const filteredCourses = filterYear === 'all' ? courses : courses.filter(c => c.year === filterYear)

  const yearGPAs = YEAR_OPTIONS.map(year => ({
    year,
    gpa: calcGPA(courses.filter(c => c.year === year)),
    count: courses.filter(c => c.year === year).length
  })).filter(y => y.count > 0)

  const honorsCount = courses.filter(c => ['Honors', 'A+', 'A'].includes(c.grade)).length
  const passRate = courses.length > 0 ? ((courses.filter(c => c.grade !== 'F' && c.grade !== 'Fail').length / courses.length) * 100).toFixed(0) : '0'

  const tabs = [
    { id: 'courses' as const, label: 'Courses', count: courses.length },
    { id: 'exams' as const, label: 'Board Exams', count: exams.length },
    { id: 'analytics' as const, label: 'Analytics' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-gray-950 to-teal-900/20" />
        <div className="relative max-w-6xl mx-auto px-4 pt-24 pb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Grade Tracker</span>
          </h1>
          <p className="text-gray-400 max-w-2xl">Track your academic performance across preclinical courses, clinical clerkships, and board exams.</p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30">
              <div className="text-2xl font-bold text-emerald-400">{overallGPA ? overallGPA.toFixed(2) : '—'}</div>
              <div className="text-xs text-gray-500">Cumulative GPA</div>
            </div>
            <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30">
              <div className="text-2xl font-bold text-white">{courses.length}</div>
              <div className="text-xs text-gray-500">Courses</div>
            </div>
            <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30">
              <div className="text-2xl font-bold text-yellow-400">{honorsCount}</div>
              <div className="text-xs text-gray-500">Honors/A&apos;s</div>
            </div>
            <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30">
              <div className="text-2xl font-bold text-blue-400">{exams.length}</div>
              <div className="text-xs text-gray-500">Board Exams</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-1 border-b border-gray-800 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}
            </button>
          ))}
        </div>

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setFilterYear('all')} className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${filterYear === 'all' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'}`}>All</button>
                {YEAR_OPTIONS.map(y => (
                  <button key={y} onClick={() => setFilterYear(y)} className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${filterYear === y ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'}`}>{y}</button>
                ))}
              </div>
              <button onClick={() => setShowAddCourse(true)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg transition-colors">+ Add Course</button>
            </div>

            {selectedCourse ? (
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setSelectedCourse(null)} className="text-sm text-gray-400 hover:text-white">← Back</button>
                  <button onClick={() => deleteCourse(selectedCourse.id)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
                </div>
                <h2 className="text-xl font-bold mb-1">{selectedCourse.name}</h2>
                <div className="flex gap-3 text-sm text-gray-400 mb-4">
                  <span>{selectedCourse.year}</span>
                  <span>•</span>
                  <span>{selectedCourse.credits} credits</span>
                  <span>•</span>
                  <span>{GRADING_SYSTEMS[selectedCourse.gradingSystem].label}</span>
                </div>
                <div className="text-3xl font-bold text-emerald-400 mb-4">{selectedCourse.grade}</div>
                {selectedCourse.date && <p className="text-sm text-gray-500 mb-2">Completed: {selectedCourse.date}</p>}
                {selectedCourse.notes && <p className="text-sm text-gray-400 mt-2 bg-gray-900/50 p-3 rounded-lg">{selectedCourse.notes}</p>}
              </div>
            ) : (
              <>
                {filteredCourses.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <div className="text-4xl mb-3">📊</div>
                    <p>No courses added yet. Start tracking your grades!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredCourses.map(course => (
                      <GradeCard key={course.id} course={course} onClick={() => setSelectedCourse(course)} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Add Course Modal */}
            {showAddCourse && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAddCourse(false)}>
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <h3 className="text-lg font-bold mb-4">Add Course</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Year</label>
                      <select value={newCourse.year} onChange={e => setNewCourse(p => ({ ...p, year: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
                        {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Course Name</label>
                      <input type="text" value={newCourse.name} onChange={e => setNewCourse(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Anatomy" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
                      {COMMON_COURSES[newCourse.year] && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {COMMON_COURSES[newCourse.year].map(c => (
                            <button key={c} onClick={() => setNewCourse(p => ({ ...p, name: c }))} className="px-2 py-0.5 text-xs bg-gray-800 text-gray-400 rounded hover:bg-gray-700">{c}</button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Grading System</label>
                        <select value={newCourse.gradingSystem} onChange={e => { const sys = e.target.value as Course['gradingSystem']; setNewCourse(p => ({ ...p, gradingSystem: sys, grade: GRADING_SYSTEMS[sys].options[0] })) }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
                          {Object.entries(GRADING_SYSTEMS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Grade</label>
                        <select value={newCourse.grade} onChange={e => setNewCourse(p => ({ ...p, grade: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
                          {GRADING_SYSTEMS[newCourse.gradingSystem].options.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Credits</label>
                        <input type="number" min={1} max={12} value={newCourse.credits} onChange={e => setNewCourse(p => ({ ...p, credits: parseInt(e.target.value) || 1 }))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Date</label>
                        <input type="date" value={newCourse.date} onChange={e => setNewCourse(p => ({ ...p, date: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Notes (optional)</label>
                      <textarea value={newCourse.notes} onChange={e => setNewCourse(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white resize-none" />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button onClick={() => setShowAddCourse(false)} className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm">Cancel</button>
                    <button onClick={addCourse} disabled={!newCourse.name} className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-sm">Add Course</button>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-600 mt-6 text-center">Data stored locally. Sign up for MedAtlas Pro to sync across devices.</p>
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowAddExam(true)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg transition-colors">+ Add Exam</button>
            </div>

            {selectedExam ? (
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setSelectedExam(null)} className="text-sm text-gray-400 hover:text-white">← Back</button>
                  <button onClick={() => deleteExam(selectedExam.id)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
                </div>
                <h2 className="text-xl font-bold mb-1">{selectedExam.exam}</h2>
                <div className="text-3xl font-bold text-emerald-400 my-3">{selectedExam.score}</div>
                <div className="flex gap-4 text-sm text-gray-400">
                  {selectedExam.date && <span>Date: {selectedExam.date}</span>}
                  {selectedExam.percentile && <span>Percentile: {selectedExam.percentile}%</span>}
                  <span className={selectedExam.passed ? 'text-green-400' : 'text-red-400'}>{selectedExam.passed ? 'Passed' : 'Failed'}</span>
                </div>
                {selectedExam.notes && <p className="text-sm text-gray-400 mt-4 bg-gray-900/50 p-3 rounded-lg">{selectedExam.notes}</p>}
              </div>
            ) : (
              <>
                {exams.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <div className="text-4xl mb-3">🩺</div>
                    <p>No exam scores added yet. Track your board exam performance here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {exams.map(exam => (
                      <button key={exam.id} onClick={() => setSelectedExam(exam)} className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-left hover:border-emerald-500/50 transition-all">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-medium">{exam.exam}</h3>
                            <div className="text-xs text-gray-500 mt-1">
                              {exam.date && <span>{exam.date}</span>}
                              {exam.percentile && <span> • {exam.percentile}th percentile</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-emerald-400">{exam.score}</div>
                            <div className={`text-xs ${exam.passed ? 'text-green-400' : 'text-red-400'}`}>{exam.passed ? 'Pass' : 'Fail'}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Add Exam Modal */}
            {showAddExam && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAddExam(false)}>
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                  <h3 className="text-lg font-bold mb-4">Add Board Exam Score</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Exam</label>
                      <select value={newExam.exam} onChange={e => setNewExam(p => ({ ...p, exam: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
                        {EXAM_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Score</label>
                        <input type="text" value={newExam.score} onChange={e => setNewExam(p => ({ ...p, score: e.target.value }))} placeholder="e.g., 240" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Percentile</label>
                        <input type="text" value={newExam.percentile} onChange={e => setNewExam(p => ({ ...p, percentile: e.target.value }))} placeholder="e.g., 85" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Date</label>
                        <input type="date" value={newExam.date} onChange={e => setNewExam(p => ({ ...p, date: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Result</label>
                        <select value={newExam.passed ? 'pass' : 'fail'} onChange={e => setNewExam(p => ({ ...p, passed: e.target.value === 'pass' }))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
                          <option value="pass">Passed</option>
                          <option value="fail">Failed</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Notes (optional)</label>
                      <textarea value={newExam.notes} onChange={e => setNewExam(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white resize-none" />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button onClick={() => setShowAddExam(false)} className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm">Cancel</button>
                    <button onClick={addExam} disabled={!newExam.score} className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-sm">Add Score</button>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-600 mt-6 text-center">Data stored locally. Sign up for MedAtlas Pro to sync across devices.</p>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            {courses.length === 0 && exams.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="text-4xl mb-3">📈</div>
                <p>Add courses and exam scores to see your academic analytics.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* GPA by Year */}
                {yearGPAs.length > 0 && (
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4">GPA by Year</h3>
                    <div className="space-y-3">
                      {yearGPAs.map(({ year, gpa, count }) => (
                        <div key={year} className="flex items-center gap-4">
                          <span className="text-sm text-gray-400 w-12">{year}</span>
                          <div className="flex-1 h-8 bg-gray-900/50 rounded-lg overflow-hidden relative">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500/60 to-teal-500/60 rounded-lg transition-all"
                              style={{ width: `${((gpa || 0) / 4.0) * 100}%` }}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                              {gpa ? gpa.toFixed(2) : 'P/F'} ({count} courses)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grade Distribution */}
                {courses.length > 0 && (
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4">Grade Distribution</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-400">{honorsCount}</div>
                        <div className="text-xs text-gray-500">Honors/A&apos;s</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-400">{courses.filter(c => ['High Pass', 'B+', 'B', 'B-'].includes(c.grade)).length}</div>
                        <div className="text-xs text-gray-500">High Pass/B&apos;s</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-yellow-400">{courses.filter(c => ['Pass', 'C+', 'C', 'C-'].includes(c.grade)).length}</div>
                        <div className="text-xs text-gray-500">Pass/C&apos;s</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-emerald-400">{passRate}%</div>
                        <div className="text-xs text-gray-500">Pass Rate</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Board Exam Summary */}
                {exams.length > 0 && (
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4">Board Exam Summary</h3>
                    <div className="space-y-2">
                      {exams.map(exam => (
                        <div key={exam.id} className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
                          <span className="text-sm text-gray-300">{exam.exam}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-emerald-400">{exam.score}</span>
                            {exam.percentile && <span className="text-xs text-gray-500">{exam.percentile}th %ile</span>}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${exam.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{exam.passed ? 'Pass' : 'Fail'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total Credits */}
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-2">Summary</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-white">{courses.reduce((s, c) => s + c.credits, 0)}</div>
                      <div className="text-xs text-gray-500">Total Credits</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{courses.length}</div>
                      <div className="text-xs text-gray-500">Courses</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{exams.filter(e => e.passed).length}/{exams.length}</div>
                      <div className="text-xs text-gray-500">Exams Passed</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEO Content */}
        <div className="mt-16 mb-12 border-t border-gray-800 pt-8">
          <h2 className="text-xl font-bold text-gray-300 mb-4">Medical School Grade Tracker</h2>
          <div className="prose prose-invert prose-sm max-w-none text-gray-500 space-y-3">
            <p>Tracking your academic performance throughout medical school is essential for residency applications and personal development. Our Grade Tracker supports the unique grading systems used in medical education — from traditional letter grades in preclinical years to Honors/High Pass/Pass/Fail in clinical clerkships.</p>
            <p>Monitor your GPA trends across MS1 through MS4, log USMLE Step 1, Step 2 CK, and COMLEX scores alongside NBME shelf exam results, and visualize your academic trajectory with built-in analytics. Whether you are a first-year student building study habits or a fourth-year preparing your ERAS application, having a clear picture of your academic record helps you make informed decisions about your career path.</p>
            <p>Medical schools use diverse grading systems — some are entirely Pass/Fail, others use traditional letter grades, and many use tiered systems for clinical rotations. This tool handles all three systems and calculates your GPA accordingly, giving you accurate performance metrics regardless of your school&apos;s grading policy.</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-6xl mx-auto px-4 pb-8">
          <p className="text-xs text-gray-600 text-center">This tool is for personal academic tracking only. Verify all grades with your official medical school transcript. Not affiliated with NBME, USMLE, or COMLEX.</p>
        </div>
      </div>
    </div>
  )
}
