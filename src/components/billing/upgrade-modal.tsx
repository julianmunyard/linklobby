'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PricingTable } from '@/components/billing/pricing-table'
import type { PlanTier } from '@/lib/stripe/plans'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTier: PlanTier
  feature?: string
}

export function UpgradeModal({ open, onOpenChange, currentTier, feature }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto sm:max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>
            {feature ? `Upgrade to unlock ${feature}` : 'Upgrade your plan'}
          </DialogTitle>
          <DialogDescription>
            Get access to premium features with a 7-day free trial. No credit card required.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <PricingTable currentTier={currentTier} />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Not now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
