"use client"

import { useMemo, useState } from "react"
import { Loader2, Plus, Download, Gamepad2, Mail, Disc } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SortableCardList } from "@/components/canvas/sortable-card-list"
import { CanvasContainer } from "@/components/canvas/canvas-container"
import { usePageStore } from "@/stores/page-store"
import { useThemeStore } from "@/stores/theme-store"
import { useCards } from "@/hooks/use-cards"
import { generateAppendKey, generatePrependKey, sortCardsBySortKey } from "@/lib/ordering"
import type { CardType } from "@/types/card"
import { CARD_TYPE_SIZING } from "@/types/card"
import { DEFAULT_EMAIL_COLLECTION_CONTENT } from "@/types/fan-tools"
import { DEFAULT_RELEASE_CONTENT } from "./release-card-fields"
import { DEFAULT_AUDIO_CONTENT } from "@/types/audio"
import { LinktreeImportDialog } from "./linktree-import-dialog"

const CARD_TYPES: { type: CardType; label: string; singleton?: boolean }[] = [
  { type: "link", label: "Link" },
  { type: "mini", label: "Mini Link" },
  { type: "text", label: "Text" },
  { type: "horizontal", label: "Horizontal Link" },
  { type: "hero", label: "Hero Card" },
  { type: "square", label: "Square Card" },
  { type: "video", label: "Video Card" },
  { type: "audio", label: "Audio Player" },
  { type: "music", label: "Music Card" },
  { type: "gallery", label: "Photo Gallery" },
  { type: "game", label: "Game" },
  { type: "email-collection", label: "Email Collection" },
  { type: "release", label: "Release" },
  { type: "social-icons", label: "Social Icons" },
]

// Phone Home theme — limited card types that make sense as app icons / widgets
const PHONE_HOME_CARD_TYPES: { type: CardType; label: string }[] = [
  { type: "link", label: "Icon" },
  { type: "audio", label: "Audio Player" },
  { type: "music", label: "Music Card" },
  { type: "gallery", label: "Photo Gallery" },
  { type: "social-icons", label: "Social Icons" },
]

type MacWindowStyle = 'notepad' | 'small-window' | 'large-window' | 'title-link' | 'map' | 'calculator' | 'presave' | 'gallery'

const MAC_CARD_TYPES: { label: string; macWindowStyle: MacWindowStyle }[] = [
  { label: "Note Pad", macWindowStyle: "notepad" },
  { label: "Small Window", macWindowStyle: "small-window" },
  { label: "Large Window", macWindowStyle: "large-window" },
  { label: "Title Link", macWindowStyle: "title-link" },
  { label: "Pre-save", macWindowStyle: "presave" },
  { label: "Photos", macWindowStyle: "gallery" },
  { label: "Map", macWindowStyle: "map" },
  { label: "Calculator", macWindowStyle: "calculator" },
]

