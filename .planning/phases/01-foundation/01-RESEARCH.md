# Phase 1: Foundation - Research

**Researched:** 2026-01-23
**Domain:** Next.js 15 + Supabase Auth + Database Schema
**Confidence:** HIGH

## Summary

Phase 1 establishes the foundational scaffolding for LinkLobby: a Next.js 15 application with TypeScript, Tailwind CSS v4, shadcn/ui components, and Supabase for authentication and database. The core challenge is implementing cookie-based authentication with proper SSR support using `@supabase/ssr`, creating a database schema with profiles, pages, and cards tables with proper RLS policies, and enabling username claiming during signup.

The standard approach uses `create-next-app` with the App Router, configures Supabase clients for both browser and server contexts with proper cookie handling, implements middleware for session refresh, and uses database triggers to auto-create profiles when users sign up. Username uniqueness is enforced via database constraints with validation happening both client-side (for UX) and server-side (for security).

**Primary recommendation:** Use the official Supabase SSR patterns with `createBrowserClient` and `createServerClient`, implement middleware for token refresh, use database triggers for profile creation on signup, and always verify auth with `supabase.auth.getUser()` in server code.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Next.js** | 16.1.4 | Full-stack React framework | Default with `create-next-app@latest`, App Router mature, Turbopack for fast builds |
| **React** | 19.x | UI library | Ships with Next.js 16, concurrent rendering benefits |
| **TypeScript** | 5.x | Type safety | Non-negotiable for projects this size, excellent inference |
| **Tailwind CSS** | 4.x | Utility CSS | Ships with Next.js, v4 has CSS-native configuration |
| **@supabase/supabase-js** | latest | Supabase client | Official client library |
| **@supabase/ssr** | latest | SSR auth helpers | Required for cookie-based auth in Next.js App Router |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **shadcn/ui** | latest | UI components | Dashboard forms, buttons, inputs - copy-paste ownership |
| **React Hook Form** | 7.x | Form handling | Signup/login forms with minimal re-renders |
| **Zod** | 3.x | Schema validation | Form validation + API input validation |
| **@hookform/resolvers** | latest | RHF + Zod bridge | Connect Zod schemas to React Hook Form |
| **clsx** | latest | Conditional classes | Combining Tailwind classes |
| **tailwind-merge** | latest | Class deduplication | Merging Tailwind classes without conflicts |
| **lucide-react** | latest | Icons | Consistent icon set, tree-shakeable |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @supabase/ssr | @supabase/auth-helpers-nextjs | Old package, deprecated - DO NOT USE |
| shadcn/ui | MUI, Chakra UI | Opinionated design, harder theme customization |
| React Hook Form | Formik | More re-renders, larger bundle |
| Zod | Yup | Zod has better TypeScript inference |

**Installation:**

```bash
# Create Next.js project (TypeScript + Tailwind enabled by default)
npx create-next-app@latest linklobby --yes --app --src-dir

# Install Tailwind CSS v4 explicitly (create-next-app may install v3)
npm install tailwindcss@4 @tailwindcss/postcss postcss

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Forms and validation
npm install react-hook-form zod @hookform/resolvers

# UI components - initialize shadcn/ui
npx shadcn@latest init

# Add required shadcn components
npx shadcn@latest add button input label card form toast

# Utilities
npm install clsx tailwind-merge lucide-react
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Auth route group (no layout impact on URL)
│   │   ├── login/page.tsx         # Login page
│   │   ├── signup/page.tsx        # Signup page with username claim
│   │   └── layout.tsx             # Centered card layout for auth
│   ├── (dashboard)/               # Protected dashboard route group
│   │   ├── editor/page.tsx        # Main editor (future phases)
│   │   └── layout.tsx             # Dashboard layout (future phases)
│   ├── [username]/page.tsx        # Public profile page (future phases)
│   ├── auth/callback/route.ts     # OAuth callback handler
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page
│
├── components/                    # Shared components
│   └── ui/                        # shadcn/ui components (auto-generated)
│
├── lib/                           # Utilities and config
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client
│   │   └── middleware.ts          # Session refresh helper
│   └── utils.ts                   # cn() helper for class merging
│
├── types/                         # TypeScript types
│   └── database.ts                # Supabase generated types
│
└── middleware.ts                  # Root middleware for auth
```

### Pattern 1: Cookie-Based Auth with @supabase/ssr

**What:** Supabase authentication using HTTP-only cookies managed by middleware.
**When to use:** All Next.js App Router projects with Supabase Auth.
**Why:** Secure by default, proper SSR support, no localStorage XSS vulnerability.

