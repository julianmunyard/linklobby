// src/components/cards/square-card.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Card, SquareCardContent } from "@/types/card"

interface SquareCardProps {
  card: Card
  isPreview?: boolean
}

// Check if URL looks valid for an image
function isValidImageUrl(url: string | undefined): boolean {
  if (!url) return false
  return url.startsWith('http') && !url.includes('undefined') && !url.includes('null')
}

export function SquareCard({ card, isPreview = false }: SquareCardProps) {
  const content = card.content as SquareCardContent
  const [imageError, setImageError] = useState(false)
  const hasLink = Boolean(card.url)
  const showTitle = content.showTitle !== false && Boolean(card.title)
  const hasValidImage = isValidImageUrl(content.imageUrl) && !imageError

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
        "relative block aspect-square w-full rounded-lg border bg-card overflow-hidden",
        "transition-colors duration-150",
        hasLink && "hover:border-accent-foreground/20 cursor-pointer",
        !hasLink && "cursor-default"
      )}
    >
      {/* Image or placeholder */}
      {hasValidImage ? (
        <Image
          src={content.imageUrl!}
          alt={content.imageAlt || card.title || "Card image"}
          fill
          className="object-cover"
          sizes="(max-width: 400px) 50vw, 200px"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground" />
        </div>
      )}

      {/* Title overlay */}
      {showTitle && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-sm font-medium text-white truncate drop-shadow-sm">
              {card.title}
            </h3>
          </div>
        </>
      )}
    </Wrapper>
  )
}
