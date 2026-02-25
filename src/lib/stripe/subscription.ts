/**
 * Subscription helpers for reading plan tier from local DB.
 * Uses RLS-enabled server client — caller must be in authenticated context.
 */
import { createClient } from '@/lib/supabase/server'
import { type PlanTier } from './plans'

export type { PlanTier }

/**
 * Returns the active plan tier for a user from the local subscriptions table.
 * Returns 'free' if no subscription found, status is not active/trialing,
 * or subscription was canceled before the period end.
 */
export async function getUserPlan(userId: string): Promise<PlanTier> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .select('plan_tier, status, cancel_at_period_end, current_period_end')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    return 'free'
  }

  // If canceled and past period end, treat as free
  if (data.cancel_at_period_end && data.current_period_end) {
    const periodEnd = new Date(data.current_period_end)
    if (periodEnd < new Date()) {
      return 'free'
    }
  }

  return (data.plan_tier as PlanTier) ?? 'free'
}

/**
 * Returns true if the tier has Pro or Artist features.
 */
export function isPro(tier: PlanTier): boolean {
  return tier === 'pro' || tier === 'artist'
}

/**
 * Returns true only for Artist tier.
 */
export function isArtist(tier: PlanTier): boolean {
  return tier === 'artist'
}
