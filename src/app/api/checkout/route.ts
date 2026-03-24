import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2025-07-30.basil',
})

// Stored Stripe price IDs — created via Stripe dashboard / API
const PRICE_IDS: Record<string, string> = {
  annual: process.env.STRIPE_PRICE_ANNUAL || 'price_1TEc18C8atqHyHC7nftQWGEq',
  '5year': process.env.STRIPE_PRICE_5YEAR || 'price_1TEc19C8atqHyHC7A8ch1pEP',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plan = '5year' } = body

    const priceId = PRICE_IDS[plan] || PRICE_IDS['5year']

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
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { success: false, error: 'Payment processing error' },
      { status: 500 }
    )
  }
}
