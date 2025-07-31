import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createUser, createToken, updateUserPaidStatus } from '@/lib/auth'
import { db } from '@/lib/database'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id } = body

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      )
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Payment not completed' },
        { status: 400 }
      )
    }

    const { email, stage } = session.metadata || {}
    if (!email || !stage) {
      return NextResponse.json(
        { success: false, error: 'Missing user information' },
        { status: 400 }
      )
    }

    // Check if user already exists
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any

    if (user) {
      // User exists, just upgrade to paid
      updateUserPaidStatus(user.id, true)
      user.is_paid = 1
    } else {
      // Create new user account
      const result = await createUser({
        email,
        password: Math.random().toString(36), // Random password (not used)
        stage,
        display_name: undefined
      })

      if (!result.success || !result.user) {
        return NextResponse.json(
          { success: false, error: 'Failed to create account' },
          { status: 500 }
        )
      }

      // Mark as paid immediately
      updateUserPaidStatus(result.user.id, true)
      user = { ...result.user, is_paid: 1 }
    }

    // Record the payment
    const amountCents = session.amount_total || parseInt(process.env.MEDATLAS_PRICE_CENTS || '9900')
    db.prepare(`
      INSERT INTO payments (user_id, stripe_session_id, amount_cents)
      VALUES (?, ?, ?)
    `).run(user.id, session_id, amountCents)

    // Create JWT token and set cookie
    const token = await createToken(user)
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        stage: user.stage,
        display_name: user.display_name,
        is_paid: true
      }
    })
  } catch (error) {
    console.error('Payment success error:', error)
    return NextResponse.json(
      { success: false, error: 'Account creation failed' },
      { status: 500 }
    )
  }
}