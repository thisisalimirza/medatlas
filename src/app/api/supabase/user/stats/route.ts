import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()
    
    // Get user stats
    const { data: stats, error } = await supabase
      .from('user_stats')
      .select('mcat, gpa, state, research_months, clinical_hours, volunteer_hours, shadowing_hours, leadership, publications, specialty_interest')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Get user stats error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to get user stats' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: stats || {}
    })
  } catch (error) {
    console.error('Get user stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get user stats' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      mcat,
      gpa,
      state,
      research_months = 0,
      clinical_hours = 0,
      volunteer_hours = 0,
      shadowing_hours = 0,
      leadership = false,
      publications = 0,
      specialty_interest = ''
    } = body

    // Validate required fields
    if (!mcat || !gpa) {
      return NextResponse.json(
        { success: false, error: 'MCAT and GPA are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Upsert user stats (insert or update if exists)
    const { error } = await supabase
      .from('user_stats')
      .upsert({
        user_id: user.id,
        mcat,
        gpa,
        state,
        research_months,
        clinical_hours,
        volunteer_hours,
        shadowing_hours,
        leadership,
        publications,
        specialty_interest,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('Update user stats error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update stats' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Stats updated successfully'
    })
  } catch (error) {
    console.error('Update user stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update stats' },
      { status: 500 }
    )
  }
}