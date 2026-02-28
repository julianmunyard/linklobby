import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/stripe/subscription'
import { PricingTable } from '@/components/billing/pricing-table'
import type { PlanTier } from '@/lib/stripe/plans'

export const metadata: Metadata = {
  title: 'Pricing - LinkLobby',
  description: 'Simple, transparent pricing. Start free and upgrade when you\'re ready.',
}

const FAQ_ITEMS = [
  {
    question: 'Is there a free trial?',
    answer:
      'Yes — paid plans include a 7-day free trial with no credit card required. You can cancel anytime during the trial and won\'t be charged.',
  },
  {
    question: 'Can I change plans later?',
    answer:
      'Absolutely. You can upgrade or downgrade at any time. Upgrades take effect immediately, and downgrades apply at the end of your current billing period.',
  },
  {
    question: 'What happens if I cancel?',
    answer:
      'You\'ll keep access to your paid features until the end of your billing period. After that, your account reverts to the Free plan and your page remains live.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'We offer a 7-day trial so you can try before you pay. If you have a billing issue, contact support and we\'ll make it right.',
  },
]

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentTier: PlanTier | undefined
  if (user) {
    currentTier = await getUserPlan(user.id)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
          Start free. Upgrade when you&apos;re ready. No hidden fees.
        </p>
      </div>

      {/* Pricing table */}
      <PricingTable currentTier={currentTier} />

      {/* FAQ */}
      <div className="mt-24 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8 text-white">Frequently asked questions</h2>
        <div className="divide-y divide-white/10">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question} className="py-6">
              <h3 className="font-semibold mb-2 text-white">{item.question}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
