import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      )
    }

    // Get public profile data (excluding sensitive information)
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select(`
        id,
        username,
        display_name,
        stage,
        bio,
        location_city,
        location_state,
        undergraduate_school,
        medical_school,
        graduation_year,
        created_at
      `)
      .eq('username', username)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile
    })
  } catch (error) {
    console.error('Get public profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}