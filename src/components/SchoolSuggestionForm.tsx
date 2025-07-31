'use client'

import { useState } from 'react'

interface SchoolSuggestionFormProps {
  schoolType: 'undergraduate' | 'medical'
  onSuccess?: () => void
  onCancel?: () => void
}

export default function SchoolSuggestionForm({ 
  schoolType, 
  onSuccess, 
  onCancel 
}: SchoolSuggestionFormProps) {
  const [formData, setFormData] = useState({
    school_name: '',
    location_city: '',
    location_state: '',
    website_url: '',
    additional_info: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/school-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          school_type: schoolType
        })
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to submit suggestion')
        return
      }

      setSuccess(true)
      setFormData({
        school_name: '',
        location_city: '',
        location_state: '',
        website_url: '',
        additional_info: ''
      })

      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }

    } catch (error) {
      console.error('Error submitting suggestion:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-green-600">✅</span>
          <div>
            <p className="font-medium text-green-800">Suggestion Submitted!</p>
            <p className="text-green-700 text-sm">
              Thank you for suggesting a {schoolType} school. We'll review it and add it to our database if approved.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-blue-800">
          Suggest a {schoolType === 'undergraduate' ? 'University' : 'Medical School'}
        </h3>
        <p className="text-blue-700 text-sm mt-1">
          Can't find your {schoolType} school? Help us expand our database by suggesting it below.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            School Name *
          </label>
          <input
            type="text"
            value={formData.school_name}
            onChange={(e) => handleInputChange('school_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`e.g., ${schoolType === 'undergraduate' ? 'University of California, Berkeley' : 'Harvard Medical School'}`}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={formData.location_city}
              onChange={(e) => handleInputChange('location_city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Berkeley"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              value={formData.location_state}
              onChange={(e) => handleInputChange('location_state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="CA"
              maxLength={2}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website URL
          </label>
          <input
            type="url"
            value={formData.website_url}
            onChange={(e) => handleInputChange('website_url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://www.berkeley.edu"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Information
          </label>
          <textarea
            value={formData.additional_info}
            onChange={(e) => handleInputChange('additional_info', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Any additional details about this school that might be helpful..."
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading || !formData.school_name.trim()}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Suggestion'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <p className="text-xs text-gray-500 mt-3">
        * Required fields. Your suggestion will be reviewed before being added to our database.
      </p>
    </div>
  )
}