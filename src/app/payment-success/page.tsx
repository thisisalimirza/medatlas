'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import Header from '@/components/Header'

function PaymentProcessor() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser, sendMagicLink } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'magic-link' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  useEffect(() => {
    const processPayment = async () => {
      const sessionId = searchParams.get('session_id') || 
                       searchParams.get('checkout_session_id')
      
      console.log('Processing payment with session ID:', sessionId)
      
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
        const response = await fetch('/api/payment-success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId })
        })

        const data = await response.json()

        if (data.success) {
          setUserEmail(data.user.email)
          await refreshUser()
          setStatus('magic-link')
        } else {
          setStatus('error')
          setMessage(data.error || 'Payment processing failed')
        }
      } catch (error) {
        console.error('Payment processing error:', error)
        setStatus('error')
        setMessage('Something went wrong processing your payment.')
      }
    }

    processPayment()
  }, [searchParams, refreshUser])

  const handleSendMagicLink = async () => {
    if (magicLinkSent) return
    
    try {
      const result = await sendMagicLink(userEmail)
      
      if (result.success) {
        setMagicLinkSent(true)
        setMessage('Magic link sent! Check your email to complete login.')
      } else {
        setMessage(result.error || 'Failed to send magic link')
      }
    } catch (error) {
      console.error('Magic link error:', error)
      setMessage('Failed to send magic link. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center px-4 max-w-md mx-auto">
          
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold mb-2">Processing your payment...</h1>
              <p className="text-gray-600">Please wait while we set up your MedAtlas Pro account.</p>
            </>
          )}

          {status === 'magic-link' && (
            <>
              <div className="text-4xl mb-4">✨</div>
              <h1 className="text-2xl font-bold mb-2">Payment successful!</h1>
              <p className="text-gray-600 mb-6">
                Your MedAtlas Pro account is ready. Get secure access with a magic login link.
              </p>

              {!magicLinkSent ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✅</span>
                      <div className="text-left">
                        <p className="text-green-800 font-medium">Payment confirmed</p>
                        <p className="text-green-700 text-sm">Welcome to MedAtlas Pro! Account: {userEmail}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSendMagicLink}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-3 rounded-lg transition-all duration-200"
                  >
                    Send Magic Login Link ✨
                  </button>

                  <p className="text-xs text-gray-500">
                    No passwords needed! We'll send you a secure login link via email.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">📧</span>
                      <div className="text-left">
                        <p className="text-blue-800 font-medium">Magic link sent!</p>
                        <p className="text-blue-700 text-sm">Check your email to log in securely</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-left text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">🔍 Don't see it?</h4>
                    <ul className="space-y-1">
                      <li>• Check your spam/junk folder</li>
                      <li>• The link expires in 1 hour</li>
                      <li>• Try clicking from your mobile device</li>
                    </ul>
                  </div>

                  <p className="text-xs text-gray-500">
                    Once you click the login link, you'll have full access to MedAtlas Pro!
                  </p>
                </div>
              )}
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-5xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold mb-2 text-green-600">Welcome to MedAtlas Pro!</h1>
              <p className="text-gray-600 mb-6">You now have full access to all premium features.</p>
              
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-3 rounded-lg transition-all duration-200"
              >
                Go to Dashboard →
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-5xl mb-4">❌</div>
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
                  Need help? Email us at help@medatlas.com or join our{' '}
                  <a 
                    href="https://t.me/+666ywZFkke5lMjQx" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-red hover:underline"
                  >
                    community chat
                  </a>
                </p>
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