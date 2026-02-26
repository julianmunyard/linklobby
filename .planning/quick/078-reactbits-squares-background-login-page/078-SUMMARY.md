---
phase: quick-078
plan: 01
subsystem: auth-ui
tags: [animation, canvas, glassmorphism, auth, ui]
dependency-graph:
  requires: []
  provides: [squares-background-component, glassmorphism-auth-pages]
  affects: []
tech-stack:
  added: []
  patterns: [canvas-animation, glassmorphism]
key-files:
  created:
    - src/components/ui/squares-background.tsx
  modified:
    - src/app/(auth)/layout.tsx
    - src/app/(auth)/login/login-form.tsx
    - src/app/(auth)/signup/signup-form.tsx
    - src/app/(auth)/forgot-password/forgot-password-form.tsx
    - src/app/(auth)/reset-password/reset-password-form.tsx
    - src/app/(auth)/verify-email/page.tsx
    - src/app/(auth)/mfa-challenge/mfa-challenge-form.tsx
decisions: []
metrics:
  duration: ~2 minutes
  completed: 2026-02-26
---

# Quick Task 078: ReactBits Squares Background on Auth Pages

Animated canvas grid background with glassmorphism cards across all auth pages.

## One-liner

Canvas-based animated squares grid on bg-neutral-950 auth layout with backdrop-blur glassmorphism on all auth page cards.

## What Was Done

### Task 1: Create Squares Background Component
**Commit:** `cc6ef27`

Created `src/components/ui/squares-background.tsx` -- a TypeScript 'use client' canvas component that renders an animated grid of squares. Features:
- Configurable direction (right/left/up/down/diagonal), speed, border color, square size, hover fill color
- requestAnimationFrame-based animation loop with proper cleanup
- Mouse hover interaction highlights individual grid squares
- Radial gradient vignette overlay fades edges for polished appearance
- Typed refs, proper cleanup of event listeners and animation frame on unmount

### Task 2: Add Squares to Auth Layout and Glassmorphism Cards
**Commit:** `790122a`

Updated auth layout to dark `bg-neutral-950` background with Squares component rendered as absolute background layer behind content (z-0 vs z-10).

Applied glassmorphism styling (`bg-card/80 backdrop-blur-xl border-white/10`) to Card components on all auth pages:
- Login form
- Signup form
- Forgot password form (both states)
- Reset password form (both states)
- Verify email page
- MFA challenge form

Changed "or" divider spans on login/signup from `bg-card` to `bg-transparent` to avoid solid background rectangle breaking through the blur effect.

## Deviations from Plan

### Auto-applied Consistency Fix

**1. [Rule 2 - Missing Critical] Applied glassmorphism to all auth page cards, not just login/signup**

- **Found during:** Task 2
- **Issue:** The plan specified login and signup as priority but noted "check and apply if needed" for other auth pages. Forgot-password, reset-password, verify-email, and mfa-challenge all had bare `<Card>` elements that would appear as solid opaque rectangles against the animated dark background -- visually jarring.
- **Fix:** Applied same `bg-card/80 backdrop-blur-xl border-white/10` className to all auth page Card components.
- **Files modified:** forgot-password-form.tsx, reset-password-form.tsx, verify-email/page.tsx, mfa-challenge-form.tsx

## Verification

- TypeScript compilation passes (no new errors; pre-existing audioEngine.ts wasmCDNUrl error is unrelated)
- All auth pages inherit dark background + animated squares from layout
- Login and signup cards are translucent with backdrop blur
- "or" dividers use transparent background
