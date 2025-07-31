import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/database'

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

    // Get favorites with place details
    const favorites = db.prepare(`
      SELECT 
        f.id as favorite_id,
        f.notes,
        f.application_deadline,
        f.created_at,
        p.id,
        p.name,
        p.city,
        p.state,
        p.country,
        p.type,
        p.metrics
      FROM favorites f
      JOIN places p ON f.place_id = p.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `).all(user.id)

    const formattedFavorites = favorites.map((fav: any) => {
      // Parse metrics to get additional data
      let metrics = {}
      try {
        metrics = JSON.parse(fav.metrics || '{}')
      } catch (e) {
        metrics = {}
      }

      return {
        favorite_id: fav.favorite_id,
        notes: fav.notes,
        application_deadline: fav.application_deadline,
        created_at: fav.created_at,
        place: {
          id: fav.id,
          name: fav.name,
          location_city: fav.city,
          location_state: fav.state,
          location_country: fav.country,
          type: fav.type,
          tuition_in_state: (metrics as any).tuition_in_state,
          tuition_out_state: (metrics as any).tuition_out_state,
          mcat_avg: (metrics as any).mcat_avg,
          gpa_avg: (metrics as any).gpa_avg,
          acceptance_rate: (metrics as any).acceptance_rate,
          img_friendly: Boolean((metrics as any).img_friendly)
        }
      }
    })

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

    // Check if place exists
    const place = db.prepare('SELECT id FROM places WHERE id = ?').get(place_id)
    if (!place) {
      return NextResponse.json(
        { success: false, error: 'Place not found' },
        { status: 404 }
      )
    }

    // Check if already favorited
    const existing = db.prepare(`
      SELECT id FROM favorites WHERE user_id = ? AND place_id = ?
    `).get(user.id, place_id) as { id: number } | undefined

    const now = new Date().toISOString()

    if (existing) {
      // Update existing favorite
      db.prepare(`
        UPDATE favorites 
        SET notes = ?, application_deadline = ?, updated_at = ?
        WHERE user_id = ? AND place_id = ?
      `).run(notes || null, application_deadline || null, now, user.id, place_id)

      return NextResponse.json({
        success: true,
        message: 'Favorite updated successfully',
        favorite_id: existing.id
      })
    } else {
      // Create new favorite
      const result = db.prepare(`
        INSERT INTO favorites (user_id, place_id, notes, application_deadline, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(user.id, place_id, notes || null, application_deadline || null, now, now)

      return NextResponse.json({
        success: true,
        message: 'Place added to favorites',
        favorite_id: result.lastInsertRowid
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

    // Remove favorite
    const result = db.prepare(`
      DELETE FROM favorites WHERE user_id = ? AND place_id = ?
    `).run(user.id, placeId)

    if (result.changes === 0) {
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