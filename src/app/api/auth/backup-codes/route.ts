import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateCsrfOrigin } from '@/lib/csrf'
import { generalApiRatelimit, checkRateLimit } from '@/lib/ratelimit'
import crypto from 'crypto'
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

  // Rate limit: keyed by user ID
  const rl = await checkRateLimit(generalApiRatelimit, user.id)
  if (!rl.allowed) return rl.response!

  // Generate 10 backup codes (10-char hex uppercase)
  const codes = Array.from({ length: 10 }, () =>
    crypto.randomBytes(5).toString('hex').toUpperCase()
  )

  // Hash all codes with bcrypt (salt rounds: 10)
  const hashes = await Promise.all(codes.map(c => bcrypt.hash(c, 10)))

  const admin = createAdminClient()

  // Delete existing codes for this user (supports regeneration)
  await admin.from('mfa_backup_codes').delete().eq('user_id', user.id)

  // Insert new hashed codes
  const rows = hashes.map(hash => ({
    user_id: user.id,
    code_hash: hash,
  }))
  const { error } = await admin.from('mfa_backup_codes').insert(rows)

  if (error) {
    console.error('[backup-codes] Insert failed:', error)
    return NextResponse.json({ error: 'Failed to generate backup codes' }, { status: 500 })
  }

  // Return plaintext codes — shown ONCE to user, never stored in plaintext
  return NextResponse.json({ codes })
}
