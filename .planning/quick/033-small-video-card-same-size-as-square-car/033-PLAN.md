# Quick Task 033: Small Video Card Same Size as Square Card

## Objective

Make small video cards use `aspect-square` (1:1) instead of `aspect-video` (16:9) so they match the square card dimensions when sized as "small".

## Context

Currently:
- Video cards always use `aspect-video` (16:9 ratio)
- Square cards use `aspect-square` (1:1 ratio)
- When both are set to "small" size (50% width), video cards are shorter than square cards

User wants:
- Small video cards should be the same size as small square cards (aspect-square)
- Big video cards should remain 16:9 (aspect-video)

## Tasks

### Task 1: Pass card size to VideoCard component

**File:** `src/components/cards/card-renderer.tsx`

Pass the `card.size` prop to `VideoCard` so it can adjust aspect ratio.

### Task 2: Update VideoCard to use aspect-square for small size

**File:** `src/components/cards/video-card.tsx`

1. Add `size` prop to `VideoCardProps` interface
2. In placeholder view, use `aspect-square` when size is "small", else `aspect-video`
3. Pass size to `VideoCardUpload` and `VideoCardEmbed` components
4. Update both sub-components to use conditional aspect ratio

## Files to Modify

1. `src/components/cards/card-renderer.tsx` - Pass size prop
2. `src/components/cards/video-card.tsx` - Conditional aspect ratio based on size

## Success Criteria

- [ ] Small video cards display with 1:1 aspect ratio (same as square cards)
- [ ] Big video cards remain 16:9 aspect ratio
- [ ] All video views (embed thumbnail, playing iframe, upload) respect size
