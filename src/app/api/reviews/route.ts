import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

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

    // Get reviews from Supabase
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        tags,
        body,
        is_anonymous,
        created_at,
        updated_at,
        user_id
      `)
      .eq('place_id', placeId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase reviews error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }

    // Get user info for non-anonymous reviews
    const userIds = (reviews || [])
      .filter(review => !review.is_anonymous)
      .map(review => review.user_id)

    let users: { id: string; stage: string; display_name: string }[] = []
    if (userIds.length > 0) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, stage, display_name')
        .in('id', userIds)
      
      if (!userError) {
        users = userData || []
      }
    }

    // Format reviews for frontend
    const formattedReviews = (reviews || []).map((review: any) => {
      const user = users.find(u => u.id === review.user_id)
      return {
        id: review.id,
        rating: review.rating,
        tags: Array.isArray(review.tags) ? review.tags : JSON.parse(review.tags || '[]'),
        body: review.body,
        is_anonymous: Boolean(review.is_anonymous),
        created_at: review.created_at,
        updated_at: review.updated_at,
        author: {
          stage: user?.stage || 'Student',
          display_name: review.is_anonymous ? null : user?.display_name
        }
      }
    })

    // Calculate review stats
    const totalReviews = formattedReviews.length
    const averageRating = totalReviews > 0 
      ? formattedReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews 
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

    // Check if place exists in Supabase
    const { data: place, error: placeError } = await supabase
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

    // Check if user already reviewed this place
    const { data: existingReview, error: existingError } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('place_id', place_id)
      .single()

    const reviewData = {
      user_id: user.id,
      place_id: place_id,
      rating: rating,
      tags: tags || [],
      body: review_body,
      is_anonymous: is_anonymous || false,
      updated_at: new Date().toISOString()
    }

    if (existingReview && !existingError) {
      // Update existing review
      const { data, error } = await supabase
        .from('reviews')
        .update(reviewData)
        .eq('id', existingReview.id)
        .select()

      if (error) {
        console.error('Update review error:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to update review' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Review updated successfully',
        review_id: existingReview.id
      })
    } else {
      // Create new review
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          created_at: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error('Create review error:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to create review' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Review posted successfully',
        review_id: data[0]?.id
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