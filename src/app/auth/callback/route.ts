import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/editor'

  if (code) {
    const cookieStore = await cookies()
    // Accumulate cookies that Supabase sets during code exchange.
    // We cannot use cookieStore.set() here because those mutations only
    // apply to the implicit response — returning our own NextResponse.redirect()
    // silently discards them, causing the session to be lost.
    const cookiesToSet: { name: string; value: string; options: any }[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookies) {
            cookies.forEach((cookie) => cookiesToSet.push(cookie))
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Determine redirect URL based on flow type
      let redirectUrl = `${origin}${next}`
      if (type === 'recovery') {
        redirectUrl = `${origin}/reset-password`
      } else if (type === 'email_change') {
        redirectUrl = `${origin}/settings?email_updated=true`
      }

      const response = NextResponse.redirect(redirectUrl)

      // Copy accumulated session cookies onto the redirect response.
      // This is critical — without this, cookies are lost and middleware
      // sees no session on the subsequent request to /editor.
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })

      return response
    }

    console.error('Auth callback error:', error.message, error)
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
