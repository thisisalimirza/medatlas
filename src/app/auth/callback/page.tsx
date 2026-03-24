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
        console.log('Auth callback: Processing magic link...')
        
        // Get the current URL with all parameters
        const url = new URL(window.location.href)
        const accessToken = url.searchParams.get('access_token')
        const refreshToken = url.searchParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          console.log('Auth callback: Found tokens in URL, setting session...')
          
          // Set the session using the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (error) {
            console.error('Auth callback error setting session:', error)
            setStatus('error')
            setMessage('Authentication failed. Please try again.')
            return
          }
          
          if (data.session) {
            console.log('Auth callback: Session set successfully')
            setStatus('success')
            setMessage('Successfully logged in! Redirecting...')
            
            // Check if this was a payment flow
            const isPayment = searchParams.get('payment') === 'true'
            
            // Redirect after a brief success message
            setTimeout(() => {
              if (isPayment) {
                router.push('/dashboard')
              } else {
                router.push('/')
              }
            }, 1500)
          } else {
            console.error('Auth callback: No session created despite tokens')
            setStatus('error')
            setMessage('Authentication failed. Please try again.')
          }
        } else {
          console.log('Auth callback: No tokens in URL, checking existing session...')
          
          // Try to get existing session
          const { data, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('Auth callback error getting session:', error)
            setStatus('error')
            setMessage('Authentication failed. Please try again.')
            return
          }
          
          if (data.session) {
            console.log('Auth callback: Found existing session')
            setStatus('success')
            setMessage('Already logged in! Redirecting...')
            
            setTimeout(() => {
              router.push('/')
            }, 1000)
          } else {
            console.error('Auth callback: No session found')
            setStatus('error')
            setMessage('No valid session found. Please try logging in again.')
          }
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to MedAtlas!</h1>
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