import type { ReactNode } from 'react'
import Link from 'next/link'

export default function PricingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal nav */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">
            LinkLobby
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-primary text-primary-foreground rounded-md px-3 py-1.5 hover:bg-primary/90 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {children}

      {/* Footer */}
      <footer className="border-t mt-24 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} LinkLobby. All rights reserved.</p>
      </footer>
    </div>
  )
}
