'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * SessionManagement - Sign out all other devices or sign out everywhere
 *
 * Supabase does not expose a public API to list individual sessions,
 * so this is a simplified UI that provides two global sign-out actions:
 *
 * - Sign out all other devices: revokes all sessions except the current one
 * - Sign out everywhere: revokes all sessions including this one
 */
export function SessionManagement() {
  const supabase = createClient()
  const router = useRouter()
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function signOutOthers() {
    if (!confirm('This will sign you out of all other devices. Continue?')) return

    setIsLoading(true)
    setStatus(null)

    const { error } = await supabase.auth.signOut({ scope: 'others' })

    if (error) {
      setStatus({ type: 'error', message: 'Failed to sign out other sessions. Please try again.' })
    } else {
      setStatus({ type: 'success', message: 'All other sessions have been signed out.' })
    }

    setIsLoading(false)
  }

  async function signOutAll() {
    if (!confirm('This will sign you out of ALL devices, including this one. Continue?')) return

    setIsLoading(true)
    setStatus(null)

    await supabase.auth.signOut({ scope: 'global' })
    router.push('/login')
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Sessions</CardTitle>
        <CardDescription>Manage your active sessions across devices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status && (
          <p className={`text-sm ${status.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
            {status.message}
          </p>
        )}
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={signOutOthers}
            disabled={isLoading}
          >
            Sign out all other devices
          </Button>
          <Button
            variant="destructive"
            onClick={signOutAll}
            disabled={isLoading}
          >
            Sign out everywhere
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
