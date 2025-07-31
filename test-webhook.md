# Testing Stripe Webhooks Locally

## Setup Complete ✅
- Stripe CLI installed and authenticated
- Webhook endpoint created at `/api/webhooks/stripe`
- Webhook secret added to `.env.local`
- Stripe CLI is listening on `localhost:3000/api/webhooks/stripe`

## How to Test

### 1. Start Your Development Server
```bash
npm run dev
```

### 2. In Another Terminal, Start Stripe Webhook Listener
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 3. Test Payment Events

#### Test a successful payment intent (for custom checkout):
```bash
stripe trigger payment_intent.succeeded
```

#### Test with custom metadata (more realistic):
```bash
stripe trigger payment_intent.succeeded --add payment_intent:metadata[email]=test@example.com --add payment_intent:metadata[stage]=ms1
```

#### Test a successful checkout session (for hosted checkout):
```bash
stripe trigger checkout.session.completed
```

#### Test checkout session with custom metadata:
```bash
stripe trigger checkout.session.completed --add checkout_session:metadata[email]=test@example.com --add checkout_session:metadata[stage]=ms1 --add checkout_session:payment_status=paid
```

### 4. Test Real Payment Flow
1. Go to your app at `http://localhost:3000`
2. Try to sign up for Pro (use Stripe test card: `4242 4242 4242 4242`)
3. Watch the webhook listener terminal for events
4. Check if the payment success page works correctly

## What to Watch For

### In Webhook Listener Terminal:
- You should see events like `checkout.session.completed` 
- Look for `[200]` status codes (success)
- Any errors will show `[4xx]` or `[5xx]` status codes

### In Next.js Development Console:
- Look for console logs from the webhook handler
- User creation/update messages
- Payment recording messages

### In Browser Developer Tools:
- Check Network tab for `/api/payment-success` calls
- Console logs for debugging information
- URL parameters after payment

## Test Cards
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002` 
- **Insufficient funds**: `4000 0000 0000 9995`

Use any future expiry date (like 12/34) and any 3-digit CVC.

## Troubleshooting

If webhooks aren't working:
1. Check that your Next.js server is running on port 3000
2. Verify the webhook secret in `.env.local` matches what CLI shows
3. Make sure the webhook endpoint URL is correct
4. Check server logs for any errors in the webhook handler