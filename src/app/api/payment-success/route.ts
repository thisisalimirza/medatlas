import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await request.json()
    const { session_id, password, stage } = body

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
    const { data: existingUser, error: findError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single()

    let user
    if (existingUser && !findError) {
      // Update existing user to paid status
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ 
          is_paid: true,
          stage: stage || existingUser.stage || 'premed',
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

      // If password provided, update the user's auth password
      if (password) {
        const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
          user.id,
          { password }
        )
        if (passwordError) {
          console.error('Password update error:', passwordError)
        }
      }
    } else {
      // Create new user in Supabase auth first
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: password || Math.random().toString(36).slice(-8), // Random password if not provided
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
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          is_paid: true,
          stage: stage || 'premed',
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
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .upsert({
        user_id: user.id,
        stripe_session_id: session_id,
        amount_cents: amountCents,
        created_at: new Date().toISOString()
      })

    if (paymentError) {
      console.error('Payment record error:', paymentError)
      // Don't fail the whole process if payment recording fails
    }

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