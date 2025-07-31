'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'

interface Prerequisite {
  id: string
  category: string
  name: string
  credits: number
  required: boolean
  completed: boolean
  grade?: string
  notes?: string
}

interface PrereqCategory {
  name: string
  credits: number
  completed: number
  requirements: Prerequisite[]
}

const defaultPrerequisites: Prerequisite[] = [
  // Biology
  { id: 'gen-bio-1', category: 'Biology', name: 'General Biology I', credits: 4, required: true, completed: false },
  { id: 'gen-bio-2', category: 'Biology', name: 'General Biology II', credits: 4, required: true, completed: false },
  { id: 'molecular-bio', category: 'Biology', name: 'Molecular Biology', credits: 3, required: false, completed: false },
  { id: 'genetics', category: 'Biology', name: 'Genetics', credits: 3, required: false, completed: false },
  { id: 'anatomy', category: 'Biology', name: 'Human Anatomy', credits: 4, required: false, completed: false },
  { id: 'physiology', category: 'Biology', name: 'Human Physiology', credits: 4, required: false, completed: false },
  
  // Chemistry
  { id: 'gen-chem-1', category: 'Chemistry', name: 'General Chemistry I', credits: 4, required: true, completed: false },
  { id: 'gen-chem-2', category: 'Chemistry', name: 'General Chemistry II', credits: 4, required: true, completed: false },
  { id: 'organic-1', category: 'Chemistry', name: 'Organic Chemistry I', credits: 4, required: true, completed: false },
  { id: 'organic-2', category: 'Chemistry', name: 'Organic Chemistry II', credits: 4, required: true, completed: false },
  { id: 'biochemistry', category: 'Chemistry', name: 'Biochemistry', credits: 3, required: true, completed: false },
  
  // Physics
  { id: 'physics-1', category: 'Physics', name: 'Physics I (Mechanics)', credits: 4, required: true, completed: false },
  { id: 'physics-2', category: 'Physics', name: 'Physics II (E&M)', credits: 4, required: true, completed: false },
  
  // Mathematics
  { id: 'calculus-1', category: 'Mathematics', name: 'Calculus I', credits: 4, required: true, completed: false },
  { id: 'statistics', category: 'Mathematics', name: 'Statistics', credits: 3, required: true, completed: false },
  
  // English
  { id: 'english-1', category: 'English', name: 'English Composition I', credits: 3, required: true, completed: false },
  { id: 'english-2', category: 'English', name: 'English Composition II', credits: 3, required: true, completed: false },
  
  // Social Sciences
  { id: 'psychology', category: 'Social Sciences', name: 'General Psychology', credits: 3, required: false, completed: false },
  { id: 'sociology', category: 'Social Sciences', name: 'Sociology', credits: 3, required: false, completed: false },
  { id: 'anthropology', category: 'Social Sciences', name: 'Anthropology', credits: 3, required: false, completed: false }
]

const gradePoints: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0
}

