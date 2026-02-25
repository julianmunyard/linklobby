/**
 * Creates a Stripe Checkout session for subscription upgrade.
 * Includes 7-day free trial with card collection upfront.
 * POST /api/billing/checkout { priceId: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe/client'
import { PLANS } from '@/lib/stripe/plans'
import type { PlanTier } from '@/lib/stripe/plans'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Authenticate user
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse request body — accepts either { priceId } or { tier, period }
  let priceId: string
  try {
    const body = await request.json()
    if (body.priceId) {
      priceId = body.priceId
    } else if (body.tier && body.period) {
      const plan = PLANS[body.tier as PlanTier]
      if (!plan) {
        return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
      }
      const resolvedId = body.period === 'annual'
        ? plan.stripePriceIdAnnual
        : plan.stripePriceIdMonthly
      if (!resolvedId) {
        return NextResponse.json({ error: 'Price ID not configured for this tier' }, { status: 400 })
      }
      priceId = resolvedId
    } else {
      return NextResponse.json({ error: 'priceId or tier+period is required' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!priceId) {
    return NextResponse.json({ error: 'priceId is required' }, { status: 400 })
  }

  // Look up existing Stripe customer via admin client (customers table has no user SELECT policy)
  const admin = createAdminClient()
  const { data: customerRecord } = await admin
    .from('customers')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Build Checkout session params
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
      trial_settings: {
        end_behavior: {
          missing_payment_method: 'cancel',
        },
      },
      metadata: {
        user_id: user.id,
      },
    },
    metadata: {
      user_id: user.id,
    },
    payment_method_collection: 'always',
    success_url: `${appUrl}/editor?upgrade=success`,
    cancel_url: `${appUrl}/editor?upgrade=cancelled`,
  }

  // Use existing customer if found, otherwise pass email for new customer creation
  if (customerRecord?.stripe_customer_id) {
    sessionParams.customer = customerRecord.stripe_customer_id
  } else {
    sessionParams.customer_email = user.email
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams)
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[billing/checkout] Failed to create checkout session:', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    )
  }
}
