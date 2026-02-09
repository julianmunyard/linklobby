---
phase: quick
plan: 049
type: execute
wave: 1
depends_on: []
files_modified:
  - src/types/theme.ts
  - src/lib/themes/lanyard-badge.ts
  - src/lib/themes/index.ts
  - src/stores/theme-store.ts
  - src/components/cards/lanyard-badge-layout.tsx
  - src/components/cards/lanyard-badge-scene.tsx
  - src/components/cards/lanyard-badge-card-views.tsx
  - src/components/public/static-lanyard-badge-layout.tsx
  - src/app/preview/page.tsx
  - src/components/public/public-page-renderer.tsx
  - src/app/[username]/page.tsx
  - src/app/globals.css
autonomous: true

must_haves:
  truths:
    - "User can select the Lanyard Badge theme in the editor"
    - "Editor preview shows a 3D physics-based lanyard with a draggable badge card"
    - "Badge card displays receipt-paper styled content with paper texture blend"
    - "User can flick between card views using left/right arrows on the badge"
    - "Card views include: links list, video card, photo card, audio player, presave card"
    - "Public page renders the same 3D lanyard with card content"
    - "Lanyard physics allow dragging/flicking the badge naturally"
  artifacts:
    - path: "src/lib/themes/lanyard-badge.ts"
      provides: "ThemeConfig for lanyard-badge theme"
      exports: ["lanyardBadgeTheme"]
    - path: "src/components/cards/lanyard-badge-layout.tsx"
      provides: "Editor preview layout wrapping the 3D scene"
      exports: ["LanyardBadgeLayout"]
    - path: "src/components/cards/lanyard-badge-scene.tsx"
      provides: "Three.js Canvas with physics lanyard and HTML card overlay"
      exports: ["LanyardBadgeScene"]
    - path: "src/components/cards/lanyard-badge-card-views.tsx"
      provides: "Swipeable card view content (links, video, photo, audio, presave)"
      exports: ["LanyardCardViews"]
    - path: "src/components/public/static-lanyard-badge-layout.tsx"
      provides: "Public page layout with dynamically loaded 3D scene"
      exports: ["StaticLanyardBadgeLayout"]
  key_links:
    - from: "src/components/cards/lanyard-badge-layout.tsx"
      to: "lanyard-badge-scene.tsx"
      via: "imports and renders LanyardBadgeScene"
      pattern: "import.*LanyardBadgeScene"
    - from: "src/components/cards/lanyard-badge-scene.tsx"
      to: "lanyard-badge-card-views.tsx"
      via: "Html component from drei renders LanyardCardViews on 3D card"
      pattern: "import.*LanyardCardViews"
    - from: "src/app/preview/page.tsx"
      to: "lanyard-badge-layout.tsx"
      via: "themeId === 'lanyard-badge' conditional"
      pattern: "themeId.*lanyard-badge"
---

<objective>
Add a "Lanyard Badge" theme that renders a 3D physics-based badge hanging on a lanyard rope.
The badge card displays receipt-paper styled content that users can swipe through using
left/right arrows. Card views include: links list (4 links), video card, photo card,
audio player, and presave/release card.

Purpose: New premium theme that leverages react-three-fiber for a unique 3D interactive experience
where the user's link-in-bio content appears on a draggable conference-badge-style card.

Output: Fully functional lanyard-badge theme with 3D scene, swipeable card views,
editor preview integration, and public page support.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/types/theme.ts
@src/lib/themes/index.ts
@src/lib/themes/receipt.ts
@src/stores/theme-store.ts
@src/components/cards/receipt-layout.tsx
@src/components/public/public-page-renderer.tsx
@src/app/preview/page.tsx
@src/app/[username]/page.tsx
@src/app/globals.css
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Three.js dependencies</name>
  <files>package.json</files>
  <action>
    Install the required Three.js ecosystem packages:
    ```
    npm install three @react-three/fiber @react-three/drei @react-three/rapier meshline
    npm install -D @types/three
    ```

    These are needed for:
    - `three` - Core Three.js library
    - `@react-three/fiber` - React renderer for Three.js (Canvas, useFrame, extend)
    - `@react-three/drei` - Helpers (useGLTF, useTexture, Environment, Lightformer, Html)
    - `@react-three/rapier` - Physics engine (BallCollider, CuboidCollider, Physics, RigidBody, joints)
    - `meshline` - For rendering the lanyard rope (MeshLineGeometry, MeshLineMaterial)
    - `@types/three` - TypeScript types

    After install, verify packages are in package.json dependencies.
  </action>
  <verify>Run `npm ls three @react-three/fiber @react-three/drei @react-three/rapier meshline` to confirm all installed.</verify>
  <done>All six packages appear in package.json dependencies and node_modules.</done>
