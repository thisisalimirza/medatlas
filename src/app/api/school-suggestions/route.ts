import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase-server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      school_name, 
      school_type, 
      location_city, 
      location_state, 
      website_url, 
      additional_info 
    } = body

    // Validate required fields
    if (!school_name || !school_type) {
      return NextResponse.json(
        { success: false, error: 'School name and type are required' },
        { status: 400 }
      )
    }

    if (!['undergraduate', 'medical'].includes(school_type)) {
      return NextResponse.json(
        { success: false, error: 'School type must be undergraduate or medical' },
        { status: 400 }
      )
    }

    // Check for duplicate suggestions from the same user
    const { data: existingSuggestion } = await supabaseAdmin
      .from('school_suggestions')
      .select('id')
      .eq('user_id', user.id)
      .eq('school_name', school_name)
      .eq('school_type', school_type)
      .eq('status', 'pending')
      .single()

    if (existingSuggestion) {
      return NextResponse.json(
        { success: false, error: 'You have already suggested this school' },
        { status: 409 }
      )
    }

    // Create the suggestion
    const { data: suggestion, error } = await supabaseAdmin
      .from('school_suggestions')
      .insert({
        user_id: user.id,
        school_name: school_name.trim(),
        school_type,
        location_city: location_city?.trim() || null,
        location_state: location_state?.trim() || null,
        website_url: website_url?.trim() || null,
        additional_info: additional_info?.trim() || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating school suggestion:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to submit suggestion' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      suggestion
    })

  } catch (error) {
    console.error('School suggestion error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    let query = supabaseAdmin
      .from('school_suggestions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status)
    }

    const { data: suggestions, error } = await query

    if (error) {
      console.error('Error fetching school suggestions:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch suggestions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      suggestions
    })

  } catch (error) {
    console.error('School suggestion fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}