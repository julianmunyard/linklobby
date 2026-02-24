---
phase: quick
plan: 074
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/editor/featured-themes-tab.tsx
  - src/components/editor/editor-panel.tsx
  - src/components/editor/editor-layout.tsx
autonomous: true

must_haves:
  truths:
    - "Editor loads with Featured Themes tab active by default"
    - "All 11 curated templates display in a visual grid"
    - "Each card shows template thumbnail, name, and theme name"
    - "Clicking 'Explore more' navigates to Design > Templates subtab filtered to that theme"
    - "URL param ?tab=featured works for direct linking"
    - "Existing tabs (Links, Design, etc.) still work unchanged"
  artifacts:
    - path: "src/components/editor/featured-themes-tab.tsx"
      provides: "Featured themes grid component"
    - path: "src/components/editor/editor-panel.tsx"
      provides: "Updated tab container with featured tab as first/default"
  key_links:
    - from: "src/components/editor/featured-themes-tab.tsx"
      to: "src/lib/templates/index.ts"
      via: "getTemplate() lookups for featured IDs"
      pattern: "getTemplate\\("
    - from: "src/components/editor/featured-themes-tab.tsx"
      to: "src/components/editor/editor-panel.tsx"
      via: "onNavigateToTheme callback triggers tab switch to design + templates subtab"
      pattern: "onNavigateToTheme"
---

<objective>
Add a "Featured Themes" tab to the editor as the default landing tab, showing 11 curated template picks in a visual grid with "explore more" navigation to each theme's template collection.

Purpose: Give users an inspiring first impression when they open the editor, showcasing the best templates across all themes.
Output: New FeaturedThemesTab component + updated EditorPanel with featured as default tab.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/editor/editor-panel.tsx
@src/components/editor/editor-layout.tsx
@src/components/editor/design-tab.tsx
@src/components/editor/design-panel.tsx
@src/components/editor/template-picker.tsx
@src/lib/templates/index.ts
@src/lib/templates/types.ts
@src/lib/themes/index.ts
@src/types/theme.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create FeaturedThemesTab component</name>
  <files>src/components/editor/featured-themes-tab.tsx</files>
  <action>
Create a new component `FeaturedThemesTab` that displays 11 curated templates in a scrollable grid.

**Featured template IDs (hardcoded list):**
```ts
const FEATURED_IDS = [
  'phone-home-burple',
  'mac-os-my-mac',
  'instagram-reels-cards',
  'system-settings-quite-beskoke',
  'blinkies-blink-once',
  'vcr-menu-home-video',
  'ipod-classic-your-ipod',
  'macintosh-84-macintosh',
  'word-art-just-word-art',
  'chaotic-zine-simple-new',
  'artifact-brutal',
]
```

**Component props:**
```ts
interface FeaturedThemesTabProps {
  onNavigateToTheme: (themeId: string) => void
}
```

**Implementation:**
1. Import `getTemplate` from `@/lib/templates` and `getTheme` from `@/lib/themes` (for theme display name via `ThemeConfig.name`)
2. Use `useMemo` to resolve featured templates: map over FEATURED_IDS, call `getTemplate(id)` for each, filter out any undefined (defensive)
3. For each template, also resolve the theme name via `getTheme(template.themeId as ThemeId)?.name`
4. Render wrapped in the same scroll container pattern as other tabs: outer `<div className="h-full overflow-y-auto">` > inner `<div className="p-4 pb-20">`
5. Add a heading section: "Featured Themes" as h3 with a subtitle like "Curated picks to get you started"
6. Grid layout: `grid grid-cols-2 gap-3` (matching template-picker.tsx grid)
7. Each card is a `<div>` (not a button since there are two actions) with:
   - Thumbnail: `<Image>` from next/image, `src={template.thumbnailPath}`, `alt={template.name}`, aspect-[9/16], fill, object-cover, rounded-lg overflow-hidden bg-muted container
   - Template name: `<span className="text-xs font-medium">` showing `template.name`
   - Theme name: `<span className="text-[10px] text-muted-foreground">` showing resolved theme name (e.g. "Phone Home")
   - "Explore theme" button: small text button at bottom of card, clicking calls `onNavigateToTheme(template.themeId)` — style as `text-[10px] text-accent hover:underline` link-style
8. Cards should have the same visual treatment as template-picker.tsx: `rounded-lg border-2 border-border bg-card overflow-hidden transition-colors hover:border-accent`
9. Use `motion.div` from `motion/react` with `whileHover={{ scale: 1.02 }}` for hover effect (same as template-picker)
10. Import `cn` from `@/lib/utils` for className merging

