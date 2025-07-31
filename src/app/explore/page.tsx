'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ExplorePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page since this is the main explore page
    router.replace('/')
  }, [router])

  return null
}