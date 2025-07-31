'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'

interface TimelineItem {
  id: string
  title: string
  description: string
  deadline: string
  category: 'mcat' | 'application' | 'interviews' | 'preparation'
  status: 'upcoming' | 'current' | 'completed' | 'missed'
  priority: 'high' | 'medium' | 'low'
  daysUntil?: number
}

const defaultTimeline: Omit<TimelineItem, 'id' | 'status' | 'daysUntil'>[] = [
  // Spring Year Before Application
  {
    title: 'Begin MCAT Preparation',
    description: 'Start serious MCAT study schedule 3-6 months before test date',
    deadline: '2024-03-01',
    category: 'mcat',
    priority: 'high'
  },
  {
    title: 'Research Medical Schools',
    description: 'Create list of target schools, research requirements and deadlines',
    deadline: '2024-04-01',
    category: 'preparation',
    priority: 'high'
  },
  {
    title: 'Request Letters of Recommendation',
    description: 'Ask professors, physicians, and supervisors for recommendation letters',
    deadline: '2024-04-15',
    category: 'application',
    priority: 'high'
  },
  
  // Summer Year Before Application
  {
    title: 'Take MCAT',
    description: 'Complete MCAT exam (multiple dates available)',
    deadline: '2024-06-15',
    category: 'mcat',
    priority: 'high'
  },
  {
    title: 'AMCAS Opens',
    description: 'AMCAS application opens for the following year\'s cycle',
    deadline: '2024-05-01',
    category: 'application',
    priority: 'medium'
  },
  {
    title: 'Complete Personal Statement',
    description: 'Draft, revise, and finalize your personal statement',
    deadline: '2024-05-31',
    category: 'application',
    priority: 'high'
  },
  {
    title: 'AMCAS Submission Deadline',
    description: 'Submit primary application to AMCAS',
    deadline: '2024-06-01',
    category: 'application',
    priority: 'high'
  },
  
  // Application Year
  {
    title: 'MCAT Scores Released',
    description: 'Review MCAT scores, decide if retake is necessary',
    deadline: '2024-07-15',
    category: 'mcat',
    priority: 'high'
  },
  {
    title: 'Submit Secondary Applications',
    description: 'Complete secondary applications as they arrive',
    deadline: '2024-08-31',
    category: 'application',
    priority: 'high'
  },
  {
    title: 'CASPer Test',
    description: 'Complete CASPer test for schools that require it',
    deadline: '2024-09-15',
    category: 'application',
    priority: 'medium'
  },
  {
    title: 'Interview Season Begins',
    description: 'Medical school interviews typically start',
    deadline: '2024-10-01',
    category: 'interviews',
    priority: 'high'
  },
  {
    title: 'Update Letters & Activities',
    description: 'Send updates to schools about new activities and achievements',
    deadline: '2024-12-01',
    category: 'application',
    priority: 'medium'
  },
  
  // Decision Year
  {
    title: 'Interview Season Ends',
    description: 'Most medical school interviews conclude',
    deadline: '2025-02-28',
    category: 'interviews',
    priority: 'medium'
  },
  {
    title: 'First Acceptance Day',
    description: 'Schools begin sending acceptance offers',
    deadline: '2025-03-15',
    category: 'interviews',
    priority: 'low'
  },
  {
    title: 'Deposit Deadline',
    description: 'Submit deposit to hold your seat at chosen school',
    deadline: '2025-05-01',
    category: 'application',
    priority: 'high'
  },
  {
    title: 'Medical School Starts',
    description: 'Begin medical school!',
    deadline: '2025-08-15',
    category: 'preparation',
    priority: 'low'
  }
]

