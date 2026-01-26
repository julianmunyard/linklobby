"use client"

import { useState, type ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Instagram,
  Youtube,
  Twitter,
  Music,
  Music2,
  Plus,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react"
import {
  SOCIAL_PLATFORMS,
  type SocialPlatform,
} from "@/types/profile"
import { useProfileStore } from "@/stores/profile-store"

/**
 * Icon mapping for social platforms
 * Lucide doesn't have native TikTok/Spotify icons, using closest matches
 */
export const PLATFORM_ICONS: Record<SocialPlatform, LucideIcon> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  spotify: Music,    // Closest match for Spotify
  tiktok: Music2,    // Closest match for TikTok
}

interface SocialIconPickerProps {
  children?: ReactNode
}

type Step = "select" | "url"

/**
 * Two-step dialog for adding social icons:
 * 1. Select platform from Big 5 grid
 * 2. Enter URL for selected platform
 */
export function SocialIconPicker({ children }: SocialIconPickerProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("select")
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null)
  const [url, setUrl] = useState("")

  const addSocialIcon = useProfileStore((state) => state.addSocialIcon)

  // Get all platforms as array for rendering
  const platforms = Object.entries(SOCIAL_PLATFORMS) as [SocialPlatform, typeof SOCIAL_PLATFORMS[SocialPlatform]][]

  function resetState() {
    setStep("select")
    setSelectedPlatform(null)
    setUrl("")
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) {
      resetState()
    }
  }

  function handlePlatformSelect(platform: SocialPlatform) {
    setSelectedPlatform(platform)
    setStep("url")
  }

  function handleBack() {
    setStep("select")
    setSelectedPlatform(null)
    setUrl("")
  }

  function normalizeUrl(inputUrl: string): string {
    const trimmed = inputUrl.trim()
    // Add https:// prefix if missing
    if (trimmed && !trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return `https://${trimmed}`
    }
    return trimmed
  }

  function handleAdd() {
    if (!selectedPlatform || !url.trim()) return

    const normalizedUrl = normalizeUrl(url)
    addSocialIcon(selectedPlatform, normalizedUrl)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline" size="sm">
            <Plus className="size-4" />
            Add Icon
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "select" ? "Add Social Icon" : `Add ${selectedPlatform ? SOCIAL_PLATFORMS[selectedPlatform].label : ""} Link`}
          </DialogTitle>
        </DialogHeader>

        {step === "select" ? (
          // Platform selection grid
          <div className="grid grid-cols-3 gap-3">
            {platforms.map(([platform, meta]) => {
              const Icon = PLATFORM_ICONS[platform]
              return (
                <button
                  key={platform}
                  onClick={() => meta.enabled && handlePlatformSelect(platform)}
                  disabled={!meta.enabled}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-lg border
                    transition-colors
                    ${meta.enabled
                      ? "hover:bg-accent hover:border-accent-foreground/20 cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                    }
                  `}
                >
                  <Icon className="size-6" />
                  <span className="text-sm font-medium">{meta.label}</span>
                  {!meta.enabled && (
                    <span className="text-xs text-muted-foreground">Coming soon</span>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          // URL input step
          <div className="space-y-4">
            {selectedPlatform && (
              <>
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = PLATFORM_ICONS[selectedPlatform]
                    return <Icon className="size-6" />
                  })()}
                  <span className="font-medium">{SOCIAL_PLATFORMS[selectedPlatform].label}</span>
                </div>
                <Input
                  type="url"
                  placeholder={SOCIAL_PLATFORMS[selectedPlatform].placeholder}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && url.trim()) {
                      handleAdd()
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                  <Button onClick={handleAdd} disabled={!url.trim()}>
                    Add
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
