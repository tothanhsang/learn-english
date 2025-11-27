# Research Report: Next.js 14+ with Supabase Stack for Vocabulary Learning

**Date:** November 27, 2025
**Status:** Complete

---

## Executive Summary

Next.js 14+ with Supabase provides an optimal, production-ready foundation for a vocabulary learning app. The stack leverages Server Components for performance, Supabase for secure auth/data with Row Level Security, and shadcn/ui + Tailwind for modern UI. Key advantages: granular database-level security via RLS, cookie-based sessions for server-side auth, and minimal JavaScript bundle overhead. Recommended approach: use Server Components by default, Server Actions for mutations, client-side interactivity only where needed. For state management, Zustand (minimal) or React Query (data fetching) balances simplicity with scalability.

---

## Key Findings

### 1. Next.js App Router Best Practices

**Server Components (Default)**
- All components in App Router are Server Components by default
- No JavaScript sent to client unless explicitly needed
- Keep sensitive logic (tokens, API keys) secure on server
- Supports real-time data, database queries directly in components

**Client Components** (`"use client"`)
- Use sparingly: only for interactivity, state, effects, browser APIs
- Place `"use client"` directive at file top; affects all imported modules
- Prefer granular client components near leaves of component tree
- Example: form inputs, modals, client-side animations

**Server Actions**
- Stable in v14+, replaces traditional API routes for mutations
- Define async functions marked with `"use server"` in server/client components
- Automatically create secure POST endpoints; handle serialization
- Better for mutations (update vocabulary, save progress)

**Performance Patterns**
- Streaming via `Suspense` + `loading.js` for slow data fetches
- Memoization to prevent unnecessary re-renders
- Code splitting automatically via route segments
- Image optimization with `next/image`

### 2. Supabase Authentication Architecture

**Server-Side Auth (Recommended)**
- Use `@supabase/ssr` package (replaces deprecated auth-helpers)
- Cookie-based sessions: secure, stateless, works across SSR/SSG
- `supabase.auth.getUser()` validates token server-side every request (safer than `getSession()`)

**Email/Password Setup**
- Create sign-up form with `supabase.auth.signUp({ email, password })`
- Modify email confirmation template to use Route Handler: `/auth/confirm?token_hash=...`
- Exchange token in handler: `supabase.auth.verifyOtp()`
- Automatically sign user in after confirmation

