'use client'

import { useState } from 'react'
import { Check, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PlanTier } from '@/lib/stripe/plans'

interface PricingTableProps {
  currentTier?: PlanTier
  onSelectPlan?: (priceId: string) => void
}

type BillingPeriod = 'monthly' | 'annual'

interface FeatureRow {
  label: string
  free: boolean | 'soon'
  pro: boolean | 'soon'
  artist: boolean | 'soon'
}

const FEATURES: FeatureRow[] = [
  { label: 'All card types', free: true, pro: true, artist: true },
  { label: 'Themes & templates', free: true, pro: true, artist: true },
  { label: 'Basic analytics', free: true, pro: true, artist: true },
  { label: 'Audio players', free: true, pro: true, artist: true },
  { label: 'Scatter mode', free: true, pro: true, artist: true },
  { label: 'Remove branding', free: false, pro: true, artist: true },
  { label: 'Email collection', free: false, pro: true, artist: true },
  { label: 'QR codes', free: false, pro: true, artist: true },
  { label: 'Facebook Pixel / GA', free: false, pro: true, artist: true },
  { label: 'Link scheduling', free: false, pro: true, artist: true },
  { label: 'Release mode', free: false, pro: true, artist: true },
  { label: 'Pro themes', free: false, pro: true, artist: true },
  { label: 'Custom domain', free: false, pro: false, artist: 'soon' },
  { label: 'Geo analytics', free: false, pro: false, artist: 'soon' },
  { label: 'Priority support', free: false, pro: false, artist: true },
]

function FeatureCell({ value }: { value: boolean | 'soon' }) {
  if (value === 'soon') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Check className="h-4 w-4 text-green-500/60" />
        <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
          Soon
        </span>
      </span>
    )
  }
  if (value) {
    return <Check className="h-4 w-4 text-green-500 mx-auto" />
  }
  return <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />
}