**Browser Client (lib/supabase/client.ts):**
```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/creating-a-client
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Server Client (lib/supabase/server.ts):**
```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component - ignored if middleware handles refresh
          }
        },
      },
    }
  )
}
```

**Middleware Helper (lib/supabase/middleware.ts):**
```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: getUser() validates the JWT with Supabase Auth server
  // Do NOT use getSession() in server code - it doesn't validate the token
  const { data: { user } } = await supabase.auth.getUser()

  return supabaseResponse
}
```

**Root Middleware (middleware.ts):**
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Pattern 2: Signup with Username Claiming

**What:** Pass username during signup, auto-create profile via database trigger.
**When to use:** When users claim a unique identifier during registration.

**Signup Form (client component):**
```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SignupForm() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
        },
      },
    })

    if (error) {
      // Handle error
      return
    }

    router.push('/editor')
  }

  return (/* form JSX */)
}
```

### Pattern 3: Protected Routes via Middleware

**What:** Redirect unauthenticated users away from protected routes.
**When to use:** Dashboard, editor, settings pages.

**Enhanced Middleware:**
```typescript
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // For protected routes, check auth
  if (request.nextUrl.pathname.startsWith('/editor') ||
      request.nextUrl.pathname.startsWith('/settings')) {

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() { /* no-op for read-only check */ },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}
```

### Anti-Patterns to Avoid

- **Using `getSession()` in server code:** Always use `getUser()` - it validates the JWT with Supabase Auth server. `getSession()` trusts the cookie without validation.
- **Importing `@supabase/auth-helpers-nextjs`:** Deprecated package. Use `@supabase/ssr` exclusively.
- **Using `get`, `set`, `remove` cookie methods:** Only use `getAll` and `setAll` with `@supabase/ssr`.
- **Storing username in auth.users directly:** Store in a profiles table linked via foreign key.
- **Skipping middleware:** Without middleware, auth tokens won't refresh and sessions will expire.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie-based auth | Custom cookie management | `@supabase/ssr` | Handles token refresh, secure cookie settings, SSR hydration |
| Form validation | Manual validation logic | React Hook Form + Zod | Type inference, minimal re-renders, consistent patterns |
| Username uniqueness check | Polling/debounced API calls | Database UNIQUE constraint + RPC | Race condition proof, single source of truth |
| Profile creation on signup | Client-side insert after signup | Database trigger | Atomic, can't be bypassed, handles edge cases |
| Class name merging | String concatenation | `clsx` + `tailwind-merge` | Handles conflicts, conditional classes properly |
| Component primitives | Custom buttons/inputs | shadcn/ui | Accessible, consistent, customizable |

**Key insight:** Supabase's SSR package handles complex cookie synchronization between server and client. Rolling your own will miss edge cases like token refresh during SSR, cookie chunking for large tokens, and proper security settings.

## Common Pitfalls

### Pitfall 1: Using getSession() Instead of getUser()

**What goes wrong:** JWT tokens aren't validated, allowing spoofed sessions.
**Why it happens:** `getSession()` is faster (no network call) so developers use it by default.
**How to avoid:** Always use `supabase.auth.getUser()` in server code. It sends a request to Supabase Auth server to validate the token.
**Warning signs:** Security audit failures, sessions that "work" with invalid tokens.

### Pitfall 2: Database Trigger Failures Blocking Signup

**What goes wrong:** If the `handle_new_user` trigger fails, the entire signup transaction rolls back.
**Why it happens:** Triggers run in the same transaction as the auth.users insert.
**How to avoid:**
- Test triggers thoroughly before production
- Use `SECURITY DEFINER` with explicit `search_path = ''`
- Keep trigger logic minimal (just insert essential fields)
- Log errors to a separate table if needed
**Warning signs:** "Signup failed" errors with no obvious cause, users can't register.

### Pitfall 3: Username Validation Race Conditions

**What goes wrong:** Two users check username availability simultaneously, both see "available", both try to claim it.
**Why it happens:** Client-side availability checks aren't atomic with the insert.
**How to avoid:**
- Rely on database UNIQUE constraint as the source of truth
- Handle the unique violation error gracefully in UI
- Optional: Create an RPC function that checks + reserves atomically
**Warning signs:** Duplicate username errors in production, lost signups.

### Pitfall 4: Missing Middleware Causes Session Expiry

**What goes wrong:** Users are randomly logged out, especially after being away.
**Why it happens:** Auth tokens expire and aren't refreshed without middleware.
**How to avoid:** Always implement the middleware pattern from `@supabase/ssr` docs.
**Warning signs:** "Session expired" errors, users complaining about being logged out.

### Pitfall 5: Tailwind v3 Installed Instead of v4

**What goes wrong:** `create-next-app` installs Tailwind v3, causing config file confusion.
**Why it happens:** Default installation hasn't fully transitioned to v4.
**How to avoid:** Explicitly install `tailwindcss@4 @tailwindcss/postcss postcss` after project creation.
**Warning signs:** `tailwind.config.ts` exists (v4 doesn't need it), old plugin syntax in CSS.

## Code Examples

Verified patterns from official sources:

### Signup with Username (Complete Flow)

```typescript
// app/(auth)/signup/page.tsx
import { SignupForm } from './signup-form'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignupForm />
    </div>
  )
}
```

```typescript
// app/(auth)/signup/signup-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, underscores, and hyphens'),
})

type SignupFormData = z.infer<typeof signupSchema>

