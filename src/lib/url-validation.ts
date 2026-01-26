/**
 * Result of URL validation
 */
export interface ValidationResult {
  valid: boolean
  url?: string
  error?: string
}

/**
 * Validate and auto-fix URL input
 * @param input User-provided URL string
 * @returns Validation result with normalized URL or error message
 *
 * Features:
 * - Trims whitespace
 * - Returns valid with empty string for empty input (allows optional URLs)
 * - Auto-adds https:// if no protocol present
 * - Uses native URL constructor for validation (handles international domains)
 * - Only allows http:// and https:// protocols
 */
export function validateAndFixUrl(input: string): ValidationResult {
  const trimmed = input.trim()

  // Empty input is valid (allows optional URLs)
  if (trimmed === '') {
    return { valid: true, url: '' }
  }

  // Auto-add https:// if no protocol present
  let urlToTest = trimmed
  if (!urlToTest.match(/^https?:\/\//i)) {
    urlToTest = `https://${urlToTest}`
  }

  try {
    const parsed = new URL(urlToTest)

    // Only allow http:// and https:// protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        valid: false,
        error: 'Only HTTP and HTTPS URLs are supported',
      }
    }

    return {
      valid: true,
      url: parsed.href,
    }
  } catch {
    return {
      valid: false,
      error: 'Invalid URL format',
    }
  }
}
