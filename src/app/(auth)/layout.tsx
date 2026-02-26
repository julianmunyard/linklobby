'use client'

import { Squares } from '@/components/ui/squares-background'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-neutral-950">
      <div className="absolute inset-0 z-0">
        <Squares
          direction="diagonal"
          speed={0.5}
          borderColor="#333"
          squareSize={40}
          hoverFillColor="#222"
        />
      </div>
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
