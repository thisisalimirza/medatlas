import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createUser, updateUserPaidStatus } from '@/lib/auth'
import { db } from '@/lib/database'

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
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { email, stage } = paymentIntent.metadata || {}
        
        if (!email || !stage) {
          console.error('Missing metadata in payment intent:', paymentIntent.id)
          break
        }

        // Check if user already exists
        let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any

        if (user) {
          // User exists, just upgrade to paid
          updateUserPaidStatus(user.id, true)
          console.log(`Updated existing user ${user.id} to paid status via payment intent`)
        } else {
          // Create new user account
          const result = await createUser({
            email,
            password: Math.random().toString(36), // Random password
            stage,
            display_name: undefined
          })

          if (result.success && result.user) {
            // Mark as paid immediately
            updateUserPaidStatus(result.user.id, true)
            user = { ...result.user, is_paid: 1 }
            console.log(`Created new paid user ${user.id} via payment intent`)
          } else {
            console.error('Failed to create user from payment intent webhook:', result.error)
            break
          }
        }

        // Record the payment
        const amountCents = paymentIntent.amount
        db.prepare(`
          INSERT OR IGNORE INTO payments (user_id, stripe_session_id, amount_cents)
          VALUES (?, ?, ?)
        `).run(user.id, paymentIntent.id, amountCents)

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

          // Check if user already exists
          let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any

          if (user) {
            // User exists, just upgrade to paid
            updateUserPaidStatus(user.id, true)
            console.log(`Webhook: Updated existing user ${user.id} to paid status`)
          } else {
            // Create new user account (as backup - normally payment-success endpoint handles this)
            const result = await createUser({
              email,
              password: Math.random().toString(36), // Random password
              stage,
              display_name: undefined
            })

            if (result.success && result.user) {
              // Mark as paid immediately
              updateUserPaidStatus(result.user.id, true)  
              user = { ...result.user, is_paid: 1 }
              console.log(`Webhook: Created new paid user ${user.id} (backup creation)`)
            } else {
              console.error('Webhook: Failed to create user:', result.error)
              break
            }
          }

          // Record the payment (use INSERT OR IGNORE to prevent duplicates)
          const amountCents = session.amount_total || parseInt(process.env.MEDATLAS_PRICE_CENTS || '9900')
          db.prepare(`
            INSERT OR IGNORE INTO payments (user_id, stripe_session_id, amount_cents)
            VALUES (?, ?, ?)
          `).run(user.id, session.id, amountCents)

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