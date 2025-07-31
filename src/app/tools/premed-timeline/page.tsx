'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'

interface TimelineItem {
  id: string
  title: string
  description: string
  category: 'academics' | 'mcat' | 'extracurriculars' | 'application' | 'experience'
  priority: 'high' | 'medium' | 'low'
  season: 'fall' | 'spring' | 'summer'
  yearOffset: number // Years from current year
  completed?: boolean
}

interface AcademicYear {
  year: number
  label: string
  fall: TimelineItem[]
  spring: TimelineItem[]
  summer: TimelineItem[]
}

const baseTimeline: Omit<TimelineItem, 'id' | 'completed'>[] = [
  // Freshman Year (Year 1)
  {
    title: "Take General Biology I",
    description: "Complete first semester of general biology with lab. Focus on building strong study habits.",
    category: "academics",
    priority: "high",
    season: "fall",
    yearOffset: 0
  },
  {
    title: "Take General Chemistry I", 
    description: "Start chemistry sequence. This is foundational for organic chemistry and the MCAT.",
    category: "academics",
    priority: "high", 
    season: "fall",
    yearOffset: 0
  },
  {
    title: "Explore Healthcare Volunteering",
    description: "Begin volunteering at local hospitals, clinics, or community health organizations.",
    category: "extracurriculars",
    priority: "high",
    season: "fall",
    yearOffset: 0
  },
  {
    title: "Take General Biology II",
    description: "Continue biology sequence. Many schools require a full year of biology.",
    category: "academics",
    priority: "high",
    season: "spring",
    yearOffset: 0
  },
  {
    title: "Take General Chemistry II",
    description: "Complete general chemistry sequence before moving to organic chemistry.",
    category: "academics",
    priority: "high",
    season: "spring",
    yearOffset: 0
  },
  {
    title: "Shadow Healthcare Professionals",
    description: "Start shadowing physicians to understand different medical specialties.",
    category: "experience",
    priority: "high",
    season: "spring",
    yearOffset: 0
  },
  {
    title: "Summer Research or Healthcare Experience",
    description: "Apply for summer research programs or work in healthcare settings.",
    category: "experience",
    priority: "medium",
    season: "summer",
    yearOffset: 0
  },

  // Sophomore Year (Year 2)
  {
    title: "Take Organic Chemistry I",
    description: "Begin organic chemistry sequence. Critical for MCAT success.",
    category: "academics",
    priority: "high",
    season: "fall",
    yearOffset: 1
  },
  {
    title: "Take Physics I",
    description: "Start physics sequence. Choose algebra-based or calculus-based based on school requirements.",
    category: "academics",
    priority: "high",
    season: "fall",
    yearOffset: 1
  },
  {
    title: "Continue Clinical Volunteering",
    description: "Maintain consistent healthcare volunteering. Aim for 2-4 hours per week.",
    category: "extracurriculars",
    priority: "high",
    season: "fall",
    yearOffset: 1
  },
  {
    title: "Take Organic Chemistry II",
    description: "Complete organic chemistry sequence. Essential for biochemistry and MCAT.",
    category: "academics",
    priority: "high",
    season: "spring",
    yearOffset: 1
  },
  {
    title: "Take Physics II",
    description: "Complete physics requirement. Cover electricity, magnetism, and modern physics.",
    category: "academics",
    priority: "high",
    season: "spring",
    yearOffset: 1
  },
  {
    title: "Join Pre-med Organizations",
    description: "Get involved in pre-health clubs, honor societies, or student government.",
    category: "extracurriculars",
    priority: "medium",
    season: "spring",
    yearOffset: 1
  },
  {
    title: "Summer Research Program",
    description: "Apply for competitive summer research programs (REUs, NIH programs).",
    category: "experience",
    priority: "high",
    season: "summer",
    yearOffset: 1
  },

  // Junior Year (Year 3)
  {
    title: "Take Biochemistry",
    description: "Complete biochemistry requirement. Heavily tested on the MCAT.",
    category: "academics",
    priority: "high",
    season: "fall",
    yearOffset: 2
  },
  {
    title: "Take Upper-Level Biology Courses",
    description: "Take molecular biology, genetics, anatomy, or physiology.",
    category: "academics",
    priority: "medium",
    season: "fall",
    yearOffset: 2
  },
  {
    title: "Begin MCAT Preparation",
    description: "Start light MCAT prep with content review. Take a diagnostic exam.",
    category: "mcat",
    priority: "high",
    season: "fall",
    yearOffset: 2
  },
  {
    title: "Seek Leadership Opportunities",
    description: "Take on leadership roles in research, volunteering, or student organizations.",
    category: "extracurriculars",
    priority: "medium",
    season: "fall",
    yearOffset: 2
  },
  {
    title: "Complete Statistics Requirement",
    description: "Take statistics or biostatistics. Many schools now require this.",
    category: "academics",
    priority: "high",
    season: "spring",
    yearOffset: 2
  },
  {
    title: "Intensive MCAT Preparation",
    description: "Dedicate 15-20 hours/week to MCAT study. Take practice exams regularly.",
    category: "mcat",
    priority: "high",
    season: "spring",
    yearOffset: 2
  },
  {
    title: "Request Letters of Recommendation",
    description: "Ask professors, research mentors, and physicians for recommendation letters.",
    category: "application",
    priority: "high",
    season: "spring",
    yearOffset: 2
  },
  {
    title: "Take MCAT",
    description: "Take the MCAT in late spring or early summer. Allow time for retake if needed.",
    category: "mcat",
    priority: "high",
    season: "summer",
    yearOffset: 2
  },
  {
    title: "Begin Personal Statement",
    description: "Start drafting your personal statement. Write multiple drafts and get feedback.",
    category: "application",
    priority: "high",
    season: "summer",
    yearOffset: 2
  },

  // Senior Year (Year 4)
  {
    title: "Finalize School List",
    description: "Research and finalize your list of medical schools to apply to.",
    category: "application",
    priority: "high",
    season: "fall",
    yearOffset: 3
  },
  {
    title: "Submit Primary Application",
    description: "Submit AMCAS application as early as possible (early June).",
    category: "application",
    priority: "high",
    season: "fall",
    yearOffset: 3
  },
  {
    title: "Complete Secondary Applications",
    description: "Submit secondary applications within 2 weeks of receiving them.",
    category: "application",
    priority: "high",
    season: "fall",
    yearOffset: 3
  },
  {
    title: "Interview Preparation",
    description: "Practice interviews, research schools, and prepare thoughtful questions.",
    category: "application",
    priority: "high",
    season: "fall",
    yearOffset: 3
  },
  {
    title: "Attend Medical School Interviews",
    description: "Interview at medical schools. Follow up with thank-you notes.",
    category: "application",
    priority: "high",
    season: "spring",
    yearOffset: 3
  },
  {
    title: "Submit Updates",
    description: "Send updates to schools about new activities, grades, or achievements.",
    category: "application",
    priority: "medium",
    season: "spring",
    yearOffset: 3
  },
  {
    title: "Make Final School Decision",
    description: "Choose your medical school and submit enrollment deposit.",
    category: "application",
    priority: "high",
    season: "spring",
    yearOffset: 3
  }
]

