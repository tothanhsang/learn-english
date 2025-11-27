# Learn English - Vocabulary Learning App

A simple vocabulary learning application built with Next.js and Supabase.

## Features

- **Authentication**: Email/password signup and login
- **Vocabulary Management**: Add, view, edit, delete vocabulary cards
- **FlashCard Practice**: Interactive flashcard review with progress tracking
- **Statistics Dashboard**: Track learning progress across word statuses
- **Audio Pronunciation**: Text-to-speech using Web Speech API

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Auth**: Supabase Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account

### Setup

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Create Supabase project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Copy your project URL and anon key

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run database migration**
   - Go to Supabase Dashboard > SQL Editor
   - Run the SQL from `supabase/migrations/001_initial_schema.sql`

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, signup pages
│   ├── (protected)/     # Dashboard, practice, stats
│   └── auth/confirm/    # Email confirmation handler
├── components/
│   ├── ui/              # Base UI components
│   └── *.tsx            # Feature components
├── lib/
│   ├── supabase/        # Supabase client setup
│   ├── actions/         # Server actions
│   └── utils.ts         # Utilities
└── types/
    └── database.ts      # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT
