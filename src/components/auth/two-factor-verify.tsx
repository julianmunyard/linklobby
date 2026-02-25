'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { TwoFactorSetup } from './two-factor-setup'

interface TotpFactor {
  id: string
  friendly_name?: string
}

export function TwoFactorStatus() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)
  const [totpFactor, setTotpFactor] = useState<TotpFactor | null>(null)
  const [isDisabling, setIsDisabling] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [newCodes, setNewCodes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    checkMfaStatus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function checkMfaStatus() {
    setIsLoading(true)
    const { data } = await supabase.auth.mfa.listFactors()
    const totp = data?.totp?.[0] ?? null
    setTotpFactor(totp)
    setIsLoading(false)
  }

  async function handleDisable() {
    if (!totpFactor) return
    if (!confirm('Are you sure you want to disable two-factor authentication? Your account will be less secure.')) {
      return
    }

    setIsDisabling(true)
    setError(null)

    const { error: unenrollError } = await supabase.auth.mfa.unenroll({
      factorId: totpFactor.id,
    })

    if (unenrollError) {
      setError(unenrollError.message || 'Failed to disable 2FA')
      setIsDisabling(false)
      return
    }

    setTotpFactor(null)
    setStatusMessage('Two-factor authentication has been disabled.')
    setIsDisabling(false)
  }

  async function handleRegenerateCodes() {
    setIsRegenerating(true)
    setError(null)
    setNewCodes([])

    const res = await fetch('/api/auth/backup-codes', { method: 'POST' })
    if (!res.ok) {
      setError('Failed to regenerate backup codes. Please try again.')
      setIsRegenerating(false)
      return
    }

    const { codes } = await res.json()
    setNewCodes(codes)
    setIsRegenerating(false)
  }

  async function handleCopyAll() {
    await navigator.clipboard.writeText(newCodes.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading security settings...</p>
  }

  if (!totpFactor) {
    return (
      <div className="space-y-4">
        {statusMessage && (
          <p className="text-sm text-muted-foreground">{statusMessage}</p>
        )}
        <TwoFactorSetup onComplete={checkMfaStatus} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
        <p className="text-sm font-medium">Two-factor authentication is enabled</p>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {newCodes.length > 0 && (
        <div className="space-y-3 rounded-lg border p-4">
          <div className="rounded border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-3">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">New backup codes generated</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Your old backup codes have been invalidated. Save these new codes in a safe place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {newCodes.map((code, i) => (
              <code
                key={i}
                className="block text-sm font-mono bg-muted px-3 py-2 rounded text-center tracking-wider"
              >
                {code}
              </code>
            ))}
          </div>
          <Button variant="outline" onClick={handleCopyAll} size="sm" className="w-full">
            {copied ? 'Copied!' : 'Copy all codes'}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRegenerateCodes}
          disabled={isRegenerating || isDisabling}
        >
          {isRegenerating ? 'Generating...' : 'Regenerate backup codes'}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDisable}
          disabled={isDisabling || isRegenerating}
        >
          {isDisabling ? 'Disabling...' : 'Disable 2FA'}
        </Button>
      </div>
    </div>
  )
}
