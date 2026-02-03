---
phase: 09-platform-integrations
plan: 05
subsystem: Editor Integration
tags: [music-card, playback-coordination, editor-ui]
dependency-graph:
  requires: ["09-02", "09-03", "09-04"]
  provides: ["music-card-editor-integration", "playback-coordination-wiring"]
  affects: ["09-06"]
tech-stack:
  added: []
  patterns: ["playback-coordination", "embed-registration"]
key-files:
  created: []
  modified:
    - src/components/cards/card-renderer.tsx
    - src/components/editor/card-property-editor.tsx
    - src/components/editor/cards-tab.tsx
    - src/components/cards/music-card.tsx
    - src/components/cards/video-card.tsx
decisions:
  - id: music-uses-default-empty-content
    choice: "Music cards use empty default content"
    rationale: "Users paste URL to configure, placeholder shows supported platforms"
  - id: video-cardid-prop
    choice: "Pass cardId as prop to VideoCardEmbed"
    rationale: "VideoCardEmbed is sub-component, needs card ID for playback registration"
  - id: pausefn-resets-to-thumbnail
    choice: "Pause function resets isPlaying to false (thumbnail state)"
    rationale: "Simplest pause implementation - heavy iframe unloads, saves resources"
metrics:
  duration: 3min
  completed: 2026-02-03
---

# Phase 9 Plan 05: Editor Integration Summary

Music card fully integrated into editor with playback coordination across all embeds.

## Changes

### 1. CardRenderer Integration
**File:** `src/components/cards/card-renderer.tsx`

Added MusicCard import and switch case:
```typescript
import { MusicCard } from "./music-card"

case "music":
  cardContent = <MusicCard card={card} isPreview={isPreview} />
  break
```

### 2. PropertyEditor Integration
**File:** `src/components/editor/card-property-editor.tsx`

Added MusicCardFields import and rendering for music cards:
```typescript
import { MusicCardFields } from "./music-card-fields"
import type { ..., MusicCardContent, ... } from "@/types/card"

{card.card_type === "music" && (
  <MusicCardFields
    content={currentContent as MusicCardContent}
    onChange={handleContentChange}
    cardId={card.id}
  />
)}
```

### 3. Cards Tab Integration
**File:** `src/components/editor/cards-tab.tsx`

Added music to Add Card dropdown:
```typescript
{ type: "music", label: "Music Card" },
```

### 4. MusicCard Playback Coordination
**File:** `src/components/cards/music-card.tsx`

Added embed playback coordination:
- Import `useOptionalEmbedPlayback` hook
- Register embed on mount with pause callback
- Unregister on unmount
- Call `setActiveEmbed` when play button clicked
- Pause function resets to thumbnail state

### 5. VideoCard Playback Coordination
**File:** `src/components/cards/video-card.tsx`

Added embed playback coordination to VideoCardEmbed:
- Added `cardId` prop to VideoCardEmbedProps interface
- Import `useOptionalEmbedPlayback` hook
- Register/unregister pattern same as MusicCard
- Pass `cardId` from VideoCard to VideoCardEmbed

## Verification Results

- Music type renders via CardRenderer: case "music" in switch
- MusicCardFields integrated in property editor
- Music card in Add Card menu
- TypeScript compiles without errors
- Build succeeds

## Implementation Notes

1. **Playback Coordination Pattern:** Both music and video cards use `useOptionalEmbedPlayback` (not `useEmbedPlayback`) so cards work on public pages where provider might not exist.

2. **Pause Implementation:** The simplest pause implementation is reverting to thumbnail state. This unloads the heavy iframe which saves resources. For more advanced control (Spotify/SoundCloud APIs), could add in future iteration.

3. **Default Content:** Music cards use empty default content (`{}`), showing placeholder with supported platforms until user pastes URL.

## Commits

| Hash | Message |
|------|---------|
| 499e22a | feat(09-05): integrate MusicCard into CardRenderer and PropertyEditor |
| 23e3ce9 | feat(09-05): wire playback coordination into music and video cards |

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

Phase 9 Plan 06 (Platform Verification) can proceed. All music card features are complete:
- Music card renders in preview
- Music card editable in property panel
- Playback coordination works across all embed types
- Only one embed plays at a time
