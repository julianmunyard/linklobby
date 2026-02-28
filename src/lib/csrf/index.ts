export function validateCsrfOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  // Vercel may use x-forwarded-host instead of host
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host')

  if (!origin || !host) return false

  try {
    const originHost = new URL(origin).host
    return originHost === host
  } catch {
    return false
  }
}
