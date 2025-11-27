# Implementation Plan: Vietnamese Vocabulary Learning App MVP

**Date**: 2025-11-27
**Status**: Ready for Implementation
**Priority**: High
**Tech Stack**: Next.js 14+, Supabase, Tailwind CSS, shadcn/ui

---

## Executive Summary

Simple MVP for Vietnamese users learning English vocabulary. Focus: authentication, vocabulary CRUD, flashcard practice, statistics, and TTS audio. No gamification or advanced features in MVP.

**Core Principle**: KISS (Keep It Simple, Stupid) - only implement must-have features, defer nice-to-haves to Phase 2.

---

## Architecture Overview

**Pattern**: Server Components First + Server Actions for Mutations
**Security**: Row Level Security (RLS) mandatory on all user tables
**Auth**: Cookie-based sessions via @supabase/ssr
**Data Flow**: Server Components (read) → Server Actions (write) → Client Components (interactivity only)

---

## Implementation Phases

### [Phase 1: Project Setup](./phase-01-project-setup.md)
**Status**: Pending
**Priority**: Critical
**Estimated Time**: 1-2 hours

Initialize Next.js 14+ project with Supabase, Tailwind CSS, shadcn/ui. Configure environment variables, Supabase client instances, basic project structure.

**Key Deliverables**:
- Next.js project with App Router
- Supabase client (server + client)
- shadcn/ui components configured
- Environment variables set

---

### [Phase 2: Authentication](./phase-02-authentication.md)
**Status**: Pending
**Priority**: Critical
**Estimated Time**: 2-3 hours

Email/password signup/login using Supabase Auth with cookie-based sessions. Protected routes via middleware.

**Key Deliverables**:
- Login/signup pages
- Email confirmation flow
- Protected route middleware
- Auth utilities

---

### [Phase 3: Database Schema](./phase-03-database-schema.md)
**Status**: Pending
**Priority**: Critical
**Estimated Time**: 1-2 hours

PostgreSQL tables with RLS policies. Schema: words, learning_progress.

**Key Deliverables**:
- Database migrations
- RLS policies (user-owned data)
- Indexes on user_id columns

---

### [Phase 4: Vocabulary CRUD](./phase-04-vocabulary-crud.md)
**Status**: Pending
**Priority**: High
**Estimated Time**: 3-4 hours

Add, view, edit, delete vocabulary cards. Server Actions for mutations, Server Components for display.

**Key Deliverables**:
- Vocabulary list page
- Add vocabulary form
- Edit/delete actions
- Validation with Zod

---

### [Phase 5: Flashcard Practice](./phase-05-flashcard-practice.md)
**Status**: Pending
**Priority**: High
**Estimated Time**: 2-3 hours

Simple flashcard review UI with show/hide answer. Track review progress.

**Key Deliverables**:
- Flashcard UI component
- Review session logic
- Progress tracking

---

### [Phase 6: Statistics Dashboard](./phase-06-statistics.md)
**Status**: Pending
**Priority**: Medium
**Estimated Time**: 2 hours

Display count of words by status (Mới/Đang học/Ôn tập/Đã thuộc).

**Key Deliverables**:
- Stats dashboard page
- Query aggregations by status
- Simple data visualization

---

### [Phase 7: Audio TTS Integration](./phase-07-audio-tts.md)
**Status**: Pending
**Priority**: Medium
**Estimated Time**: 1-2 hours

Web Speech API for text-to-speech audio playback (MVP). Google Cloud TTS upgrade path documented for future.

**Key Deliverables**:
- TTS client component
- Audio playback controls
- Fallback handling

---

## Success Criteria

**Must-Have**:
- [ ] User can signup/login with email/password
- [ ] User can add vocabulary (word, definition, phonetic)
- [ ] User can view their vocabulary list
- [ ] User can edit/delete vocabulary
- [ ] User can practice with flashcards
- [ ] User can see statistics (word count by status)
- [ ] User can hear pronunciation via Web Speech API
- [ ] All data is secured via RLS (users only see their own data)

**Out of Scope** (Phase 2):
- Google OAuth
- Gamification (coins, rewards)
- Bulk selection/actions
- Quick test mode
- Reading/Writing practice modules

---

## Project Structure

```
/app
├── (auth)
│   ├── login/
│   └── signup/
├── (protected)
│   ├── dashboard/
│   ├── vocabulary/
│   ├── practice/
│   └── stats/
├── auth/
│   └── confirm/
├── layout.tsx
└── page.tsx
/components
├── ui/ (shadcn)
├── vocabulary-card.tsx
├── flashcard.tsx
└── audio-player.tsx
/lib
├── supabase/
│   ├── server.ts
│   ├── client.ts
│   └── middleware.ts
├── actions/
│   ├── vocabulary.ts
│   └── auth.ts
└── utils.ts
/types
└── database.ts
```

---

## Technical Constraints

- Next.js 14.2+ (App Router)
- React 19.0+
- TypeScript 5.3+
- Supabase (PostgreSQL + Auth)
- Tailwind CSS v4
- shadcn/ui (Radix + Tailwind)

---

## Deployment Checklist

1. Deploy to Vercel
2. Set environment variables (Supabase URLs, keys)
3. Run database migrations in production
4. Test RLS policies with multiple users
5. Verify email confirmation flow
6. Test TTS audio playback across browsers

---

## Related Documentation

- [Tech Stack](../../docs/tech-stack.md)
- [Research: Next.js + Supabase Stack](../../docs/research/251127-nextjs-supabase-stack.md)
- [Development Rules](../../.claude/workflows/development-rules.md)

---

## Notes

- Follow YANGI, KISS, DRY principles
- Server Components default, client components only when needed
- Keep files under 200 lines
- Use conventional commits
- No premature optimization

---

## Unresolved Questions

None at this stage. Implementation will surface any technical blockers.
