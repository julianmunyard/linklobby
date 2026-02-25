/**
 * Creates a Stripe Customer Portal session for billing management.
 * POST /api/billing/portal
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe/client'

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

  // Look up Stripe customer ID via admin client (customers table has no user SELECT policy)
  const admin = createAdminClient()
  const { data: customerRecord } = await admin
    .from('customers')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!customerRecord?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No billing account found for this user' },
      { status: 404 },
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerRecord.stripe_customer_id,
      return_url: `${appUrl}/settings`,
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[billing/portal] Failed to create portal session:', err)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 },
    )
  }
}
