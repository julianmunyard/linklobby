import crypto from 'crypto'

/**
 * Creates a privacy-safe visitor hash from IP address and User Agent
 *
 * The hash includes a daily salt (current date) which means:
 * - Same visitor gets same hash within a day (allows daily unique visitor count)
 * - Hash changes daily (prevents long-term tracking, privacy-friendly)
 * - No cookies required (GDPR-friendly)
 *
 * @param ip - IP address (can be null for missing data)
 * @param userAgent - User Agent string (can be null for missing data)
 * @returns SHA-256 hex digest hash
 */
export function createVisitorHash(ip: string | null, userAgent: string | null): string {
  // Daily salt rotates the hash daily (no persistent tracking)
  const dailySalt = new Date().toDateString()

  // Combine IP, User Agent, and salt with pipe delimiter
  const input = `${ip || 'unknown'}|${userAgent || 'unknown'}|${dailySalt}`

  // Create SHA-256 hash
  const hash = crypto.createHash('sha256')
  hash.update(input)

  // Return hex digest
  return hash.digest('hex')
}
