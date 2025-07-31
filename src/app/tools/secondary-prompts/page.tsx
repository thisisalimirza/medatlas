'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'

interface SecondaryPrompt {
  id: string
  school: string
  prompt: string
  wordLimit?: number
  characterLimit?: number
  theme: 'why-us' | 'diversity' | 'challenge' | 'leadership' | 'research' | 'service' | 'personal' | 'academic'
  year: number
  required: boolean
}

interface SchoolPrompts {
  school: string
  location: string
  prompts: SecondaryPrompt[]
  totalPrompts: number
  averageWords: number
}

// Sample database of secondary prompts - in a real app this would be much larger
const secondaryPromptsDatabase: SecondaryPrompt[] = [
  // Harvard Medical School
  {
    id: 'harvard-1',
    school: 'Harvard Medical School',
    prompt: 'Why are you applying to Harvard Medical School? What aspects of our curriculum, community, and mission appeal to you?',
    wordLimit: 200,
    theme: 'why-us',
    year: 2024,
    required: true
  },
  {
    id: 'harvard-2',
    school: 'Harvard Medical School',
    prompt: 'Describe a time when you faced a significant challenge. How did you respond and what did you learn from the experience?',
    wordLimit: 300,
    theme: 'challenge',
    year: 2024,
    required: true
  },

  // Johns Hopkins
  {
    id: 'jhu-1',
    school: 'Johns Hopkins University School of Medicine',
    prompt: 'Briefly describe your single, most rewarding experience. Feel free to refer to an experience previously described in your AMCAS application.',
    wordLimit: 300,
    theme: 'personal',
    year: 2024,
    required: true
  },
  {
    id: 'jhu-2',
    school: 'Johns Hopkins University School of Medicine',
    prompt: 'Describe your most meaningful research experience and how it has contributed to your preparation for a career in medicine.',
    wordLimit: 300,
    theme: 'research',
    year: 2024,
    required: true
  },

  // UCSF
  {
    id: 'ucsf-1',
    school: 'UCSF School of Medicine',
    prompt: 'What is the most important thing you want the admissions committee to know about you that is not already reflected in your application?',
    wordLimit: 500,
    theme: 'personal',
    year: 2024,
    required: true
  },
  {
    id: 'ucsf-2',
    school: 'UCSF School of Medicine',
    prompt: 'Describe how you have demonstrated leadership in your academic, professional, or personal life.',
    wordLimit: 500,
    theme: 'leadership',
    year: 2024,
    required: true
  },

  // Stanford
  {
    id: 'stanford-1',
    school: 'Stanford University School of Medicine',
    prompt: 'What experiences have shaped your interest in a career in medicine?',
    wordLimit: 250,
    theme: 'personal',
    year: 2024,
    required: true
  },
  {
    id: 'stanford-2',
    school: 'Stanford University School of Medicine',
    prompt: 'How do you envision using your medical degree to contribute to society?',
    wordLimit: 250,
    theme: 'service',
    year: 2024,
    required: true
  },

  // NYU
  {
    id: 'nyu-1',
    school: 'NYU Grossman School of Medicine',
    prompt: 'If you are not a NYC resident, what ties, if any, do you have to the NYC area?',
    wordLimit: 200,
    theme: 'why-us',
    year: 2024,
    required: false
  },
  {
    id: 'nyu-2',
    school: 'NYU Grossman School of Medicine',
    prompt: 'Please describe any circumstances adversely affecting your academic performance during undergraduate or graduate study.',
    wordLimit: 300,
    theme: 'academic',
    year: 2024,
    required: false
  },

  // Washington University
  {
    id: 'washu-1',
    school: 'Washington University School of Medicine',
    prompt: 'How will your background and experiences add to the diversity of the Washington University School of Medicine community?',
    wordLimit: 300,
    theme: 'diversity',
    year: 2024,
    required: true
  },
  {
    id: 'washu-2',
    school: 'Washington University School of Medicine',
    prompt: 'Describe a time when you were part of a team that was struggling. What did you do to help the team?',
    wordLimit: 300,
    theme: 'leadership',
    year: 2024,
    required: true
  },

  // University of Michigan
  {
    id: 'umich-1',
    school: 'University of Michigan Medical School',
    prompt: 'Why are you interested in attending the University of Michigan Medical School?',
    wordLimit: 400,
    theme: 'why-us',
    year: 2024,
    required: true
  },
  {
    id: 'umich-2',
    school: 'University of Michigan Medical School',
    prompt: 'Describe a situation where you had to work with someone who was very different from you. How did you handle it?',
    wordLimit: 400,
    theme: 'diversity',
    year: 2024,
    required: true
  },

  // UCLA
  {
    id: 'ucla-1',
    school: 'UCLA David Geffen School of Medicine',
    prompt: 'What do you see as the most likely practice scenario for your future medical career?',
    characterLimit: 800,
    theme: 'personal',
    year: 2024,
    required: true
  },
  {
    id: 'ucla-2',
    school: 'UCLA David Geffen School of Medicine',
    prompt: 'Describe a time when you observed or personally experienced biased treatment of others. What was your response?',
    characterLimit: 800,
    theme: 'diversity',
    year: 2024,
    required: true
  }
]

