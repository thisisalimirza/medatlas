'use client'

import { useAuth } from '@/contexts/SupabaseAuthContext'

export default function AuthDebug() {
  const { user, session, loading } = useAuth()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-3 rounded-lg text-xs font-mono max-w-xs z-50">
      <div className="font-bold mb-2">Auth Debug:</div>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>Session: {session ? 'exists' : 'null'}</div>
      <div>User: {user ? `${user.email} (paid: ${user.is_paid})` : 'null'}</div>
      <div>State: {loading ? 'loading' : user ? 'authenticated' : 'unauthenticated'}</div>
    </div>
  )
}