import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Stripe Price IDs — set these in .env.local (test) and Vercel env vars (prod)
// To switch between test/live: just swap STRIPE_SECRET_KEY and STRIPE_PRICE_* values
const PRICE_IDS: Record<string, string | undefined> = {
  annual: process.env.STRIPE_PRICE_ANNUAL,
  '5year': process.env.STRIPE_PRICE_5YEAR,
}

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      console.error('STRIPE_SECRET_KEY is not set')
      return NextResponse.json(
        { success: false, error: 'Stripe is not configured. Set STRIPE_SECRET_KEY in env vars.' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(secretKey)

    const body = await request.json()
    const { plan = '5year' } = body

    const priceId = PRICE_IDS[plan] || PRICE_IDS['5year']
    if (!priceId) {
      const mode = secretKey.startsWith('sk_live') ? 'live' : 'test'
      console.error(`STRIPE_PRICE_${plan.toUpperCase()} is not set. Current mode: ${mode}`)
      return NextResponse.json(
        { success: false, error: `Price not configured for "${plan}" plan. Set STRIPE_PRICE_${plan === '5year' ? '5YEAR' : 'ANNUAL'} in env vars.` },
        { status: 500 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || request.headers.get('origin') || 'http://localhost:3000'
    const successUrl = `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${baseUrl}/?canceled=true`

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        product: 'medstack-pro',
        plan,
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id,
    })
  } catch (error: unknown) {
    const stripeErr = error as { type?: string; message?: string; code?: string }
    console.error('Stripe checkout error:', {
      type: stripeErr.type,
      message: stripeErr.message,
      code: stripeErr.code,
    })
    return NextResponse.json(
      { success: false, error: stripeErr.message || 'Payment processing error' },
      { status: 500 }
    )
  }
}
