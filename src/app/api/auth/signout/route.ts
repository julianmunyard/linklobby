import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generalApiRatelimit, checkRateLimit } from '@/lib/ratelimit'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const rl = await checkRateLimit(generalApiRatelimit, user.id)
    if (!rl.allowed) return rl.response!
  }

  await supabase.auth.signOut()

  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
}
