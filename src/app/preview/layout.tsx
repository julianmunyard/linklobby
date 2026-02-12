import type { Viewport } from 'next'
import { ThemeApplicator } from '@/components/theme-applicator'

// Disable native pinch-to-zoom inside the preview iframe —
// zoom is handled by the parent editor via CSS transform
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ThemeApplicator>{children}</ThemeApplicator>
}
