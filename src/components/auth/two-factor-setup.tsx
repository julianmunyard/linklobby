'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type SetupState = 'idle' | 'qr_code' | 'backup_codes' | 'complete'

interface EnrollData {
  factorId: string
  qrCode: string
  secret: string
}

export function TwoFactorSetup({ onComplete }: { onComplete?: () => void }) {
  const supabase = createClient()
  const [state, setState] = useState<SetupState>('idle')
  const [enrollData, setEnrollData] = useState<EnrollData | null>(null)
  const [totpCode, setTotpCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleEnable() {
    setIsLoading(true)
    setError(null)

    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Authenticator App',
    })

    if (enrollError || !data) {
      setError(enrollError?.message || 'Failed to start 2FA setup')
      setIsLoading(false)
      return
    }

    setEnrollData({
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    })
    setState('qr_code')
    setIsLoading(false)
  }

  async function handleVerifyTotp() {
    if (!enrollData) return
    if (totpCode.length !== 6) {
      setError('Enter the 6-digit code from your authenticator app')
      return
    }

    setIsLoading(true)
    setError(null)

    // Challenge the factor
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: enrollData.factorId,
    })

    if (challengeError || !challenge) {
      setError(challengeError?.message || 'Failed to create MFA challenge')
      setIsLoading(false)
      return
    }

    // Verify the TOTP code
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: enrollData.factorId,
      challengeId: challenge.id,
      code: totpCode,
    })

    if (verifyError) {
      setError('Invalid code — check your authenticator app and try again')
      setIsLoading(false)
      return
    }

    // TOTP verified — generate backup codes
    const res = await fetch('/api/auth/backup-codes', { method: 'POST' })
    if (!res.ok) {
      setError('2FA enabled but failed to generate backup codes. You can regenerate them from settings.')
      setState('complete')
      setIsLoading(false)
      return
    }

    const { codes } = await res.json()
    setBackupCodes(codes)
    setState('backup_codes')
    setIsLoading(false)
  }

  async function handleCopyAll() {
    await navigator.clipboard.writeText(backupCodes.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDone() {
    setState('complete')
    onComplete?.()
  }

  if (state === 'idle') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security to your account by requiring a code from your authenticator app when you sign in.
        </p>
        <Button onClick={handleEnable} disabled={isLoading}>
          {isLoading ? 'Setting up...' : 'Enable two-factor authentication'}
        </Button>
      </div>
    )
  }

  if (state === 'qr_code' && enrollData) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">
            1. Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </p>
          <div className="inline-block border rounded-lg p-3 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={enrollData.qrCode} alt="2FA QR code" width={160} height={160} />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Or enter this code manually:</p>
          <code className="block text-xs font-mono bg-muted px-3 py-2 rounded break-all select-all">
            {enrollData.secret}
          </code>
        </div>

        <div className="space-y-2">
          <Label htmlFor="totp-code">2. Enter the 6-digit code from your app to confirm</Label>
          <Input
            id="totp-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={totpCode}
            onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
            className="max-w-[160px] font-mono tracking-widest text-center"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button onClick={handleVerifyTotp} disabled={isLoading || totpCode.length !== 6}>
          {isLoading ? 'Verifying...' : 'Verify and enable'}
        </Button>
      </div>
    )
  }

  if (state === 'backup_codes') {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-4">
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
            Save your backup codes
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Store these in a safe place. Each code can only be used once. If you lose your authenticator app, you can use these to sign in.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {backupCodes.map((code, i) => (
            <code
              key={i}
              className="block text-sm font-mono bg-muted px-3 py-2 rounded text-center tracking-wider"
            >
              {code}
            </code>
          ))}
        </div>

        <Button variant="outline" onClick={handleCopyAll} className="w-full">
          {copied ? 'Copied!' : 'Copy all codes'}
        </Button>

        <Button onClick={handleDone} className="w-full">
          I have saved my backup codes
        </Button>
      </div>
    )
  }

  if (state === 'complete') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-4">
        <p className="text-sm font-semibold text-green-800 dark:text-green-200">
          Two-factor authentication is now enabled
        </p>
        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
          You will be asked for a code from your authenticator app each time you sign in.
        </p>
      </div>
    )
  }

  return null
}
