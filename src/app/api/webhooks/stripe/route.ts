import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2025-07-30.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const supabaseAdmin = getSupabaseAdmin()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { email, stage } = paymentIntent.metadata || {}
        
        if (!email || !stage) {
          console.error('Missing metadata in payment intent:', paymentIntent.id)
          break
        }

        // Check if user already exists in Supabase
        const { data: existingUser } = await supabaseAdmin
          .from('user_profiles')
          .select('*')
          .eq('email', email)
          .single()

        let user = existingUser

        if (user) {
          // User exists, just upgrade to paid
          const { error } = await supabaseAdmin
            .from('user_profiles')
            .update({ is_paid: true, updated_at: new Date().toISOString() })
            .eq('id', user.id)
          
          if (!error) {
            console.log(`Updated existing user ${user.id} to paid status via payment intent`)
          }
        } else {
          console.log(`User with email ${email} not found for payment intent ${paymentIntent.id}`)
          // Don't create users here - they should be created during checkout flow
          break
        }

        // Record the payment in Supabase
        const amountCents = paymentIntent.amount
        await supabaseAdmin
          .from('payments')
          .upsert({
            user_id: user.id,
            stripe_session_id: paymentIntent.id,
            amount_cents: amountCents,
            created_at: new Date().toISOString()
          })

        console.log(`Payment recorded for user ${user.id}, payment intent ${paymentIntent.id}`)
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.payment_status === 'paid') {
          const { email, stage } = session.metadata || {}
          
          if (!email || !stage) {
            console.error('Missing metadata in checkout session:', session.id)
            break
          }

          // Check if user already exists in Supabase
          const { data: existingUser } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('email', email)
            .single()

          let user = existingUser

          if (user) {
            // User exists, just upgrade to paid
            const { error } = await supabaseAdmin
              .from('user_profiles')
              .update({ is_paid: true, updated_at: new Date().toISOString() })
              .eq('id', user.id)
            
            if (!error) {
              console.log(`Webhook: Updated existing user ${user.id} to paid status`)
            }
          } else {
            console.log(`Webhook: User with email ${email} not found for session ${session.id}`)
            // Don't create users here - they should be created during checkout flow
            break
          }

          // Record the payment in Supabase
          const amountCents = session.amount_total || parseInt(process.env.MEDATLAS_PRICE_CENTS || '9900')
          await supabaseAdmin
            .from('payments')
            .upsert({
              user_id: user.id,
              stripe_session_id: session.id,
              amount_cents: amountCents,
              created_at: new Date().toISOString()
            })

          console.log(`Webhook: Payment recorded for user ${user.id}, session ${session.id}`)
        }
        break
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}