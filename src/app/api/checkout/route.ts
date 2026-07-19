import { NextRequest, NextResponse } from 'next/server'
import { getStripe, resolvePlanPrice, type PlanId } from '@/lib/stripe-prices'

export async function POST(request: NextRequest) {
  try {
    let stripe
    try {
      stripe = getStripe()
    } catch {
      console.error('STRIPE_SECRET_KEY is not set')
      return NextResponse.json(
        { success: false, error: 'Stripe is not configured. Set STRIPE_SECRET_KEY in env vars.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const plan = (body.plan === 'annual' ? 'annual' : '5year') as PlanId

    const resolved = await resolvePlanPrice(stripe, plan)
    if (!resolved) {
      const mode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'live' : 'test'
      console.error(`No Stripe price found for plan "${plan}". Mode: ${mode}`)
      return NextResponse.json(
        {
          success: false,
          error: `Price not configured for "${plan}" plan. Set a Stripe lookup key (medstack_${plan === '5year' ? '5year' : 'annual'}) or STRIPE_PRICE_${plan === '5year' ? '5YEAR' : 'ANNUAL'} in env vars.`,
        },
        { status: 500 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || request.headers.get('origin') || 'http://localhost:3000'
    const successUrl = `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${baseUrl}/?canceled=true`

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: resolved.priceId, quantity: 1 }],
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
