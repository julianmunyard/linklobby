import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/editor', '/settings']
  const isProtectedRoute = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Auth routes - redirect to editor if already authenticated
  const authPaths = ['/login', '/signup']
  const isAuthRoute = authPaths.some(path =>
    request.nextUrl.pathname === path
  )

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/editor', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
