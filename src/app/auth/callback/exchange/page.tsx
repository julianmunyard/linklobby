'use client'

import { Suspense } from 'react'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

function ExchangeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/editor'

    if (!code) {
      router.replace('/login?error=auth_callback_error')
      return
    }

    const supabase = createClient()

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        console.error('Exchange error:', error.message)
        router.replace('/login?error=auth_callback_error')
        return
      }

      if (type === 'recovery') {
        router.replace('/reset-password')
      } else if (type === 'email_change') {
        router.replace('/settings?email_updated=true')
      } else {
        router.replace(next)
      }
    })
  }, [router, searchParams])

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  )
}

export default function ExchangePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    }>
      <ExchangeContent />
    </Suspense>
  )
}
