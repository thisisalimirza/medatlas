import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const search = searchParams.get('search') || searchParams.get('q') || ''
    const type = searchParams.get('type')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    let query = ''
    let params: any[] = []

    if (search.trim()) {
      // Use FTS5 search
      query = `
        SELECT p.*, 
          json_extract(p.metrics, '$.tuition') as tuition_in_state,
          json_extract(p.metrics, '$.tuition_out_state') as tuition_out_state,
          json_extract(p.metrics, '$.mcat_avg') as mcat_avg,
          json_extract(p.metrics, '$.gpa_avg') as gpa_avg,
          json_extract(p.metrics, '$.acceptance_rate') as acceptance_rate,
          json_extract(p.metrics, '$.img_friendly') as img_friendly,
          json_extract(p.metrics, '$.usmle_step1_pass_rate') as usmle_step1_pass_rate,
          json_extract(p.metrics, '$.match_rate') as match_rate
        FROM places p
        JOIN place_search ps ON p.id = ps.rowid
        WHERE place_search MATCH ?
      `
      params.push(search)
    } else {
      // Regular query
      query = `
        SELECT p.*,
          json_extract(p.metrics, '$.tuition') as tuition_in_state,
          json_extract(p.metrics, '$.tuition_out_state') as tuition_out_state,
          json_extract(p.metrics, '$.mcat_avg') as mcat_avg,
          json_extract(p.metrics, '$.gpa_avg') as gpa_avg,
          json_extract(p.metrics, '$.acceptance_rate') as acceptance_rate,
          json_extract(p.metrics, '$.img_friendly') as img_friendly,
          json_extract(p.metrics, '$.usmle_step1_pass_rate') as usmle_step1_pass_rate,
          json_extract(p.metrics, '$.match_rate') as match_rate
        FROM places p
        WHERE 1=1
      `
    }

    if (type) {
      query += ' AND p.type = ?'
      params.push(type)
    }

    query += ' ORDER BY p.rank_overall DESC, p.name ASC'
    query += ' LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const places = db.prepare(query).all(...params)

    // Get total count
    let countQuery = ''
    let countParams: any[] = []

    if (search.trim()) {
      countQuery = `
        SELECT COUNT(*) as total
        FROM places p
        JOIN place_search ps ON p.id = ps.rowid
        WHERE place_search MATCH ?
      `
      countParams.push(search)
    } else {
      countQuery = 'SELECT COUNT(*) as total FROM places WHERE 1=1'
    }

    if (type) {
      countQuery += ' AND type = ?'
      countParams.push(type)
    }

    const totalResult = db.prepare(countQuery).get(...countParams) as { total: number }
    const total = totalResult.total

    // Format the places data
    const formattedPlaces = places.map((place: any) => ({
      id: place.id,
      slug: place.slug,
      name: place.name,
      type: place.type,
      institution: place.institution,
      city: place.city,
      state: place.state,
      country: place.country,
      location_city: place.city,
      location_state: place.state,
      location_country: place.country,
      lat: place.lat,
      lng: place.lng,
      photo_url: place.photo_url,
      tags: JSON.parse(place.tags || '[]'),
      rank_overall: place.rank_overall,
      metrics: JSON.parse(place.metrics || '{}'),
      scores: JSON.parse(place.scores || '{}'),
      tuition_in_state: place.tuition_in_state,
      tuition_out_state: place.tuition_out_state,
      mcat_avg: place.mcat_avg,
      gpa_avg: place.gpa_avg,
      acceptance_rate: place.acceptance_rate,
      img_friendly: Boolean(place.img_friendly),
      usmle_step1_pass_rate: place.usmle_step1_pass_rate,
      match_rate: place.match_rate,
      created_at: place.created_at,
      updated_at: place.updated_at
    }))

    return NextResponse.json({
      success: true,
      data: formattedPlaces,
      meta: {
        total,
        limit,
        offset,
        hasMore: (offset + limit) < total
      }
    })
  } catch (error) {
    console.error('Error fetching places:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch places' },
      { status: 500 }
    )
  }
}