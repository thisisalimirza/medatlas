import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { slug } = await params

    // Query Supabase for the place by slug
    const { data: place, error } = await supabaseAdmin
      .from('places')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !place) {
      console.error('Place not found:', error)
      return NextResponse.json(
        { success: false, error: 'Place not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields if they exist (handle both string and object cases)
    const parsedPlace = {
      ...place,
      tags: place.tags ? (Array.isArray(place.tags) ? place.tags : (typeof place.tags === 'string' ? JSON.parse(place.tags) : place.tags)) : [],
      metrics: place.metrics ? (typeof place.metrics === 'string' ? JSON.parse(place.metrics) : place.metrics) : {},
      scores: place.scores ? (typeof place.scores === 'string' ? JSON.parse(place.scores) : place.scores) : {}
    }

    // Add mock data for tabs that aren't in database
    const placeWithMockData = {
      ...parsedPlace,
      guide: {
        overview: `${place.name} is located in ${place.location_city}, ${place.location_state}. Known for its ${parsedPlace.tags.includes('research-heavy') ? 'research excellence' : 'clinical training'}.`,
        curriculum: 'Traditional 4-year curriculum with integrated clinical experiences.',
        rotations: 'Core rotations in internal medicine, surgery, pediatrics, obstetrics/gynecology, psychiatry, and family medicine.',
        residencyMatching: `Strong match rates with ${parsedPlace.scores.match_strength || 8}/10 match strength score.`
      },
      prosAndCons: {
        pros: [
          parsedPlace.tags.includes('urban') ? 'Urban location with diverse patient population' : 'Quieter suburban environment',
          (parsedPlace.scores.quality_of_training || 7) >= 8 ? 'Excellent clinical training' : 'Solid clinical foundation',
          (parsedPlace.metrics.tuition || place.tuition_in_state || 0) === 0 ? 'Tuition-free education' : (parsedPlace.metrics.tuition || place.tuition_in_state || 0) < 40000 ? 'Affordable tuition' : 'Comprehensive financial aid',
        ],
        cons: [
          (parsedPlace.scores.burnout || 4) >= 6 ? 'Higher stress environment' : 'Moderate workload',
          (parsedPlace.metrics.col_index || 2500) > 3500 ? 'High cost of living' : 'Manageable living costs',
          (parsedPlace.scores.community_score || 7) < 7 ? 'Less community support' : 'Competitive peer environment'
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