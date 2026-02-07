# Quick Task 044: Mac Gallery Full-bleed with 8-bit Arrows

**Removed circular gallery option on Macintosh theme. Gallery images now fill the entire large window with no whitespace. Navigation uses custom 8-bit jagged pixel arrows.**

## Commits

- `facd477` - feat(quick-044): Mac gallery full-bleed images with 8-bit pixel arrows

## Changes

### macintosh-card.tsx
- Replaced `MacintoshGallery` component: no longer wraps `GalleryCard`, instead renders images directly
- Full-bleed images with `objectFit: cover` and `aspectRatio: 4/3` fill the window
- Custom `PixelArrowLeft` / `PixelArrowRight` SVG components: jagged 8-bit staircase arrows built from 2x2 pixel rects
- Image counter badge at bottom center with Mac pixel font
- Removed `GalleryCard` import (no longer needed)

### static-macintosh-layout.tsx
- Same full-bleed + pixel arrow treatment for public pages
- Removed `CircularGallery` dynamic import, `EmblaCarouselGallery` import, `next/dynamic` import (all unused now)

### gallery-card-fields.tsx
- Added `isMacCard?: boolean` prop
- Gallery Style toggle (Circular/Carousel) hidden when `isMacCard` is true
- Circular Settings section hidden when `isMacCard` is true

### card-property-editor.tsx
- Passes `isMacCard` prop to `GalleryCardFields`

### cards-tab.tsx
- Default gallery style for Mac cards changed from `'circular'` to `'carousel'`

## Decisions

- **Carousel-only on Mac**: Circular WebGL gallery doesn't fit the retro Mac aesthetic. Simple image carousel with pixel arrows is on-brand.
- **Custom carousel (not Embla)**: Simple state-based image switching with `currentIndex` avoids Embla overhead and gives full control over the retro styling.
- **8-bit arrows via SVG**: Staircase pattern using 2x2 pixel rects gives authentic jagged look. `imageRendering: pixelated` ensures crisp edges.