**Do NOT:**
- Add template apply functionality here (that's in template-picker). This is purely a showcase/navigation component.
- Use Framer Motion's `AnimatePresence` or complex animations — just the simple hover scale.
  </action>
  <verify>TypeScript compiles: `npx tsc --noEmit --pretty 2>&1 | head -30`</verify>
  <done>FeaturedThemesTab component exists, renders 11 templates in a grid, each with thumbnail/name/theme/explore-link</done>
</task>

<task type="auto">
  <name>Task 2: Wire FeaturedThemesTab into EditorPanel as default tab</name>
  <files>src/components/editor/editor-panel.tsx, src/components/editor/editor-layout.tsx</files>
  <action>
**In `editor-panel.tsx`:**

1. Add "featured" to `VALID_TABS` array — put it FIRST: `["featured", "links", "design", "schedule", "insights", "settings"]`

2. Change default tab from "links" to "featured":
   ```ts
   const defaultTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : "featured"
   ```

3. Import the new component: `import { FeaturedThemesTab } from "./featured-themes-tab"`
4. Import `Sparkles` icon from lucide-react (for the tab icon)

5. Add the Featured tab trigger BEFORE the Links trigger in the TabsList:
   ```tsx
   <TabsTrigger value="featured" className="flex-1 gap-2">
     <Sparkles className="h-4 w-4" />
     <span className="hidden sm:inline">Featured</span>
   </TabsTrigger>
   ```

6. Add a handler for the "explore theme" navigation. This needs to:
   - Switch to the "design" tab
   - Set the design subtab to "templates"
   - Ideally, the TemplatePicker already filters by current themeId from the store. So we need to ALSO apply the theme first.

   Create handler:
   ```ts
   const handleNavigateToTheme = useCallback((themeId: string) => {
     // Import and use the theme store to switch theme
     // This makes TemplatePicker show templates for that theme
     const { loadThemeDefaults } = useThemeStore.getState()
     loadThemeDefaults(themeId as any)

     // Switch to design tab with templates subtab
     setActiveTab('design')
     setDesignSubTab('templates')
     router.replace('/editor?tab=design', { scroll: false })
   }, [router])
   ```

   Wait — looking at the existing code, `initialDesignTab` is passed from EditorLayout. The EditorPanel already supports switching to design with a subtab via the `initialDesignTab` prop mechanism. But this is prop-driven from EditorLayout. A simpler approach:

   Add local state `const [designSubTab, setDesignSubTab] = useState<string | null>(initialDesignTab ?? null)` and pass it to DesignTab. When "explore theme" is clicked, set activeTab to 'design' and designSubTab to 'templates'.

   Actually, looking more carefully, the DesignTab already accepts `initialSubTab` and the DesignPanel watches for changes via useEffect. So:

   ```ts
   const [pendingDesignSubTab, setPendingDesignSubTab] = useState<string | null>(null)

   const handleNavigateToTheme = (themeId: string) => {
     // Switch theme so TemplatePicker shows that theme's templates
     useThemeStore.getState().loadThemeDefaults(themeId as any)
     // Navigate to Design > Templates
     setPendingDesignSubTab('templates')
     setActiveTab('design')
     router.replace('/editor?tab=design', { scroll: false })
   }
   ```

   Update the DesignTab rendering to pass the combined subtab:
   ```tsx
   <DesignTab initialSubTab={pendingDesignSubTab || initialDesignTab} />
   ```

   After the design tab consumes it, clear pendingDesignSubTab. Add a useEffect:
   ```ts
   useEffect(() => {
     if (activeTab === 'design' && pendingDesignSubTab) {
       // Clear after a tick so DesignPanel's useEffect picks it up
       const timer = setTimeout(() => setPendingDesignSubTab(null), 100)
       return () => clearTimeout(timer)
     }
   }, [activeTab, pendingDesignSubTab])
   ```

7. Add the Featured tab content BEFORE the Links tab content:
   ```tsx
   <TabsContent
     value="featured"
     className={cn(
       "flex-1 overflow-hidden",
       "data-[state=inactive]:hidden"
     )}
   >
     <FeaturedThemesTab onNavigateToTheme={handleNavigateToTheme} />
   </TabsContent>
   ```

8. Update the `handleTabChange` — when tab is "featured", use `/editor` URL (same as links, no param needed since it's default), OR use `?tab=featured`:
   ```ts
   if (tab === "featured") {
     router.replace("/editor", { scroll: false })
   } else if (tab === "links") {
     router.replace("/editor?tab=links", { scroll: false })
   } else {
     router.replace(`/editor?tab=${tab}`, { scroll: false })
   }
   ```
   Note: Since "featured" is now the default, navigating to `/editor` (no param) should land on featured. And "links" now needs an explicit param.

**In `editor-layout.tsx`:**
No changes needed — initialTab state already supports any valid tab string.

**Check `loadThemeDefaults`:** Verify this method exists on the theme store. If it doesn't, use whatever method switches the theme. Look at ThemePresets component to see how theme switching works and use the same approach.
  </action>
  <verify>
1. `npx tsc --noEmit --pretty 2>&1 | head -30` — no type errors
2. `npm run build 2>&1 | tail -20` — builds successfully
  </verify>
  <done>
- Editor opens to Featured Themes tab by default (no URL param)
- Featured tab shows grid of 11 curated templates
- Clicking "Explore theme" on any card switches theme and navigates to Design > Templates
- Direct URL ?tab=featured works
- All existing tabs still accessible and functional
- ?tab=links now correctly routes to Links tab
  </done>
</task>

</tasks>

<verification>
1. Open editor at `/editor` — should show Featured Themes tab by default
2. See all 11 templates in grid with thumbnails, names, theme names
3. Click "Explore theme" on a card — should switch to Design > Templates showing that theme's templates
4. Click Links, Design, etc. tabs — all still work
5. Navigate to `/editor?tab=links` — should show Links tab
6. Navigate to `/editor?tab=featured` — should show Featured tab
</verification>

<success_criteria>
- Featured Themes tab is the default landing tab in the editor
- 11 curated templates display with thumbnails, names, and theme labels
- "Explore theme" navigation works: switches theme + navigates to Design > Templates
- All existing editor tabs remain functional
- URL param routing works for all tabs including featured
</success_criteria>

<output>
After completion, create `.planning/quick/074-featured-themes-tab-in-editor/074-SUMMARY.md`
</output>
