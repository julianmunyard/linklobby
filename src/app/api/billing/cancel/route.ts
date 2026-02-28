/**
 * Cancels the user's subscription at the end of the current billing period.
 * POST /api/billing/cancel
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

  // Find the user's active subscription
  const admin = createAdminClient()
  const { data: subscription } = await admin
    .from('subscriptions')
    .select('id, cancel_at_period_end')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!subscription) {
    return NextResponse.json(
      { error: 'No active subscription found' },
      { status: 404 },
    )
  }

  if (subscription.cancel_at_period_end) {
    return NextResponse.json(
      { error: 'Subscription is already set to cancel' },
      { status: 400 },
    )
  }

  try {
    // Tell Stripe to cancel at period end (not immediately)
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown Stripe error'
    console.error('[billing/cancel] Stripe API error:', message)
    return NextResponse.json(
      { error: `Stripe error: ${message}` },
      { status: 500 },
    )
  }

  // The webhook will sync cancel_at_period_end to our DB,
  // but update locally now for immediate UI feedback
  await admin
    .from('subscriptions')
    .update({
      cancel_at_period_end: true,
      canceled_at: new Date().toISOString(),
    })
    .eq('id', subscription.id)

  return NextResponse.json({ success: true })
}
