# MedStack — Medical School & Residency Explorer

## What This Is
MedStack (mymedstack.com) is a platform for pre-med students, med students, residents, and attending physicians. It provides school/program data, calculators, tracking tools, and a paid community. The codebase is branded "MedStack" everywhere (previously "MedAtlas" — the repo name is a leftover).

## Tech Stack
- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4
- **Database & Auth**: Supabase (PostgreSQL + Auth with magic links & passwords)
- **Payments**: Stripe Checkout (one-time payments, not subscriptions)
- **Deployment**: Vercel (auto-deploys from `main` branch)
- **Domain**: mymedstack.com

## Architecture

### Auth Flow (CRITICAL — read before touching auth)
- Auth is managed by `src/contexts/SupabaseAuthContext.tsx` which wraps the entire app
- `onAuthStateChange` must NOT await heavy async work — it blocks Supabase's internal state machine
- Profile data comes from `user_profiles` table (RLS enabled, users can only read their own row)
- The `user_profiles.is_paid` boolean controls premium access everywhere
- After Stripe payment, users are auto-logged-in via `verifyOtp` with a `token_hash` (NOT `email` + `token_hash` — Supabase rejects that combo)
- Magic link redirect URLs must use `NEXT_PUBLIC_URL` env var, not `window.location.origin`
- Auth callback at `/auth/callback` handles both hash-based tokens and PKCE code exchange

### Premium/Paywall System
- `PremiumGate` component (`src/components/PremiumGate.tsx`) — newspaper-style paywall
- Wraps page content, shows it clipped with a gradient fade + upgrade CTA for free users
- Paid users (`user.is_paid`) see everything normally
- To make a page premium: wrap its content in `<PremiumGate featureName="X">...</PremiumGate>`
- Navigation items with `requiresPaid: true` show a star icon; external+requiresPaid items (Telegram) are completely hidden from non-paid users

### Navigation
- `MainNavigation.tsx` — hamburger menu with all tools organized by category
- Items are defined in `navigationData` array — toggle `requiresPaid` on any item to gate it
- All items are always clickable (premium pages handle gating via PremiumGate on the page itself)
- Exception: external links with `requiresPaid` (like Telegram) are filtered out entirely for non-paid users

### Stripe Configuration
- Two Stripe accounts: "MedAtlas Sandbox" (test) and "MedAtlas/Brask Group" (live)
- Switch between test/live by changing `STRIPE_SECRET_KEY` + `STRIPE_PRICE_*` env vars on Vercel
- Checkout route: `src/app/api/checkout/route.ts`
- Payment processing: `src/app/api/payment-success/route.ts` (creates user, profile, records payment)
- Plans: `annual` and `5year` (one-time payments, not recurring)

## Key Files
- `src/contexts/SupabaseAuthContext.tsx` — auth state management (be very careful editing this)
- `src/components/Header.tsx` — top bar with search, login/profile buttons
- `src/components/MainNavigation.tsx` — hamburger nav menu with all tools
- `src/components/PremiumGate.tsx` — newspaper-style paywall component
- `src/components/AuthModal.tsx` — login/signup/checkout modal
- `src/components/PlaceCard.tsx` — school/program card (used on homepage grid)
- `src/app/page.tsx` — homepage with program explorer
- `src/app/api/supabase/places/route.ts` — API for fetching programs (default limit: 500)
- `src/lib/supabase.ts` — browser Supabase client
- `src/lib/supabase-server.ts` — server Supabase client (service role key)

## Database
- **Supabase project ID**: `ltdtaojperckycfjpdht`
- **Key tables**: `places` (208 medical programs), `user_profiles`, `favorites`, `payments`, `reviews`
- `places` table has `metrics` JSONB column with scores, `image_url` for Wikipedia photos, `rank_overall` for unique 1-208 rankings
- RLS is enabled on `user_profiles` — users can only SELECT/INSERT/UPDATE their own row

## Environment Variables (Vercel)
Required on Vercel for production:
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ANNUAL`, `STRIPE_PRICE_5YEAR`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_URL` (must be `https://mymedstack.com` in production)
- `ANTHROPIC_API_KEY` (for AI features like contract analyzer)

## Supabase Dashboard Settings
- **Site URL**: must be `https://mymedstack.com`
- **Redirect URLs**: must include `https://mymedstack.com/auth/callback`

## Conventions
- Emojis are used in UI as icons (not icon libraries)
- `btn-red`, `btn-outline`, `btn-sm` are reusable button classes in globals.css
- `brand-red` is the primary color
- Coming-soon pages use `ComingSoonPage` component — no Telegram links in alternatives
- Telegram community link should ONLY be visible to paid users (never expose to free users)
- School images come from Wikipedia REST API, loaded with `unoptimized` prop on next/image to avoid proxy 429s

## Common Gotchas
1. **Never `await` inside `onAuthStateChange`** — it blocks Supabase's auth state machine
2. **`verifyOtp` with `token_hash`** — pass ONLY `token_hash` + `type`, never include `email`
3. **Wikipedia images** — use `unoptimized={true}` on next/image to bypass Next.js image proxy
4. **Building while dev server runs** — can corrupt `.next` cache. Stop server first, or `rm -rf .next`
5. **Stripe test vs live** — env vars control which mode. Don't mix test prices with live keys
6. **`places` API limit** — default is 500 to show all 208 programs. Don't reduce below 208
