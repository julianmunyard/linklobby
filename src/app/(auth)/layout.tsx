'use client'

import { Squares } from '@/components/ui/squares-background'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex h-[100dvh] items-center justify-center p-4 bg-neutral-950 overflow-hidden">
      <div className="fixed inset-0 z-0">
        <Squares
          direction="diagonal"
          speed={0.5}
          borderColor="#696249"
          squareSize={40}
          hoverFillColor="#956232"
        />
      </div>
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
