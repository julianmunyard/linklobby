// src/components/cards/horizontal-link.tsx
"use client"

import Image from "next/image"
import { ChevronRight, Link2 } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Card, HorizontalLinkContent } from "@/types/card"

interface HorizontalLinkProps {
  card: Card
  isPreview?: boolean
}

export function HorizontalLink({ card, isPreview = false }: HorizontalLinkProps) {
  const content = card.content as HorizontalLinkContent
  const hasLink = Boolean(card.url)

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
        "relative flex items-center gap-4 w-full p-4 rounded-lg border bg-card",
        "transition-colors duration-150",
        hasLink && "hover:bg-accent hover:border-accent-foreground/20 cursor-pointer",
        !hasLink && "cursor-default"
      )}
    >
      {/* Thumbnail or icon placeholder */}
      {content.imageUrl ? (
        <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          <Image
            src={content.imageUrl}
            alt={content.imageAlt || ""}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      ) : (
        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <Link2 className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">
          {card.title || "Untitled Link"}
        </h3>
        {card.description && (
          <p className="text-sm text-muted-foreground truncate">
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
