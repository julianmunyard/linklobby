import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Check if a user is allowed to publish their page.
 *
 * Returns null if the user is eligible to publish, or an error message
 * string if they are not (not authenticated, email not verified, etc.).
 *
 * Usage (client component):
 *   const error = await checkPublishEligibility(supabase)
 *   if (error) { toast.error(error); return }
 *
 * Usage (server/API route):
 *   const error = await checkPublishEligibility(supabase)
 *   if (error) return NextResponse.json({ error }, { status: 403 })
 */
export async function checkPublishEligibility(
  supabase: SupabaseClient
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return 'Not authenticated'
  if (!user.email_confirmed_at) return 'Please verify your email before publishing'

  return null
}
