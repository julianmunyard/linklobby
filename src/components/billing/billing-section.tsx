'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlanBadge } from '@/components/billing/plan-badge'
import type { PlanTier } from '@/lib/stripe/plans'

interface BillingSectionProps {
  tier: PlanTier
  periodEnd?: string | null
  cancelAtPeriodEnd?: boolean
  isTrial?: boolean
}

export function BillingSection({ tier, periodEnd, cancelAtPeriodEnd, isTrial }: BillingSectionProps) {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)

  const isPaid = tier !== 'free'

  const formattedDate = periodEnd
    ? new Date(periodEnd).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  async function handleManageBilling() {
    setIsLoadingPortal(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const { url, error } = await res.json()
      if (error) {
        console.error('Portal error:', error)
        return
      }
      if (url) {
        window.location.href = url
      }
    } finally {
      setIsLoadingPortal(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 space-y-3">
        {/* Current plan */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current plan</span>
          <PlanBadge tier={tier} />
        </div>

        {/* Trial notice */}
        {isTrial && (
          <div className="text-sm text-amber-600 dark:text-amber-400">
            You are on a free trial{formattedDate ? ` until ${formattedDate}` : ''}.
          </div>
        )}

        {/* Renewal / cancellation date */}
        {isPaid && !isTrial && formattedDate && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {cancelAtPeriodEnd ? 'Cancels on' : 'Renews on'}
            </span>
            <span className={cancelAtPeriodEnd ? 'text-destructive' : ''}>{formattedDate}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        {isPaid ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleManageBilling}
            disabled={isLoadingPortal}
          >
            {isLoadingPortal ? 'Loading...' : 'Manage Billing'}
          </Button>
        ) : (
          <Button size="sm" asChild>
            <Link href="/pricing">Upgrade Plan</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
