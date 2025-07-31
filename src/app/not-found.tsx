import Link from 'next/link'
import Header from '@/components/Header'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center px-4">
          <div className="text-8xl mb-8">🏥</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-md">
            Looks like this page took a wrong turn in the hospital corridors.
          </p>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-brand-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                🏠 Go Home
              </Link>
              <Link
                href="/explore"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                🧭 Explore Schools
              </Link>
            </div>
            
            <div className="mt-8 text-sm text-gray-500">
              <p>
                Need help? Join our{' '}
                <a 
                  href="https://t.me/+666ywZFkke5lMjQx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-red hover:underline"
                >
                  community chat
                </a>
                {' '}or check our{' '}
                <Link href="/faq" className="text-brand-red hover:underline">
                  FAQ
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}