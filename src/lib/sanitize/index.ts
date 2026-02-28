/**
 * Strip all HTML tags from user-supplied text.
 * Previously used isomorphic-dompurify + jsdom which crashed on Vercel serverless.
 * Since we strip ALL tags (no allowed tags/attrs), a simple regex approach is safe.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}
