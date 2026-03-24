'use client'

import { useEffect, useState, useCallback, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'

// ─── Confetti Canvas ─────────────────────────────────────────────
function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ['#ff5e5b', '#ff9a9e', '#ffd700', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6', '#fb923c']
    const particles: Array<{
      x: number; y: number; w: number; h: number
      color: string; vx: number; vy: number
      rotation: number; rotationSpeed: number; opacity: number
    }> = []

    // Create particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      })
    }

    let animationId: number
    let frame = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      let allDone = true
      for (const p of particles) {
        p.x += p.vx
        p.vy += 0.05 // gravity
        p.y += p.vy
        p.rotation += p.rotationSpeed

        // Fade out after 120 frames
        if (frame > 120) {
          p.opacity = Math.max(0, p.opacity - 0.01)
        }

        if (p.opacity > 0 && p.y < canvas.height + 50) {
          allDone = false
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rotation * Math.PI) / 180)
          ctx.globalAlpha = p.opacity
          ctx.fillStyle = p.color
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
          ctx.restore()
        }
      }

      if (!allDone) {
        animationId = requestAnimationFrame(animate)
      }
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  )
}

// ─── Medical stage options ───────────────────────────────────────
const medicalStages = [
  { value: 'premed', label: 'Pre-med Student' },
  { value: 'ms1', label: 'MS1 (First Year)' },
  { value: 'ms2', label: 'MS2 (Second Year)' },
  { value: 'ms3', label: 'MS3 (Third Year)' },
  { value: 'ms4', label: 'MS4 (Fourth Year)' },
  { value: 'resident', label: 'Resident' },
  { value: 'attending', label: 'Attending' },
]