export default function PrerequisitesCheckerPage() {
  const [prerequisites, setPrerequisites] = useState<Prerequisite[]>(defaultPrerequisites)
  const [categories, setCategories] = useState<PrereqCategory[]>([])

  useEffect(() => {
    updateCategories()
  }, [prerequisites])

  const updateCategories = () => {
    const categoryMap = new Map<string, PrereqCategory>()
    
    for (const prereq of prerequisites) {
      if (!categoryMap.has(prereq.category)) {
        categoryMap.set(prereq.category, {
          name: prereq.category,
          credits: 0,
          completed: 0,
          requirements: []
        })
      }
      
      const category = categoryMap.get(prereq.category)!
      category.requirements.push(prereq)
      category.credits += prereq.credits
      if (prereq.completed) {
        category.completed += prereq.credits
      }
    }
    
    setCategories(Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name)))
  }

  const toggleCompletion = (id: string) => {
    setPrerequisites(prerequisites.map(prereq =>
      prereq.id === id ? { ...prereq, completed: !prereq.completed } : prereq
    ))
  }

  const updateGrade = (id: string, grade: string) => {
    setPrerequisites(prerequisites.map(prereq =>
      prereq.id === id ? { ...prereq, grade } : prereq
    ))
  }

  const updateNotes = (id: string, notes: string) => {
    setPrerequisites(prerequisites.map(prereq =>
      prereq.id === id ? { ...prereq, notes } : prereq
    ))
  }

  const getOverallStats = () => {
    const totalRequired = prerequisites.filter(p => p.required).length
    const completedRequired = prerequisites.filter(p => p.required && p.completed).length
    const totalRecommended = prerequisites.filter(p => !p.required).length
    const completedRecommended = prerequisites.filter(p => !p.required && p.completed).length
    const totalCredits = prerequisites.reduce((sum, p) => sum + (p.completed ? p.credits : 0), 0)
    
    const completedWithGrades = prerequisites.filter(p => p.completed && p.grade)
    const gpa = completedWithGrades.length > 0 
      ? completedWithGrades.reduce((sum, p) => sum + (gradePoints[p.grade!] * p.credits), 0) / 
        completedWithGrades.reduce((sum, p) => sum + p.credits, 0)
      : 0

    return {
      totalRequired,
      completedRequired,
      totalRecommended,
      completedRecommended,
      totalCredits,
      gpa,
      completionPercentage: totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0
    }
  }

  const stats = getOverallStats()

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50'
    if (percentage >= 70) return 'text-blue-600 bg-blue-50'
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            ✅ Medical School Prerequisites Checker
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track your progress through medical school prerequisites. Check off completed courses, 
            record grades, and ensure you meet all requirements before applying.
          </p>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Progress</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-red">{stats.completedRequired}/{stats.totalRequired}</div>
              <div className="text-sm text-gray-600">Required Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.completedRecommended}/{stats.totalRecommended}</div>
              <div className="text-sm text-gray-600">Recommended</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalCredits}</div>
              <div className="text-sm text-gray-600">Total Credits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.gpa > 0 ? stats.gpa.toFixed(2) : 'N/A'}</div>
              <div className="text-sm text-gray-600">Science GPA</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-brand-red h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(stats.completionPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600 mt-2 text-center">
            {stats.completionPercentage.toFixed(0)}% of required prerequisites completed
          </div>
        </div>

        {/* Prerequisites by Category */}
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.name} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    getCompletionColor((category.completed / category.credits) * 100)
                  }`}>
                    {category.completed}/{category.credits} credits
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {category.requirements.map((prereq) => (
                  <div key={prereq.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={prereq.completed}
                          onChange={() => toggleCompletion(prereq.id)}
                          className="w-5 h-5 text-brand-red border-gray-300 rounded focus:ring-brand-red"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <h4 className={`font-medium ${prereq.completed ? 'text-green-700' : 'text-gray-900'}`}>
                              {prereq.name}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {prereq.credits} credits
                            </span>
                            {prereq.required && (
                              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                                Required
                              </span>
                            )}
                          </div>
                        </div>

                        {prereq.completed && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Grade
                              </label>
                              <select
                                value={prereq.grade || ''}
                                onChange={(e) => updateGrade(prereq.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-red focus:border-transparent text-sm"
                              >
                                <option value="">Select grade</option>
                                {Object.keys(gradePoints).map(grade => (
                                  <option key={grade} value={grade}>
                                    {grade} ({gradePoints[grade].toFixed(1)})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                              </label>
                              <input
                                type="text"
                                value={prereq.notes || ''}
                                onChange={(e) => updateNotes(prereq.id, e.target.value)}
                                placeholder="Semester, professor, etc."
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-red focus:border-transparent text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Readiness Assessment */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 Application Readiness</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Strong Application</h4>
              <ul className="space-y-1 text-blue-700">
                <li className={stats.completedRequired === stats.totalRequired ? '✅' : '❌'}>
                  All required prerequisites completed
                </li>
                <li className={stats.gpa >= 3.5 ? '✅' : '❌'}>
                  Science GPA ≥ 3.5
                </li>
                <li className={stats.completedRecommended >= 2 ? '✅' : '❌'}>
                  At least 2 recommended courses
                </li>
                <li className={stats.totalCredits >= 90 ? '✅' : '❌'}>
                  Minimum 90 credit hours
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Next Steps</h4>
              <ul className="space-y-1 text-blue-700">
                {stats.completedRequired < stats.totalRequired && (
                  <li>• Complete remaining {stats.totalRequired - stats.completedRequired} required courses</li>
                )}
                {stats.gpa < 3.5 && stats.gpa > 0 && (
                  <li>• Consider retaking courses to improve GPA</li>
                )}
                {stats.completedRecommended < 2 && (
                  <li>• Add recommended courses for stronger application</li>
                )}
                <li>• Plan MCAT preparation timeline</li>
                <li>• Begin clinical experience and research</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}