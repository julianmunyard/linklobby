export function validateCsrfOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  // Vercel proxies set x-forwarded-host to the real hostname;
  // prefer it over host which may be an internal Vercel address
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')

  if (!origin || !host) {
    console.warn('[CSRF] Missing headers — origin:', origin, 'host:', host)
    return false
  }

  try {
    const originHost = new URL(origin).host
    if (originHost !== host) {
      console.warn('[CSRF] Mismatch — origin:', originHost, 'host:', host)
      return false
    }
    return true
  } catch {
    return false
  }
}
