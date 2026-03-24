import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2025-07-30.basil',
})

/**
 * POST /api/payment-success
 *
 * Called after Stripe checkout completes. Retrieves the session from Stripe,
 * extracts customer email from customer_details (Stripe-collected), creates
 * or updates the Supabase auth user + profile, and records the payment.
 *
 * Body: { session_id, password?, displayName?, stage? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, password, displayName, stage } = body

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

    // Get email from Stripe's customer_details (collected by Stripe checkout)
    const email = session.customer_details?.email || session.metadata?.email
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Missing customer email from Stripe session' },
        { status: 400 }
      )
    }

    const customerName = session.customer_details?.name || displayName || ''
    const plan = session.metadata?.plan || '5year'

    // Check if user already exists in Supabase auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingAuthUser = existingUsers?.users?.find(u => u.email === email)

    let userId: string

    if (existingAuthUser) {
      userId = existingAuthUser.id

      // If password provided, update the auth user's password
      if (password) {
        await supabaseAdmin.auth.admin.updateUserById(userId, { password })
      }
    } else {
      // Create new user in Supabase auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: password || undefined,
        email_confirm: true,
        user_metadata: {
          display_name: customerName || email.split('@')[0],
          stage: stage || 'premed',
        },
      })

      if (authError || !authUser.user) {
        console.error('Auth user creation error:', authError)
        return NextResponse.json(
          { success: false, error: 'Failed to create auth user' },
          { status: 500 }
        )
      }
      userId = authUser.user.id
    }

    // Upsert the user profile
    const profileData = {
      id: userId,
      email,
      display_name: customerName || displayName || email.split('@')[0],
      stage: stage || 'premed',
      is_paid: true,
      updated_at: new Date().toISOString(),
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .single()

    if (profileError) {
      console.error('Profile upsert error:', profileError)
      // Try update as fallback
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ is_paid: true, display_name: profileData.display_name, stage: profileData.stage, updated_at: profileData.updated_at })
        .eq('email', email)
        .select()
        .single()

      if (updateError) {
        console.error('Profile update fallback error:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to update user profile' },
          { status: 500 }
        )
      }
    }

    // Record the payment
    const amountCents = session.amount_total || 0
    await supabaseAdmin
      .from('payments')
      .upsert({
        user_id: userId,
        stripe_session_id: session_id,
        amount_cents: amountCents,
        plan,
        created_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) console.error('Payment record error:', error)
      })

    // Generate a magic link token for auto-login (no email click needed)
    // Also send a proper magic link email as fallback in case verifyOtp fails
    let tokenHash: string | null = null
    const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://mymedstack.com'
    try {
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: `${siteUrl}/auth/callback?payment=true`,
        },
      })
      if (!linkError && linkData?.properties?.action_link) {
        const url = new URL(linkData.properties.action_link)
        tokenHash = url.searchParams.get('token_hash') || url.searchParams.get('token')
      }
    } catch (err) {
      console.error('Auto-login token generation error:', err)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        display_name: profileData.display_name,
        stage: profileData.stage,
        is_paid: true,
      },
      tokenHash,
      hasPassword: !!password,
    })
  } catch (error) {
    console.error('Payment success error:', error)
    return NextResponse.json(
      { success: false, error: 'Account creation failed' },
      { status: 500 }
    )
  }
}
