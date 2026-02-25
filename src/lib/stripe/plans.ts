/**
 * Plan definitions for the 3-tier billing system.
 * Central config for plan tiers, pricing, and feature flags.
 */

export type PlanTier = 'free' | 'pro' | 'artist'

export type PlanFeatures = {
  removeBranding: boolean
  emailCollection: boolean
  qrCodes: boolean
  facebookPixel: boolean
  googleAnalytics: boolean
  linkScheduling: boolean
  releaseMode: boolean
  customDomain: boolean
  geoAnalytics: boolean
  tourDates: boolean
  proThemes: boolean
}

export type Plan = {
  tier: PlanTier
  name: string
  priceMonthly: number | null // cents
  priceAnnual: number | null // cents
  stripePriceIdMonthly: string | null
  stripePriceIdAnnual: string | null
  features: PlanFeatures
}

export const PLANS: Record<PlanTier, Plan> = {
  free: {
    tier: 'free',
    name: 'Free',
    priceMonthly: null,
    priceAnnual: null,
    stripePriceIdMonthly: null,
    stripePriceIdAnnual: null,
    features: {
      removeBranding: false,
      emailCollection: false,
      qrCodes: false,
      facebookPixel: false,
      googleAnalytics: false,
      linkScheduling: false,
      releaseMode: false,
      customDomain: false,
      geoAnalytics: false,
      tourDates: false,
      proThemes: false,
    },
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    priceMonthly: 1200, // $12.00
    priceAnnual: 11500, // $115.00
    stripePriceIdMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    stripePriceIdAnnual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
    features: {
      removeBranding: true,
      emailCollection: true,
      qrCodes: true,
      facebookPixel: true,
      googleAnalytics: true,
      linkScheduling: true,
      releaseMode: true,
      customDomain: false,
      geoAnalytics: true,
      tourDates: true,
      proThemes: true,
    },
  },
  artist: {
    tier: 'artist',
    name: 'Artist',
    priceMonthly: 2000, // $20.00
    priceAnnual: 19200, // $192.00
    stripePriceIdMonthly: process.env.STRIPE_ARTIST_MONTHLY_PRICE_ID!,
    stripePriceIdAnnual: process.env.STRIPE_ARTIST_ANNUAL_PRICE_ID!,
    features: {
      removeBranding: true,
      emailCollection: true,
      qrCodes: true,
      facebookPixel: true,
      googleAnalytics: true,
      linkScheduling: true,
      releaseMode: true,
      customDomain: true,
      geoAnalytics: true,
      tourDates: true,
      proThemes: true,
    },
  },
}

/**
 * Maps a Stripe price ID to a plan tier.
 * Returns 'free' if no match found.
 */
export function getPlanTierByPriceId(priceId: string): PlanTier {
  for (const plan of Object.values(PLANS)) {
    if (
      priceId === plan.stripePriceIdMonthly ||
      priceId === plan.stripePriceIdAnnual
    ) {
      return plan.tier
    }
  }
  return 'free'
}