// ─── Main Payment Processor ──────────────────────────────────────
function PaymentProcessor() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser, user, sendMagicLink } = useAuth()
  const [status, setStatus] = useState<'loading' | 'onboarding' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [saving, setSaving] = useState(false)
  const [onboardingDone, setOnboardingDone] = useState(false)
  const [autoLoginFailed, setAutoLoginFailed] = useState(false)
  const processedRef = useRef(false)

  // Onboarding form state
  const [displayName, setDisplayName] = useState('')
  const [stage, setStage] = useState('premed')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const processPayment = useCallback(async () => {
    if (processedRef.current) return
    processedRef.current = true

    const sessionId = searchParams.get('session_id') || searchParams.get('checkout_session_id')

    if (!sessionId) {
      const canceled = searchParams.get('canceled')
      if (canceled) {
        setStatus('error')
        setMessage('Payment was canceled. You can try again anytime.')
        return
      }
      setStatus('error')
      setMessage('Missing payment session ID. Please contact support if you completed payment.')
      return
    }

    try {
      // Step 1: Process payment and create account
      const response = await fetch('/api/payment-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })

      const data = await response.json()

      if (!data.success) {
        setStatus('error')
        setMessage(data.error || 'Payment processing failed')
        return
      }

      setUserEmail(data.user.email)
      setDisplayName(data.user.display_name || '')

      // Step 2: Auto-sign in using the token from the API
      if (data.tokenHash) {
        try {
          const { error: otpError } = await supabase.auth.verifyOtp({
            email: data.user.email,
            token_hash: data.tokenHash,
            type: 'email',
          })
          if (otpError) {
            console.error('Auto-login OTP error:', otpError)
            setAutoLoginFailed(true)
          } else {
            await refreshUser()
          }
        } catch (err) {
          console.error('Auto-login error:', err)
          setAutoLoginFailed(true)
          // Send a magic link email as fallback
          await sendMagicLink(data.user.email)
        }
      } else {
        setAutoLoginFailed(true)
        // Send a magic link email as fallback
        await sendMagicLink(data.user.email)
      }

      // Step 3: Show confetti + onboarding
      setShowConfetti(true)
      setStatus('onboarding')
    } catch (error) {
      console.error('Payment processing error:', error)
      setStatus('error')
      setMessage('Something went wrong processing your payment.')
    }
  }, [searchParams, refreshUser, sendMagicLink])

  useEffect(() => {
    processPayment()
  }, [processPayment])

  const handleSaveProfile = async () => {
    setSaving(true)

    try {
      const sessionId = searchParams.get('session_id') || searchParams.get('checkout_session_id')

      // Update profile with onboarding data
      const response = await fetch('/api/payment-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          displayName: displayName || userEmail.split('@')[0],
          stage,
          password: password || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // If they set a password, sign them in with it for a solid session
        if (password) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password,
          })
          if (signInError) {
            console.error('Password sign-in error:', signInError)
          } else {
            setAutoLoginFailed(false) // Successfully signed in
          }
        }

        // Try to refresh user again (works if any sign-in method succeeded)
        await refreshUser()

        // If still not logged in and no password was set, send a magic link
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        if (!currentSession && !password) {
          await sendMagicLink(userEmail)
          setAutoLoginFailed(true)
        }

        setOnboardingDone(true)
      }
    } catch (error) {
      console.error('Profile save error:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {showConfetti && <ConfettiCanvas />}

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="w-full max-w-md mx-auto">

          {/* ─── LOADING ─── */}
          {status === 'loading' && (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold mb-2">Setting up your account...</h1>
              <p className="text-gray-600">Please wait while we activate MedStack Pro.</p>
            </div>
          )}

          {/* ─── ONBOARDING ─── */}
          {status === 'onboarding' && !onboardingDone && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Celebration header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-center text-white">
                <div className="text-5xl mb-3">&#127881;</div>
                <h1 className="text-2xl font-bold mb-1">Welcome to MedStack Pro!</h1>
                <p className="text-red-100 text-sm">
                  Payment confirmed for <strong>{userEmail}</strong>
                </p>
              </div>

              {/* Onboarding form */}
              <div className="p-6 space-y-5">
                <p className="text-sm text-gray-600 text-center">
                  Let's set up your profile so the community knows who you are.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                    placeholder="How should others see your name?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Stage
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base bg-white"
                  >
                    {medicalStages.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional password */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg className={`w-4 h-4 mr-1.5 transition-transform ${showPassword ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    Set a password (optional)
                  </button>

                  {showPassword && (
                    <div className="mt-2">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                        placeholder="At least 6 characters"
                        minLength={6}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        You can always sign in with a magic email link instead.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full bg-red-500 text-white font-bold py-3.5 rounded-xl hover:bg-red-600 transition-all duration-200 text-lg shadow-sm hover:shadow-md disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save & Continue'}
                </button>

                <button
                  onClick={() => setOnboardingDone(true)}
                  className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* ─── POST-ONBOARDING: Community Invite ─── */}
          {status === 'onboarding' && onboardingDone && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden text-center">
              <div className="px-6 py-8">
                <div className="text-5xl mb-4">&#x1F389;</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h1>
                <p className="text-gray-600 mb-6">
                  Welcome to the MedStack community. You now have full access to all Pro features.
                </p>

                {/* If auto-login failed and user still isn't signed in, prompt them */}
                {autoLoginFailed && !user && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
                    <p className="text-sm text-yellow-800 font-medium mb-2">
                      We couldn't sign you in automatically.
                    </p>
                    <p className="text-sm text-yellow-700 mb-3">
                      Check your email (<strong>{userEmail}</strong>) for a magic link to log in, or use the login button on the homepage.
                    </p>
                  </div>
                )}

                {/* Telegram community invite */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 text-left">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl flex-shrink-0">&#x1F4AC;</span>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Join the Community</h3>
                      <p className="text-sm text-blue-700 mb-3">
                        Connect with 2,847+ med students and residents. Ask questions, share experiences, and get advice.
                      </p>
                      <a
                        href="https://t.me/+666ywZFkke5lMjQx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Join Telegram Group &rarr;
                      </a>
                    </div>
                  </div>
                </div>

                {/* What's next */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                  <h4 className="font-medium text-sm text-gray-800 mb-3">What you can do now:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">&#10003;</span>
                      <span>Read all student & resident reviews</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">&#10003;</span>
                      <span>Compare schools side-by-side</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">&#10003;</span>
                      <span>Detailed cost breakdowns & financial tools</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">&#10003;</span>
                      <span>Connect with the MedStack community</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-red-500 text-white font-bold py-3.5 rounded-xl hover:bg-red-600 transition-all duration-200 text-lg shadow-sm hover:shadow-md"
                >
                  Start Exploring &rarr;
                </button>
              </div>
            </div>
          )}

          {/* ─── ERROR ─── */}
          {status === 'error' && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">&#10060;</div>
              <h1 className="text-2xl font-bold mb-2">Payment Issue</h1>
              <p className="text-gray-600 mb-6">{message}</p>

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-3 rounded-lg transition-all duration-200"
                >
                  Try Again
                </button>

                <p className="text-sm text-gray-500">
                  Need help? Email us at help@mymedstack.com
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
        </div>
      </div>
    }>
      <PaymentProcessor />
    </Suspense>
  )
}
