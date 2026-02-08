import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that need COOP/COEP for Superpowered AudioWorklet (SharedArrayBuffer)
const audioRoutes = ['/editor', '/preview']

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/editor', '/settings']
  const isProtectedRoute = protectedPaths.some(path =>
    pathname.startsWith(path)
  )

  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
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

  // Add COOP/COEP headers for Superpowered AudioWorklet (SharedArrayBuffer)
  // Same pattern as Munyard Mixer's middleware.ts
  // Applied to editor + all public slug pages (where audio cards can play)
  const isAudioRoute = audioRoutes.some(path => pathname.startsWith(path))
  const isPublicPage = !pathname.startsWith('/api') &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/signup') &&
    !pathname.startsWith('/settings') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/auth')

  if (isAudioRoute || isPublicPage) {
    supabaseResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
    supabaseResponse.headers.set('Cross-Origin-Embedder-Policy', 'credentialless')
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
