import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase-server'

// GET /api/favorites - Get user's favorite places
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!user.is_paid) {
      return NextResponse.json(
        { success: false, error: 'Paid membership required' },
        { status: 403 }
      )
    }

    // Get favorites with place details from Supabase
    const { data: favorites, error } = await supabaseAdmin
      .from('favorites')
      .select(`
        id,
        notes,
        application_deadline,
        created_at,
        places (
          id,
          name,
          location_city,
          location_state,
          location_country,
          type,
          tuition_in_state,
          tuition_out_state,
          mcat_avg,
          gpa_avg,
          acceptance_rate,
          img_friendly
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase favorites error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch favorites' },
        { status: 500 }
      )
    }

    const formattedFavorites = (favorites || []).map((fav: any) => ({
      favorite_id: fav.id,
      notes: fav.notes,
      application_deadline: fav.application_deadline,
      created_at: fav.created_at,
      place: fav.places
    }))

    return NextResponse.json({
      success: true,
      data: formattedFavorites
    })
  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

// POST /api/favorites - Add/update favorite
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!user.is_paid) {
      return NextResponse.json(
        { success: false, error: 'Paid membership required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { place_id, notes, application_deadline } = body

    if (!place_id) {
      return NextResponse.json(
        { success: false, error: 'place_id is required' },
        { status: 400 }
      )
    }

    // Check if place exists in Supabase
    const { data: place, error: placeError } = await supabaseAdmin
      .from('places')
      .select('id')
      .eq('id', place_id)
      .single()

    if (placeError || !place) {
      return NextResponse.json(
        { success: false, error: 'Place not found' },
        { status: 404 }
      )
    }

    // Check if already favorited
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('place_id', place_id)
      .single()

    const now = new Date().toISOString()

    if (existing && !existingError) {
      // Update existing favorite
      const { error: updateError } = await supabaseAdmin
        .from('favorites')
        .update({
          notes: notes || null,
          application_deadline: application_deadline || null,
          updated_at: now
        })
        .eq('id', existing.id)

      if (updateError) {
        console.error('Update favorite error:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to update favorite' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Favorite updated successfully',
        favorite_id: existing.id
      })
    } else {
      // Create new favorite
      const { data: newFavorite, error: createError } = await supabaseAdmin
        .from('favorites')
        .insert({
          user_id: user.id,
          place_id: place_id,
          notes: notes || null,
          application_deadline: application_deadline || null,
          created_at: now,
          updated_at: now
        })
        .select('id')
        .single()

      if (createError) {
        console.error('Create favorite error:', createError)
        return NextResponse.json(
          { success: false, error: 'Failed to add favorite' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Place added to favorites',
        favorite_id: newFavorite.id
      })
    }
  } catch (error) {
    console.error('Add favorite error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add favorite' },
      { status: 500 }
    )
  }
}

// DELETE /api/favorites?place_id=123 - Remove favorite
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!user.is_paid) {
      return NextResponse.json(
        { success: false, error: 'Paid membership required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const placeId = searchParams.get('place_id')

    if (!placeId) {
      return NextResponse.json(
        { success: false, error: 'place_id is required' },
        { status: 400 }
      )
    }

    // Remove favorite from Supabase
    const { error, count } = await supabaseAdmin
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('place_id', placeId)

    if (error) {
      console.error('Delete favorite error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to remove favorite' },
        { status: 500 }
      )
    }

    if (count === 0) {
      return NextResponse.json(
        { success: false, error: 'Favorite not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Favorite removed successfully'
    })
  } catch (error) {
    console.error('Remove favorite error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}