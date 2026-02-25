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

  const proMonthly = 1200
  const proAnnual = 11500
  const artistMonthly = 2000
  const artistAnnual = 19200

  const proDisplay = period === 'monthly'
    ? '$12/mo'
    : `$${(proAnnual / 12 / 100).toFixed(2)}/mo`
  const artistDisplay = period === 'monthly'
    ? '$20/mo'
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

  const tiers: Array<{
    tier: PlanTier
    name: string
    price: string
    annualNote?: string
    description: string
    popular?: boolean
    ctaLabel: string
    ctaDisabled: boolean
    onCta: () => void
  }> = [
    {
      tier: 'free',
      name: 'Free',
      price: '$0/mo',
      description: 'Everything you need to get started.',
      ctaLabel: currentTier === 'free' ? 'Current Plan' : 'Get Started Free',
      ctaDisabled: currentTier === 'free',
      onCta: () => {
        if (currentTier !== 'free') {
          window.location.href = '/signup'
        }
      },
    },
    {
      tier: 'pro',
      name: 'Pro',
      price: proDisplay,
      annualNote: period === 'annual' ? 'billed $115/year' : undefined,
      description: 'Remove branding and unlock pro features.',
      popular: true,
      ctaLabel: currentTier === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      ctaDisabled: currentTier === 'pro' || loadingTier === 'pro',
      onCta: () => {
        if (currentTier !== 'pro') handleUpgrade('pro')
      },
    },
    {
      tier: 'artist',
      name: 'Artist',
      price: artistDisplay,
      annualNote: period === 'annual' ? 'billed $192/year' : undefined,
      description: 'Everything in Pro, plus advanced tools.',
      ctaLabel: currentTier === 'artist' ? 'Current Plan' : 'Upgrade to Artist',
      ctaDisabled: currentTier === 'artist' || loadingTier === 'artist',
      onCta: () => {
        if (currentTier !== 'artist') handleUpgrade('artist')
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {tiers.map((t) => (
          <div
            key={t.tier}
            className={cn(
              'relative rounded-xl border p-6 flex flex-col',
              t.popular
                ? 'border-primary bg-primary/5 shadow-lg ring-1 ring-primary'
                : 'border-border bg-card'
            )}
          >
            {t.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            <div className="mb-4">
              <h3 className="text-lg font-bold">{t.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold">{t.price}</span>
              {t.annualNote && (
                <p className="text-xs text-muted-foreground mt-1">{t.annualNote}</p>
              )}
            </div>
            <Button
              className="w-full"
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
              <th className="text-left p-4 font-medium text-muted-foreground">Features</th>
              {tiers.map((t) => (
                <th key={t.tier} className="p-4 text-center font-semibold">
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
                <td className="p-4 text-left text-muted-foreground">{feature.label}</td>
                <td className="p-4 text-center">
                  <FeatureCell value={feature.free} />
                </td>
                <td className="p-4 text-center">
                  <FeatureCell value={feature.pro} />
                </td>
                <td className="p-4 text-center">
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
