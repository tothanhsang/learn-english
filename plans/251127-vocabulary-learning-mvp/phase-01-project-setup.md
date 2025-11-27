# Phase 1: Project Setup

**Date**: 2025-11-27
**Priority**: Critical
**Status**: Pending
**Estimated Time**: 1-2 hours

---

## Overview

Initialize Next.js 14+ project with App Router, Supabase integration, Tailwind CSS v4, and shadcn/ui components. Configure environment variables and establish project structure.

---

## Requirements

1. Next.js 14.2+ with App Router and TypeScript
2. Supabase client (server + client instances)
3. Tailwind CSS v4 configured
4. shadcn/ui components installed
5. Environment variables set
6. Basic folder structure

---

## Architecture

**Pattern**: Server-first architecture
- Server Components by default
- Client Components only for interactivity
- Supabase SSR package for cookie-based auth

**File Organization**:
```
/app         - App Router pages
/components  - React components (ui/ for shadcn)
/lib         - Utilities, actions, Supabase clients
/types       - TypeScript type definitions
```

---

## Implementation Steps

### 1. Create Next.js Project

```bash
npx create-next-app@latest learn-english \
  --typescript \
  --tailwind \
  --app \
  --eslint \
  --src-dir=false \
  --import-alias="@/*"
```

**Options**:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes
- src/ directory: No
- Import alias: @/*

### 2. Install Dependencies

```bash
cd learn-english

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# UI & Forms
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
npm install react-hook-form @hookform/resolvers zod

# Icons
npm install lucide-react

# State Management (optional)
npm install zustand

# Dev Dependencies
npm install -D @types/node typescript
```

### 3. Configure Tailwind CSS v4

Update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

Install animation plugin:
```bash
npm install -D tailwindcss-animate
```

### 4. Initialize shadcn/ui

```bash
npx shadcn@latest init
```

**Configuration**:
- Style: Default
- Base color: Slate
- CSS variables: Yes

Install core components:
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add form
npx shadcn@latest add label
npx shadcn@latest add dialog
npx shadcn@latest add table
npx shadcn@latest add badge
```

### 5. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Create new project: `learn-english-vocab`
3. Choose region (closest to users)
4. Save database password securely
5. Wait for provisioning (~2 mins)

### 6. Configure Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Create `.env.example` (commit to git):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Add to `.gitignore`:
```
.env.local
.env*.local
```

### 7. Create Supabase Client Utilities

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Server Component - ignore set cookie errors
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Server Component - ignore remove cookie errors
          }
        },
      },
    }
  );
}
```

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

Create `lib/supabase/middleware.ts`:

```typescript
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}
```

### 8. Create Middleware

Create `middleware.ts` (root):

```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### 9. Create Project Structure

```bash
mkdir -p app/(auth)/login
mkdir -p app/(auth)/signup
mkdir -p app/(protected)/dashboard
mkdir -p app/(protected)/vocabulary
mkdir -p app/(protected)/practice
mkdir -p app/(protected)/stats
mkdir -p app/auth/confirm
mkdir -p components/ui
mkdir -p lib/actions
mkdir -p lib/utils
mkdir -p types
```

### 10. Create Utility Functions

Create `lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 11. Update Root Layout

Update `app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "English Vocabulary Learning",
  description: "Learn English vocabulary effectively",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### 12. Test Setup

Create simple home page `app/page.tsx`:

```typescript
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">English Vocabulary Learning</h1>
      <p className="mt-4 text-muted-foreground">MVP Setup Complete</p>
    </main>
  );
}
```

Run dev server:
```bash
npm run dev
```

Visit http://localhost:3000 - should see welcome page.

---

## Success Criteria

- [ ] Next.js dev server runs without errors
- [ ] Tailwind CSS styles applied correctly
- [ ] shadcn/ui components imported successfully
- [ ] Supabase client utilities created
- [ ] Environment variables configured
- [ ] Project structure follows conventions
- [ ] TypeScript compilation passes

---

## Related Files

**Created**:
- `lib/supabase/server.ts` - Server Supabase client
- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/middleware.ts` - Session management
- `middleware.ts` - Root middleware
- `lib/utils.ts` - Utility functions
- `.env.local` - Environment variables
- `.env.example` - Example env template

**Modified**:
- `tailwind.config.ts` - Tailwind configuration
- `app/layout.tsx` - Root layout
- `app/page.tsx` - Home page

---

## Notes

- Never commit `.env.local` to git
- Use `NEXT_PUBLIC_` prefix only for client-exposed vars
- Service role key is for admin operations only (never expose to client)
- Middleware refreshes session on every request

---

## Next Phase

[Phase 2: Authentication](./phase-02-authentication.md)