const currentYearOptions = [
  { value: 'freshman', label: 'Freshman (1st Year)', yearOffset: 0 },
  { value: 'sophomore', label: 'Sophomore (2nd Year)', yearOffset: 1 },
  { value: 'junior', label: 'Junior (3rd Year)', yearOffset: 2 },
  { value: 'senior', label: 'Senior (4th Year)', yearOffset: 3 },
  { value: 'gap1', label: 'Gap Year 1', yearOffset: 4 },
  { value: 'gap2', label: 'Gap Year 2', yearOffset: 5 }
]

export default function PremedTimelinePage() {
  const [currentYear, setCurrentYear] = useState('freshman')
  const [medSchoolYear, setMedSchoolYear] = useState(new Date().getFullYear() + 4)
  const [timeline, setTimeline] = useState<AcademicYear[]>([])
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    generateTimeline()
  }, [currentYear, medSchoolYear])

  const generateTimeline = () => {
    const currentYearInfo = currentYearOptions.find(y => y.value === currentYear)!
    const startYear = new Date().getFullYear()
    const yearsToGenerate = medSchoolYear - startYear

    const academicYears: AcademicYear[] = []

    for (let i = 0; i < yearsToGenerate; i++) {
      const year = startYear + i
      const yearLabel = getYearLabel(i, currentYearInfo.yearOffset)
      
      const fallItems = baseTimeline
        .filter(item => item.season === 'fall' && item.yearOffset === i)
        .map(item => ({ ...item, id: `${year}-fall-${item.title}`, completed: false }))
        
      const springItems = baseTimeline
        .filter(item => item.season === 'spring' && item.yearOffset === i)
        .map(item => ({ ...item, id: `${year}-spring-${item.title}`, completed: false }))
        
      const summerItems = baseTimeline
        .filter(item => item.season === 'summer' && item.yearOffset === i)
        .map(item => ({ ...item, id: `${year}-summer-${item.title}`, completed: false }))

      academicYears.push({
        year,
        label: yearLabel,
        fall: fallItems,
        spring: springItems,
        summer: summerItems
      })
    }

    setTimeline(academicYears)
  }

  const getYearLabel = (yearIndex: number, currentYearOffset: number) => {
    const adjustedIndex = yearIndex + currentYearOffset
    const labels = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Gap Year 1', 'Gap Year 2', 'Gap Year 3']
    return labels[adjustedIndex] || `Year ${adjustedIndex + 1}`
  }

  const toggleItemCompletion = (itemId: string) => {
    const newCompleted = new Set(completedItems)
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId)
    } else {
      newCompleted.add(itemId)
    }
    setCompletedItems(newCompleted)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academics': return 'bg-blue-100 text-blue-800'
      case 'mcat': return 'bg-purple-100 text-purple-800'
      case 'extracurriculars': return 'bg-green-100 text-green-800'
      case 'application': return 'bg-red-100 text-red-800'
      case 'experience': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  const exportToPDF = () => {
    window.print()
  }

  const exportToNotion = () => {
    const notionFormat = timeline.map(year => {
      const items = [...year.fall, ...year.spring, ...year.summer]
      return `## ${year.label} (${year.year})\n\n${items.map(item => 
        `- [ ] **${item.title}** (${item.season}) - ${item.description}`
      ).join('\n')}`
    }).join('\n\n')

    navigator.clipboard.writeText(notionFormat)
    alert('Timeline copied to clipboard! Paste it into your Notion page.')
  }

  const getProgressStats = () => {
    const totalItems = timeline.reduce((sum, year) => 
      sum + year.fall.length + year.spring.length + year.summer.length, 0)
    const completedCount = completedItems.size
    return { total: totalItems, completed: completedCount, percentage: totalItems > 0 ? (completedCount / totalItems) * 100 : 0 }
  }

  const stats = getProgressStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            📅 Premed Timeline Generator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create a personalized timeline for your medical school journey. Get a semester-by-semester 
            plan based on your current year and target medical school entry date.
          </p>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Timeline Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Academic Year
              </label>
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
              >
                {currentYearOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Medical School Entry Year
              </label>
              <select
                value={medSchoolYear}
                onChange={(e) => setMedSchoolYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
              >
                {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + i).map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={exportToPDF}
                className="flex-1 btn-outline text-sm"
              >
                📄 Export PDF
              </button>
              <button
                onClick={exportToNotion}
                className="flex-1 btn-red text-sm"
              >
                📋 Copy to Notion
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">{stats.completed}/{stats.total} completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-brand-red h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(stats.percentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {timeline.map((year) => (
            <div key={year.year} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {year.label} ({year.year}-{year.year + 1})
                </h3>
                <div className="text-sm text-gray-500">
                  {[...year.fall, ...year.spring, ...year.summer].filter(item => completedItems.has(item.id)).length}/
                  {year.fall.length + year.spring.length + year.summer.length} completed
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Fall Semester */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">🍂 Fall Semester</h4>
                  <div className="space-y-3">
                    {year.fall.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={completedItems.has(item.id)}
                            onChange={() => toggleItemCompletion(item.id)}
                            className="mt-1 w-4 h-4 text-brand-red border-gray-300 rounded focus:ring-brand-red"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm">{getPriorityIcon(item.priority)}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                                {item.category}
                              </span>
                            </div>
                            <h5 className={`font-medium mb-1 ${completedItems.has(item.id) ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {item.title}
                            </h5>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {year.fall.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No specific tasks for this semester</p>
                    )}
                  </div>
                </div>

                {/* Spring Semester */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">🌸 Spring Semester</h4>
                  <div className="space-y-3">
                    {year.spring.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={completedItems.has(item.id)}
                            onChange={() => toggleItemCompletion(item.id)}
                            className="mt-1 w-4 h-4 text-brand-red border-gray-300 rounded focus:ring-brand-red"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm">{getPriorityIcon(item.priority)}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                                {item.category}
                              </span>
                            </div>
                            <h5 className={`font-medium mb-1 ${completedItems.has(item.id) ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {item.title}
                            </h5>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {year.spring.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No specific tasks for this semester</p>
                    )}
                  </div>
                </div>

                {/* Summer */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">☀️ Summer</h4>
                  <div className="space-y-3">
                    {year.summer.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={completedItems.has(item.id)}
                            onChange={() => toggleItemCompletion(item.id)}
                            className="mt-1 w-4 h-4 text-brand-red border-gray-300 rounded focus:ring-brand-red"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm">{getPriorityIcon(item.priority)}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                                {item.category}
                              </span>
                            </div>
                            <h5 className={`font-medium mb-1 ${completedItems.has(item.id) ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {item.title}
                            </h5>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {year.summer.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No specific tasks for this summer</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Timeline Success Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Getting Started</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Start early - don't wait until junior year</li>
                <li>• Focus on prerequisites first</li>
                <li>• Build relationships with professors</li>
                <li>• Get involved in meaningful activities</li>
                <li>• Track your progress regularly</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Staying on Track</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Set reminders for deadlines</li>
                <li>• Join pre-med advising groups</li>
                <li>• Find study partners and mentors</li>
                <li>• Be flexible - timelines can change</li>
                <li>• Celebrate your progress!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}