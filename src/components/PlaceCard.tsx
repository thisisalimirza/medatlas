'use client'

import { Place } from '@/types'
import Image from 'next/image'

interface PlaceCardProps {
  place: Place
  onClick: () => void
}

export default function PlaceCard({ place, onClick }: PlaceCardProps) {
  const formatTuition = (tuition: number) => {
    if (tuition === 0) return 'Free'
    return `$${(tuition / 1000).toFixed(0)}K/yr`
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500'
    if (score >= 6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getWorkloadIndicator = (burnout: number) => {
    const level = Math.ceil((10 - burnout) / 2.5)
    return '📶'.repeat(Math.max(1, Math.min(4, level)))
  }

  // Sample medical school images from Unsplash with proper attribution
  const getSampleImage = (placeName: string) => {
    const medicalImages = [
      { 
        url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        credit: 'Photo by Martha Dominguez de Gouveia on Unsplash'
      },
      { 
        url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
        credit: 'Photo by National Cancer Institute on Unsplash'
      },
      { 
        url: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        credit: 'Photo by Hush Naidoo Jade Photography on Unsplash'
      },
      { 
        url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2274&q=80',
        credit: 'Photo by Piron Guillaume on Unsplash'
      },
      { 
        url: 'https://images.unsplash.com/photo-1581594549595-35f6edc7b762?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        credit: 'Photo by Olga Guryanova on Unsplash'
      },
      { 
        url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2128&q=80',
        credit: 'Photo by Online Marketing on Unsplash'
      }
    ]
    
    // Use place name to consistently select same image for same place
    const hash = placeName.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return medicalImages[hash % medicalImages.length]
  }

  const sampleImage = getSampleImage(place.name)
  
  // Check if photo_url is a valid, non-placeholder URL
  const isValidPhotoUrl = place.photo_url && 
    !place.photo_url.includes('example.com') && 
    !place.photo_url.includes('placeholder') &&
    place.photo_url.startsWith('http')
  
  const imageUrl = isValidPhotoUrl ? place.photo_url! : sampleImage.url
  const shouldShowCredit = !isValidPhotoUrl

  return (
    <div 
      className="relative card cursor-pointer group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
      onClick={onClick}
    >
      {/* Rank Badge - Top Left */}
      <div className="absolute top-3 left-3 z-10 bg-black bg-opacity-75 text-white rounded-full px-2 py-1 text-xs font-bold">
        #{place.rank_overall ? Math.round(place.rank_overall * 10) : '?'}
      </div>

      {/* Quick Stats - Top Right */}
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-1">
        <div className="bg-black bg-opacity-75 text-white rounded-full px-2 py-1 text-xs flex items-center space-x-1">
          <span>⭐</span>
          <span>{place.scores.quality_of_training}</span>
        </div>
      </div>

      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <Image
          src={imageUrl}
          alt={place.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Photo credit - top right, like nomad */}
        {shouldShowCredit && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            📷 {sampleImage.credit.split(' by ')[1].split(' on')[0]}
          </div>
        )}
        
        {/* Location label overlay - bottom of image */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg drop-shadow-lg">
            {place.name}
          </h3>
          <p className="text-white/90 text-sm drop-shadow">
            {place.city}, {place.state}
          </p>
        </div>
      </div>

      {/* Content - Simplified like nomad style */}
      <div className="p-4">
        {/* Key metrics row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">Training</span>
              <div className={`w-2 h-2 rounded-full ${getScoreColor(place.scores.quality_of_training)}`}></div>
              <span className="text-xs font-semibold">{place.scores.quality_of_training}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">Match</span>
              <div className={`w-2 h-2 rounded-full ${getScoreColor(place.scores.match_strength)}`}></div>
              <span className="text-xs font-semibold">{place.scores.match_strength}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-brand-red">
              {formatTuition(place.metrics.tuition || 0)}
            </div>
            <div className="text-xs text-gray-500">
              /year
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <span>📍 {place.institution}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>COL:</span>
            <span className="font-medium">${Math.round(place.metrics.col_index || 0)}/mo</span>
          </div>
        </div>

        {/* Key tags - max 2, medical focused */}
        <div className="flex flex-wrap gap-1 mt-3">
          {place.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
              {tag.replace('-', ' ')}
            </span>
          ))}
          {place.img_friendly && (
            <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              IMG Friendly
            </span>
          )}
        </div>
      </div>
    </div>
  )
}