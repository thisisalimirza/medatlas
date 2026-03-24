'use client'

import { useEffect } from 'react'
import Header from '@/components/Header'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center px-4">
          <div className="text-8xl mb-8">⚠️</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-md">
            Don't worry, even the best doctors encounter unexpected complications.
          </p>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center bg-brand-red text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                🔄 Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center justify-center bg-white text-gray-700 px-6 py-3 rounded-xl border-2 border-gray-300 hover:border-brand-red hover:text-brand-red transition-all duration-200 font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                🏠 Go Home
              </button>
            </div>
            
            <div className="mt-8 text-sm text-gray-500">
              <p>
                If this problem persists, email us at help@mymedstack.com
              </p>
            </div>
            
            {error.digest && (
              <div className="mt-4 text-xs text-gray-400">
                Error ID: {error.digest}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}