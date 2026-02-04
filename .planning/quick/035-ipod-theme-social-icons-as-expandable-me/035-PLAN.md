---
phase: quick
plan: 035
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/cards/ipod-classic-layout.tsx
  - src/components/public/static-ipod-classic-layout.tsx
  - src/app/globals.css
autonomous: true

must_haves:
  truths:
    - "Social icons card renders as 'Socials' menu item in iPod theme"
    - "Clicking 'Socials' expands to show platform names as sub-items"
    - "Clicking a platform name opens that social URL"
    - "Sub-menu collapses when clicking 'Socials' again"
  artifacts:
    - path: "src/components/cards/ipod-classic-layout.tsx"
      provides: "Expandable Socials menu item with sub-menu"
    - path: "src/components/public/static-ipod-classic-layout.tsx"
      provides: "Same expandable behavior for public pages"
    - path: "src/app/globals.css"
      provides: "CSS for iPod sub-menu styling"
  key_links:
    - from: "ipod-classic-layout.tsx"
      to: "profile-store"
      via: "useProfileStore for social icons data"
      pattern: "getSortedSocialIcons"
---

<objective>
Render social icons as an expandable "Socials" menu item in the iPod theme that shows platform names (not icons) when clicked.

Purpose: iPod themes should display social links in a menu-native way - as expandable sub-menus showing text labels, not graphical icons.

Output: Modified iPod layouts with expandable Socials menu item, supporting both editor preview and public pages.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/components/cards/ipod-classic-layout.tsx
@src/components/public/static-ipod-classic-layout.tsx
@src/components/cards/social-icons-card.tsx
@src/types/profile.ts
@src/app/globals.css
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add expandable Socials menu to iPod layouts</name>
  <files>
    src/components/cards/ipod-classic-layout.tsx
    src/components/public/static-ipod-classic-layout.tsx
  </files>
  <action>
Modify both iPod layout files to render social-icons cards as expandable "Socials" menu items:

1. **In ipod-classic-layout.tsx:**
   - Add `expandedSocials` state: `const [expandedSocials, setExpandedSocials] = useState<string | null>(null)` to track which social-icons card is expanded (by card.id)
   - Get social icons data via `getSortedSocialIcons` from profile-store (already imported useProfileStore for logoUrl)
   - In the menu list rendering, detect `card.card_type === 'social-icons'`:
     - Render as "Socials" menu item with chevron indicator (> when collapsed, v when expanded)
     - On click: toggle `expandedSocials` between card.id and null (don't call activateLink)
     - When expanded (`expandedSocials === card.id`), render sub-items immediately after the Socials item:
       - Each sub-item shows platform label (from SOCIAL_PLATFORMS) as text
       - Sub-items have indentation (padding-left) to indicate hierarchy
       - Clicking sub-item opens the social URL (use `window.open(icon.url, '_blank')`)
   - Sub-items should NOT participate in selectedIndex navigation - they're rendered inline but not selectable via wheel

2. **In static-ipod-classic-layout.tsx:**
   - Same logic but without profile-store hooks
   - Accept socialIcons prop from parent: `socialIcons?: SocialIcon[]` (import SocialIcon from types/profile)
   - Same expand/collapse behavior with local state

3. **Rendering pattern for sub-items:**
```tsx
{card.card_type === 'social-icons' ? (
  <>
    <div
      key={card.id}
      className={cn('ipod-menu-item', isSelected && 'selected')}
      onClick={() => setExpandedSocials(prev => prev === card.id ? null : card.id)}
    >
      <span className="flex-1 text-[12px]">Socials</span>
      <span className="text-[11px] ml-2">{expandedSocials === card.id ? 'v' : '>'}</span>
    </div>
    {expandedSocials === card.id && socialIcons.map((icon) => (
      <div
        key={icon.id}
        className="ipod-menu-subitem"
        onClick={() => window.open(icon.url, '_blank', 'noopener,noreferrer')}
      >
        <span className="text-[11px]">{SOCIAL_PLATFORMS[icon.platform].label}</span>
        <span className="text-[10px] ml-2">{'>'}</span>
      </div>
    ))}
  </>
) : (
  // existing menu item rendering
)}
```

4. Import `SOCIAL_PLATFORMS` from `@/types/profile` in both files.
  </action>
  <verify>
    - `npm run lint` passes
    - In editor with iPod theme: social-icons card shows as "Socials" menu item
    - Clicking "Socials" expands to show platform names (Instagram, TikTok, etc.)
    - Clicking a platform name opens URL in new tab
    - Clicking "Socials" again collapses the sub-menu
  </verify>
  <done>Social icons render as expandable "Socials" menu in iPod theme with platform name sub-items</done>
</task>

<task type="auto">
  <name>Task 2: Add CSS for iPod sub-menu items</name>
  <files>src/app/globals.css</files>
  <action>
Add CSS classes for iPod sub-menu items after the existing `.ipod-menu-item` styles (around line 343):

```css
/* iPod sub-menu items (for expandable menus like Socials) */
.ipod-menu-subitem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px 6px 24px; /* Extra left padding for indentation */
  cursor: pointer;
  font-family: var(--font-chicago), 'Chicago', 'Pix Chicago', monospace;
  background: transparent;
  transition: background 0.1s;
}

.ipod-menu-subitem:hover {
  background: rgba(0, 0, 0, 0.05);
}

.ipod-menu-subitem:active {
  background: rgba(0, 0, 0, 0.1);
}
```

The sub-items should:
- Have left indentation (24px padding-left vs 10px for regular items) to show hierarchy
- Use slightly smaller text (11px) to differentiate from main items
- Have hover/active states for feedback
- Use same monospace font as other iPod menu items
  </action>
  <verify>
    - Sub-items appear indented under "Socials" when expanded
    - Hover state provides visual feedback
    - Font matches iPod aesthetic
  </verify>
  <done>CSS styling for iPod sub-menu items complete</done>
</task>

</tasks>

<verification>
1. Start dev server: `npm run dev`
2. Create or select a page with iPod theme
3. Add social icons via Header settings
4. Verify "Socials" appears in iPod menu list
5. Click "Socials" - verify platform names appear indented below
6. Click a platform name - verify URL opens in new tab
7. Click "Socials" again - verify sub-menu collapses
8. Test on public page to verify static version works
</verification>

<success_criteria>
- Social icons card renders as "Socials" menu item (not icons)
- Clicking expands to show platform names
- Platform names are clickable and open URLs
- Sub-menu can be collapsed by clicking "Socials" again
- Works in both editor preview and public pages
- No lint errors
</success_criteria>

<output>
After completion, create `.planning/quick/035-ipod-theme-social-icons-as-expandable-me/035-SUMMARY.md`
</output>
