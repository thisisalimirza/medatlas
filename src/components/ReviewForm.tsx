'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface ReviewFormProps {
  placeId: number
  placeName: string
  onSuccess: () => void
  existingReview?: {
    rating: number
    tags: string[]
    body: string
    is_anonymous: boolean
  }
}

export default function ReviewForm({ placeId, placeName, onSuccess, existingReview }: ReviewFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 0,
    tags: existingReview?.tags || [],
    body: existingReview?.body || '',
    is_anonymous: existingReview?.is_anonymous ?? true
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const availableTags = [
    'clinical-training', 'research', 'faculty', 'curriculum', 'facilities',
    'location', 'cost', 'student-life', 'diversity', 'match-rate',
    'workload', 'mental-health', 'housing', 'food', 'transportation'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    if (!user || !user.is_paid) {
      setErrors(['Paid membership required to post reviews'])
      setLoading(false)
      return
    }

    if (formData.rating === 0) {
      setErrors(['Please select a rating'])
      setLoading(false)
      return
    }

    if (formData.body.length < 10) {
      setErrors(['Review must be at least 10 characters long'])
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_id: placeId,
          rating: formData.rating,
          tags: formData.tags,
          review_body: formData.body,
          is_anonymous: formData.is_anonymous
        })
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
        // Reset form if it was a new review
        if (!existingReview) {
          setFormData({
            rating: 0,
            tags: [],
            body: '',
            is_anonymous: true
          })
        }
      } else {
        setErrors([data.error || 'Failed to post review'])
      }
    } catch (error) {
      setErrors(['Network error. Please try again.'])
    } finally {
      setLoading(false)
    }
  }

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Sign in to write a review</p>
      </div>
    )
  }

  if (!user.is_paid) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">💬</div>
        <h3 className="text-lg font-semibold mb-2">Share Your Experience</h3>
        <p className="text-gray-600 mb-4">
          Help future students by writing an honest review of {placeName}
        </p>
        <button className="btn-red">
          Upgrade to Post Reviews
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">
        {existingReview ? 'Update Your Review' : 'Write a Review'} for {placeName}
      </h3>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          {errors.map((error, index) => (
            <p key={index} className="text-red-700 text-sm">{error}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium mb-2">Overall Rating</label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                className={`text-2xl ${
                  star <= formData.rating 
                    ? 'text-yellow-400' 
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {formData.rating > 0 && (
                <>
                  {formData.rating}/5 - {
                    formData.rating === 5 ? 'Excellent' :
                    formData.rating === 4 ? 'Very Good' :
                    formData.rating === 3 ? 'Good' :
                    formData.rating === 2 ? 'Fair' : 'Poor'
                  }
                </>
              )}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Topics <span className="text-gray-500">(select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  formData.tags.includes(tag)
                    ? 'bg-brand-red text-white border-brand-red'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {tag.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Review Body */}
        <div>
          <label className="block text-sm font-medium mb-2">Your Review</label>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
            rows={6}
            placeholder="Share your honest experience... What would you want future students to know?"
            required
            minLength={10}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.body.length}/500 characters (minimum 10)
          </p>
        </div>

        {/* Anonymous Option */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="anonymous"
            checked={formData.is_anonymous}
            onChange={(e) => setFormData(prev => ({ ...prev, is_anonymous: e.target.checked }))}
            className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
          />
          <label htmlFor="anonymous" className="text-sm text-gray-700">
            Post anonymously (recommended)
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || formData.rating === 0}
            className="btn-red disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Posting...' : existingReview ? 'Update Review' : 'Post Review'}
          </button>
        </div>
      </form>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Reviews help future students make informed decisions. Please be honest and constructive.
        </p>
      </div>
    </div>
  )
}