**Social Login**
- PKCE flow (Authorization Code with PKCE) for security
- Supported: Google, GitHub, Discord, Twitter, Microsoft, etc.
- One-click setup: `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Combine with password auth by sharing login button logic

**Protected Pages**
- Always use `getUser()` in Server Components to verify auth
- Use Route Middleware for global auth checks
- Never expose session tokens to client (use cookies only)

### 3. Row Level Security (RLS) Patterns

**User-Owned Data** (Primary pattern for learning app)
```sql
-- Users see only their own vocabulary
CREATE POLICY "Users view own vocab" ON vocabulary
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own vocab" ON vocabulary
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own vocab" ON vocabulary
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own vocab" ON vocabulary
FOR DELETE USING (auth.uid() = user_id);
```

**Team/Multi-Tenant Pattern** (If sharing vocab lists)
```sql
-- Check team membership before allowing access
CREATE POLICY "Team members access shared vocab" ON vocabulary
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = vocabulary.team_id
    AND user_id = auth.uid()
  )
);
```

**Best Practices**
- Enable RLS on all user-related tables immediately
- Use `(SELECT auth.uid())` subquery to optimize policy performance
- Index columns used in policies: `CREATE INDEX ON vocabulary(user_id)`
- Keep policies simple; avoid complex nested logic
- Never trust client-side checks; RLS is the security boundary
- Use service keys only for admin tasks (never expose to client)

### 4. Supabase Storage for Audio Files

**Basic Setup**
- Create bucket in Supabase console (e.g., `vocab-audio`)
- Enable public access if distributing audio widely, RLS for private
- Bucket path: `/bucket-name/user-id/file.mp3`

**Audio Upload Implementation**
```typescript
const uploadAudio = async (file: File, userId: string) => {
  const { data, error } = await supabase.storage
    .from('vocab-audio')
    .upload(`${userId}/${file.name}`, file, {
      contentType: 'audio/mpeg', // or audio/wav
      upsert: false
    });
  return data?.path;
};
```

**Audio Blob Handling**
- Convert recording to File with proper MIME type
- Use `contentType: 'audio/mpeg'` for MP3 uploads
- For streaming audio generation, use `stream.tee()` to split stream
- Set proper Cache-Control headers for CDN caching

**Best Practices**
- Validate file type + size before upload (client-side UX, server-side security)
- Organize storage: `/user-id/category/file.mp3`
- Use signed URLs for private audio access (auto-expire)
- Leverage Supabase CDN for caching/distribution

---

## Recommended Tech Stack

### Core Dependencies

```json
{
  "next": "^14.2.0",
  "react": "^19.0.0",
  "typescript": "^5.3.0",
  "@supabase/supabase-js": "^2.45.0",
  "@supabase/ssr": "^0.4.0",
  "tailwindcss": "^4.0.0",
  "shadcn-ui": "latest"
}
```

### UI & Styling
- **Tailwind CSS v4**: Utility-first, built-in JIT, minimal bundle
- **shadcn/ui**: Headless components (Radix UI + Tailwind), copy/paste model, fully accessible

### State Management
- **Zustand** (minimal): Simple global state (auth context, user prefs)
- **React Query** (optional, recommended): Caching/syncing server data, automatic refetching

### Form Handling
- **React Hook Form**: Lightweight, performant, minimal re-renders
- **Zod**: Runtime schema validation, TypeScript-first
- Pair: `useForm` + `useFormContext` for complex forms

### Data Fetching Strategy
- **Server Components**: Direct DB queries for read-heavy pages (vocabulary list)
- **Server Actions**: Form submissions, mutations (add vocabulary, update progress)
- **Client-side fetch** (if needed): Only for real-time, user-triggered updates

---

## Implementation Checklist

1. **Project Setup**
   - `npx create-next-app@latest --typescript --tailwind --app`
   - Install: `@supabase/supabase-js`, `@supabase/ssr`, `shadcn-ui`
   - Configure env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Authentication**
   - Set up Supabase client (server + client instances)
   - Create auth pages: `/auth/login`, `/auth/signup`, `/auth/confirm`
   - Add middleware for session refresh
   - Implement logout action

3. **Database Schema**
   - `users` (auto-created by Supabase Auth)
   - `vocabularies` (word, translation, user_id, created_at)
   - `user_progress` (vocab_id, user_id, mastered_at)
   - `audio_files` (vocab_id, url, duration)
   - Enable RLS on all tables

4. **Storage**
   - Create `vocab-audio` bucket
   - Configure RLS policy: users upload/access their own audio
   - Implement upload handler

5. **UI Components**
   - Build with shadcn/ui: Button, Input, Card, Dialog, Table
   - Use React Hook Form for all inputs
   - Add loading states (Suspense boundaries)

6. **Deployment**
   - Deploy to Vercel (built for Next.js)
   - Set env vars in Vercel dashboard
   - Test RLS policies in production

---

## Critical Security Insights

- **RLS is non-negotiable**: Database-level enforcement beats app-level checks
- **Never trust `getSession()`**: Use `getUser()` which revalidates server-side
- **Cookies > tokens**: Store session in httpOnly cookies, never localStorage
- **Service keys secret**: Only use for admin, never expose to frontend
- **Signed URLs for private audio**: Auto-expire tokens (60 seconds recommended)
- **Input validation**: Zod on client (UX), Postgres constraints on server (security)

---

## Sources

### Official Documentation
- [Next.js App Router: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js 14 Blog](https://nextjs.org/blog/next-14)
- [Supabase Auth with Next.js App Router](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage/overview)

### Community Resources
- [Next.js 14+ Performance Optimization (DEV)](https://dev.to/hijazi313/nextjs-14-performance-optimization-modern-approaches-for-production-applications-3n65)
- [Building Full Stack with Next.js 14, Supabase, shadcn/ui (Medium)](https://omarmokhfi.medium.com/building-a-full-stack-apps-with-nextjs-14-supabase-and-shadcnui-b3a66ae138af)
- [Mastering Supabase RLS (DEV)](https://dev.to/asheeshh/mastering-supabase-rls-row-level-security-as-a-beginner-5175)
- [Next.js + Supabase Starters (GitHub)](https://github.com/codelab-davis/next-shadcn-tailwind-supabase)

### Key Articles
- [Password-based Authentication (Supabase UI)](https://supabase.com/ui/docs/nextjs/password-based-auth)
- [Social Authentication (Supabase UI)](https://supabase.com/ui/docs/nextjs/social-auth)
- [How to Set Up Supabase Auth in Next.js 2025 (Zestminds)](https://www.zestminds.com/blog/supabase-auth-nextjs-setup-guide/)
- [Row Level Security Tips (Max Lynch)](https://maxlynch.com/2023/11/04/tips-for-row-level-security-rls-in-postgres-and-supabase/)

---

## Unresolved Questions

None identified at this stage. Implementation will reveal nuances specific to vocabulary learning features (e.g., spaced repetition algorithm placement, real-time progress sync architecture).
