import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/editor'

  let redirectUrl = `${origin}/login?error=auth_callback_error`

  if (code) {
    let redirectTo = `${origin}${next}`
    if (type === 'recovery') {
      redirectTo = `${origin}/reset-password`
    } else if (type === 'email_change') {
      redirectTo = `${origin}/settings?email_updated=true`
    }

    const response = NextResponse.redirect(redirectTo)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return response
    }

    console.error('Auth callback error:', error.message)
  }

  return NextResponse.redirect(redirectUrl)
}