export function PricingTable({ currentTier, onSelectPlan }: PricingTableProps) {
  const [period, setPeriod] = useState<BillingPeriod>('monthly')
  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null)

  const proMonthly = 699
  const proAnnual = 6710
  const artistMonthly = 1000
  const artistAnnual = 9600

  const proDisplay = period === 'monthly'
    ? '$6.99/mo'
    : `$${(proAnnual / 12 / 100).toFixed(2)}/mo`
  const artistDisplay = period === 'monthly'
    ? '$10/mo'
    : `$${(artistAnnual / 12 / 100).toFixed(2)}/mo`

  async function handleUpgrade(tier: 'pro' | 'artist') {
    // Determine the price ID based on period
    const priceIdEnvKey = tier === 'pro'
      ? period === 'monthly' ? 'STRIPE_PRO_MONTHLY_PRICE_ID' : 'STRIPE_PRO_ANNUAL_PRICE_ID'
      : period === 'monthly' ? 'STRIPE_ARTIST_MONTHLY_PRICE_ID' : 'STRIPE_ARTIST_ANNUAL_PRICE_ID'

    // We pass the price ID via callback or direct API call
    // Since env vars aren't available client-side, we send tier+period to the API
    if (onSelectPlan) {
      // Parent handles the checkout — pass a sentinel for tier+period
      onSelectPlan(`${tier}:${period}`)
      return
    }

    setLoadingTier(tier)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, period }),
      })

      if (res.status === 401) {
        window.location.href = '/login?next=/pricing'
        return
      }

      const { url, error } = await res.json()
      if (error) {
        console.error('Checkout error:', error)
        return
      }
      if (url) {
        window.location.href = url
      }
    } finally {
      setLoadingTier(null)
    }
  }

  const tierRank: Record<PlanTier, number> = { free: 0, pro: 1, artist: 2 }
  const currentRank = currentTier ? tierRank[currentTier] : -1

  function getCtaLabel(tier: PlanTier): string {
    if (currentTier === tier) return 'Current Plan'
    if (currentRank > tierRank[tier]) return tier === 'free' ? 'Free Plan' : 'Included in your plan'
    if (!currentTier && tier === 'free') return 'Get Started'
    return 'Upgrade'
  }

  function isCtaDisabled(tier: PlanTier): boolean {
    if (currentTier === tier) return true
    if (currentRank >= tierRank[tier]) return true
    if (loadingTier === tier) return true
    return false
  }

  const tiers: Array<{
    tier: PlanTier
    name: string
    price: string
    annualNote?: string
    description: string
    popular?: boolean
    isCurrent: boolean
    ctaLabel: string
    ctaDisabled: boolean
    onCta: () => void
  }> = [
    {
      tier: 'free',
      name: 'Free',
      price: '$0/mo',
      description: 'Everything you need to get started.',
      isCurrent: currentTier === 'free',
      ctaLabel: getCtaLabel('free'),
      ctaDisabled: isCtaDisabled('free'),
      onCta: () => {
        if (!currentTier) {
          window.location.href = '/signup'
        }
      },
    },
    {
      tier: 'pro',
      name: 'Pro',
      price: proDisplay,
      annualNote: period === 'annual' ? 'billed $67.10/year' : undefined,
      description: 'Remove branding and unlock pro features.',
      popular: !currentTier || currentTier === 'free',
      isCurrent: currentTier === 'pro',
      ctaLabel: getCtaLabel('pro'),
      ctaDisabled: isCtaDisabled('pro'),
      onCta: () => {
        if (currentRank < tierRank['pro']) handleUpgrade('pro')
      },
    },
    {
      tier: 'artist',
      name: 'Artist',
      price: artistDisplay,
      annualNote: period === 'annual' ? 'billed $96/year' : undefined,
      description: 'Everything in Pro, plus advanced tools.',
      isCurrent: currentTier === 'artist',
      ctaLabel: getCtaLabel('artist'),
      ctaDisabled: isCtaDisabled('artist'),
      onCta: () => {
        if (currentRank < tierRank['artist']) handleUpgrade('artist')
      },
    },
  ]

  return (
    <div className="w-full">
      {/* Monthly/Annual toggle */}
      <div className="flex justify-center mb-8">
        <div className="relative flex items-center bg-muted rounded-full p-1 gap-1">
          <button
            onClick={() => setPeriod('monthly')}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              period === 'monthly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setPeriod('annual')}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2',
              period === 'annual'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Annual
            <span className="text-[10px] font-semibold bg-green-500/20 text-green-600 dark:text-green-400 rounded-full px-1.5 py-0.5">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Tier cards — mobile stacked, desktop side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 overflow-hidden">
        {tiers.map((t) => (
          <div
            key={t.tier}
            className={cn(
              'relative rounded-xl border p-4 flex flex-col min-w-0',
              t.isCurrent
                ? 'border-green-500 bg-green-500/5 shadow-lg ring-1 ring-green-500'
                : t.popular
                  ? 'border-primary bg-primary/5 shadow-lg ring-1 ring-primary'
                  : 'border-border bg-card'
            )}
          >
            {t.isCurrent && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="bg-green-500 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                  Your Plan
                </span>
              </div>
            )}
            {!t.isCurrent && t.popular && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            <div className="mb-3 mt-1">
              <h3 className="text-base font-bold">{t.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold">{t.price}</span>
              {t.annualNote && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{t.annualNote}</p>
              )}
            </div>
            <Button
              className="w-full mt-auto text-xs sm:text-sm"
              size="sm"
              variant={t.popular ? 'default' : 'outline'}
              disabled={t.ctaDisabled}
              onClick={t.onCta}
            >
              {loadingTier === t.tier ? 'Redirecting...' : t.ctaLabel}
            </Button>
          </div>
        ))}
      </div>

      {/* Feature comparison table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Features</th>
              {tiers.map((t) => (
                <th key={t.tier} className="px-2 py-2.5 text-center font-semibold">
                  {t.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((feature, i) => (
              <tr
                key={feature.label}
                className={cn('border-b last:border-0', i % 2 === 0 ? 'bg-background' : 'bg-muted/20')}
              >
                <td className="px-3 py-2.5 text-left text-muted-foreground">{feature.label}</td>
                <td className="px-2 py-2.5 text-center">
                  <FeatureCell value={feature.free} />
                </td>
                <td className="px-2 py-2.5 text-center">
                  <FeatureCell value={feature.pro} />
                </td>
                <td className="px-2 py-2.5 text-center">
                  <FeatureCell value={feature.artist} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
