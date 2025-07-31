# Vercel Environment Variables Setup

When deploying to Vercel, you need to set these environment variables in your Vercel dashboard:

## Required Environment Variables

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Stripe Configuration
```
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_... for testing)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### App Configuration
```
NEXT_PUBLIC_URL=https://your-vercel-domain.vercel.app
MEDATLAS_PRICE_CENTS=9900
```

## How to Add in Vercel

1. Go to your Vercel dashboard
2. Select your MedAtlas project
3. Navigate to Settings → Environment Variables
4. Add each variable above with your actual values
5. Make sure to select "Production", "Preview", and "Development" for each variable

## Build Settings (if needed)

If you need to override build settings:
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Notes

- Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Service role keys should only be used in server-side code
- Make sure your Supabase project URL and keys are correct
- Test with preview deployments before going to production