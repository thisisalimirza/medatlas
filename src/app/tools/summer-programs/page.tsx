'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import Header from '@/components/Header'

interface SummerProgram {
  id: number
  program_name: string
  host_institution: string
  description: string
  eligibility: string
  application_deadline: string
  stipend_funding: string
  duration: string
  created_at: string
  updated_at: string
}

export default function SummerProgramsPage() {
  const { user } = useAuth()
  const [programs, setPrograms] = useState<SummerProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [institutionFilter, setInstitutionFilter] = useState('')
  const [deadlineFilter, setDeadlineFilter] = useState('')
  const [sortField, setSortField] = useState<keyof SummerProgram>('program_name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => {
    fetchPrograms()
  }, [searchTerm, institutionFilter, deadlineFilter])

  const fetchPrograms = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (searchTerm) queryParams.append('search', searchTerm)
      if (institutionFilter) queryParams.append('institution', institutionFilter)
      if (deadlineFilter) queryParams.append('deadline', deadlineFilter)
      
      const response = await fetch(`/api/summer-programs?${queryParams.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setPrograms(data.data)
      } else {
        console.error('Failed to fetch programs:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: keyof SummerProgram) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedPrograms = [...programs].sort((a, b) => {
    const aValue = a[sortField] || ''
    const bValue = b[sortField] || ''
    
    if (sortDirection === 'asc') {
      return aValue.toString().localeCompare(bValue.toString())
    } else {
      return bValue.toString().localeCompare(aValue.toString())
    }
  })

  const handleProtectedAction = () => {
    if (!user || !user.is_paid) {
      setShowPaywall(true)
      return false
    }
    return true
  }

  const isUserPaid = user && user.is_paid

  // Get unique institutions for filter dropdown
  const uniqueInstitutions = [...new Set(programs.map(p => p.host_institution))].sort()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            🏥 Medical Student Summer Programs
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover research fellowships, clinical experiences, and summer opportunities 
            designed specifically for medical students to advance their careers.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Programs
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Program name, institution, or keywords..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution
              </label>
              <select
                value={institutionFilter}
                onChange={(e) => setInstitutionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
              >
                <option value="">All Institutions</option>
                {uniqueInstitutions.map(institution => (
                  <option key={institution} value={institution}>
                    {institution}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Deadline
              </label>
              <input
                type="text"
                value={deadlineFilter}
                onChange={(e) => setDeadlineFilter(e.target.value)}
                placeholder="January, February, etc..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {loading ? 'Loading...' : `${sortedPrograms.length} programs found`}
            </p>
            
            {!isUserPaid && (
              <div className="flex items-center space-x-2 text-sm text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                <span>🔒</span>
                <span>Some details require MedAtlas Pro</span>
              </div>
            )}
          </div>
        </div>

        {/* Programs Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red mx-auto mb-4"></div>
              <p className="text-gray-600">Loading summer programs...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('program_name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Program Name</span>
                        {sortField === 'program_name' && (
                          <span className="text-brand-red">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('host_institution')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Institution</span>
                        {sortField === 'host_institution' && (
                          <span className="text-brand-red">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('application_deadline')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Deadline</span>
                        {sortField === 'application_deadline' && (
                          <span className="text-brand-red">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('duration')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Duration</span>
                        {sortField === 'duration' && (
                          <span className="text-brand-red">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedPrograms.map((program, index) => (
                    <tr key={program.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {program.program_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {program.host_institution}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs">
                          {isUserPaid ? (
                            program.description
                          ) : (
                            <div className="relative">
                              <div className="blur-sm select-none">
                                {program.description.substring(0, 50)}...
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <button
                                  onClick={() => handleProtectedAction()}
                                  className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full hover:bg-amber-600 transition-colors"
                                >
                                  🔒 Pro
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {program.application_deadline}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {program.duration}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleProtectedAction()}
                          className={`text-sm px-3 py-1 rounded-full transition-colors ${
                            isUserPaid 
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {isUserPaid ? 'View Details' : '🔒 Unlock'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && sortedPrograms.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium mb-2">No programs found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 How to Use This Tool</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Search & Filter</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Search by program name, institution, or keywords</li>
                <li>• Filter by specific institutions</li>
                <li>• Search deadlines by month (e.g., "January")</li>
                <li>• Click column headers to sort</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Application Tips</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Start researching programs early in your first year</li>
                <li>• Many programs prefer students from underrepresented backgrounds</li>
                <li>• Application deadlines are typically January-March</li>
                <li>• Build relationships with faculty mentors early</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Unlock Full Program Details</h3>
              <p className="text-gray-600 mb-6">
                Get access to complete program descriptions, eligibility requirements, 
                funding details, and application guidance.
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = '/?upgrade=true'}
                  className="w-full btn-red"
                >
                  Upgrade to MedAtlas Pro
                </button>
                <button 
                  onClick={() => setShowPaywall(false)}
                  className="w-full btn-outline"
                >
                  Continue with Limited Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}