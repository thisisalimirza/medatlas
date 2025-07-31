import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

async function getUser() {
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
    
    // Get user's school list with place details
    const { data: schoolList, error } = await supabase
      .from('school_list')
      .select(`
        *,
        places:place_id (
          id,
          name,
          city,
          state,
          metrics
        )
      `)
      .eq('user_id', user.id)
      .order('added_date', { ascending: false })

    if (error) {
      console.error('Get school list error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to get school list' },
        { status: 500 }
      )
    }

    // Format the response to match the expected structure
    const formattedList = schoolList?.map(item => ({
      id: item.id,
      school_name: (item.places as any)?.name || 'Unknown School',
      city: (item.places as any)?.city,
      state: (item.places as any)?.state,
      category: item.category,
      acceptance_odds: item.acceptance_odds,
      notes: item.notes,
      application_status: item.application_status,
      added_date: item.added_date
    })) || []

    return NextResponse.json({
      success: true,
      data: formattedList
    })
  } catch (error) {
    console.error('Get school list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get school list' },
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
    const { place_id, category, notes = '' } = body

    if (!place_id || !category) {
      return NextResponse.json(
        { success: false, error: 'Place ID and category are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get user stats and school data for acceptance odds calculation
    const [userStatsResult, schoolResult] = await Promise.all([
      supabase
        .from('user_stats')
        .select('mcat, gpa')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('places')
        .select('metrics')
        .eq('id', place_id)
        .single()
    ])

    let acceptanceOdds = 0
    if (userStatsResult.data && schoolResult.data && userStatsResult.data.mcat && userStatsResult.data.gpa) {
      // Parse school metrics
      const schoolMetrics = schoolResult.data.metrics || {}
      const mcatAvg = schoolMetrics.mcat_avg || 500
      const gpaAvg = schoolMetrics.gpa_avg || 3.0
      const acceptanceRate = schoolMetrics.acceptance_rate || 5
      
      // Simple algorithm to calculate odds
      const mcatDiff = (userStatsResult.data.mcat - mcatAvg) / 28 // Normalize to ~-1 to 1
      const gpaDiff = (userStatsResult.data.gpa - gpaAvg) / 1.0 // Normalize to ~-3 to 1
      
      // Adjust base rate based on stats
      const adjustment = (mcatDiff + gpaDiff) * 20 // Can adjust odds by up to ±40%
      acceptanceOdds = Math.max(1, Math.min(95, acceptanceRate + adjustment))
    }

    // Check if already in list
    const { data: existing } = await supabase
      .from('school_list')
      .select('id')
      .eq('user_id', user.id)
      .eq('place_id', place_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'School already in your list' },
        { status: 400 }
      )
    }

    // Add to school list
    const { data: result, error } = await supabase
      .from('school_list')
      .insert({
        user_id: user.id,
        place_id,
        category,
        acceptance_odds: Math.round(acceptanceOdds),
        notes
      })
      .select('id')
      .single()

    if (error) {
      console.error('Add to school list error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to add to school list' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        acceptance_odds: Math.round(acceptanceOdds)
      }
    })
  } catch (error) {
    console.error('Add to school list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add to school list' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, application_status, notes, category } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'School list ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString()
    }
    
    if (application_status) updates.application_status = application_status
    if (notes !== undefined) updates.notes = notes
    if (category) updates.category = category

    // Update school list entry
    const { error } = await supabase
      .from('school_list')
      .update(updates)
      .eq('user_id', user.id)
      .eq('id', id)

    if (error) {
      console.error('Update school list error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update school list' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'School list updated successfully'
    })
  } catch (error) {
    console.error('Update school list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update school list' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'School list ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Remove from school list
    const { error } = await supabase
      .from('school_list')
      .delete()
      .eq('user_id', user.id)
      .eq('id', id)

    if (error) {
      console.error('Remove from school list error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to remove from school list' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'School removed from list'
    })
  } catch (error) {
    console.error('Remove from school list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove from school list' },
      { status: 500 }
    )
  }
}