# Quick Task 033: Small Video Card Same Size as Square Card

## Completed: 2026-02-03

## Summary

Made small video cards use `aspect-square` (1:1) aspect ratio instead of `aspect-video` (16:9) to match square card dimensions.

## Changes Made

### 1. card-renderer.tsx
- Pass `card.size` prop to `VideoCard` component

### 2. video-card.tsx
- Added `CardSize` import from types
- Added `size?: CardSize` prop to `VideoCardProps` interface
- Added conditional aspect ratio: `size === 'small' ? 'aspect-square' : 'aspect-video'`
- Updated all views to use conditional aspect ratio:
  - Main component placeholder (invalid content)
  - Final placeholder (no video configured)
  - `VideoCardUpload` component
  - `VideoCardEmbed` component (thumbnail + playing iframe)

## Result

| Card Size | Before | After |
|-----------|--------|-------|
| Big | 16:9 | 16:9 (unchanged) |
| Small | 16:9 | 1:1 (matches square card) |

## Commit

`81b81b9` - feat(quick-033): small video cards use square aspect ratio
