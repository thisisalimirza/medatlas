import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        stage: user.stage,
        is_paid: user.is_paid,
        bio: user.bio,
        location_city: user.location_city,
        location_state: user.location_state,
        undergraduate_school: user.undergraduate_school,
        medical_school: user.medical_school,
        graduation_year: user.graduation_year,
        created_at: user.created_at
      }
    })

  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}