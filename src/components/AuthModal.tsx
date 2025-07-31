'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'signup'
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signup' }: AuthModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    stage: 'ms1'
  })
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [userCheckResult, setUserCheckResult] = useState<any>(null)
  const [step, setStep] = useState<'email' | 'password' | 'checkout'>('email')
  const { login } = useAuth()

  const medicalStages = [
    { value: 'premed', label: 'Pre-med Student', emoji: '📚' },
    { value: 'ms1', label: 'MS1 (First Year)', emoji: '👨‍⚕️' },
    { value: 'ms2', label: 'MS2 (Second Year)', emoji: '👩‍⚕️' },
    { value: 'ms3', label: 'MS3 (Third Year)', emoji: '🏥' },
    { value: 'ms4', label: 'MS4 (Fourth Year)', emoji: '🎓' },
    { value: 'resident', label: 'Resident', emoji: '👨‍⚕️' },
    { value: 'attending', label: 'Attending', emoji: '🩺' },
  ]

  if (!isOpen) return null

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setErrors(['Please enter a valid email address'])
      setLoading(false)
      return
    }

    try {
      // Check if user exists and is paid
      const response = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      const data = await response.json()
      
      if (data.success) {
        setUserCheckResult(data)
        
        if (data.userExists && data.isPaid) {
          // User exists and is paid - ask for password to login
          setStep('password')
        } else {
          // New user or unpaid user - proceed to checkout
          setStep('checkout')
        }
      } else {
        setErrors([data.error || 'Failed to check user status'])
      }
    } catch (error) {
      console.error('User check error:', error)
      setErrors(['Failed to check user status. Please try again.'])
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    if (!formData.password) {
      setErrors(['Please enter your password'])
      setLoading(false)
      return
    }

    try {
      const result = await login(formData.email, formData.password)
      
      if (result.success) {
        handleClose()
      } else {
        setErrors([result.error || 'Login failed'])
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors(['Login failed. Please try again.'])
    } finally {
      setLoading(false)
    }
  }

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email
        })
      })

      const data = await response.json()
      
      if (data.success && data.checkout_url) {
        // Redirect to Stripe hosted checkout
        window.location.href = data.checkout_url
      } else {
        setErrors([data.error || 'Failed to create checkout session'])
        setLoading(false)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setErrors(['Failed to create checkout session. Please try again.'])
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors([]) // Clear errors when user types
  }

  const resetModal = () => {
    setFormData({ email: '', password: '', stage: 'ms1' })
    setErrors([])
    setLoading(false)
    setUserCheckResult(null)
    setStep('email')
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Join MedAtlas</h2>
              <p className="text-gray-600 mt-1">
                Connect with 2,847+ medical students and residents
              </p>
            </div>
            <button 
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl hover:bg-gray-100 p-1 rounded-full transition-all duration-200 group"
            >
              <span className="group-hover:scale-110 transition-transform inline-block">×</span>
            </button>
          </div>

          {/* Community Stats Teaser */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-blue-900">2,847+</div>
                <div className="text-blue-700">Members</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-900">450+</div>
                <div className="text-blue-700">Schools</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-900">1,200+</div>
                <div className="text-blue-700">Reviews</div>
              </div>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              {errors.map((error, index) => (
                <p key={index} className="text-red-700 text-sm">{error}</p>
              ))}
            </div>
          )}

          {/* Form - Step-based */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">Email address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll check if you already have an account
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-red disabled:opacity-50 disabled:cursor-not-allowed text-lg py-3"
              >
                {loading ? 'Checking...' : 'Continue →'}
              </button>
            </form>
          )}

          {step === 'password' && userCheckResult && (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✅</span>
                  <div>
                    <p className="text-green-800 font-medium">Welcome back!</p>
                    <p className="text-green-700 text-sm">You already have a MedAtlas Pro account.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="flex-1 px-4 py-3 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-red disabled:opacity-50 disabled:cursor-not-allowed text-lg py-3"
                  >
                    {loading ? 'Logging in...' : 'Log In'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'checkout' && (
            <div>
              {userCheckResult && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600">ℹ️</span>
                    <div>
                      <p className="text-blue-800 font-medium">
                        {userCheckResult.userExists ? 'Upgrade Your Account' : 'Create Your Account'}
                      </p>
                      <p className="text-blue-700 text-sm">{userCheckResult.message}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                {/* Pricing Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="mb-3">
                    <span className="font-medium text-lg">MedAtlas Pro</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    One-time payment • Lifetime access • 30-day money-back guarantee
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Read all student & resident reviews</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Connect with students at each school</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Access detailed cost breakdowns</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Post your own reviews & insights</span>
                    </li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="flex-1 px-4 py-3 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-red disabled:opacity-50 disabled:cursor-not-allowed text-lg py-3"
                  >
                    {loading ? 'Creating checkout...' : 'Join MedAtlas →'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Trust indicators */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              🔒 Secure payment via Stripe • 30-day money-back guarantee • Join 2,847+ members
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}