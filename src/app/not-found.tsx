import Link from "next/link"

/**
 * Global 404 page
 *
 * Triggered by:
 * - Non-existent routes
 * - notFound() calls from pages (e.g., unpublished usernames)
 *
 * Design:
 * - Uses Ishmeria font for retro aesthetic (per CONTEXT.md)
 * - Minimal, clean layout
 * - Dark background with foreground text colors
 * - Link back to home
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* 404 with Ishmeria font */}
        <h1 className="text-8xl font-bold" style={{ fontFamily: "var(--font-ishmeria)" }}>
          404
        </h1>

        {/* Message */}
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">
          This page doesn't exist or has not been published yet.
        </p>

        {/* Back to home */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors font-medium"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
