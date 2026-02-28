import type { ReactNode } from 'react'
import Link from 'next/link'
import { Squares } from '@/components/ui/squares-background'

export default function PricingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-neutral-950 overflow-hidden">
      {/* Animated grid background */}
      <div className="fixed inset-0 z-0">
        <Squares
          direction="diagonal"
          speed={0.5}
          borderColor="#696249"
          squareSize={40}
          hoverFillColor="#956232"
        />
      </div>

      {/* Content layer */}
      <div className="relative z-10">
        {/* Minimal nav */}
        <nav className="border-b border-white/10 bg-neutral-950/60 backdrop-blur sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg text-white">
              LinkLobby
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium bg-white text-neutral-900 rounded-md px-3 py-1.5 hover:bg-neutral-200 transition-colors"
              >
                Get started
              </Link>
            </div>
          </div>
        </nav>

        {children}

        {/* Footer */}
        <footer className="border-t border-white/10 mt-24 py-8 text-center text-sm text-neutral-500">
          <p>&copy; {new Date().getFullYear()} LinkLobby. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