</task>

<task type="auto">
  <name>Task 2: Add lanyard-badge to theme type system and config</name>
  <files>
    src/types/theme.ts
    src/lib/themes/lanyard-badge.ts
    src/lib/themes/index.ts
  </files>
  <action>
    **2a. Update ThemeId union type** in `src/types/theme.ts`:
    Add `'lanyard-badge'` to the ThemeId union:
    ```ts
    export type ThemeId = 'mac-os' | 'instagram-reels' | 'system-settings' | 'vcr-menu' | 'ipod-classic' | 'receipt' | 'macintosh' | 'word-art' | 'lanyard-badge'
    ```

    Add optional lanyard state fields to ThemeState interface:
    ```ts
    lanyardActiveView?: number  // Active card view index (0-4)
    ```

    **2b. Create theme config** at `src/lib/themes/lanyard-badge.ts`:
    ```ts
    import type { ThemeConfig } from '@/types/theme'

    export const lanyardBadgeTheme: ThemeConfig = {
      id: 'lanyard-badge',
      name: 'Lanyard Badge',
      description: '3D physics-based conference badge on a lanyard with swipeable card views',
      isListLayout: true,

      defaultColors: {
        background: '#1a1a2e',      // Dark navy/indigo background (event hall feel)
        cardBg: '#f5f2eb',          // Off-white paper (receipt paper color)
        text: '#1a1a1a',            // Dark print on card
        accent: '#e94560',          // Vibrant red accent (lanyard color)
        border: '#1a1a1a',          // Dark borders
        link: '#1a1a1a',            // Dark links on card
      },

      defaultFonts: {
        heading: 'var(--font-hypermarket)',   // Reuse receipt heading font
        body: 'var(--font-ticket-de-caisse)', // Reuse receipt body font
        headingSize: 1.4,
        bodySize: 1.0,
        headingWeight: 'normal',
      },

      defaultStyle: {
        borderRadius: 8,
        shadowEnabled: false,
        blurIntensity: 0,
      },

      palettes: [
        {
          id: 'conference-dark',
          name: 'Conference Dark',
          colors: {
            background: '#1a1a2e',
            cardBg: '#f5f2eb',
            text: '#1a1a1a',
            accent: '#e94560',
            border: '#1a1a1a',
            link: '#1a1a1a',
          },
        },
        {
          id: 'backstage-pass',
          name: 'Backstage Pass',
          colors: {
            background: '#0f0f0f',
            cardBg: '#f5f2eb',
            text: '#1a1a1a',
            accent: '#ff6b35',
            border: '#1a1a1a',
            link: '#1a1a1a',
          },
        },
        {
          id: 'vip-gold',
          name: 'VIP Gold',
          colors: {
            background: '#1a1a1a',
            cardBg: '#faf8f0',
            text: '#2d2517',
            accent: '#d4a43a',
            border: '#2d2517',
            link: '#2d2517',
          },
        },
        {
          id: 'all-access',
          name: 'All Access',
          colors: {
            background: '#16213e',
            cardBg: '#e8eef5',
            text: '#1a2a4a',
            accent: '#0f3460',
            border: '#1a2a4a',
            link: '#1a2a4a',
          },
        },
      ],
    }
    ```

    **2c. Register in themes index** at `src/lib/themes/index.ts`:
    - Import `lanyardBadgeTheme` from `./lanyard-badge`
    - Add to `THEMES` array
    - Add `'lanyard-badge'` to `THEME_IDS` array
  </action>
  <verify>Run `npx tsc --noEmit` to confirm no type errors. Grep for 'lanyard-badge' in theme files.</verify>
  <done>ThemeId includes 'lanyard-badge', theme config file exists with palettes, theme is registered in index.</done>
</task>