export default function ApplicationTimelinePage() {
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [applicationYear, setApplicationYear] = useState(2025)

  useEffect(() => {
    // Initialize timeline with current status
    const now = new Date()
    const initializedTimeline = defaultTimeline.map(item => {
      const deadline = new Date(item.deadline)
      const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      let status: TimelineItem['status']
      if (daysUntil < -30) status = 'missed'
      else if (daysUntil < 0) status = 'completed'
      else if (daysUntil <= 30) status = 'current'
      else status = 'upcoming'

      return {
        ...item,
        id: Date.now().toString() + Math.random(),
        status,
        daysUntil
      }
    })

    setTimeline(initializedTimeline)
  }, [])

  const toggleTaskStatus = (taskId: string) => {
    setTimeline(timeline.map(item => {
      if (item.id === taskId) {
        const newStatus = item.status === 'completed' ? 
          (item.daysUntil && item.daysUntil <= 30 ? 'current' : 'upcoming') : 
          'completed'
        return { ...item, status: newStatus }
      }
      return item
    }))
  }

  const filteredTimeline = timeline.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  )

  const getStatusColor = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200'
      case 'current': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'upcoming': return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'missed': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCategoryIcon = (category: TimelineItem['category']) => {
    switch (category) {
      case 'mcat': return '📝'
      case 'application': return '📋'
      case 'interviews': return '🎤'
      case 'preparation': return '📚'
      default: return '📅'
    }
  }

  const getPriorityColor = (priority: TimelineItem['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const stats = {
    total: timeline.length,
    completed: timeline.filter(item => item.status === 'completed').length,
    current: timeline.filter(item => item.status === 'current').length,
    upcoming: timeline.filter(item => item.status === 'upcoming').length,
    missed: timeline.filter(item => item.status === 'missed').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            📅 Medical School Application Timeline
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay on track with your medical school application process. This timeline covers everything 
            from MCAT prep to starting medical school.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-green-700">Completed</div>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.current}</div>
            <div className="text-sm text-blue-700">Current</div>
          </div>
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.upcoming}</div>
            <div className="text-sm text-gray-700">Upcoming</div>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.missed}</div>
            <div className="text-sm text-red-700">Missed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-brand-red text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setSelectedCategory('mcat')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'mcat' 
                  ? 'bg-brand-red text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📝 MCAT
            </button>
            <button
              onClick={() => setSelectedCategory('application')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'application' 
                  ? 'bg-brand-red text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 Applications
            </button>
            <button
              onClick={() => setSelectedCategory('interviews')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'interviews' 
                  ? 'bg-brand-red text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎤 Interviews
            </button>
            <button
              onClick={() => setSelectedCategory('preparation')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'preparation' 
                  ? 'bg-brand-red text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📚 Preparation
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {filteredTimeline.map((item, index) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg border-2 p-6 transition-all hover:shadow-md ${getStatusColor(item.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    <span className={`text-sm font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{item.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>📅 {new Date(item.deadline).toLocaleDateString()}</span>
                    {item.daysUntil !== undefined && (
                      <span>
                        {item.daysUntil > 0 
                          ? `⏰ ${item.daysUntil} days away`
                          : item.daysUntil === 0 
                          ? '🔥 Due today'
                          : `⏰ ${Math.abs(item.daysUntil)} days ago`
                        }
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right text-sm">
                    <div className={`font-medium ${
                      item.status === 'completed' ? 'text-green-600' :
                      item.status === 'current' ? 'text-blue-600' :
                      item.status === 'missed' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleTaskStatus(item.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      item.status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {item.status === 'completed' && <span className="text-xs">✓</span>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Information Panel */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Application Timeline Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Key Dates to Remember</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• AMCAS opens in May for next year's cycle</li>
                <li>• June 1st is the earliest you can submit</li>
                <li>• Secondary applications arrive July-August</li>
                <li>• Interview season: October-February</li>
                <li>• First acceptances: March 15th</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Success Strategies</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Submit applications as early as possible</li>
                <li>• Complete secondaries within 2 weeks</li>
                <li>• Request letters of rec 3-4 months early</li>
                <li>• Research schools thoroughly before applying</li>
                <li>• Keep a detailed tracking spreadsheet</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}