'use client'

import { usePlanTier } from '@/contexts/plan-tier-context'
import type { PlanTier } from '@/lib/stripe/plans'

/**
 * Tier ordering for comparison.
 */
const TIER_ORDER: Record<PlanTier, number> = {
  free: 0,
  pro: 1,
  artist: 2,
}

function hasTierAccess(userTier: PlanTier, requiredTier: PlanTier): boolean {
  return TIER_ORDER[userTier] >= TIER_ORDER[requiredTier]
}

// ---------------------------------------------------------------------------
// ProBadge — standalone badge (no wrapper), for use in lists/dropdowns
// ---------------------------------------------------------------------------

interface ProBadgeProps {
  feature?: string
  className?: string
}

export function ProBadge({ feature, className }: ProBadgeProps) {
  const { openUpgradeModal } = usePlanTier()

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        openUpgradeModal(feature)
      }}
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30 hover:bg-amber-400/30 transition-colors cursor-pointer ${className ?? ''}`}
      title={feature ? `Upgrade to unlock ${feature}` : 'Upgrade to Pro'}
    >
      Pro
    </button>
  )
}

// ---------------------------------------------------------------------------
// ProGate — wraps children and overlays a Pro badge if user lacks access
// ---------------------------------------------------------------------------

interface ProGateProps {
  children: React.ReactNode
  /** Minimum tier required. Defaults to 'pro'. */
  requiredTier?: 'pro' | 'artist'
  /** Optional feature name for the badge tooltip / modal heading. */
  feature?: string
  className?: string
}

/**
 * Soft-lock gate. Children remain fully interactive.
 * If the user doesn't have access, a small Pro badge overlay appears
 * in the top-right corner. Clicking it opens the UpgradeModal.
 */
export function ProGate({
  children,
  requiredTier = 'pro',
  feature,
  className,
}: ProGateProps) {
  const { planTier, openUpgradeModal } = usePlanTier()

  const hasAccess = hasTierAccess(planTier, requiredTier)

  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <div className={`relative ${className ?? ''}`}>
      {children}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          openUpgradeModal(feature)
        }}
        className="absolute top-1 right-1 z-10 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30 hover:bg-amber-400/30 transition-colors cursor-pointer"
        title={feature ? `Upgrade to unlock ${feature}` : 'Upgrade to Pro'}
      >
        Pro
      </button>
    </div>
  )
}
