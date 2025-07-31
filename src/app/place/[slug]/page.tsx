'use client'

import { useEffect, useState } from 'react'
import { Place } from '@/types'
import PlaceModal from '@/components/PlaceModal'
import { useRouter } from 'next/navigation'

interface PlacePageProps {
  params: Promise<{ slug: string }>
}

export default function PlacePage({ params }: PlacePageProps) {
  const router = useRouter()
  const [place, setPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')

  useEffect(() => {
    params.then(({ slug }) => {
      setSlug(slug)
      fetchPlace(slug)
    })
  }, [params])

  const fetchPlace = async (slug: string) => {
    try {
      const response = await fetch(`/api/places/${slug}`)
      const data = await response.json()
      
      if (data.success) {
        setPlace(data.data)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching place:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PlaceModal
        place={place}
        isOpen={true}
        onClose={handleClose}
      />
    </div>
  )
}