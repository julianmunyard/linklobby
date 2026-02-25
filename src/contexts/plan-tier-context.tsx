'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import type { PlanTier } from '@/lib/stripe/plans'
import { UpgradeModal } from '@/components/billing/upgrade-modal'

interface PlanTierContextValue {
  planTier: PlanTier
  openUpgradeModal: (feature?: string) => void
}

const PlanTierContext = createContext<PlanTierContextValue>({
  planTier: 'free',
  openUpgradeModal: () => {},
})

export function PlanTierProvider({
  planTier,
  children,
}: {
  planTier: PlanTier
  children: React.ReactNode
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalFeature, setModalFeature] = useState<string | undefined>()

  const openUpgradeModal = useCallback((feature?: string) => {
    setModalFeature(feature)
    setModalOpen(true)
  }, [])

  return (
    <PlanTierContext.Provider value={{ planTier, openUpgradeModal }}>
      {children}
      <UpgradeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentTier={planTier}
        feature={modalFeature}
      />
    </PlanTierContext.Provider>
  )
}

export function usePlanTier() {
  return useContext(PlanTierContext)
}
