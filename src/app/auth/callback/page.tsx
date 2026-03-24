'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase client with detectSessionInUrl: true will automatically
        // exchange the URL hash/params for a session. We just need to verify it worked.
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setMessage('Authentication failed. Please try again.')
          return
        }

        if (session) {
          setStatus('success')
          setMessage('Successfully logged in! Redirecting...')

          const isPayment = searchParams.get('payment') === 'true'
          setTimeout(() => {
            router.push(isPayment ? '/dashboard' : '/')
          }, 1200)
        } else {
          // Session not yet available — listen for the auth state change
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (event === 'SIGNED_IN' && newSession) {
              setStatus('success')
              setMessage('Successfully logged in! Redirecting...')
              subscription.unsubscribe()

              const isPayment = searchParams.get('payment') === 'true'
              setTimeout(() => {
                router.push(isPayment ? '/dashboard' : '/')
              }, 1200)
            }
          })

          // Timeout fallback
          setTimeout(() => {
            subscription.unsubscribe()
            setStatus('error')
            setMessage('Login timed out. Please try again.')
          }, 10000)
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again.')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center px-4 max-w-md mx-auto">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Logging you in...</h1>
              <p className="text-gray-600">Please wait while we complete your authentication.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to MedStack!</h1>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
              <p className="text-gray-600 mb-6">{message}</p>

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/')}
                  className="block w-full bg-brand-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Try Again
                </button>

                <p className="text-sm text-gray-500">
                  Need help? Join our{' '}
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
