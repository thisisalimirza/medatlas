'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import Header from '@/components/Header'

function PaymentProcessor() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'password-setup' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [stage, setStage] = useState('ms1')
  const [passwordError, setPasswordError] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  const medicalStages = [
    { value: 'premed', label: 'Pre-med Student', emoji: '📚' },
    { value: 'ms1', label: 'MS1 (First Year)', emoji: '👨‍⚕️' },
    { value: 'ms2', label: 'MS2 (Second Year)', emoji: '👩‍⚕️' },
    { value: 'ms3', label: 'MS3 (Third Year)', emoji: '🏥' },
    { value: 'ms4', label: 'MS4 (Fourth Year)', emoji: '🎓' },
    { value: 'resident', label: 'Resident', emoji: '👨‍⚕️' },
    { value: 'attending', label: 'Attending', emoji: '🩺' },
  ]

  useEffect(() => {
    const processPayment = async () => {
      // Try different possible parameter names that Stripe might use
      const sessionId = searchParams.get('session_id') || 
                       searchParams.get('checkout_session_id') ||
                       searchParams.get('cs_') // Stripe sometimes uses cs_ prefix
      
      // Debug: Log all search params
      console.log('All search params:', Object.fromEntries(searchParams.entries()))
      console.log('Session ID found:', sessionId)
      console.log('Current URL:', window.location.href)
      
      if (!sessionId) {
        // Check if payment was canceled
        const canceled = searchParams.get('canceled')
        if (canceled) {
          setStatus('error')
          setMessage('Payment was canceled. You can try again anytime.')
          return
        }
        
        // As a fallback, check if the user just became a paid user
        console.log('No session ID found, checking user payment status as fallback...')
        try {
          await refreshUser()
          // Small delay to allow auth context to update
          setTimeout(async () => {
            const response = await fetch('/api/auth/me')
            const userData = await response.json()
            
            if (userData.success && userData.user && userData.user.is_paid) {
              console.log('User is paid, assuming payment was successful')
              setUserEmail(userData.user.email)
              setStatus('password-setup')
              return
            } else {
              setStatus('error')
              setMessage('Missing payment session ID. This usually means the payment redirect was incomplete. Please check your email for payment confirmation or contact support.')
            }
          }, 1000)
        } catch (error) {
          console.error('Fallback check failed:', error)
          setStatus('error')
          setMessage('Missing payment session ID. This usually means the payment redirect was incomplete. Please check your email for payment confirmation or contact support.')
        }
        return
      }

      try {
        const response = await fetch('/api/payment-success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId })
        })

        const data = await response.json()

        if (data.success) {
          // Store user email for password setup
          setUserEmail(data.user.email)
          // Refresh user data to get the updated paid status
          await refreshUser()
          // Show password setup form instead of immediate success
          setStatus('password-setup')
        } else {
          setStatus('error')
          setMessage(data.error || 'Payment processing failed')
        }
      } catch (error) {
        console.error('Payment processing error:', error)
        setStatus('error')
        setMessage('Something went wrong')
      }
    }

    processPayment()
  }, [searchParams, refreshUser, router])

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordLoading(true)

    // Validate password
    if (!password || password.length < 8) {
      setPasswordError('Password must be at least 8 characters long')
      setPasswordLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      setPasswordLoading(false)
      return
    }

    try {
      // Update user's password and stage
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail,
          password: password,
          stage: stage
        })
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        // Redirect to home after a brief success message
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } else {
        setPasswordError(data.error || 'Failed to set password')
      }
    } catch (error) {
      console.error('Password setup error:', error)
      setPasswordError('Something went wrong. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {status === 'loading' && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
                <h1 className="text-xl font-semibold mb-2">Processing your payment...</h1>
                <p className="text-gray-600">Creating your MedAtlas Pro account</p>
              </>
            )}

            {status === 'password-setup' && (
              <>
                <div className="text-4xl mb-4">🔐</div>
                <h1 className="text-xl font-semibold mb-2">Set Your Password</h1>
                <p className="text-gray-600 mb-6">
                  Complete your MedAtlas Pro account setup by creating a secure password. 
                  You'll use this to log in next time.
                </p>

                <form onSubmit={handlePasswordSetup} className="space-y-4">
                  <div className="text-left">
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div className="text-left">
                    <label className="block text-sm font-medium mb-1">What's your stage?</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      required
                    >
                      {medicalStages.map(stageOption => (
                        <option key={stageOption.value} value={stageOption.value}>
                          {stageOption.emoji} {stageOption.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-left">
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      placeholder="Enter a secure password (8+ characters)"
                      required
                    />
                  </div>

                  <div className="text-left">
                    <label className="block text-sm font-medium mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>

                  {passwordError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm">{passwordError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? 'Setting up account...' : 'Complete Setup →'}
                  </button>
                </form>

                <p className="text-xs text-gray-500 mt-4">
                  Your password should be at least 8 characters long for security.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="text-5xl mb-4">🎉</div>
                <h1 className="text-2xl font-bold mb-2 text-green-600">Welcome to MedAtlas Pro!</h1>
                <p className="text-gray-600 mb-6">
                  Your account has been created and you now have full access to:
                </p>
                <ul className="text-left text-sm text-gray-700 space-y-2 mb-6">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>All student and resident reviews</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Community features and networking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Detailed cost breakdowns</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Ability to post reviews and insights</span>
                  </li>
                </ul>
                <p className="text-sm text-gray-500">
                  Redirecting you to explore medical schools in 3 seconds...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="text-4xl mb-4">⚠️</div>
                <h1 className="text-xl font-semibold mb-2 text-red-600">Payment Issue</h1>
                <p className="text-gray-600 mb-4">{message}</p>
                
                {/* Debug info for development */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-500 mb-4 p-3 bg-gray-100 rounded">
                    <strong>Debug Info:</strong><br />
                    URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}<br />
                    Full Search: {typeof window !== 'undefined' ? window.location.search : 'N/A'}<br />
                    Params Object: {JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2)}<br />
                    All Params: {Array.from(searchParams.entries()).map(([key, value]) => `${key}=${value}`).join(', ')}
                  </div>
                )}
                
                <div className="space-y-2 mb-6">
                  <button
                    onClick={() => router.push('/')}
                    className="btn-red w-full"
                  >
                    Return Home
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="btn-outline w-full"
                  >
                    Try Again
                  </button>
                </div>
                
                <div className="text-xs text-gray-500">
                  <p className="mb-2">Need help? Contact support at help@medatlas.com</p>
                  <p>If your payment went through, check your email for confirmation. Your account will be activated within 24 hours.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      }>
        <PaymentProcessor />
      </Suspense>
    </div>
  )
}