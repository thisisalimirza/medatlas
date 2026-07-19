import Stripe from 'stripe'

export type PlanId = 'annual' | '5year'

/** Stripe Price lookup keys — set these on your Prices in the Stripe Dashboard. */
export const PLAN_LOOKUP_KEYS: Record<PlanId, string> = {
  annual: 'medstack_annual',
  '5year': 'medstack_5year',
}

const PLAN_ENV_VARS: Record<PlanId, string> = {
  annual: 'STRIPE_PRICE_ANNUAL',
  '5year': 'STRIPE_PRICE_5YEAR',
}

export const PLAN_IDS: PlanId[] = ['annual', '5year']

export interface PlanPrice {
  plan: PlanId
  priceId: string
  /** Amount in the smallest currency unit (cents for USD) */
  unitAmount: number
  currency: string
  /** Display string like "$100" */
  formatted: string
}

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(secretKey)
}

export function formatUSDFromCents(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

/**
 * Resolve the active Stripe Price for a plan.
 *
 * Preference order:
 * 1. Active Price with lookup key (`medstack_annual` / `medstack_5year`)
 *    — lets you change prices in Stripe without updating Vercel env vars
 * 2. Price ID from env (`STRIPE_PRICE_ANNUAL` / `STRIPE_PRICE_5YEAR`)
 *
 * To change a price going forward:
 * - Create a new Price in Stripe with the same lookup key (Stripe transfers it)
 * - Archive the old Price
 * - The site picks up the new amount automatically (no redeploy needed for amounts;
 *   if you still rely only on env Price IDs, update the Vercel env var to the new ID)
 */
export async function resolvePlanPrice(
  stripe: Stripe,
  plan: PlanId
): Promise<PlanPrice | null> {
  const lookupKey = PLAN_LOOKUP_KEYS[plan]

  const byLookup = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  })

  let price = byLookup.data[0]

  if (!price) {
    const envPriceId = process.env[PLAN_ENV_VARS[plan]]
    if (!envPriceId) return null
    price = await stripe.prices.retrieve(envPriceId)
  }

  if (!price || price.unit_amount == null) return null

  return {
    plan,
    priceId: price.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    formatted: formatUSDFromCents(price.unit_amount, price.currency),
  }
}

export async function resolveAllPlanPrices(
  stripe: Stripe
): Promise<Record<PlanId, PlanPrice | null>> {
  const results = await Promise.all(
    PLAN_IDS.map(async (plan) => [plan, await resolvePlanPrice(stripe, plan)] as const)
  )
  return Object.fromEntries(results) as Record<PlanId, PlanPrice | null>
}
