---
phase: quick-077
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/auth/callback/route.ts
autonomous: true

must_haves:
  truths:
    - "Google OAuth login redirects to /editor with a valid session (not back to /login)"
    - "Works in both normal Chrome (with stale cookies) and incognito"
    - "Email/password login still works"
    - "Password recovery flow still redirects to /reset-password"
    - "Email change verification still redirects to /settings"
  artifacts:
    - path: "src/app/auth/callback/route.ts"
      provides: "OAuth callback that correctly persists session cookies on the redirect response"
  key_links:
    - from: "src/app/auth/callback/route.ts"
      to: "src/middleware.ts"
      via: "Session cookies set on redirect response are readable by middleware on next request"
      pattern: "response\\.cookies\\.set"
---

<objective>
Fix Google OAuth redirect loop where users are bounced back to /login after successful OAuth code exchange.

Purpose: The auth callback route uses `cookieStore.set()` from `next/headers` to persist session cookies, but then returns an explicit `NextResponse.redirect()`. In Next.js Route Handlers, cookie mutations via `cookies().set()` are only applied to the implicit response — when you return your own `NextResponse`, those mutations are silently discarded. The session cookies never reach the browser, so the middleware sees no session on the next request to /editor and redirects to /login.

Output: A fixed callback route that collects cookies during `exchangeCodeForSession`, then explicitly copies them onto the `NextResponse.redirect()` before returning it.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/app/auth/callback/route.ts
@src/middleware.ts
@src/lib/supabase/middleware.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix cookie propagation in auth callback redirect response</name>
  <files>src/app/auth/callback/route.ts</files>
  <action>
Rewrite the callback route to collect cookies set by `exchangeCodeForSession` and copy them onto the redirect `NextResponse`. The pattern:

1. Instead of using `cookieStore.set()` directly, accumulate cookies in a local array during `setAll`.
2. After `exchangeCodeForSession` succeeds, create the `NextResponse.redirect()`.
3. Loop over the accumulated cookies and call `response.cookies.set(name, value, options)` on the redirect response.
4. Return that response.

This is the same pattern Supabase documents for middleware (`supabaseResponse.cookies.set`) but adapted for Route Handlers that return redirects.

Concrete implementation:

```typescript
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
    // Accumulate cookies that Supabase sets during code exchange
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

      // Copy accumulated session cookies onto the redirect response
      // This is critical — without this, cookies are lost and middleware
      // sees no session on the subsequent request
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
```

Key points:
- Do NOT call `cookieStore.set()` in setAll — that writes to the implicit response which we discard
- Accumulate in a plain array, then apply to the redirect response
- Keep all existing flow-type handling (recovery, email_change, default)
- The error path redirect does not need cookies (session failed)
  </action>
  <verify>
1. `npx tsc --noEmit` passes (no type errors in callback route)
2. Manual test: Click "Continue with Google" in normal Chrome (not incognito) -> should land on /editor, not /login
3. Manual test: Same flow in incognito -> should also work
4. Manual test: Email/password login still works (unaffected code path)
  </verify>
  <done>
Google OAuth flow completes with the user landing on /editor (or the intended destination) with a valid session. The middleware sees the session cookies on the redirect request and does not bounce to /login. Works in both normal and incognito browser sessions.
  </done>
</task>

</tasks>

<verification>
- Google OAuth: Click "Continue with Google" -> lands on /editor with valid session
- Password recovery: Magic link with type=recovery -> lands on /reset-password
- Email change: Link with type=email_change -> lands on /settings?email_updated=true
- Invalid code: Returns to /login?error=auth_callback_error
- Middleware: Still protects /editor, /settings from unauthenticated access
- Email/password login: Unaffected (uses different auth path)
</verification>

<success_criteria>
- OAuth login works in normal Chrome (the primary bug)
- OAuth login works in incognito Chrome
- All three callback flow types (OAuth, recovery, email_change) redirect correctly
- No TypeScript errors
- Existing auth flows unaffected
</success_criteria>

<output>
After completion, create `.planning/quick/077-fix-google-oauth-redirect-loop-back-to-l/077-SUMMARY.md`
</output>
