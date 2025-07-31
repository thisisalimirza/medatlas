'use client'

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-4xl mb-4">🏥</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">MedAtlas</h1>
          <p className="text-gray-600 mb-6">Medical School Discovery Platform</p>
          
          <div className="space-y-3 text-left text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Next.js deployment successful</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Vercel hosting active</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Basic routing working</span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <a 
              href="/test" 
              className="block w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
            >
              🧪 Run Diagnostics
            </a>
            <a 
              href="/" 
              className="block w-full border border-red-600 text-red-600 py-2 px-4 rounded hover:bg-red-50 transition-colors"
            >
              🏠 Try Main App
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}