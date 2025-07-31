import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/database'

// GET /api/reviews?place_id=123
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const placeId = searchParams.get('place_id')

    if (!placeId) {
      return NextResponse.json(
        { success: false, error: 'place_id is required' },
        { status: 400 }
      )
    }

    // Get reviews with user info (but keep anonymous)
    const reviews = db.prepare(`
      SELECT 
        r.id,
        r.rating,
        r.tags,
        r.body,
        r.is_anonymous,
        r.created_at,
        r.updated_at,
        u.stage,
        u.display_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.place_id = ?
      ORDER BY r.created_at DESC
    `).all(placeId)

    // Parse JSON fields and format for frontend
    const formattedReviews = reviews.map((review: any) => ({
      id: review.id,
      rating: review.rating,
      tags: JSON.parse(review.tags || '[]'),
      body: review.body,
      is_anonymous: Boolean(review.is_anonymous),
      created_at: review.created_at,
      updated_at: review.updated_at,
      author: {
        stage: review.stage,
        display_name: review.is_anonymous ? null : review.display_name
      }
    }))

    // Calculate review stats
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews 
      : 0

    return NextResponse.json({
      success: true,
      data: {
        reviews: formattedReviews,
        stats: {
          total: totalReviews,
          average_rating: Math.round(averageRating * 10) / 10
        }
      }
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create or update review
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
        { success: false, error: 'Paid membership required to post reviews' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { place_id, rating, tags, review_body, is_anonymous } = body

    // Validation
    if (!place_id || !rating || !review_body) {
      return NextResponse.json(
        { success: false, error: 'place_id, rating, and review_body are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (review_body.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Review must be at least 10 characters' },
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

    // Check if user already reviewed this place
    const existingReview = db.prepare(`
      SELECT id FROM reviews WHERE user_id = ? AND place_id = ?
    `).get(user.id, place_id) as { id: number } | undefined

    const tagsJson = JSON.stringify(tags || [])
    const now = new Date().toISOString()

    if (existingReview) {
      // Update existing review
      db.prepare(`
        UPDATE reviews 
        SET rating = ?, tags = ?, body = ?, is_anonymous = ?, updated_at = ?
        WHERE user_id = ? AND place_id = ?
      `).run(rating, tagsJson, review_body, is_anonymous ? 1 : 0, now, user.id, place_id)

      return NextResponse.json({
        success: true,
        message: 'Review updated successfully',
        review_id: existingReview.id
      })
    } else {
      // Create new review
      const result = db.prepare(`
        INSERT INTO reviews (user_id, place_id, rating, tags, body, is_anonymous, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(user.id, place_id, rating, tagsJson, review_body, is_anonymous ? 1 : 0, now, now)

      return NextResponse.json({
        success: true,
        message: 'Review posted successfully',
        review_id: result.lastInsertRowid
      })
    }
  } catch (error) {
    console.error('Post review error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to post review' },
      { status: 500 }
    )
  }
}