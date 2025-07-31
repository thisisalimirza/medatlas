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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={reset}
                className="bg-brand-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                🔄 Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                🏠 Go Home
              </button>
            </div>
            
            <div className="mt-8 text-sm text-gray-500">
              <p>
                If this problem persists, please contact us via{' '}
                <a 
                  href="https://t.me/+666ywZFkke5lMjQx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-red hover:underline"
                >
                  community chat
                </a>
                {' '}or email help@medatlas.com
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