<task type="auto">
  <name>Task 3: Add lanyard state to theme store</name>
  <files>src/stores/theme-store.ts</files>
  <action>
    Add lanyard-specific state and actions to the theme store following the exact pattern used by other themes (receiptPrice, ipodTexture, macPattern, etc.):

    **In ThemeStore interface, add:**
    ```ts
    lanyardActiveView: number  // Lanyard theme: active card view index (0 = links, 1 = video, 2 = photo, 3 = audio, 4 = presave)
    ```

    **Add action:**
    ```ts
    setLanyardActiveView: (view: number) => void
    ```

    **In initial state of create():**
    ```ts
    lanyardActiveView: 0,
    ```

    **Add action implementation:**
    ```ts
    setLanyardActiveView: (view: number) => {
      set({ lanyardActiveView: view, hasChanges: true })
    },
    ```

    **In setTheme():** No special handling needed (unlike receipt which sets image bg). The lanyard theme uses default solid background behavior.

    **In loadFromDatabase():** Add:
    ```ts
    lanyardActiveView: theme.lanyardActiveView ?? 0,
    ```

    **In getSnapshot():** Add:
    ```ts
    lanyardActiveView: state.lanyardActiveView,
    ```

    **In preview/page.tsx STATE_UPDATE handler:** Add:
    ```ts
    lanyardActiveView: ts.lanyardActiveView ?? 0,
    ```
  </action>
  <verify>Run `npx tsc --noEmit` to confirm no type errors.</verify>
  <done>Theme store has lanyardActiveView state field, setter action, and proper serialization in loadFromDatabase/getSnapshot.</done>
</task>

<task type="auto">
  <name>Task 4: Download/create lanyard 3D assets</name>
  <files>
    public/models/card.glb
    public/images/lanyard-band.png
  </files>
  <action>
    The ReactBits Lanyard component requires two assets:
    1. `card.glb` - A GLTF 3D model with meshes named `card`, `clip`, `clamp` and materials `base`, `metal`
    2. A band/lanyard texture PNG for the rope

    **Download the card.glb from ReactBits:**
    ```bash
    mkdir -p public/models
    curl -L "https://raw.githubusercontent.com/DavidHDev/react-bits/main/public/assets/card.glb" -o public/models/card.glb
    ```

    **Download the lanyard band texture:**
    ```bash
    curl -L "https://raw.githubusercontent.com/DavidHDev/react-bits/main/public/assets/lanyard.png" -o public/images/lanyard-band.png
    ```

    If the ReactBits URLs don't work (paths may differ), try:
    ```bash
    curl -L "https://reactbits.dev/assets/card.glb" -o public/models/card.glb
    curl -L "https://reactbits.dev/assets/lanyard.png" -o public/images/lanyard-band.png
    ```

    Verify the GLB file is a valid binary file (should be > 10KB) and the PNG is a valid image.
    If downloads fail, note this and we'll need to source them differently.
  </action>
  <verify>Run `ls -la public/models/card.glb public/images/lanyard-band.png` to confirm files exist and have reasonable sizes (GLB > 10KB, PNG > 1KB).</verify>
  <done>card.glb and lanyard-band.png are in the public directory ready for Three.js to load.</done>
</task>

