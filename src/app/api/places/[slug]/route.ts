import { NextRequest, NextResponse } from 'next/server'
import { getPlaceBySlug } from '@/lib/seed'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const place = getPlaceBySlug(slug)

    if (!place) {
      return NextResponse.json(
        { success: false, error: 'Place not found' },
        { status: 404 }
      )
    }

    // Add mock data for tabs that aren't in seed data
    const placeWithMockData = {
      ...place,
      guide: {
        overview: `${place.name} is located in ${place.city}, ${place.state}. Known for its ${place.tags.includes('research-heavy') ? 'research excellence' : 'clinical training'}.`,
        curriculum: 'Traditional 4-year curriculum with integrated clinical experiences.',
        rotations: 'Core rotations in internal medicine, surgery, pediatrics, obstetrics/gynecology, psychiatry, and family medicine.',
        residencyMatching: `Strong match rates with ${place.scores.match_strength}/10 match strength score.`
      },
      prosAndCons: {
        pros: [
          place.tags.includes('urban') ? 'Urban location with diverse patient population' : 'Quieter suburban environment',
          place.scores.quality_of_training >= 8 ? 'Excellent clinical training' : 'Solid clinical foundation',
          place.metrics.tuition === 0 ? 'Tuition-free education' : (place.metrics.tuition || 0) < 40000 ? 'Affordable tuition' : 'Comprehensive financial aid',
        ],
        cons: [
          place.scores.burnout >= 6 ? 'Higher stress environment' : 'Moderate workload',
          (place.metrics.col_index || 0) > 3500 ? 'High cost of living' : 'Manageable living costs',
          place.scores.community_score < 7 ? 'Less community support' : 'Competitive peer environment'
        ]
      }
    }

    return NextResponse.json({
      success: true,
      data: placeWithMockData
    })
  } catch (error) {
    console.error('Error fetching place:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch place' },
      { status: 500 }
    )
  }
}