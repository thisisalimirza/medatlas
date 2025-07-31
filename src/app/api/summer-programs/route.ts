import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const search = searchParams.get('search') || ''
    const institution = searchParams.get('institution') || ''
    const deadline = searchParams.get('deadline') || ''
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    let query = supabaseAdmin
      .from('summer_programs')
      .select('*', { count: 'exact' })

    // Apply search filter across multiple fields
    if (search.trim()) {
      query = query.or(`program_name.ilike.%${search}%,host_institution.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply institution filter
    if (institution.trim()) {
      query = query.ilike('host_institution', `%${institution}%`)
    }

    // Apply deadline filter
    if (deadline.trim()) {
      query = query.ilike('application_deadline', `%${deadline}%`)
    }

    // Apply pagination and ordering
    query = query
      .order('program_name', { ascending: true })
      .range(offset, offset + limit - 1)

    const { data: programs, error, count } = await query

    if (error) {
      console.error('Summer programs fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch summer programs' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: programs || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })
  } catch (error) {
    console.error('Summer programs API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch summer programs' },
      { status: 500 }
    )
  }
}