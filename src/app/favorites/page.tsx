'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function FavoritesPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard since favorites are part of the dashboard
    router.replace('/dashboard')
  }, [router])

  return null
}