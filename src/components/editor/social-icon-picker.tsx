"use client"

import { useState, type ReactNode, type ComponentType } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft, Globe, Mail, Music } from "lucide-react"
import {
  SiInstagram, SiTiktok, SiYoutube, SiSpotify, SiX,
  SiSoundcloud, SiApplemusic, SiBandcamp, SiAmazonmusic,
  SiFacebook, SiThreads, SiBluesky, SiSnapchat, SiPinterest, SiLinkedin, SiWhatsapp,
  SiTwitch, SiKick, SiDiscord,
  SiPatreon, SiVenmo, SiCashapp, SiPaypal
} from "react-icons/si"
import {
  SOCIAL_PLATFORMS,
  type SocialPlatform,
} from "@/types/profile"
import { useProfileStore } from "@/stores/profile-store"
import { usePageStore } from "@/stores/page-store"
import { useCards } from "@/hooks/use-cards"
import { generateAppendKey } from "@/lib/ordering"

/**
 * Icon component type that works with both react-icons and Lucide
 */
type IconComponent = ComponentType<{ className?: string }>

/**
 * Icon mapping for social platforms using brand icons from react-icons
 * Website and Email use Lucide icons (generic icons)
 */
export const PLATFORM_ICONS: Record<SocialPlatform, IconComponent> = {
  // Big 5
  instagram: SiInstagram,
  tiktok: SiTiktok,
  youtube: SiYoutube,
  spotify: SiSpotify,
  twitter: SiX,
  // Music
  soundcloud: SiSoundcloud,
  applemusic: SiApplemusic,
  bandcamp: SiBandcamp,
  deezer: Music,  // No brand icon available
  amazonmusic: SiAmazonmusic,
  // Social
  facebook: SiFacebook,
  threads: SiThreads,
  bluesky: SiBluesky,
  snapchat: SiSnapchat,
  pinterest: SiPinterest,
  linkedin: SiLinkedin,
  whatsapp: SiWhatsapp,
  // Streaming
  twitch: SiTwitch,
  kick: SiKick,
  // Community
  discord: SiDiscord,
  // Other
  website: Globe,
  email: Mail,
  patreon: SiPatreon,
  venmo: SiVenmo,
  cashapp: SiCashapp,
  paypal: SiPaypal,
}

/**
 * Platform categories for organized icon picker UI
 */
const PLATFORM_CATEGORIES: { name: string; platforms: SocialPlatform[] }[] = [
  {
    name: "Popular",
    platforms: ["instagram", "tiktok", "youtube", "spotify", "twitter"],
  },
  {
    name: "Music",
    platforms: ["soundcloud", "applemusic", "bandcamp", "deezer", "amazonmusic"],
  },
  {
    name: "Social",
    platforms: ["facebook", "threads", "bluesky", "snapchat", "pinterest", "linkedin", "whatsapp"],
  },
  {
    name: "Streaming",
    platforms: ["twitch", "kick"],
  },
  {
    name: "Community & Support",
    platforms: ["discord", "patreon", "venmo", "cashapp", "paypal"],
  },
  {
    name: "Other",
    platforms: ["website", "email"],
  },
]

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
  const cards = usePageStore((state) => state.cards)
  const { createCard } = useCards()

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

  async function handleAdd() {
    if (!selectedPlatform) return

    const normalizedUrl = url.trim() ? normalizeUrl(url) : ""
    addSocialIcon(selectedPlatform, normalizedUrl)

    // Auto-create social-icons card if it doesn't exist
    const hasSocialIconsCard = cards.some(c => c.card_type === "social-icons")
    if (!hasSocialIconsCard) {
      try {
        const sortKey = generateAppendKey(cards)
        const newCard = await createCard({
          card_type: "social-icons",
          title: null,
          description: null,
          url: null,
          content: {},
          size: "big",
          position: "left",
          sortKey,
          is_visible: true,
        })
        usePageStore.getState().setCards([...cards, newCard])
      } catch (err) {
        console.error("Failed to create social icons card:", err)
      }
    }

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
            {step === "select" ? "Add Social Icon" : `Add ${selectedPlatform ? SOCIAL_PLATFORMS[selectedPlatform].label : ""} Icon`}
          </DialogTitle>
        </DialogHeader>

        {step === "select" ? (
          // Platform selection by category
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {PLATFORM_CATEGORIES.map((category) => (
              <div key={category.name}>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">{category.name}</h4>
                <div className="grid grid-cols-4 gap-2">
                  {category.platforms.map((platform) => {
                    const meta = SOCIAL_PLATFORMS[platform]
                    const Icon = PLATFORM_ICONS[platform]
                    return (
                      <button
                        key={platform}
                        onClick={() => meta.enabled && handlePlatformSelect(platform)}
                        disabled={!meta.enabled}
                        className={`
                          flex flex-col items-center gap-1 p-2 rounded-lg border
                          transition-colors
                          ${meta.enabled
                            ? "hover:bg-accent hover:border-accent-foreground/20 cursor-pointer"
                            : "opacity-50 cursor-not-allowed"
                          }
                        `}
                        title={meta.label}
                      >
                        <Icon className="size-5" />
                        <span className="text-[10px] font-medium truncate w-full text-center">{meta.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
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
                    if (e.key === "Enter") {
                      handleAdd()
                    }
                  }}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">Leave blank to show icon without a link</p>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                  <Button onClick={handleAdd}>
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
