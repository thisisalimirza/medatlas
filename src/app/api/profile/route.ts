import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Helper function to get current user from Supabase
async function getCurrentUserFromSupabase() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('sb-access-token')?.value
    
    if (!session) return null

    const { data: { user }, error } = await supabase.auth.getUser(session)
    if (error || !user) return null

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) return null
    return profile
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromSupabase()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: user
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUserFromSupabase()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      display_name,
      username,
      stage,
      bio,
      location_city,
      location_state,
      undergraduate_school,
      medical_school,
      graduation_year
    } = body

    // Validate username if provided
    if (username) {
      // Check if username is already taken by another user
      const { data: existingUser, error: usernameError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', username)
        .neq('id', user.id)
        .single()

      if (existingUser && !usernameError) {
        return NextResponse.json(
          { success: false, error: 'Username is already taken' },
          { status: 400 }
        )
      }

      // Validate username format
      const usernameRegex = /^[a-zA-Z0-9_-]+$/
      if (!usernameRegex.test(username)) {
        return NextResponse.json(
          { success: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' },
          { status: 400 }
        )
      }

      if (username.length < 3 || username.length > 30) {
        return NextResponse.json(
          { success: false, error: 'Username must be between 3 and 30 characters' },
          { status: 400 }
        )
      }
    }

    // Update user profile
    const updateData = {
      display_name,
      username,
      stage,
      bio,
      location_city,
      location_state,
      undergraduate_school,
      medical_school,
      graduation_year,
      updated_at: new Date().toISOString()
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData]
      }
    })

    const { data: updatedProfile, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}