const themeLabels = {
  'why-us': 'Why Us?',
  'diversity': 'Diversity & Inclusion',
  'challenge': 'Overcoming Challenges',
  'leadership': 'Leadership',
  'research': 'Research Experience',
  'service': 'Community Service',
  'personal': 'Personal Statement',
  'academic': 'Academic Performance'
}

const themeColors = {
  'why-us': 'bg-blue-100 text-blue-800',
  'diversity': 'bg-green-100 text-green-800',
  'challenge': 'bg-red-100 text-red-800',
  'leadership': 'bg-purple-100 text-purple-800',
  'research': 'bg-yellow-100 text-yellow-800',
  'service': 'bg-orange-100 text-orange-800',
  'personal': 'bg-pink-100 text-pink-800',
  'academic': 'bg-gray-100 text-gray-800'
}

const writingTips = {
  'why-us': [
    'Research specific programs, faculty, and opportunities',
    'Connect your goals to what the school uniquely offers',
    'Avoid generic statements that could apply to any school',
    'Mention specific courses, research labs, or clinical sites'
  ],
  'diversity': [
    'Be authentic about your unique background or perspective',
    'Connect your experiences to how you\'ll contribute to medicine',
    'Avoid simply listing demographics',
    'Show how diversity has shaped your worldview'
  ],
  'challenge': [
    'Choose a meaningful challenge, not a minor setback',
    'Focus on your response and growth, not just the problem',
    'Show resilience and problem-solving skills',
    'Connect the lesson to your medical career goals'
  ],
  'leadership': [
    'Leadership can be formal or informal',
    'Focus on impact and what you accomplished',
    'Show emotional intelligence and teamwork',
    'Demonstrate how you motivated or helped others'
  ],
  'research': [
    'Explain your role and contributions clearly',
    'Discuss what you learned about the research process',
    'Connect research skills to clinical medicine',
    'Show intellectual curiosity and critical thinking'
  ],
  'service': [
    'Focus on sustained, meaningful involvement',
    'Reflect on what you learned about serving others',
    'Connect service to your understanding of healthcare',
    'Show commitment to helping underserved populations'
  ],
  'personal': [
    'Tell a story that reveals who you are',
    'Show personal growth and self-reflection',
    'Connect experiences to your motivation for medicine',
    'Be genuine and avoid trying to impress'
  ],
  'academic': [
    'Be honest about any academic struggles',
    'Show how you\'ve grown and improved',
    'Take responsibility without making excuses',
    'Demonstrate resilience and commitment to excellence'
  ]
}