<task type="auto">
  <name>Task 5: Create swipeable card views component</name>
  <files>src/components/cards/lanyard-badge-card-views.tsx</files>
  <action>
    Create the component that renders the different card view contents. This is pure HTML/CSS - no Three.js here. This component will be rendered INSIDE the 3D scene via drei's Html component.

    ```tsx
    'use client'

    import { useState } from 'react'
    import type { Card, ReleaseCardContent } from '@/types/card'
    import { isReleaseContent, isAudioContent } from '@/types/card'
    import type { AudioCardContent } from '@/types/audio'
    import { AudioPlayer } from '@/components/audio/audio-player'
    import { sortCardsBySortKey } from '@/lib/ordering'
    import { ChevronLeft, ChevronRight } from 'lucide-react'
    import Countdown, { CountdownRenderProps } from 'react-countdown'
    ```

    **Props interface:**
    ```ts
    interface LanyardCardViewsProps {
      cards: Card[]
      activeView: number
      onViewChange: (view: number) => void
      title: string
      avatarUrl?: string | null
      isPreview?: boolean
      onCardClick?: (cardId: string) => void
    }
    ```

    **Card dimensions:** The badge card is roughly 3.5:2.15 aspect ratio (credit card sized). The HTML content should fill a container approximately 336px wide x 213px tall (scaled to fit the 3D card). Use `width: 336px; height: 213px; overflow: hidden;` on the outer wrapper.

    **5 view types to implement:**

    **View 0 - Links List:**
    - Show up to 4 links from visible cards (filter same as receipt: exclude social-icons, release, text cards)
    - Receipt-paper styling: use font-family var(--font-ticket-de-caisse)
    - Title at top in var(--font-hypermarket) uppercase
    - Each link as a row with title and ">" arrow, receipt dot-leader style
    - If fewer than 4 links, that's fine; if more, only show first 4

    **View 1 - Video Card:**
    - Find first video card from cards array (card_type === 'video')
    - Show video thumbnail covering the full card area
    - Overlay play button icon centered
    - If no video card exists, show placeholder text "NO VIDEO"

    **View 2 - Photo Card:**
    - Find first image/gallery/hero/square card with an image URL
    - Show the image centered on white textured background
    - `object-fit: contain` so image fits within card bounds
    - If no image card exists, show placeholder

    **View 3 - Audio Player:**
    - Find first audio card from cards array
    - Render a compact version: album art (small), track title, artist, play button
    - Style with receipt typography
    - If no audio card, show placeholder

    **View 4 - Presave/Release Card:**
    - Find first release card from cards array
    - Show: release title, artist name, countdown (if future), presave button text
    - Receipt typography and styling
    - If no release card, show placeholder

    **Navigation arrows:**
    - At the bottom of every view, render left/right chevron arrows
    - Centered horizontally, positioned at the very bottom of the card
    - Left arrow disabled (opacity 0.3) when activeView === 0
    - Right arrow disabled when activeView === 4
    - onClick calls onViewChange(activeView - 1) or onViewChange(activeView + 1)
    - Arrows should have e.stopPropagation() to prevent dragging the 3D card

    **Dot indicators:**
    - 5 small dots between the arrows showing current position
    - Active dot is filled, others are outline

    **Paper texture:**
    - The outer wrapper should have the class `receipt-paper` to get the paper texture overlay
    - BUT remove the torn edges - this is a badge card, not a receipt
    - Instead add `rounded-lg overflow-hidden` for clean badge edges
    - The content inside uses `receipt-content` class for the multiply blend mode effect

    **Overall wrapper structure:**
    ```tsx
    <div
      className="relative overflow-hidden"
      style={{
        width: '336px',
        height: '213px',
        backgroundColor: 'var(--theme-card-bg)',
        color: 'var(--theme-text)',
        fontFamily: 'var(--font-ticket-de-caisse)',
        borderRadius: '8px',
      }}
    >
      {/* Paper texture pseudo-elements via lanyard-badge-card class */}
      <div className="lanyard-badge-card absolute inset-0" />
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col" style={{ mixBlendMode: 'multiply', opacity: 0.9 }}>
        {/* View content takes flex-1 */}
        <div className="flex-1 overflow-hidden px-3 pt-3 pb-1">
          {/* Render active view */}
        </div>
        {/* Navigation - fixed at bottom */}
        <div className="flex items-center justify-center gap-2 pb-2 px-3">
          <button onClick={prev} disabled={activeView===0} className="..."><ChevronLeft size={14} /></button>
          {/* 5 dots */}
          {[0,1,2,3,4].map(i => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === activeView ? 'bg-current' : 'border border-current opacity-40'}`} />
          ))}
          <button onClick={next} disabled={activeView===4} className="..."><ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
    ```

    IMPORTANT: All click handlers (arrows, links) must call `e.stopPropagation()` to prevent the Three.js drag handler from capturing them.
  </action>
  <verify>Run `npx tsc --noEmit` to confirm the component has no type errors.</verify>
  <done>LanyardCardViews component renders 5 different card views with navigation arrows, receipt-paper styling, and proper event isolation from Three.js drag.</done>
</task>

<task type="auto">
  <name>Task 6: Create the Three.js lanyard scene component</name>
  <files>src/components/cards/lanyard-badge-scene.tsx</files>
  <action>
    Create the core 3D scene component that renders the physics-based lanyard with badge card. This is adapted from the ReactBits Lanyard component but with our HTML card content overlaid.

    ```tsx
    'use client'
    ```

    **Imports needed:**
    - React: `useRef, useState, useEffect, useCallback`
    - @react-three/fiber: `Canvas, useFrame, extend`
    - @react-three/drei: `useGLTF, useTexture, Environment, Lightformer, Html`
    - @react-three/rapier: `BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint`
    - meshline: `MeshLineGeometry, MeshLineMaterial`
    - three: `THREE` (Vector3, CatmullRomCurve3, etc.)
    - Our card views: `LanyardCardViews`

    **Props interface:**
    ```ts
    interface LanyardBadgeSceneProps {
      cards: Card[]
      title: string
      activeView: number
      onViewChange: (view: number) => void
      avatarUrl?: string | null
      isPreview?: boolean
      onCardClick?: (cardId: string) => void
      lanyardColor?: string  // accent color for lanyard band
    }
    ```

    **Key implementation details:**

    1. **extend meshline:** At module level, call `extend({ MeshLineGeometry, MeshLineMaterial })` to register custom Three.js elements.

    2. **Band sub-component:** This is the inner component that runs inside the Canvas/Physics context.
       - Create 5 rigid body refs: fixed anchor point, 3 rope segments, 1 card
       - Use `useRopeJoint` to connect segments (fixed->seg1, seg1->seg2, seg2->seg3)
       - Use `useSphericalJoint` to connect last segment to card (seg3->card)
       - Use `useFrame` to:
         a. Interpolate joint positions
         b. Update CatmullRomCurve3 for the rope visual
         c. Apply angular velocity damping to card for natural settling
         d. Handle kinematic translation when dragging
       - Load `card.glb` via `useGLTF('/models/card.glb')` - destructure nodes and materials
       - Load band texture via `useTexture('/images/lanyard-band.png')`
       - Render the rope as a mesh with MeshLineGeometry/MeshLineMaterial
       - Render the card GLTF meshes (card body, clip, clamp)
       - **CRITICAL:** Attach a `<Html>` component from drei to the card RigidBody group with props:
         ```tsx
         <Html
           transform
           occlude="blending"
           position={[0, 0, 0.01]}  // Slightly in front of card face
           scale={0.035}             // Scale HTML to match 3D card size - ADJUST to fit
           rotation={[0, 0, 0]}     // Match card face orientation
           style={{ pointerEvents: 'auto' }}
         >
           <LanyardCardViews
             cards={cards}
             activeView={activeView}
             onViewChange={onViewChange}
             title={title}
             avatarUrl={avatarUrl}
             isPreview={isPreview}
             onCardClick={onCardClick}
           />
         </Html>
         ```
       - The Html scale value will need tuning to match the 3D card dimensions. Start with 0.035 and adjust. The card.glb card mesh is roughly 3.5 x 2.15 units.

    3. **Pointer handling for dragging:**
       - onPointerDown: set dragging true, capture pointer
       - onPointerUp: release, apply a small angular impulse for natural feel
       - onPointerMove (in useFrame): translate card kinematically toward pointer position
       - Cursor changes: 'grab' on hover, 'grabbing' when dragging

    4. **Canvas wrapper:**
       The main exported component renders:
       ```tsx
       <div className="lanyard-wrapper" style={{ width: '100%', height: '100vh' }}>
         <Canvas camera={{ position: [0, 0, 13], fov: 25 }} dpr={[1, 2]}>
           <ambientLight intensity={0.5} />
           <Physics gravity={[0, -40, 0]} timeStep={1/60}>
             <Band {...props} />
           </Physics>
           <Environment background={false}>
             <Lightformer intensity={2} position={[0, 5, -5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
             <Lightformer intensity={3} position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
             <Lightformer intensity={2} position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
             <Lightformer intensity={10} position={[0, 0, -5]} scale={[10, 100, 1]} />
           </Environment>
         </Canvas>
       </div>
       ```

    5. **Mobile detection:** Check `window.innerWidth < 768` to:
       - Reduce physics timestep to 1/30
       - Lower Canvas dpr to [1, 1.5]
       - Adjust camera position for mobile viewport

    6. **Replace card material texture:** Instead of using the default card.glb texture, make the card mesh's base material transparent or very faded so our Html overlay shows as the card face. Set the card mesh material opacity low or use a plain white material so the Html content is the visual:
       ```tsx
       // On the card mesh, override the material to be mostly transparent
       <mesh geometry={nodes.card.geometry}>
         <meshStandardMaterial color="#f5f2eb" opacity={0.95} transparent />
       </mesh>
       ```

    IMPORTANT: The card.glb model geometry names may vary. Log `Object.keys(nodes)` on first load to verify mesh names. Common names from ReactBits: `card`, `clip`, `clamp`.
  </action>
  <verify>Run `npx tsc --noEmit` to confirm no type errors. The 3D scene is complex; visual verification comes in a later checkpoint-style verification.</verify>
  <done>LanyardBadgeScene component renders a physics-based lanyard with a card that has HTML content overlaid via drei's Html component, with drag interaction and proper lighting/environment.</done>
</task>

<task type="auto">
  <name>Task 7: Create the editor preview layout component</name>
  <files>src/components/cards/lanyard-badge-layout.tsx</files>
  <action>
    Create the layout component used in the editor preview iframe. This wraps the 3D scene and provides the bridge between theme store state and the scene component.

    Follow the exact pattern of `receipt-layout.tsx` for the interface and store access, but render the 3D scene instead of receipt HTML.

    ```tsx
    'use client'

    import { useState, useRef, useEffect } from 'react'
    import dynamic from 'next/dynamic'
    import type { Card } from '@/types/card'
    import { useThemeStore } from '@/stores/theme-store'
    import { useProfileStore } from '@/stores/profile-store'

    // Dynamic import for Three.js scene to avoid SSR issues
    const LanyardBadgeScene = dynamic(
      () => import('./lanyard-badge-scene').then(mod => ({ default: mod.LanyardBadgeScene })),
      { ssr: false, loading: () => <div className="w-full h-screen flex items-center justify-center"><div className="animate-pulse text-sm opacity-50">Loading 3D scene...</div></div> }
    )
    ```

    **Props interface** (match other list layout components):
    ```ts
    interface LanyardBadgeLayoutProps {
      title: string
      cards: Card[]
      isPreview?: boolean
      onCardClick?: (cardId: string) => void
      selectedCardId?: string | null
    }
    ```

    **Implementation:**
    - Read from theme store: `lanyardActiveView`, `setLanyardActiveView`, accent color for lanyard band color
    - Read from profile store: `avatarUrl`, `showAvatar`
    - Manage local state for activeView that syncs with store
    - Render the scene fullscreen:
    ```tsx
    return (
      <div className="fixed inset-0 w-full h-full z-10">
        <LanyardBadgeScene
          cards={cards}
          title={title}
          activeView={lanyardActiveView}
          onViewChange={handleViewChange}
          avatarUrl={showAvatar ? avatarUrl : null}
          isPreview={isPreview}
          onCardClick={onCardClick}
          lanyardColor={accentColor}
        />
      </div>
    )
    ```

    The `handleViewChange` function should:
    1. Update local state
    2. Call `setLanyardActiveView(view)` on the theme store
    3. If isPreview, send a postMessage to parent editor: `{ type: "UPDATE_LANYARD_VIEW", payload: { view } }`

    IMPORTANT: Use `dynamic` import with `ssr: false` for the 3D scene. Three.js cannot render on the server. This is critical.
  </action>
  <verify>Run `npx tsc --noEmit` to confirm no type errors.</verify>
  <done>LanyardBadgeLayout wraps the 3D scene with dynamic import, reads from theme/profile stores, and handles view state syncing.</done>
</task>

<task type="auto">
  <name>Task 8: Create the public/static layout component</name>
  <files>src/components/public/static-lanyard-badge-layout.tsx</files>
  <action>
    Create the public page version. Since this theme REQUIRES client-side JS for the 3D scene (Three.js needs WebGL), the "static" version is actually a client component that dynamically loads the 3D scene.

    Follow the pattern of `static-word-art-layout.tsx` which is also a 'use client' component.

    ```tsx
    'use client'

    import { useState, useEffect } from 'react'
    import dynamic from 'next/dynamic'
    import Link from 'next/link'
    import type { Card } from '@/types/card'
    import type { SocialIcon } from '@/types/profile'

    // Dynamic import for Three.js scene
    const LanyardBadgeScene = dynamic(
      () => import('@/components/cards/lanyard-badge-scene').then(mod => ({ default: mod.LanyardBadgeScene })),
      { ssr: false, loading: () => <LoadingState /> }
    )
    ```

    **Props interface:**
    ```ts
    interface StaticLanyardBadgeLayoutProps {
      username: string
      title: string
      cards: Card[]
      headingSize?: number
      bodySize?: number
      socialIcons?: SocialIcon[]
      accentColor?: string
      avatarUrl?: string | null
      showAvatar?: boolean
    }
    ```

    **Implementation:**
    - Local state for `activeView` (starts at 0)
    - Render the 3D scene fullscreen, passing cards and view state
    - Include LegalFooter at the bottom (positioned absolutely or overlaid)
    - `isPreview={false}` so card clicks open URLs in new tabs
    - `onCardClick` should open card URLs

    **Loading state component:**
    A simple centered loading indicator shown while Three.js loads:
    ```tsx
    function LoadingState() {
      return (
        <div className="w-full h-screen flex items-center justify-center bg-[var(--theme-background)]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm opacity-50" style={{ color: 'var(--theme-text)' }}>Loading...</p>
          </div>
        </div>
      )
    }
    ```

    **Legal footer:** Positioned at the bottom of the screen with absolute positioning and high z-index so it floats over the 3D scene:
    ```tsx
    <div className="fixed bottom-0 left-0 right-0 z-50 py-3 text-center text-xs" style={{ color: 'var(--theme-card-bg)', opacity: 0.5 }}>
      <div className="flex items-center justify-center gap-4">
        <Link href={`/privacy?username=${username}`}>Privacy Policy</Link>
        <span>-</span>
        <Link href="/terms">Terms of Service</Link>
      </div>
      <div className="mt-1">Powered by LinkLobby</div>
    </div>
    ```
  </action>
  <verify>Run `npx tsc --noEmit` to confirm no type errors.</verify>
  <done>StaticLanyardBadgeLayout renders the 3D lanyard scene on public pages with dynamic import, loading state, and legal footer overlay.</done>
</task>

<task type="auto">
  <name>Task 9: Wire up preview page routing</name>
  <files>src/app/preview/page.tsx</files>
  <action>
    Add the lanyard-badge theme to the editor preview page routing, following the exact pattern of other list layout themes.

    **At the top, add import:**
    ```ts
    import { LanyardBadgeLayout } from "@/components/cards/lanyard-badge-layout"
    ```

    **In PreviewContent function, add a conditional block** BEFORE the default return, after the word-art block (around line 270):
    ```tsx
    // Lanyard Badge theme uses 3D lanyard with badge card
    if (themeId === 'lanyard-badge') {
      return (
        <>
          <PageBackground />
          <DimOverlay />
          <LanyardBadgeLayout
            title={displayName || 'BADGE'}
            cards={state.cards}
            isPreview={true}
            onCardClick={handleCardClick}
            selectedCardId={state.selectedCardId}
          />
          <NoiseOverlay />
        </>
      )
    }
    ```

    **Also in the STATE_UPDATE handler** (around line 112-131), add the lanyard field sync:
    ```ts
    lanyardActiveView: ts.lanyardActiveView ?? 0,
    ```
    This was also mentioned in Task 3 but listing here as a reminder to ensure it's in the right location within the `useThemeStore.setState()` call.
  </action>
  <verify>Run `npx tsc --noEmit` to confirm no errors. Grep for 'lanyard-badge' in preview/page.tsx.</verify>
  <done>Preview page routes to LanyardBadgeLayout when themeId is 'lanyard-badge', with proper PageBackground, DimOverlay, and NoiseOverlay wrapping.</done>
</task>

<task type="auto">
  <name>Task 10: Wire up public page routing</name>
  <files>
    src/components/public/public-page-renderer.tsx
    src/app/[username]/page.tsx
  </files>
  <action>
    **10a. Update PublicPageRenderer** (`src/components/public/public-page-renderer.tsx`):

    Add import at top:
    ```ts
    import { StaticLanyardBadgeLayout } from "./static-lanyard-badge-layout"
    ```

    Add to PublicPageRendererProps interface (if not already there via existing pattern):
    ```ts
    // No new props needed - lanyard uses existing: avatarUrl, showAvatar, accentColor, cards, displayName, username
    ```

    Add conditional block after the word-art block (around line 255):
    ```tsx
    // Lanyard Badge theme uses 3D lanyard with badge card
    if (themeId === 'lanyard-badge') {
      const socialIcons: SocialIcon[] = socialIconsJson ? JSON.parse(socialIconsJson) : []
      return (
        <StaticLanyardBadgeLayout
          username={username}
          title={displayName || 'BADGE'}
          cards={cards}
          headingSize={headingSize}
          bodySize={bodySize}
          socialIcons={socialIcons}
          accentColor={accentColor}
          avatarUrl={avatarUrl}
          showAvatar={showAvatar}
        />
      )
    }
    ```

    **10b. Update [username]/page.tsx** to pass any lanyard-specific fields:
    The existing pattern already passes `accentColor`, `avatarUrl`, `showAvatar`, `cards`, etc. No new props are needed for the lanyard theme since it uses the same fields. Verify that the existing prop passing covers what StaticLanyardBadgeLayout needs.
  </action>
  <verify>Run `npx tsc --noEmit`. Visit a public page URL with lanyard-badge theme (if test data exists) or confirm no build errors with `npm run build`.</verify>
  <done>Public page routes to StaticLanyardBadgeLayout when themeId is 'lanyard-badge', with all required props passed through.</done>
</task>

<task type="auto">
  <name>Task 11: Add lanyard theme CSS styles</name>
  <files>src/app/globals.css</files>
  <action>
    Add CSS for the lanyard-badge theme. Place after the receipt theme styles section (after the `.receipt-photo` block, around line 487).

    ```css
    /* Lanyard Badge Theme Styles */
    [data-theme="lanyard-badge"] {
      --theme-shadow: none;
      --font-ticket-de-caisse: 'Ticket De Caisse', 'Courier New', monospace;
      --font-hypermarket: 'Hypermarket', 'Impact', sans-serif;
    }

    /* Lanyard badge card - paper texture overlay (reuses receipt paper textures but with rounded corners) */
    .lanyard-badge-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      background-image: url('/images/paper-texture.jpeg');
      background-size: cover;
      background-position: center;
      mix-blend-mode: multiply;
      pointer-events: none;
      z-index: 5;
      opacity: 0.6;
      border-radius: inherit;
    }

    .lanyard-badge-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      background-image: url('/images/plastic-texture.jpg');
      background-size: cover;
      background-position: center;
      mix-blend-mode: multiply;
      pointer-events: none;
      z-index: 6;
      opacity: 0.7;
      border-radius: inherit;
    }

    /* Lanyard scene wrapper */
    .lanyard-wrapper {
      position: relative;
      z-index: 0;
      width: 100%;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    /* Navigation arrows on badge card */
    .lanyard-nav-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 1px solid currentColor;
      opacity: 0.7;
      transition: opacity 0.15s;
      cursor: pointer;
      background: transparent;
      color: inherit;
    }

    .lanyard-nav-btn:hover:not(:disabled) {
      opacity: 1;
    }

    .lanyard-nav-btn:disabled {
      opacity: 0.25;
      cursor: default;
    }
    ```

    The fonts (Ticket De Caisse, Hypermarket) are already loaded via @font-face declarations in the receipt theme section, so they'll be available for the lanyard-badge theme too.
  </action>
  <verify>Grep for 'lanyard-badge' in globals.css to confirm styles exist.</verify>
  <done>Lanyard-badge theme has CSS variables, paper texture card styling, wrapper layout, and navigation button styles.</done>
</task>

<task type="auto">
  <name>Task 12: Build verification and smoke test</name>
  <files>None (verification only)</files>
  <action>
    Run the full build to verify everything compiles and there are no errors:

    1. Run `npx tsc --noEmit` to check TypeScript compilation
    2. Run `npm run build` to verify the Next.js production build succeeds
    3. If build errors occur, fix them:
       - Common issues: missing imports, incorrect Three.js type annotations, SSR issues with dynamic imports
       - Three.js types can be tricky - use `any` type assertions for GLTF nodes if strict typing causes issues (e.g., `(nodes as any).card.geometry`)
       - Ensure all Three.js components are only imported in client components with 'use client' directive
       - The `extend()` call for meshline must happen outside React render to avoid re-registration

    4. If the card.glb or lanyard-band.png downloads failed in Task 4:
       - Check if the assets exist: `ls -la public/models/card.glb public/images/lanyard-band.png`
       - If missing, try alternative download approaches or create placeholder files
       - The scene should handle missing assets gracefully (try/catch around useGLTF)

    5. Verify theme appears in the theme list:
       - Run `node -e "const t = require('./src/lib/themes/index.ts'); console.log(t.THEME_IDS)"` -- this won't work with TS, so instead:
       - Grep to confirm: `grep 'lanyard-badge' src/lib/themes/index.ts src/types/theme.ts`

    6. Start dev server to verify no runtime errors on initial load:
       ```
       npm run dev
       ```
       (Just verify it starts without crashing - visual verification happens manually)
  </action>
  <verify>`npm run build` completes successfully with no errors. `npx tsc --noEmit` passes. Dev server starts without crashing.</verify>
  <done>Full project builds successfully with the new lanyard-badge theme. TypeScript has no errors. All imports resolve. Three.js dynamic imports work correctly with SSR disabled.</done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes with zero errors
2. `npm run build` succeeds (production build)
3. Theme type system: `grep 'lanyard-badge' src/types/theme.ts` finds the ThemeId entry
4. Theme config: `ls src/lib/themes/lanyard-badge.ts` confirms file exists
5. Theme registered: `grep 'lanyard-badge' src/lib/themes/index.ts` finds import and array entries
6. Store state: `grep 'lanyardActiveView' src/stores/theme-store.ts` finds state, action, load, snapshot
7. Preview routing: `grep 'lanyard-badge' src/app/preview/page.tsx` finds conditional render
8. Public routing: `grep 'lanyard-badge' src/components/public/public-page-renderer.tsx` finds conditional render
9. 3D assets: `ls public/models/card.glb public/images/lanyard-band.png` both exist
10. CSS: `grep 'lanyard-badge' src/app/globals.css` finds theme styles
</verification>

<success_criteria>
- The lanyard-badge theme is selectable in the editor and loads a 3D physics-based lanyard scene
- The badge card on the lanyard displays receipt-paper styled content
- Users can swipe between 5 card views using left/right arrows on the badge
- The card views show links, video, photo, audio player, and presave content from the user's cards
- The lanyard is draggable with realistic physics (rope follows, card swings)
- Public pages render the same 3D scene with dynamic loading
- Full production build succeeds with no TypeScript or bundling errors
- Paper texture overlay gives the badge card a tactile receipt-paper feel
</success_criteria>

<output>
After completion, create `.planning/quick/049-lanyard-theme-with-3d-card-and-swipeable/049-SUMMARY.md`
</output>