export function SignupForm() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(data: SignupFormData) {
    setError(null)

    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username.toLowerCase(),
        },
      },
    })

    if (signUpError) {
      if (signUpError.message.includes('duplicate key') ||
          signUpError.message.includes('unique constraint')) {
        setError('Username is already taken')
      } else {
        setError(signUpError.message)
      }
      return
    }

    router.push('/editor')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...register('username')} placeholder="your-username" />
        {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
        <p className="text-sm text-muted-foreground">linklobby.com/{'{username}'}</p>
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register('password')} />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  )
}
```

### Database Schema with RLS

```sql
-- Source: Supabase docs + Architecture research
-- Run in Supabase SQL Editor

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can read profiles, users can update own
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Pages table (one per user)
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL REFERENCES public.profiles(username) ON UPDATE CASCADE,
  theme_id TEXT NOT NULL DEFAULT 'sleek',
  background_type TEXT DEFAULT 'color',
  background_value TEXT DEFAULT '#0a0a0a',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT one_page_per_user UNIQUE (user_id)
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public pages are viewable by everyone"
  ON public.pages FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own page"
  ON public.pages FOR ALL
  USING (auth.uid() = user_id);

-- Cards table (belongs to pages)
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL, -- 'hero', 'horizontal', 'square', 'video', 'gallery', 'dropdown', 'game'
  title TEXT,
  description TEXT,
  url TEXT,
  content JSONB DEFAULT '{}', -- Flexible content storage per card type
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 1,
  height INTEGER DEFAULT 1,
  z_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cards are viewable by everyone"
  ON public.cards FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own cards"
  ON public.cards FOR ALL
  USING (
    page_id IN (SELECT id FROM public.pages WHERE user_id = auth.uid())
  );

-- Indexes for common queries
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_pages_username ON public.pages(username);
CREATE INDEX idx_cards_page_id ON public.cards(page_id);
CREATE INDEX idx_cards_sort_order ON public.cards(page_id, sort_order);

-- Trigger: Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Auto-create page when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.pages (user_id, username)
  VALUES (NEW.id, NEW.username);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- Function: Check username availability (for client-side UX)
CREATE OR REPLACE FUNCTION public.check_username_available(desired_username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE username = LOWER(desired_username)
  );
END;
$$;
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: for server-side admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Utility Function (cn helper)

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2024 | Must migrate, old package deprecated |
| `tailwind.config.ts` | CSS `@import "tailwindcss"` | Tailwind v4 (2025) | No config file needed |
| `getSession()` for auth checks | `getUser()` for auth checks | Supabase security update | Critical security fix |
| Pages Router auth patterns | App Router with middleware | Next.js 13+ | Different cookie handling |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Replaced by `@supabase/ssr`
- Cookie methods `get`, `set`, `remove`: Use `getAll` and `setAll` only
- Tailwind `content` array configuration: v4 auto-detects content

## Open Questions

Things that couldn't be fully resolved:

1. **Email confirmation flow**
   - What we know: Supabase can require email confirmation before login
   - What's unclear: Should LinkLobby require confirmation for v1?
   - Recommendation: Start with confirmation disabled for faster onboarding, add later

2. **Username change cascading**
   - What we know: Foreign key with `ON UPDATE CASCADE` handles pages table
   - What's unclear: Need to verify public page URL revalidation
   - Recommendation: Test username change flow thoroughly, may need ISR revalidation

3. **React 19 + shadcn/ui peer dependency warnings**
   - What we know: Some shadcn components have peer dependency warnings with React 19
   - What's unclear: Whether this causes runtime issues
   - Recommendation: Use `--legacy-peer-deps` if needed, monitor for issues

## Sources

### Primary (HIGH confidence)
- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side/nextjs) - Complete middleware and client setup
- [Supabase Managing User Data](https://supabase.com/docs/guides/auth/managing-user-data) - Profiles and triggers
- [Next.js Installation](https://nextjs.org/docs/app/getting-started/installation) - create-next-app options
- [Tailwind CSS Next.js Guide](https://tailwindcss.com/docs/guides/nextjs) - v4 installation
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next) - Component setup
- [Supabase signUp API](https://supabase.com/docs/reference/javascript/auth-signup) - Metadata options

### Secondary (MEDIUM confidence)
- [Next.js Project Structure Best Practices](https://medium.com/better-dev-nextjs-react/inside-the-app-router-best-practices-for-next-js-file-and-directory-structure-2025-edition-ed6bc14a8da3) - Directory organization
- [Supabase Username Discussion](https://github.com/orgs/supabase/discussions/3491) - Community patterns for username claiming
- [shadcn/ui Form Documentation](https://ui.shadcn.com/docs/components/form) - React Hook Form integration

### Tertiary (LOW confidence)
- Next.js 16 version specifics (user context mentions 15, `create-next-app` shows 16.1.4) - verify actual version

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official docs verified all packages
- Architecture: HIGH - Supabase SSR patterns are well-documented
- Pitfalls: HIGH - Verified via official security docs and community discussions
- Database schema: MEDIUM - Based on existing project architecture research, may need adjustments

**Research date:** 2026-01-23
**Valid until:** 60 days (stable technologies, established patterns)
