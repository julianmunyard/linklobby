# Quick Task 045: Macintosh Custom Menu Bar

## What Changed

Simplified the Macintosh theme's top menu bar from the complex version with Apple icon, multiple menu items, and right-side icons to a clean "File Edit View [username]" layout.

## Files Modified

1. **src/components/cards/macintosh-layout.tsx** - Editor preview menu bar
2. **src/components/public/static-macintosh-layout.tsx** - Public page menu bar

## Before

- Left side: Apple icon (), File, Edit, View, Label, Special
- Right side: Help (?) icon, window resize icon

## After

- Left side: File, Edit, View
- Right side: User's display name (title prop)
- All text in Pix Chicago font (unchanged)
- White bar with 2px black bottom border (unchanged)

## Commit

- `1153a0b` - feat(quick-045): simplify Macintosh menu bar to File Edit View [username]
