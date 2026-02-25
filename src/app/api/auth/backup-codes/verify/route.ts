import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateCsrfOrigin } from '@/lib/csrf'
import { loginRatelimit, checkRateLimit } from '@/lib/ratelimit'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  // CSRF validation
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit: brute-force sensitive — use loginRatelimit (5/15min keyed by user ID)
  const rl = await checkRateLimit(loginRatelimit, user.id)
  if (!rl.allowed) return rl.response!

  const body = await request.json()
  const { code } = body
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Code required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: storedCodes } = await admin
    .from('mfa_backup_codes')
    .select('id, code_hash')
    .eq('user_id', user.id)
    .is('used_at', null)

  if (!storedCodes?.length) {
    return NextResponse.json({ error: 'No valid backup codes' }, { status: 400 })
  }

  // Try each stored hash — bcrypt.compare is constant-time
  const normalizedCode = code.toUpperCase().trim()
  for (const stored of storedCodes) {
    const isValid = await bcrypt.compare(normalizedCode, stored.code_hash)
    if (isValid) {
      // Mark code as used
      await admin
        .from('mfa_backup_codes')
        .update({ used_at: new Date().toISOString() })
        .eq('id', stored.id)

      // Set httpOnly cookie to bypass MFA middleware check.
      // Supabase cannot upgrade AAL via backup codes natively — only TOTP verify can.
      // This cookie tells middleware "user verified identity via backup code".
      const response = NextResponse.json({ valid: true })
      response.cookies.set('mfa_backup_verified', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })
      return response
    }
  }

  return NextResponse.json({ error: 'Invalid backup code' }, { status: 400 })
}
