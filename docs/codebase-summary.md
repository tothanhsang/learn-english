# Codebase Summary

**Last Updated**: 2025-11-28
**Project**: Learn English - Vocabulary Learning App

## Tech Stack

| Aspect | Details |
|--------|---------|
| Framework | Next.js 14+ (App Router) |
| Database | Supabase PostgreSQL + RLS |
| Styling | Tailwind CSS + CVA components |
| Auth | Supabase Auth (Email/Password) |
| APIs | Dictionary API, Gemini API |

## Database Schema

### `words` table
- `id`, `user_id` (RLS), `word` (unique/user), `definition`, `definition_vi`, `phonetic`, `status`, `topic_id`, `created_at`, `updated_at`
- Status: `new` → `learning` → `reviewing` → `mastered`

### `topics` table
- `id`, `user_id`, `name`, `description`, `icon`, `color`, `created_at`, `updated_at`
- Used for organizing words and phrases by subject

### `phrases` table
- `id`, `user_id`, `topic_id`, `phrase`, `meaning`, `meaning_vi`, `example_sentence`, `status`, `created_at`, `updated_at`
- For idioms, collocations, expressions

## Project Structure

```
src/
├── app/
│   ├── (auth)/login, signup
│   └── (protected)/dashboard, practice, stats
├── components/
│   ├── ui/                    # Badge, Button, Card, Input, Textarea
│   ├── vocabulary-*.tsx       # Word components
│   ├── phrase-card.tsx        # Phrase display
│   ├── topic-selector.tsx     # Topic pills + create
│   ├── add-word-form.tsx      # Modal with auto-lookup
│   ├── add-phrase-form.tsx    # Modal with auto-translate
│   └── dashboard-content.tsx  # Main layout (Words/Phrases tabs)
├── lib/
│   ├── actions/               # Server actions (vocabulary, phrases, topics, translate)
│   └── supabase/              # Client, server, middleware
└── types/database.ts          # TypeScript interfaces
```

## Key Features

1. **Vocabulary Management** - Add words with auto-lookup (Dictionary API) + auto-translate (Gemini)
2. **Phrase Tracking** - Save idioms/expressions organized by topics
3. **Topic Organization** - Color-coded topic pills for grouping
4. **Status Tracking** - 4 states with color-coded badges
5. **Dashboard** - Tabs (Từ vựng/Cụm từ), date filter, stats sidebar
6. **Flashcard Practice** - Review words with status updates

## Server Actions Pattern

```typescript
'use server'
// 1. Zod validation
// 2. Auth check (getUser)
// 3. Supabase mutation (RLS enforced)
// 4. revalidatePath('/dashboard')
```

## UI Components (CVA)

- **Badge**: Status colors (purple/orange/blue/green)
- **Button**: Variants (default/outline/ghost/danger), sizes (sm/default/lg/icon)
- **Card**: Container with header/content

## Data Flow

```
User Input → Dictionary API → Gemini Translation → Supabase Insert → Path Revalidation → UI Update
```

## Key File Locations

| Category | Files |
|----------|-------|
| Database Types | `src/types/database.ts` |
| Migrations | `supabase/migrations/*.sql` |
| Supabase | `src/lib/supabase/client.ts`, `server.ts` |
| Dashboard | `src/app/(protected)/dashboard/page.tsx` |
| Components | `src/components/*.tsx` |
| Server Actions | `src/lib/actions/*.ts` |

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (localhost:3000) |
| `npm run build` | Production build |
| `npx supabase db push` | Apply migrations |
