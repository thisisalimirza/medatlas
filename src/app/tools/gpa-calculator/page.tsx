'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'

interface Course {
  id: string
  name: string
  grade: string
  credits: number
  type: 'science' | 'non-science'
}

const gradePoints: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0
}

export default function GpaCalculatorPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [newCourse, setNewCourse] = useState({
    name: '',
    grade: '',
    credits: 3,
    type: 'science' as 'science' | 'non-science'
  })

  const [results, setResults] = useState({
    overallGPA: 0,
    scienceGPA: 0,
    nonScienceGPA: 0,
    totalCredits: 0,
    scienceCredits: 0,
    nonScienceCredits: 0
  })

  useEffect(() => {
    calculateGPA()
  }, [courses])

  const calculateGPA = () => {
    if (courses.length === 0) {
      setResults({
        overallGPA: 0,
        scienceGPA: 0,
        nonScienceGPA: 0,
        totalCredits: 0,
        scienceCredits: 0,
        nonScienceCredits: 0
      })
      return
    }

    let totalPoints = 0
    let totalCredits = 0
    let sciencePoints = 0
    let scienceCredits = 0
    let nonSciencePoints = 0
    let nonScienceCredits = 0

    courses.forEach(course => {
      const points = gradePoints[course.grade] * course.credits
      totalPoints += points
      totalCredits += course.credits

      if (course.type === 'science') {
        sciencePoints += points
        scienceCredits += course.credits
      } else {
        nonSciencePoints += points
        nonScienceCredits += course.credits
      }
    })

    setResults({
      overallGPA: totalCredits > 0 ? totalPoints / totalCredits : 0,
      scienceGPA: scienceCredits > 0 ? sciencePoints / scienceCredits : 0,
      nonScienceGPA: nonScienceCredits > 0 ? nonSciencePoints / nonScienceCredits : 0,
      totalCredits,
      scienceCredits,
      nonScienceCredits
    })
  }

  const addCourse = () => {
    if (newCourse.name && newCourse.grade) {
      const course: Course = {
        id: Date.now().toString(),
        ...newCourse
      }
      setCourses([...courses, course])
      setNewCourse({
        name: '',
        grade: '',
        credits: 3,
        type: 'science'
      })
    }
  }

  const removeCourse = (courseId: string) => {
    setCourses(courses.filter(course => course.id !== courseId))
  }

  const clearAll = () => {
    setCourses([])
  }

  const getGpaColor = (gpa: number) => {
    if (gpa >= 3.7) return 'text-green-600'
    if (gpa >= 3.3) return 'text-blue-600'
    if (gpa >= 3.0) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGpaDescription = (gpa: number) => {
    if (gpa >= 3.8) return { level: 'Excellent', desc: 'Highly competitive for top-tier schools' }
    if (gpa >= 3.6) return { level: 'Very Good', desc: 'Competitive for most medical schools' }
    if (gpa >= 3.4) return { level: 'Good', desc: 'Meets most medical school requirements' }
    if (gpa >= 3.0) return { level: 'Fair', desc: 'Consider strengthening other areas' }
    return { level: 'Needs Improvement', desc: 'Consider post-bacc or SMP programs' }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            📈 Medical School GPA Calculator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calculate your overall GPA, science GPA (BCPM), and non-science GPA for medical school applications. 
            Track your progress and see how competitive your GPA is.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Course Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Course</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    placeholder="e.g., Organic Chemistry I"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade
                  </label>
                  <select
                    value={newCourse.grade}
                    onChange={(e) => setNewCourse({...newCourse, grade: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  >
                    <option value="">Select Grade</option>
                    {Object.keys(gradePoints).map(grade => (
                      <option key={grade} value={grade}>
                        {grade} ({gradePoints[grade].toFixed(1)})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({...newCourse, credits: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="science"
                      checked={newCourse.type === 'science'}
                      onChange={(e) => setNewCourse({...newCourse, type: e.target.value as 'science' | 'non-science'})}
                      className="mr-2"
                    />
                    <span className="text-sm">Science (BCPM)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="non-science"
                      checked={newCourse.type === 'non-science'}
                      onChange={(e) => setNewCourse({...newCourse, type: e.target.value as 'science' | 'non-science'})}
                      className="mr-2"
                    />
                    <span className="text-sm">Non-Science</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  BCPM = Biology, Chemistry, Physics, Mathematics
                </p>
              </div>

              <div className="mt-6">
                <button
                  onClick={addCourse}
                  disabled={!newCourse.name || !newCourse.grade}
                  className="btn-red disabled:opacity-50 disabled:cursor-not-allowed mr-3"
                >
                  Add Course
                </button>
                {courses.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="btn-outline"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Course List */}
            {courses.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Courses</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2">Course</th>
                        <th className="text-center py-2">Grade</th>
                        <th className="text-center py-2">Credits</th>
                        <th className="text-center py-2">Type</th>
                        <th className="text-center py-2">Points</th>
                        <th className="text-center py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.id} className="border-b border-gray-100">
                          <td className="py-2 pr-4">{course.name}</td>
                          <td className="text-center py-2">{course.grade}</td>
                          <td className="text-center py-2">{course.credits}</td>
                          <td className="text-center py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              course.type === 'science' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {course.type === 'science' ? 'BCPM' : 'Non-Sci'}
                            </span>
                          </td>
                          <td className="text-center py-2">
                            {(gradePoints[course.grade] * course.credits).toFixed(1)}
                          </td>
                          <td className="text-center py-2">
                            <button
                              onClick={() => removeCourse(course.id)}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">GPA Results</h2>
              
              {courses.length > 0 ? (
                <div className="space-y-6">
                  {/* Overall GPA */}
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${getGpaColor(results.overallGPA)}`}>
                      {results.overallGPA.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Overall GPA</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {results.totalCredits} total credits
                    </div>
                  </div>

                  {/* Science GPA */}
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className={`text-2xl font-bold mb-1 ${getGpaColor(results.scienceGPA)}`}>
                      {results.scienceGPA > 0 ? results.scienceGPA.toFixed(2) : 'N/A'}
                    </div>
                    <div className="text-sm text-blue-700">Science GPA (BCPM)</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {results.scienceCredits} science credits
                    </div>
                  </div>

                  {/* Non-Science GPA */}
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className={`text-2xl font-bold mb-1 ${getGpaColor(results.nonScienceGPA)}`}>
                      {results.nonScienceGPA > 0 ? results.nonScienceGPA.toFixed(2) : 'N/A'}
                    </div>
                    <div className="text-sm text-green-700">Non-Science GPA</div>
                    <div className="text-xs text-green-600 mt-1">
                      {results.nonScienceCredits} non-science credits
                    </div>
                  </div>

                  {/* Competitiveness */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Competitiveness</div>
                    <div className={`font-medium ${getGpaColor(results.overallGPA)}`}>
                      {getGpaDescription(results.overallGPA).level}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {getGpaDescription(results.overallGPA).desc}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📚</div>
                  <p className="text-gray-600">
                    Add courses to calculate your GPA
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* GPA Guide */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 Medical School GPA Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">GPA Ranges</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• <strong>3.8+:</strong> Excellent - Top-tier schools</li>
                <li>• <strong>3.6-3.79:</strong> Very competitive</li>
                <li>• <strong>3.4-3.59:</strong> Competitive</li>
                <li>• <strong>3.0-3.39:</strong> Consider strengthening</li>
                <li>• <strong>&lt;3.0:</strong> Post-bacc programs recommended</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Science vs Non-Science</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Both GPAs are important for med school</li>
                <li>• Science GPA shows ability in core subjects</li>
                <li>• Aim for balanced performance in both</li>
                <li>• Strong upward trend can overcome low start</li>
                <li>• Consider grade replacement policies</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}