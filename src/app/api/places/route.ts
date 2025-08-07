import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const search = searchParams.get('search') || searchParams.get('q') || ''
    const type = searchParams.get('type')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    let query = supabaseAdmin.from('places').select('*')

    // Apply search filter
    if (search.trim()) {
      // Use Supabase text search with parameterized queries to prevent injection
      const sanitizedSearch = search.trim().replace(/[%_]/g, '\\$&') // Escape SQL wildcards
      query = query.or(`name.ilike.%${sanitizedSearch}%,location_city.ilike.%${sanitizedSearch}%,location_state.ilike.%${sanitizedSearch}%`)
    }

    // Apply type filter
    if (type) {
      query = query.eq('type', type)
    }

    // Apply pagination and ordering
    query = query
      .order('rank_overall', { ascending: false })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    const { data: places, error, count } = await query

    if (error) {
      console.error('Places fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch places' },
        { status: 500 }
      )
    }

    // Format the places data to match the expected structure
    const formattedPlaces = (places || []).map((place: any) => {
      // Parse JSON fields if they're stored as strings
      let metrics = {}
      let tags = []
      let scores = {}
      
      try {
        if (typeof place.metrics === 'string') {
          metrics = JSON.parse(place.metrics)
        } else if (place.metrics) {
          metrics = place.metrics
        }
      } catch (e) {
        metrics = {}
      }

      try {
        if (typeof place.tags === 'string') {
          tags = JSON.parse(place.tags)
        } else if (Array.isArray(place.tags)) {
          tags = place.tags
        }
      } catch (e) {
        tags = []
      }

      try {
        if (typeof place.scores === 'string') {
          scores = JSON.parse(place.scores)
        } else if (place.scores) {
          scores = place.scores
        }
      } catch (e) {
        scores = {}
      }

      return {
        id: place.id,
        slug: place.slug,
        name: place.name,
        type: place.type,
        institution: place.institution,
        city: place.location_city,
        state: place.location_state,
        country: place.location_country,
        location_city: place.location_city,
        location_state: place.location_state,
        location_country: place.location_country,
        lat: place.lat,
        lng: place.lng,
        photo_url: place.photo_url,
        tuition_in_state: (metrics as any).tuition || place.tuition_in_state,
        tuition_out_state: (metrics as any).tuition_out_state || place.tuition_out_state,
        mcat_avg: (metrics as any).mcat_avg || place.mcat_avg,
        gpa_avg: (metrics as any).gpa_avg || place.gpa_avg,
        acceptance_rate: (metrics as any).acceptance_rate || place.acceptance_rate,
        img_friendly: (metrics as any).img_friendly || place.img_friendly,
        usmle_step1_pass_rate: (metrics as any).usmle_step1_pass_rate,
        match_rate: (metrics as any).match_rate,
        rank_overall: place.rank_overall,
        tags: tags,
        metrics: metrics,
        scores: scores
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedPlaces,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })
  } catch (error) {
    console.error('Places API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch places' },
      { status: 500 }
    )
  }
}