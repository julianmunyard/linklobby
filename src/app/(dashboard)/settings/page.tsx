import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UsernameForm } from './username-form'
import { getUserPlan } from '@/lib/stripe/subscription'
import { BillingSection } from '@/components/billing/billing-section'
import { ChangePasswordForm } from '@/components/settings/change-password-form'
import { ChangeEmailForm } from '@/components/settings/change-email-form'
import { TwoFactorStatus } from '@/components/auth/two-factor-verify'
import { SessionManagement } from '@/components/auth/session-list'
import { StorageUsageBar } from '@/components/settings/storage-usage-bar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, storage_used_bytes')
    .eq('id', user.id)
    .single()

  // Fetch plan tier and subscription details
  const tier = await getUserPlan(user.id)

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('current_period_end, cancel_at_period_end, status')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const isTrial = subscription?.status === 'trialing'

  return (
    <div className="h-full overflow-auto p-4 sm:p-8">
      <header className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/editor">Back to Editor</Link>
        </Button>
      </header>

      <main className="space-y-10">
        {/* Profile section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <UsernameForm currentUsername={profile?.username || ''} />
          </div>
        </section>

        {/* Account section */}
        <section>
          <div className="border-t pt-8">
            <h2 className="text-lg font-semibold mb-4">Account</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ChangePasswordForm userEmail={user.email || ''} />
              <ChangeEmailForm userEmail={user.email || ''} />
            </div>
          </div>
        </section>

        {/* Security section */}
        <section>
          <div className="border-t pt-8">
            <h2 className="text-lg font-semibold mb-4">Security</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TwoFactorStatus />
                </CardContent>
              </Card>
              <SessionManagement />
            </div>
          </div>
        </section>

        {/* Billing & Storage section */}
        <section>
          <div className="border-t pt-8">
            <h2 className="text-lg font-semibold mb-4">Billing & Storage</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Plan & Billing</CardTitle>
                  <CardDescription>
                    Manage your subscription and billing details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BillingSection
                    tier={tier}
                    periodEnd={subscription?.current_period_end ?? null}
                    cancelAtPeriodEnd={subscription?.cancel_at_period_end ?? false}
                    isTrial={isTrial}
                  />
                </CardContent>
              </Card>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Storage</CardTitle>
                  <CardDescription>
                    Monitor your file storage usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StorageUsageBar
                    usedBytes={profile?.storage_used_bytes || 0}
                    quotaBytes={500 * 1024 * 1024}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
