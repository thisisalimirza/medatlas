import { NextResponse } from 'next/server'
import {
  formatUSDFromCents,
  getStripe,
  resolveAllPlanPrices,
  type PlanId,
} from '@/lib/stripe-prices'

export const dynamic = 'force-dynamic'

/**
 * GET /api/prices
 *
 * Returns live plan amounts from Stripe so the UI stays in sync with checkout.
 * Cached briefly at the CDN edge; amounts update within a few minutes of a Stripe change.
 */
export async function GET() {
  try {
    const stripe = getStripe()
    const resolved = await resolveAllPlanPrices(stripe)

    const plans: Partial<
      Record<
        PlanId,
        {
          priceId: string
          unitAmount: number
          currency: string
          formatted: string
          perYearFormatted?: string
        }
      >
    > = {}

    for (const plan of ['annual', '5year'] as PlanId[]) {
      const price = resolved[plan]
      if (!price) continue

      plans[plan] = {
        priceId: price.priceId,
        unitAmount: price.unitAmount,
        currency: price.currency,
        formatted: price.formatted,
        ...(plan === '5year'
          ? {
              perYearFormatted: formatUSDFromCents(
                Math.round(price.unitAmount / 5),
                price.currency
              ),
            }
          : {}),
      }
    }

    if (!plans.annual && !plans['5year']) {
      return NextResponse.json(
        { success: false, error: 'No Stripe prices configured' },
        { status: 500 }
      )
    }

    let savingsFormatted: string | null = null
    if (plans.annual && plans['5year']) {
      const savingsCents = plans.annual.unitAmount * 5 - plans['5year'].unitAmount
      if (savingsCents > 0) {
        savingsFormatted = formatUSDFromCents(savingsCents, plans.annual.currency)
      }
    }

    return NextResponse.json(
      {
        success: true,
        plans,
        savingsFormatted,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load prices'
    console.error('Prices API error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
