'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { Lock, Plus } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getTemplate } from '@/lib/templates'
import { getTheme } from '@/lib/themes'
import { usePageStore } from '@/stores/page-store'
import type { TemplateDefinition } from '@/lib/templates'
import type { ThemeId } from '@/types/theme'
import { cn } from '@/lib/utils'
import { usePlanTier } from '@/contexts/plan-tier-context'
import { PRO_THEMES } from '@/lib/stripe/plans'

// ---------------------------------------------------------------------------
// Curated featured template IDs
// ---------------------------------------------------------------------------

const FEATURED_IDS = [
  'phone-home-burple',
  'mac-os-my-mac',
  'instagram-reels-cards',
  'system-settings-quite-beskoke',
  'blinkies-blink-once',
  'vcr-menu-home-video',
  'ipod-classic-your-ipod',
  'macintosh-84-macintosh',
  'word-art-just-word-art',
  'chaotic-zine-simple-new',
  'artifact-brutal',
  'mac-os-white-light',
]

// Video preview paths keyed by template ID
const PREVIEW_VIDEOS: Record<string, string> = {
  'phone-home-burple': '/templates/previews/phone-home-burple.mp4',
  'mac-os-my-mac': '/templates/previews/mac-os-my-mac.mp4',
  'instagram-reels-cards': '/templates/previews/instagram-reels-cards.mp4',
  'system-settings-quite-beskoke': '/templates/previews/system-settings-quite-beskoke.mp4',
  'blinkies-blink-once': '/templates/previews/blinkies-blink-once.mp4',
  'vcr-menu-home-video': '/templates/previews/vcr-menu-home-video.mp4',
  'ipod-classic-your-ipod': '/templates/previews/ipod-classic-your-ipod.mp4',
  'macintosh-84-macintosh': '/templates/previews/macintosh-84-macintosh.mp4',
  'word-art-just-word-art': '/templates/previews/word-art-just-word-art.mp4',
  'chaotic-zine-simple-new': '/templates/previews/chaotic-zine-simple-new.mp4',
  'artifact-brutal': '/templates/previews/artifact-brutal.mp4',
  'mac-os-white-light': '/templates/previews/mac-os-white-light.mp4',
}

// ---------------------------------------------------------------------------
// LazyVideo — only loads/plays when visible in viewport
// ---------------------------------------------------------------------------

function LazyVideo({ src, poster, className }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = ref.current
        if (!video) return
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0">
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        className={className}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// FeaturedThemesTab
// ---------------------------------------------------------------------------

interface FeaturedThemesTabProps {
  onNavigateToTheme: (themeId: string) => void
  onNavigateToLinks?: () => void
  onTemplateApplied?: () => void
}

export function FeaturedThemesTab({ onNavigateToTheme, onNavigateToLinks }: FeaturedThemesTabProps) {
  const { planTier } = usePlanTier()
  const [showCreateOwnConfirm, setShowCreateOwnConfirm] = useState(false)

  const featuredTemplates = useMemo(() => {
    return FEATURED_IDS
      .map((id) => {
        const template = getTemplate(id)
        if (!template) return null
        const theme = getTheme(template.themeId as ThemeId)
        return {
          template,
          themeName: theme?.name ?? template.themeId,
        }
      })
      .filter(Boolean) as { template: NonNullable<ReturnType<typeof getTemplate>>; themeName: string }[]
  }, [])

  // ---------------------------------------------------------------------------
  // Card click handler — navigates to template picker for that theme
  // ---------------------------------------------------------------------------

  function handleCardClick(template: TemplateDefinition) {
    onNavigateToTheme(template.themeId)
  }

  // ---------------------------------------------------------------------------
  // Create Your Own flow
  // ---------------------------------------------------------------------------

  function handleCreateYourOwn() {
    const existingCardCount = usePageStore.getState().cards.length
    if (existingCardCount > 0) {
      setShowCreateOwnConfirm(true)
    } else {
      doCreateYourOwn()
    }
  }

  function doCreateYourOwn() {
    usePageStore.getState().setCards([])
    toast.success('Blank canvas ready — start adding your links!')
    onNavigateToLinks?.()
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 pb-20">
        {/* Heading */}
        <div className="mb-4">
          <h3 className="text-base font-semibold">Featured Themes</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Curated picks to get you started
          </p>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-2 gap-3">
          {featuredTemplates.map(({ template, themeName }) => (
            <motion.button
              key={template.id}
              onClick={() => handleCardClick(template)}
              className={cn(
                'flex flex-col rounded-lg border-2 border-border bg-card text-left overflow-hidden',
                'transition-colors hover:border-accent'
              )}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.12 }}
            >
              {/* Preview video / thumbnail */}
              <div className="relative w-full aspect-[9/16] bg-muted">
                {PREVIEW_VIDEOS[template.id] ? (
                  <LazyVideo
                    src={PREVIEW_VIDEOS[template.id]}
                    poster={template.thumbnailPath}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={template.thumbnailPath}
                    alt={template.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 150px"
                  />
                )}
                {/* Pro overlay */}
                {planTier === 'free' && PRO_THEMES.includes(template.themeId) ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <div className="flex flex-col items-center gap-1.5">
                      <Lock className="w-5 h-5 text-amber-400" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Pro</span>
                      <span className="text-[10px] text-white/70">Tap to preview</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Card info */}
              <div className="p-2.5 flex flex-col gap-0.5">
                <span className="text-xs font-medium leading-tight truncate">
                  {template.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {themeName}
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation()
                    onNavigateToTheme(template.themeId)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation()
                      onNavigateToTheme(template.themeId)
                    }
                  }}
                  className="text-[10px] text-white hover:underline text-left mt-1 w-fit"
                >
                  Explore theme
                </span>
              </div>
            </motion.button>
          ))}

          {/* Create Your Own card */}
          <motion.button
            onClick={handleCreateYourOwn}
            className={cn(
              'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card',
              'transition-colors hover:border-accent hover:bg-muted/30 min-h-[180px] gap-3 p-4'
            )}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.12 }}
          >
            <div className="rounded-full bg-muted p-3">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground text-center leading-tight">
              Create Your Own
            </span>
          </motion.button>
        </div>
      </div>

      {/* Create Your Own confirmation dialog */}
      <AlertDialog open={showCreateOwnConfirm} onOpenChange={setShowCreateOwnConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start with a blank canvas?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear your existing cards. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowCreateOwnConfirm(false); doCreateYourOwn() }}>
              Clear and start fresh
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
