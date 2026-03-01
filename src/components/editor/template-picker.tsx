'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { Loader2, LayoutTemplate, Lock } from 'lucide-react'
import type { ThemeId } from '@/types/theme'
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
import { useThemeStore } from '@/stores/theme-store'
import { usePageStore } from '@/stores/page-store'
import { useProfileStore } from '@/stores/profile-store'
import { useActiveTemplate } from '@/components/editor/dev-template-saver'
import { getTemplatesByTheme } from '@/lib/templates'
import type { TemplateDefinition } from '@/lib/templates'
import type { Card } from '@/types/card'
import type { ThemeState } from '@/types/theme'
import type { Profile } from '@/types/profile'
import { cn } from '@/lib/utils'
import { usePlanTier } from '@/contexts/plan-tier-context'
import { PRO_THEMES } from '@/lib/stripe/plans'

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
// TemplatePicker
// ---------------------------------------------------------------------------

export function TemplatePicker({ browseThemeId }: { browseThemeId?: string | null } = {}) {
  const { planTier } = usePlanTier()
  const currentThemeId = useThemeStore((state) => state.themeId)
  const themeId = (browseThemeId || currentThemeId) as ThemeId
  const templates = getTemplatesByTheme(themeId)
  const isProTheme = planTier === 'free' && PRO_THEMES.includes(themeId)

  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingTemplate, setPendingTemplate] = useState<TemplateDefinition | null>(null)

  // ---------------------------------------------------------------------------
  // Apply flow
  // ---------------------------------------------------------------------------

  async function applyTemplate(template: TemplateDefinition, mode: 'replace' | 'add') {
    setApplyingId(template.id)
    setShowConfirm(false)

    try {
      const res = await fetch('/api/templates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: template.id, mode }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `HTTP ${res.status}`)
      }

      const data = await res.json() as {
        cards: Card[]
        theme: ThemeState
        profile: Partial<Profile>
        templateName: string
      }

      // Hydrate stores
      usePageStore.getState().setCards(data.cards)
      useThemeStore.getState().loadFromDatabase(data.theme)
      useProfileStore.getState().initializeProfile(data.profile)

      // CRITICAL: loadFromDatabase and initializeProfile both set hasChanges: false,
      // but applying a template IS a new change that must be persisted via autosave.
      useThemeStore.setState({ hasChanges: true })
      useProfileStore.setState({ hasChanges: true })

      toast.success(`Template "${data.templateName}" applied!`)
      useActiveTemplate.getState().setActiveTemplate(template.id)
    } catch (err) {
      console.error('[TemplatePicker] apply error:', err)
      toast.error('Failed to apply template. Please try again.')
    } finally {
      setApplyingId(null)
      setPendingTemplate(null)
    }
  }

  // ---------------------------------------------------------------------------
  // Card click handler — one-click apply (same as FeaturedThemesTab)
  // ---------------------------------------------------------------------------

  function handleCardClick(template: TemplateDefinition) {
    if (applyingId) return

    const existingCardCount = usePageStore.getState().cards.length

    if (existingCardCount > 0) {
      setPendingTemplate(template)
      setShowConfirm(true)
    } else {
      applyTemplate(template, 'replace')
    }
  }

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
        <LayoutTemplate className="w-8 h-8 text-muted-foreground/40" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">No templates available</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            No templates available for this theme yet
          </p>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Template grid — single click to apply
  // ---------------------------------------------------------------------------

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        {templates.map((template) => (
          <motion.button
            key={template.id}
            onClick={() => handleCardClick(template)}
            disabled={!!applyingId}
            className={cn(
              'flex flex-col rounded-lg border-2 border-border bg-card text-left overflow-hidden',
              'transition-colors hover:border-accent',
              'min-h-[44px]',
              applyingId && applyingId !== template.id && 'opacity-50 pointer-events-none'
            )}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.12 }}
          >
            {/* Preview video / thumbnail */}
            <div className="relative w-full aspect-[9/16] bg-muted">
              {(() => {
                const previewSrc = `/templates/previews/${template.id}.mp4`
                return (
                  <LazyVideo
                    src={previewSrc}
                    poster={template.thumbnailPath}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )
              })()}
              {/* Pro / loading overlay */}
              {applyingId === template.id ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              ) : isProTheme ? (
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
            <div className="p-2.5 flex flex-col gap-1">
              <div className="flex items-start gap-1.5 justify-between">
                <span className="text-xs font-medium leading-tight flex-1 min-w-0 truncate">
                  {template.name}
                </span>
                {template.energyLabel && (
                  <span className="shrink-0 text-[9px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded-full bg-accent/15 text-accent">
                    {template.energyLabel}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                {template.description}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Template?</AlertDialogTitle>
            <AlertDialogDescription>
              You have {usePageStore.getState().cards.length} existing card
              {usePageStore.getState().cards.length === 1 ? '' : 's'}. What would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="outline"
              onClick={() => pendingTemplate && applyTemplate(pendingTemplate, 'add')}
            >
              Add to my page
            </AlertDialogAction>
            <AlertDialogAction onClick={() => pendingTemplate && applyTemplate(pendingTemplate, 'replace')}>
              Replace my page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
