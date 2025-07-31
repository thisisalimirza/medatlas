import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validation
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

    // Determine the base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_URL || request.headers.get('origin') || 'http://localhost:3000'
    const successUrl = `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${baseUrl}/?canceled=true`
    
    console.log('Creating checkout session with URLs:', { successUrl, cancelUrl })

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'MedAtlas Lifetime Access',
              description: 'Get full access to the MedAtlas platform — explore medical schools, residencies, student reviews, and exclusive community features.',
              images: ['https://medatlas.com/pro-icon.png'], // You can add this later
            },
            unit_amount: parseInt(process.env.MEDATLAS_PRICE_CENTS || '9900'), // Default $99 if not set
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        email,
        product: 'medatlas-pro'
      },
      allow_promotion_codes: true,
    })

    console.log('Checkout session created:', {
      sessionId: session.id,
      url: session.url,
      successUrl: session.success_url,
      cancelUrl: session.cancel_url
    })

    return NextResponse.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id // Add for debugging
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { success: false, error: 'Payment processing error' },
      { status: 500 }
    )
  }
}