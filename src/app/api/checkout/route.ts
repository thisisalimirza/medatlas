import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2025-07-30.basil',
})

const PLANS: Record<string, { name: string; description: string; cents: number }> = {
  'annual': {
    name: 'MedAtlas Pro — Annual',
    description: 'Full access to MedAtlas for 1 year. Reviews, community, tools, and more.',
    cents: 6000, // $60/yr
  },
  '5year': {
    name: 'MedAtlas Pro — 5-Year Access',
    description: 'Full access to MedAtlas for your entire medical journey (5 years). Best value — just $20/yr.',
    cents: 10000, // $100 total
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, stage, plan = '5year' } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const selectedPlan = PLANS[plan] || PLANS['5year']

    const baseUrl = process.env.NEXT_PUBLIC_URL || request.headers.get('origin') || 'http://localhost:3000'
    const successUrl = `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${baseUrl}/?canceled=true`

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPlan.name,
              description: selectedPlan.description,
              images: [`${baseUrl}/logo.png`],
            },
            unit_amount: selectedPlan.cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        email,
        stage: stage || 'premed',
        product: 'medatlas-pro',
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
