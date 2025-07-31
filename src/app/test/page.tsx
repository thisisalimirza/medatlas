'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'

export default function TestPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await fetch('/api/debug')
        const data = await response.json()
        setDebugInfo(data)
      } catch (error) {
        setDebugInfo({ error: error?.toString() })
      } finally {
        setLoading(false)
      }
    }
    
    testAPI()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        searchQuery=""
        onSearchChange={() => {}}
        isFiltersSidebarOpen={false}
        onToggleFiltersSidebar={() => {}}
      />
      
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">🧪 MedAtlas Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Basic Info</h2>
          <p className="mb-2">✅ Next.js routing is working</p>
          <p className="mb-2">✅ React components are rendering</p>
          <p className="mb-4">✅ TailwindCSS is loading</p>
          <p className="text-sm text-gray-600">
            If you can see this page, the basic Next.js app is deployed correctly.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">API & Database Test</h2>
          
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              <span>Testing API connection...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {debugInfo?.success ? (
                <div className="space-y-3">
                  <p className="text-green-600 font-medium">✅ Debug API is working</p>
                  
                  <div>
                    <h3 className="font-medium mb-2">Environment Variables:</h3>
                    <ul className="text-sm space-y-1">
                      <li>NEXT_PUBLIC_SUPABASE_URL: {debugInfo.envVariables?.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}</li>
                      <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {debugInfo.envVariables?.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'}</li>
                      <li>SUPABASE_SERVICE_ROLE_KEY: {debugInfo.envVariables?.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌'}</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Supabase Connection:</h3>
                    <ul className="text-sm space-y-1">
                      <li>Connected: {debugInfo.supabase?.connected ? '✅' : '❌'}</li>
                      <li>Places Count: {debugInfo.supabase?.placesCount || 0}</li>
                      {debugInfo.supabase?.error && (
                        <li className="text-red-600">Error: {debugInfo.supabase.error}</li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                    <details>
                      <summary className="cursor-pointer font-medium">Raw Debug Data</summary>
                      <pre className="mt-2 overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
                    </details>
                  </div>
                </div>
              ) : (
                <div className="text-red-600">
                  <p className="font-medium">❌ API Error</p>
                  <p className="text-sm mt-2">Error: {debugInfo?.error || 'Unknown error'}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          <div className="space-y-2 text-sm">
            <p><strong>If environment variables are missing:</strong> Add them in Vercel dashboard</p>
            <p><strong>If Supabase connection fails:</strong> Check your Supabase project status</p>
            <p><strong>If places count is 0:</strong> Run the data migration script</p>
          </div>
        </div>
      </div>
    </div>
  )
}