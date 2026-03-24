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
    stage: 'premed',
    displayName: '',
  })
  const [selectedPlan, setSelectedPlan] = useState<'5year' | 'annual'>('5year')
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'paywall' | 'details' | 'sent' | 'login'>(() =>
    initialMode === 'login' ? 'login' : 'paywall'
  )
  const { sendMagicLink } = useAuth()

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

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
        body: JSON.stringify({ email: formData.email }),
      })
      const data = await response.json()

      if (data.success && data.userExists && data.isPaid) {
        const result = await sendMagicLink(formData.email)
        if (result.success) {
          setStep('sent')
        } else {
          setErrors([result.error || 'Failed to send login link'])
        }
      } else if (data.success) {
        // User doesn't exist or isn't paid — show paywall
        setStep('paywall')
      } else {
        setErrors([data.error || 'Failed to check user status'])
      }
    } catch {
      setErrors(['Something went wrong. Please try again.'])
    } finally {
      setLoading(false)
    }
  }

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setErrors(['Please enter a valid email address'])
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          stage: formData.stage,
          displayName: formData.displayName,
          plan: selectedPlan,
        }),
      })

      const data = await response.json()

      if (data.success && data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        setErrors([data.error || 'Failed to create checkout session'])
        setLoading(false)
      }
    } catch {
      setErrors(['Failed to create checkout session. Please try again.'])
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors([])
  }

  const resetModal = () => {
    setFormData({ email: '', stage: 'premed', displayName: '' })
    setSelectedPlan('5year')
    setErrors([])
    setLoading(false)
    setStep(initialMode === 'login' ? 'login' : 'paywall')
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ────────────────────── LOGIN STEP ────────────────────── */}
        {step === 'login' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                <p className="text-gray-500 text-sm mt-1">Sign in to your MedAtlas account</p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                {errors.map((error, i) => (
                  <p key={i} className="text-red-700 text-sm">{error}</p>
                ))}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                  placeholder="your@email.com"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-500 text-white font-semibold py-3 rounded-xl hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending link...' : 'Send Magic Link'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <button
                  onClick={() => setStep('paywall')}
                  className="text-red-500 font-medium hover:underline"
                >
                  Join MedAtlas
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ────────────────────── PAYWALL STEP ────────────────────── */}
        {step === 'paywall' && (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Join MedAtlas Pro</h2>
                <p className="text-gray-500 text-sm mt-1">
                  The toolkit for your medical journey
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* Social proof bar */}
            <div className="flex items-center space-x-3 mb-6 text-sm text-gray-500">
              <span className="flex items-center">
                <span className="flex -space-x-1.5 mr-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">A</span>
                  <span className="w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">M</span>
                  <span className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">S</span>
                </span>
                2,847+ members
              </span>
              <span className="text-gray-300">|</span>
              <span>450+ programs</span>
            </div>

            {/* What you get */}
            <div className="mb-6">
              <ul className="space-y-2.5">
                {[
                  'Read all student & resident reviews',
                  'Connect directly with students at each school',
                  'Detailed cost breakdowns & financial planning',
                  'School comparison & rank list tools',
                  'Post your own reviews & insights',
                  'Access to exclusive community features',
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-2.5 text-sm">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing cards */}
            <div className="space-y-3 mb-6">
              {/* 5-Year Plan — Best Value (pre-selected) */}
              <button
                onClick={() => setSelectedPlan('5year')}
                className={`relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedPlan === '5year'
                    ? 'border-red-500 bg-red-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {/* Best value badge */}
                <span className="absolute -top-2.5 left-4 bg-red-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                  Best Value
                </span>

                <div className="flex items-center justify-between pr-8">
                  <div>
                    <div className="font-semibold text-gray-900">5-Year Access</div>
                    <div className="text-sm text-gray-500">Covers premed through residency</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">$100</div>
                    <div className="text-xs text-green-600 font-medium">just $20/yr</div>
                  </div>
                </div>

                {/* Selection indicator */}
                <div className={`absolute top-1/2 -translate-y-1/2 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === '5year'
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-300'
                }`}>
                  {selectedPlan === '5year' && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                </div>
              </button>

              {/* Annual Plan */}
              <button
                onClick={() => setSelectedPlan('annual')}
                className={`relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedPlan === 'annual'
                    ? 'border-red-500 bg-red-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between pr-8">
                  <div>
                    <div className="font-semibold text-gray-900">Annual Access</div>
                    <div className="text-sm text-gray-500">1 year of full access</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">$60</div>
                    <div className="text-xs text-gray-400 font-medium">per year</div>
                  </div>
                </div>

                <div className={`absolute top-1/2 -translate-y-1/2 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'annual'
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-300'
                }`}>
                  {selectedPlan === 'annual' && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                </div>
              </button>
            </div>

            {/* Savings callout */}
            {selectedPlan === '5year' && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 mb-5 text-center">
                <span className="text-sm text-green-800 font-medium">
                  You save $200 compared to 5 years of annual billing
                </span>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={() => setStep('details')}
              className="w-full bg-red-500 text-white font-bold py-3.5 rounded-xl hover:bg-red-600 transition-all duration-200 text-lg shadow-sm hover:shadow-md"
            >
              Continue — {selectedPlan === '5year' ? '$100' : '$60/yr'}
            </button>

            {/* Existing user link */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Already a member?{' '}
                <button
                  onClick={() => setStep('login')}
                  className="text-red-500 font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>

            {/* Trust */}
            <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-400">
              <span>🔒 Secure checkout</span>
              <span>30-day refund</span>
              <span>Cancel anytime</span>
            </div>
          </div>
        )}

        {/* ────────────────────── DETAILS STEP ────────────────────── */}
        {step === 'details' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Almost there!</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedPlan === '5year' ? '5-Year Access — $100' : 'Annual Access — $60/yr'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                {errors.map((error, i) => (
                  <p key={i} className="text-red-700 text-sm">{error}</p>
                ))}
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                  placeholder="your@email.com"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                  placeholder="How should others see your name?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => handleInputChange('stage', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base bg-white"
                >
                  {medicalStages.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.emoji} {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('paywall')}
                  className="px-5 py-3 text-sm font-medium border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-sm"
                >
                  {loading ? 'Redirecting to checkout...' : `Pay ${selectedPlan === '5year' ? '$100' : '$60'} →`}
                </button>
              </div>
            </form>

            <p className="text-xs text-gray-400 text-center mt-4">
              🔒 You'll be redirected to Stripe for secure payment
            </p>
          </div>
        )}

        {/* ────────────────────── SENT STEP ────────────────────── */}
        {step === 'sent' && (
          <div className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📧</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h3>
              <p className="text-gray-600 mb-6">
                We sent a magic login link to <strong className="text-gray-900">{formData.email}</strong>
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <h4 className="font-medium text-sm mb-2 text-gray-700">Don't see it?</h4>
                <ul className="text-sm text-gray-500 space-y-1.5">
                  <li className="flex items-start space-x-2">
                    <span className="text-gray-400">•</span>
                    <span>Check your spam/junk folder</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-gray-400">•</span>
                    <span>The link expires in 1 hour</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-gray-400">•</span>
                    <span>Try clicking the link from your phone if on desktop</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => { setStep('login'); setErrors([]) }}
                className="text-red-500 hover:underline text-sm font-medium"
              >
                ← Try a different email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
