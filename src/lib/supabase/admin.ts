/**
 * Server-only Supabase admin client.
 * Uses service_role key to bypass RLS.
 * Never import from client components.
 */
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
