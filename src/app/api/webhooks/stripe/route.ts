/**
 * Stripe webhook handler.
 * Verifies signature with raw body (MUST use request.text(), not .json()).
 * Processes events idempotently via webhook_events table.
 * Syncs subscription state to local Supabase tables.
 */
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlanTierByPriceId } from '@/lib/stripe/plans'

export const dynamic = 'force-dynamic'

/**
 * Looks up a user_id by their Stripe customer ID in the local customers table.
 */
async function getUserIdByStripeCustomer(
  stripeCustomerId: string,
): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('customers')
    .select('user_id')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle()
  return data?.user_id ?? null
}

/**
 * Retrieves a Stripe subscription and syncs it to local DB.
 * Resolves user_id from: passed param, sub metadata, or customers table lookup.
 *
 * Note: In Stripe SDK v20 (API 2026-01-28.clover), current_period_start/end
 * moved from Subscription to SubscriptionItem. We use the first item's period.
 */
async function syncSubscription(
  subscriptionId: string,
  userId?: string,
): Promise<void> {
  const admin = createAdminClient()

  const sub = await stripe.subscriptions.retrieve(subscriptionId)

  // Resolve user_id: param > sub metadata > customers table lookup
  let resolvedUserId: string | null = userId ?? (sub.metadata?.user_id || null)

  if (!resolvedUserId && sub.customer) {
    const customerId =
      typeof sub.customer === 'string' ? sub.customer : sub.customer.id
    resolvedUserId = await getUserIdByStripeCustomer(customerId)
  }

  if (!resolvedUserId) {
    console.error(
      `[stripe/webhook] Cannot sync subscription ${subscriptionId}: no user_id found`,
    )
    return
  }

  const priceId = sub.items.data[0]?.price?.id ?? null
  const tier = priceId ? getPlanTierByPriceId(priceId) : 'free'

  const customerId =
    typeof sub.customer === 'string' ? sub.customer : sub.customer.id

  // In Stripe SDK v20, current_period_start/end are on SubscriptionItem, not Subscription
  const firstItem = sub.items.data[0]
  const periodStart = firstItem?.current_period_start ?? null
  const periodEnd = firstItem?.current_period_end ?? null

  // Upsert subscription record
  const { error: subError } = await admin
    .from('subscriptions')
    .upsert({
      id: sub.id,
      user_id: resolvedUserId,
      plan_tier: tier,
      status: sub.status,
      price_id: priceId,
      current_period_start: periodStart
        ? new Date(periodStart * 1000).toISOString()
        : null,
      current_period_end: periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : null,
      trial_start: sub.trial_start
        ? new Date(sub.trial_start * 1000).toISOString()
        : null,
      trial_end: sub.trial_end
        ? new Date(sub.trial_end * 1000).toISOString()
        : null,
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      canceled_at: sub.canceled_at
        ? new Date(sub.canceled_at * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })

  if (subError) {
    console.error('[stripe/webhook] Failed to upsert subscription:', subError)
  }

  // Upsert customer mapping to ensure it exists
  const { error: custError } = await admin
    .from('customers')
    .upsert({
      user_id: resolvedUserId,
      stripe_customer_id: customerId,
    })

  if (custError) {
    console.error('[stripe/webhook] Failed to upsert customer:', custError)
  }
}

export async function POST(request: NextRequest) {
  // CRITICAL: Must use .text() not .json() to preserve raw body for signature verification
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signature verification failed'
    console.error('[stripe/webhook] Signature verification failed:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const admin = createAdminClient()

  // Idempotency check — skip if already processed
  const { data: existing } = await admin
    .from('webhook_events')
    .select('stripe_event_id')
    .eq('stripe_event_id', event.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ received: true })
  }

  // Record event as processed before handling (prevents duplicate processing on retry)
  await admin.from('webhook_events').insert({ stripe_event_id: event.id })

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.subscription) {
          const subscriptionId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id
          const userId = session.metadata?.user_id
          await syncSubscription(subscriptionId, userId)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await syncSubscription(sub.id, sub.metadata?.user_id)
        break
      }

      case 'invoice.paid':
      case 'invoice.payment_failed': {
        // In Stripe SDK v20, subscription is accessed via invoice.parent.subscription_details.subscription
        const invoice = event.data.object as Stripe.Invoice
        const parent = invoice.parent
        if (parent?.type === 'subscription_details' && parent.subscription_details?.subscription) {
          const subscriptionId =
            typeof parent.subscription_details.subscription === 'string'
              ? parent.subscription_details.subscription
              : parent.subscription_details.subscription.id
          await syncSubscription(subscriptionId)
        }
        break
      }

      case 'customer.subscription.trial_will_end': {
        // Email notification handled in Phase 12.7 (transactional emails)
        console.log(
          `[stripe/webhook] Trial ending soon for subscription: ${(event.data.object as Stripe.Subscription).id}`,
        )
        break
      }

      default:
        console.log(`[stripe/webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`[stripe/webhook] Error processing event ${event.id}:`, err)
    // Return 200 to prevent Stripe retries — event was already recorded as processed
    // Log the error for manual investigation
  }

  return NextResponse.json({ received: true })
}
