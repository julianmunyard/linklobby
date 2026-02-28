import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware entirely for auth callback — the route handler
  // needs to exchange the OAuth code and set session cookies itself.
  // Running updateSession here would call getUser() before the code
  // is exchanged, which interferes with the OAuth flow.
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }

  const { supabaseResponse, user, supabase } = await updateSession(request)

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/editor', '/settings', '/mfa-challenge']
  const isProtectedRoute = protectedPaths.some(path =>
    pathname.startsWith(path)
  )

  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    // Don't set redirect param for /mfa-challenge — it's a transient auth step
    if (pathname !== '/mfa-challenge') {
      loginUrl.searchParams.set('redirect', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  // Auth routes - redirect to editor if already authenticated
  const authPaths = ['/login', '/signup']
  const isAuthRoute = authPaths.some(path =>
    pathname === path
  )

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/editor', request.url))
  }

  // MFA enforcement — only for authenticated users on protected routes
  // Skip /mfa-challenge itself to prevent redirect loops
  if (isProtectedRoute && user && !pathname.startsWith('/mfa-challenge')) {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

    if (aal && aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
      // User has TOTP enrolled but hasn't completed MFA this session.
      // Check for backup code bypass cookie (set by /api/auth/backup-codes/verify).
      const mfaBypass = request.cookies.get('mfa_backup_verified')?.value

      if (!mfaBypass) {
        return NextResponse.redirect(new URL('/mfa-challenge', request.url))
      }
    }
  }

  // NOTE: COOP/COEP headers removed — they blocked all cross-origin iframes
  // (Spotify, Apple Music, SoundCloud, etc. embeds showed "refused to connect").
  // Superpowered SDK has a fallback path without SharedArrayBuffer, so audio still works.

  return supabaseResponse
}

export const config = {
  matcher: [
    // Match all paths except static files and audio assets
    // API routes ARE included so the middleware can refresh auth tokens
    '/((?!_next/static|_next/image|favicon.ico|superpowered/|processors/|SP-es6\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|wasm)$).*)',
  ],
}
