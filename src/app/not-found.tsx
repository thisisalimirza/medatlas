import Link from 'next/link'
import Header from '@/components/Header'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center px-4 max-w-lg">
          <div className="text-8xl mb-6">🏥</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Page Not Found</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Looks like this page took a wrong turn in the hospital corridors.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-brand-red text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              🏠 Go Home
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center bg-white text-gray-700 px-6 py-3 rounded-xl border-2 border-gray-300 hover:border-brand-red hover:text-brand-red transition-all duration-200 font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              🧭 Explore Schools
            </Link>
          </div>

          <div className="mt-10 text-sm text-gray-500">
            <p>
              Need help? Join our{' '}
              <a
                href="https://t.me/+666ywZFkke5lMjQx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-red hover:underline font-medium"
              >
                community chat
              </a>
              {' '}or check our{' '}
              <Link href="/faq" className="text-brand-red hover:underline font-medium">
                FAQ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