export default function SecondaryPromptsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<string>('all')
  const [filteredPrompts, setFilteredPrompts] = useState<SecondaryPrompt[]>([])
  const [schoolResults, setSchoolResults] = useState<SchoolPrompts[]>([])
  const [viewMode, setViewMode] = useState<'prompts' | 'schools'>('schools')

  useEffect(() => {
    filterPrompts()
  }, [searchTerm, selectedTheme])

  const filterPrompts = () => {
    let filtered = secondaryPromptsDatabase

    // Filter by search term (school name)
    if (searchTerm) {
      filtered = filtered.filter(prompt => 
        prompt.school.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by theme
    if (selectedTheme !== 'all') {
      filtered = filtered.filter(prompt => prompt.theme === selectedTheme)
    }

    setFilteredPrompts(filtered)

    // Group by school for school view
    const schoolGroups = new Map<string, SchoolPrompts>()
    
    filtered.forEach(prompt => {
      if (!schoolGroups.has(prompt.school)) {
        schoolGroups.set(prompt.school, {
          school: prompt.school,
          location: getSchoolLocation(prompt.school),
          prompts: [],
          totalPrompts: 0,
          averageWords: 0
        })
      }
      
      const schoolGroup = schoolGroups.get(prompt.school)!
      schoolGroup.prompts.push(prompt)
    })

    // Calculate statistics
    const schools = Array.from(schoolGroups.values()).map(school => {
      school.totalPrompts = school.prompts.length
      school.averageWords = Math.round(
        school.prompts.reduce((sum, p) => sum + (p.wordLimit || p.characterLimit || 300), 0) / school.totalPrompts
      )
      return school
    })

    setSchoolResults(schools.sort((a, b) => a.school.localeCompare(b.school)))
  }

  const getSchoolLocation = (schoolName: string): string => {
    const locations: Record<string, string> = {
      'Harvard Medical School': 'Boston, MA',
      'Johns Hopkins University School of Medicine': 'Baltimore, MD',
      'UCSF School of Medicine': 'San Francisco, CA',
      'Stanford University School of Medicine': 'Stanford, CA',
      'NYU Grossman School of Medicine': 'New York, NY',
      'Washington University School of Medicine': 'St. Louis, MO',
      'University of Michigan Medical School': 'Ann Arbor, MI',
      'UCLA David Geffen School of Medicine': 'Los Angeles, CA'
    }
    return locations[schoolName] || 'Location TBD'
  }

  const getWordOrCharacterDisplay = (prompt: SecondaryPrompt) => {
    if (prompt.wordLimit) {
      return `${prompt.wordLimit} words`
    } else if (prompt.characterLimit) {
      return `${prompt.characterLimit} characters`
    } else {
      return 'No limit specified'
    }
  }

  const getAllThemes = () => {
    const themes = new Set(secondaryPromptsDatabase.map(p => p.theme))
    return Array.from(themes).sort()
  }

  const exportPrompts = () => {
    const exportData = schoolResults.map(school => {
      return `# ${school.school}\n\n${school.prompts.map(prompt => 
        `**${themeLabels[prompt.theme]}** (${getWordOrCharacterDisplay(prompt)})\n${prompt.prompt}\n`
      ).join('\n')}`
    }).join('\n\n---\n\n')

    navigator.clipboard.writeText(exportData)
    alert('Secondary prompts copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            📝 Secondary Essay Prompt Finder
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Search and explore medical school secondary essay prompts. Find prompts by school 
            or theme, with word counts and writing tips to help you craft compelling responses.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Medical Schools
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Harvard, Stanford, UCSF..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Theme
              </label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
              >
                <option value="all">All Themes</option>
                {getAllThemes().map(theme => (
                  <option key={theme} value={theme}>
                    {themeLabels[theme as keyof typeof themeLabels]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={exportPrompts}
                className="w-full btn-red text-sm"
              >
                📋 Export Results
              </button>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('schools')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                viewMode === 'schools'
                  ? 'bg-brand-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              By School ({schoolResults.length})
            </button>
            <button
              onClick={() => setViewMode('prompts')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                viewMode === 'prompts'
                  ? 'bg-brand-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Prompts ({filteredPrompts.length})
            </button>
          </div>
        </div>

        {/* Results */}
        {viewMode === 'schools' ? (
          <div className="space-y-6">
            {schoolResults.map((school) => (
              <div key={school.school} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{school.school}</h3>
                    <p className="text-sm text-gray-600">{school.location}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>{school.totalPrompts} prompts</div>
                    <div>~{school.averageWords} words avg</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {school.prompts.map((prompt, index) => (
                    <div key={prompt.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${themeColors[prompt.theme]}`}>
                            {themeLabels[prompt.theme]}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getWordOrCharacterDisplay(prompt)}
                          </span>
                          {prompt.required && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">#{index + 1}</span>
                      </div>
                      <p className="text-gray-800 leading-relaxed">{prompt.prompt}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {schoolResults.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium mb-2">No schools found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPrompts.map((prompt) => (
              <div key={prompt.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{prompt.school}</h3>
                    <p className="text-sm text-gray-600">{getSchoolLocation(prompt.school)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${themeColors[prompt.theme]}`}>
                      {themeLabels[prompt.theme]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getWordOrCharacterDisplay(prompt)}
                    </span>
                    {prompt.required && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        Required
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-800 leading-relaxed">{prompt.prompt}</p>
              </div>
            ))}

            {filteredPrompts.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium mb-2">No prompts found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        )}

        {/* Writing Tips */}
        {selectedTheme !== 'all' && (
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              💡 Tips for {themeLabels[selectedTheme as keyof typeof themeLabels]} Essays
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              {writingTips[selectedTheme as keyof typeof writingTips]?.map((tip, index) => (
                <li key={index}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* General Tips */}
        <div className="mt-8 bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">📚 General Secondary Essay Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-green-800 mb-2">Before You Write</h4>
              <ul className="space-y-1 text-green-700">
                <li>• Research each school thoroughly</li>
                <li>• Create an outline for each prompt type</li>
                <li>• Brainstorm unique experiences and examples</li>
                <li>• Plan to submit within 1-2 weeks of receiving prompts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">Writing Best Practices</h4>
              <ul className="space-y-1 text-green-700">
                <li>• Stay within word/character limits</li>
                <li>• Use specific examples and stories</li>
                <li>• Show, don't tell your qualities</li>
                <li>• Proofread carefully for errors</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">📊 Quick Stats</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-semibold text-green-700">{secondaryPromptsDatabase.length}</div>
                <div className="text-green-600">Total Prompts</div>
              </div>
              <div>
                <div className="font-semibold text-green-700">{new Set(secondaryPromptsDatabase.map(p => p.school)).size}</div>
                <div className="text-green-600">Schools</div>
              </div>
              <div>
                <div className="font-semibold text-green-700">{Math.round(secondaryPromptsDatabase.reduce((sum, p) => sum + (p.wordLimit || 300), 0) / secondaryPromptsDatabase.length)}</div>
                <div className="text-green-600">Avg Words</div>
              </div>
              <div>
                <div className="font-semibold text-green-700">{getAllThemes().length}</div>
                <div className="text-green-600">Themes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}