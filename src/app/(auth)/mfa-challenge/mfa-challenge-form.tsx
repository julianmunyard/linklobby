'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Mode = 'totp' | 'backup'

export function MfaChallengeForm() {
  const supabase = createClient()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('totp')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  function handleModeToggle() {
    setMode(prev => prev === 'totp' ? 'backup' : 'totp')
    setCode('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (mode === 'totp') {
      await handleTotpVerify()
    } else {
      await handleBackupVerify()
    }

    setIsLoading(false)
  }

  async function handleTotpVerify() {
    // Get enrolled TOTP factor
    const { data: factors, error: listError } = await supabase.auth.mfa.listFactors()
    if (listError || !factors.totp.length) {
      // No TOTP factor found — redirect to login
      router.push('/login')
      return
    }

    const totpFactor = factors.totp[0]

    // Create a challenge
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: totpFactor.id,
    })

    if (challengeError || !challenge) {
      setError(challengeError?.message || 'Failed to create verification challenge')
      return
    }

    // Verify the TOTP code
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: totpFactor.id,
      challengeId: challenge.id,
      code: code.trim(),
    })

    if (verifyError) {
      setError('Invalid code — check your authenticator app and try again')
      return
    }

    router.push('/editor')
    router.refresh()
  }

  async function handleBackupVerify() {
    const res = await fetch('/api/auth/backup-codes/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim() }),
    })

    if (res.ok) {
      // Cookie set by API response — redirect to editor
      router.push('/editor')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Invalid backup code')
    }
  }

  const isTotp = mode === 'totp'

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Two-factor authentication</CardTitle>
        <CardDescription>
          {isTotp
            ? 'Enter the 6-digit code from your authenticator app'
            : 'Enter one of your backup codes'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mfa-code">
              {isTotp ? 'Authenticator code' : 'Backup code'}
            </Label>
            <Input
              id="mfa-code"
              type="text"
              inputMode={isTotp ? 'numeric' : 'text'}
              maxLength={isTotp ? 6 : 10}
              placeholder={isTotp ? '000000' : 'XXXXXXXXXX'}
              value={code}
              onChange={e =>
                setCode(isTotp ? e.target.value.replace(/\D/g, '') : e.target.value.toUpperCase())
              }
              className="font-mono tracking-widest text-center"
              autoComplete="one-time-code"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || (isTotp ? code.length !== 6 : code.length < 8)}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>

          <button
            type="button"
            onClick={handleModeToggle}
            className="w-full text-center text-sm text-muted-foreground hover:text-primary hover:underline"
          >
            {isTotp ? 'Use a backup code instead' : 'Use authenticator app instead'}
          </button>
        </form>
      </CardContent>
    </Card>
  )
}