export function CardsTab() {
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  // Select raw cards array (stable reference)
  const rawCards = usePageStore((state) => state.cards)
  const selectedCardId = usePageStore((state) => state.selectedCardId)
  const reorderCards = usePageStore((state) => state.reorderCards)
  const selectCard = usePageStore((state) => state.selectCard)
  const themeId = useThemeStore((state) => state.themeId)

  // Sort cards and filter out theme-incompatible hidden cards
  const allCards = useMemo(() => sortCardsBySortKey(rawCards), [rawCards])
  const cards = useMemo(() => allCards.filter((c) => {
    const content = c.content as Record<string, unknown>
    const hasMacStyle = !!content?.macWindowStyle
    const hiddenForMac = !!content?._hiddenForMac
    if (themeId === 'macintosh' && hiddenForMac && !c.is_visible) return false
    if (themeId !== 'macintosh' && hasMacStyle && !c.is_visible) return false
    return true
  }), [allCards, themeId])

  const removeCardFromStore = usePageStore((state) => state.removeCard)

  const { isLoading, error, createCard, removeCard: removeCardFromDb } = useCards()

  // Delete card from store and DB
  const handleDeleteCard = async (id: string) => {
    try {
      // Remove from store first (optimistic)
      removeCardFromStore(id)
      // Then remove from database
      await removeCardFromDb(id)
    } catch (err) {
      console.error("Failed to delete card:", err)
      // TODO: Could restore card to store on failure
    }
  }

  // Toggle card visibility
  const handleToggleVisibility = (id: string) => {
    const card = cards.find(c => c.id === id)
    if (card) {
      usePageStore.getState().updateCard(id, { is_visible: !card.is_visible })
    }
  }

  // Create card in DB first, then add to store with DB-generated id
  const handleAddCard = async (type: CardType, macWindowStyle?: MacWindowStyle) => {
    try {
      // Social icons go to top by default, others to bottom
      const sortKey = type === "social-icons"
        ? generatePrependKey(cards)
        : generateAppendKey(cards)
      // Card types with null sizing (horizontal, audio) always use 'big'
      const size = CARD_TYPE_SIZING[type] === null ? "big" : "big"

      // Type-specific default content (text and vertical alignment)
      const defaultContent: Record<string, unknown> = (() => {
        // Mac window style cards — explicit defaults matching migration/renderer expectations
        if (macWindowStyle) {
          switch (macWindowStyle) {
            case 'notepad':
              return { macWindowStyle: 'notepad', macLinks: [], notepadStyle: 'list', notepadBgColor: '#F2FFA4' }
            case 'small-window':
              return { macWindowStyle: 'small-window', macMode: 'link', macCheckerColor: '#cfffcc', macWindowBgColor: '#afb3ee', macTextAlign: 'left', macTextColor: '#000' }
            case 'large-window':
              return { macWindowStyle: 'large-window', macMode: 'link', macBodyText: '' }
            case 'title-link':
              return { macWindowStyle: 'title-link' }
            case 'gallery':
              return { macWindowStyle: 'gallery', galleryStyle: 'carousel', images: [] }
            case 'presave':
              return { macWindowStyle: 'presave', presaveBgColor: '#ad7676', textColor: '#000000', dropsInText: 'Drops in', ...DEFAULT_RELEASE_CONTENT }
            case 'map':
              return { macWindowStyle: 'map' }
            case 'calculator':
              return { macWindowStyle: 'calculator', calcMessage: '' }
            default:
              return { macWindowStyle }
          }
        }
        switch (type) {
          case "hero":
          case "square":
            return { textAlign: "center", verticalAlign: "bottom" }
          case "horizontal":
            return { textAlign: "left", verticalAlign: "middle" }
          case "link":
          case "mini":
          case "text":
            return { textAlign: "center", verticalAlign: "middle" }
          case "game":
            return { gameType: "snake" }
          case "audio":
            return { ...DEFAULT_AUDIO_CONTENT }
          case "email-collection":
            return { ...DEFAULT_EMAIL_COLLECTION_CONTENT }
          case "release":
            return { ...DEFAULT_RELEASE_CONTENT }
          default:
            return {}
        }
      })()

      // Mini and text cards default to center position
      const position = (type === "mini" || type === "text") ? "center" : "left"

      const newCard = await createCard({
        card_type: macWindowStyle === 'gallery' ? "gallery" : (macWindowStyle ? "hero" : type),
        title: null,
        description: null,
        url: null,
        content: defaultContent,
        size,
        position,
        sortKey,
        is_visible: true,
      })
      // Add to store with DB-generated id
      usePageStore.getState().setCards([...cards, newCard])
      usePageStore.getState().selectCard(newCard.id)
    } catch (err) {
      // Error already tracked in hook
      console.error("Failed to add card:", err)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <p>Failed to load cards: {error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with add and import buttons */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-sm font-medium">Cards</h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
            className="h-11" // 44px minimum touch target
          >
            <Download className="h-4 w-4 mr-1" />
            Import
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-11">
                <Plus className="h-4 w-4 mr-1" />
                Add Card
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="touch-pan-y">
              {themeId === 'macintosh' ? (
                <>
                  {MAC_CARD_TYPES.map(({ label, macWindowStyle }) => (
                    <DropdownMenuItem
                      key={macWindowStyle}
                      onClick={() => handleAddCard("hero", macWindowStyle)}
                      className="min-h-11"
                    >
                      {label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem
                    key="audio"
                    onClick={() => handleAddCard("audio")}
                    className="min-h-11"
                  >
                    <Disc className="h-4 w-4 mr-2" />
                    Audio Player
                  </DropdownMenuItem>
                </>
              ) : themeId === 'phone-home' ? (
                PHONE_HOME_CARD_TYPES.map(({ type, label }) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => handleAddCard(type)}
                    className="min-h-11"
                  >
                    {label}
                  </DropdownMenuItem>
                ))
              ) : (
                CARD_TYPES.map(({ type, label, singleton }) => {
                  const alreadyExists = singleton && cards.some(c => c.card_type === type)
                  return (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => handleAddCard(type)}
                      disabled={alreadyExists}
                      className="min-h-11" // 44px minimum touch target
                    >
                      {label}
                      {alreadyExists && " (added)"}
                    </DropdownMenuItem>
                  )
                })
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Scrollable card list */}
      <div className="flex-1 overflow-y-auto p-4">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <p className="text-muted-foreground mb-4">No cards yet. Get started by importing from Linktree or creating your first card.</p>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                onClick={() => setImportDialogOpen(true)}
              >
                <Download className="h-4 w-4 mr-2" />
                Import from Linktree
              </Button>
            </div>
          </div>
        ) : (
          <CanvasContainer>
            <SortableCardList
              cards={cards}
              onReorder={reorderCards}
              selectedCardId={selectedCardId}
              onSelectCard={selectCard}
              onDeleteCard={handleDeleteCard}
              onToggleVisibility={handleToggleVisibility}
            />
          </CanvasContainer>
        )}
      </div>

      {/* Import dialog */}
      <LinktreeImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </div>
  )
}
