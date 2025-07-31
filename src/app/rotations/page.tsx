'use client'

import Header from '@/components/Header'

export default function RotationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className="text-center">
        <div className="text-6xl mb-4">🏥</div>
        <h1 className="text-3xl font-bold mb-4">Rotation Sites</h1>
        <p className="text-gray-600 mb-6">Coming soon - Explore clinical rotation opportunities</p>
        <a 
          href="/"
          className="btn-red inline-block"
        >
          ← Back to Explore
        </a>
      </div>
      </div>
    </div>
  )
}