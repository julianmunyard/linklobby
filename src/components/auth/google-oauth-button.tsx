'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function GoogleOAuthButton() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleGoogleLogin() {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      {isLoading ? 'Redirecting...' : 'Continue with Google'}
    </Button>
  )
}
