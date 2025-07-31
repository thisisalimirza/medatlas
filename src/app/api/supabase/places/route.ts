import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const search = searchParams.get('search') || searchParams.get('q') || ''
    const type = searchParams.get('type')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    const supabase = createServerClient()
    
    let query = supabase
      .from('places')
      .select('*')
      .range(offset, offset + limit - 1)

    // Apply type filter if specified
    if (type) {
      query = query.eq('type', type)
    }

    // Apply search if specified
    if (search.trim()) {
      // Use PostgreSQL full-text search
      query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,institution.ilike.%${search}%`)
    }

    const { data: places, error } = await query

    if (error) {
      console.error('Supabase places query error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch places' },
        { status: 500 }
      )
    }

    // Format the response to match the expected structure
    const formattedPlaces = places?.map(place => ({
      id: place.id,
      slug: place.slug,
      name: place.name,
      type: place.type,
      institution: place.institution,
      city: place.city,
      state: place.state,
      country: place.country,
      lat: place.lat,
      lng: place.lng,
      photo_url: place.photo_url,
      tags: place.tags || [],
      rank_overall: place.rank_overall,
      scores: place.scores || {},
      metrics: place.metrics || {},
      // Extract common metrics for compatibility
      tuition_in_state: place.metrics?.tuition_in_state,
      tuition_out_state: place.metrics?.tuition_out_state,
      mcat_avg: place.metrics?.mcat_avg,
      gpa_avg: place.metrics?.gpa_avg,
      acceptance_rate: place.metrics?.acceptance_rate,
      match_rate: place.metrics?.match_rate,
      img_friendly: place.metrics?.img_friendly || false,
      created_at: place.created_at,
      updated_at: place.updated_at
    })) || []

    return NextResponse.json({
      success: true,
      data: formattedPlaces,
      total: formattedPlaces.length,
      page: Math.floor(offset / limit) + 1,
      per_page: limit
    })
  } catch (error) {
    console.error('Places API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}