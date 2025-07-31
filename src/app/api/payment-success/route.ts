import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2025-07-30.basil',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

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

    const { email } = session.metadata || {}
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Missing user email' },
        { status: 400 }
      )
    }

    // Check if user already exists in Supabase
    const { data: existingUser, error: findError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single()

    let user
    if (existingUser && !findError) {
      // Update existing user to paid status
      const { data: updatedUser, error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          is_paid: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single()

      if (updateError) {
        console.error('Update user error:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to update account' },
          { status: 500 }
        )
      }
      user = updatedUser
    } else {
      // Create new user in Supabase auth first
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true
      })

      if (authError) {
        console.error('Auth user creation error:', authError)
        return NextResponse.json(
          { success: false, error: 'Failed to create auth user' },
          { status: 500 }
        )
      }

      // Update user_profiles with payment status (the trigger should have created the profile)
      const { data: newUser, error: createError } = await supabase
        .from('user_profiles')
        .update({
          is_paid: true,
          stage: 'ms1', // Default stage, will be updated during password setup
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.user?.id)
        .select()
        .single()

      if (createError) {
        console.error('Create user error:', createError)
        return NextResponse.json(
          { success: false, error: 'Failed to create account' },
          { status: 500 }
        )
      }
      user = newUser
    }

    // Record the payment in Supabase
    const amountCents = session.amount_total || parseInt(process.env.MEDATLAS_PRICE_CENTS || '9900')
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        stripe_session_id: session_id,
        amount_cents: amountCents,
        created_at: new Date().toISOString()
      })

    if (paymentError) {
      console.error('Payment record error:', paymentError)
      // Don't fail the whole process if payment recording fails
    }

    // Create JWT token and set cookie
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    )

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