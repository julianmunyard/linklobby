// src/components/cards/horizontal-link.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronRight, Link2 } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Card, HorizontalLinkContent } from "@/types/card"

interface HorizontalLinkProps {
  card: Card
  isPreview?: boolean
}

// Check if URL looks valid for an image
function isValidImageUrl(url: string | undefined): boolean {
  if (!url) return false
  return url.startsWith('http') && !url.includes('undefined') && !url.includes('null')
}

export function HorizontalLink({ card, isPreview = false }: HorizontalLinkProps) {
  const content = card.content as HorizontalLinkContent & { textAlign?: string; verticalAlign?: string }
  const [imageError, setImageError] = useState(false)
  const hasLink = Boolean(card.url)
  const hasValidImage = isValidImageUrl(content.imageUrl) && !imageError
  const textAlign = content.textAlign || "left"
  const verticalAlign = content.verticalAlign || "middle"

  const Wrapper = hasLink ? "a" : "div"
  const wrapperProps = hasLink
    ? {
        href: card.url!,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {}

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "relative flex gap-4 w-full p-4",
        "transition-colors duration-150",
        hasLink && "hover:opacity-80 cursor-pointer",
        !hasLink && "cursor-default",
        verticalAlign === "top" && "items-start",
        verticalAlign === "middle" && "items-center",
        verticalAlign === "bottom" && "items-end"
      )}
    >
      {/* Thumbnail or icon placeholder */}
      {hasValidImage ? (
        <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          <Image
            src={content.imageUrl!}
            alt={content.imageAlt || ""}
            fill
            className="object-cover"
            sizes="48px"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <Link2 className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      {/* Text content */}
      <div
        className={cn(
          "flex-1 min-w-0",
          textAlign === "left" && "text-left",
          textAlign === "center" && "text-center",
          textAlign === "right" && "text-right"
        )}
      >
        <h3 className="font-medium break-words line-clamp-2 text-theme-text" style={{ fontFamily: 'var(--font-theme-heading)' }}>
          {card.title || "Untitled Link"}
        </h3>
        {card.description && (
          <p className="text-sm text-theme-text/70 break-words line-clamp-2" style={{ fontFamily: 'var(--font-theme-body)' }}>
            {card.description}
          </p>
        )}
      </div>

      {/* Chevron indicator for links */}
      {hasLink && (
        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      )}
    </Wrapper>
  )
}
