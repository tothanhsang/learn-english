# Tech Stack - Vocabulary Learning App

**Date:** November 27, 2025

---

## Core Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Framework** | Next.js | 14.2+ | Full-stack React framework (App Router) |
| **Runtime** | React | 19.0 | UI library |
| **Language** | TypeScript | 5.3+ | Type safety |
| **Database** | Supabase (PostgreSQL) | Latest | Auth, Database, Storage |
| **Deployment** | Vercel | - | Hosting optimized for Next.js |

---

## Frontend

| Category | Technology | Notes |
|----------|------------|-------|
| **Styling** | Tailwind CSS v4 | Utility-first CSS |
| **UI Components** | shadcn/ui | Radix UI + Tailwind, accessible |
| **Icons** | Lucide React | Open-source icon set |
| **Forms** | React Hook Form + Zod | Validation & schema |
| **State** | Zustand (minimal) | Global state (auth, prefs) |

---

## Backend (Supabase)

| Feature | Implementation |
|---------|----------------|
| **Auth** | Email/password, OAuth (Google) |
| **Database** | PostgreSQL with RLS |
| **Storage** | Audio files bucket |
| **Real-time** | Optional for multi-device sync |

---

## Audio/TTS

| Phase | Solution | Cost |
|-------|----------|------|
| MVP | Web Speech API | Free |
| Production | Google Cloud TTS | ~$4/1M chars |

---

## Key Packages

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^19.0.0",
    "typescript": "^5.3.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.4.0",
    "tailwindcss": "^4.0.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.0",
    "lucide-react": "^0.300.0",
    "ts-fsrs": "^4.0.0"
  }
}
```

---

## Architecture Decisions

1. **Server Components first** - Minimize JS bundle, secure data
2. **Server Actions for mutations** - Add vocab, update progress
3. **RLS mandatory** - Database-level security per user
4. **Web Speech API MVP** - Zero cost, upgrade path to Google TTS
5. **FSRS algorithm** - Modern spaced repetition (ts-fsrs package)

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
# Optional (Phase 2)
GOOGLE_TTS_API_KEY=
```
