---
phase: quick-078
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/ui/squares-background.tsx
  - src/app/(auth)/layout.tsx
  - src/app/(auth)/login/login-form.tsx
  - src/app/(auth)/signup/signup-form.tsx
autonomous: true

must_haves:
  truths:
    - "All auth pages (login, signup, forgot-password, etc.) show animated squares grid behind the content"
    - "Login and signup cards have glassmorphism effect — translucent with backdrop blur"
    - "Squares animate continuously in the chosen direction"
    - "Hovering over squares highlights them"
  artifacts:
    - path: "src/components/ui/squares-background.tsx"
      provides: "Animated canvas squares component"
    - path: "src/app/(auth)/layout.tsx"
      provides: "Auth layout with dark background and Squares"
  key_links:
    - from: "src/app/(auth)/layout.tsx"
      to: "src/components/ui/squares-background.tsx"
      via: "import and render as fixed background layer"
      pattern: "Squares"
---

<objective>
Add ReactBits Squares animated background to all auth pages with glassmorphism card styling.

Purpose: Make the login/signup experience visually polished with an animated grid background and translucent cards.
Output: Squares component, updated auth layout, translucent card overrides on login and signup forms.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/app/(auth)/layout.tsx
@src/app/(auth)/login/login-form.tsx
@src/app/(auth)/signup/signup-form.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Squares background component</name>
  <files>src/components/ui/squares-background.tsx</files>
  <action>
Create a TypeScript 'use client' component at `src/components/ui/squares-background.tsx` that is a typed conversion of the ReactBits Squares component. The component renders a full-size canvas element that draws an animated grid of squares.

Props interface:
```ts
interface SquaresProps {
  direction?: 'right' | 'left' | 'up' | 'down' | 'diagonal'
  speed?: number
  borderColor?: string
  squareSize?: number
  hoverFillColor?: string
  className?: string
}
```

Defaults: direction='diagonal', speed=0.5, borderColor='#333', squareSize=40, hoverFillColor='#222'.

The canvas uses a useEffect to:
- Resize canvas to match its container on window resize
- Animate grid offset based on direction/speed using requestAnimationFrame
- Draw grid lines with strokeRect and fill hovered square on mousemove
- Apply a radial gradient vignette overlay (transparent center to black edges) so squares fade out toward edges
- Clean up all listeners and cancelAnimationFrame on unmount

Style the canvas inline or via className to be `w-full h-full block` (replacing the original .squares-canvas CSS). Use Tailwind classes on the canvas element directly: `className={cn('w-full h-full block', className)}` — import `cn` from `@/lib/utils`.

Type all refs properly: `useRef<HTMLCanvasElement>(null)`, `useRef<number>(0)` for requestRef, etc.
  </action>
  <verify>File exists, has no TypeScript errors: `npx tsc --noEmit src/components/ui/squares-background.tsx` or check with the full build `npm run build`.</verify>
  <done>Squares component exists with proper TypeScript types, 'use client' directive, and all animation/interaction logic from the ReactBits source.</done>
</task>

<task type="auto">
  <name>Task 2: Add Squares to auth layout and make cards translucent</name>
  <files>src/app/(auth)/layout.tsx, src/app/(auth)/login/login-form.tsx, src/app/(auth)/signup/signup-form.tsx</files>
  <action>
**Auth layout (`src/app/(auth)/layout.tsx`):**
- Add 'use client' directive (needed because Squares uses client hooks)
- Import Squares from `@/components/ui/squares-background`
- Set the outer div background to `bg-neutral-950` (dark so squares are visible)
- Add Squares as a fixed/absolute background layer behind the content:

```tsx
<div className="relative flex min-h-screen items-center justify-center p-4 bg-neutral-950">
  <div className="absolute inset-0 z-0">
    <Squares
      direction="diagonal"
      speed={0.5}
      borderColor="#333"
      squareSize={40}
      hoverFillColor="#222"
    />
  </div>
  <div className="relative z-10 w-full max-w-md">
    {children}
  </div>
</div>
```

**Login form (`src/app/(auth)/login/login-form.tsx`):**
- On the `<Card>` element, add className override: `className="bg-card/80 backdrop-blur-xl border-white/10"`
- On the "or" divider `<span className="bg-card ...">`, change `bg-card` to `bg-transparent` since the card itself is translucent now and a solid bg-card span would look wrong against the blurred background

**Signup form (`src/app/(auth)/signup/signup-form.tsx`):**
- Same Card className override: `className="bg-card/80 backdrop-blur-xl border-white/10"`
- Same "or" divider span: change `bg-card` to `bg-transparent`

Note: The other auth pages (forgot-password, reset-password, mfa-challenge, verify-email) will automatically get the dark background + squares from the layout. Their cards don't need translucency overrides unless they also use Card — check and apply if needed but the login and signup are the priority.
  </action>
  <verify>Run `npm run build` to confirm no build errors. Then start dev server (`npm run dev`) and visit `/login` — should see dark background with animated diagonal squares, translucent card with blur effect, and the "or" divider should not have a solid background rectangle breaking the effect.</verify>
  <done>Auth layout shows Squares animation behind all auth pages. Login and signup cards are translucent with backdrop blur. No visual artifacts on the "or" divider.</done>
</task>

</tasks>

<verification>
- `npm run build` succeeds with no errors
- Visit `/login` in browser: animated squares visible behind translucent card
- Visit `/signup` in browser: same effect
- Hover over squares outside the card: squares highlight with hoverFillColor
- Card text remains readable against the blurred background
- Squares animation is smooth (no jank)
</verification>

<success_criteria>
All auth pages display animated Squares background on dark (neutral-950) canvas. Login and signup cards use glassmorphism styling (bg-card/80 + backdrop-blur-xl + border-white/10). Build passes with no errors.
</success_criteria>

<output>
After completion, create `.planning/quick/078-reactbits-squares-background-login-page/078-SUMMARY.md`
</output>
