import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { PlanTier } from '@/lib/stripe/plans'

interface PlanBadgeProps {
  tier: PlanTier
  className?: string
}

const TIER_STYLES: Record<PlanTier, string> = {
  free: 'bg-muted text-muted-foreground',
  pro: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  artist: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
}

const TIER_LABELS: Record<PlanTier, string> = {
  free: 'Free',
  pro: 'Pro',
  artist: 'Artist',
}

export function PlanBadge({ tier, className }: PlanBadgeProps) {
  return (
    <Link
      href="/pricing"
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-opacity hover:opacity-80',
        TIER_STYLES[tier],
        className
      )}
    >
      {TIER_LABELS[tier]}
    </Link>
  )
}
