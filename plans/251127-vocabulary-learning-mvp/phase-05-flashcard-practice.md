# Phase 5: Flashcard Practice

**Date**: 2025-11-27
**Priority**: High
**Status**: Pending
**Estimated Time**: 2-3 hours

---

## Overview

Simple flashcard review UI with show/hide answer functionality. Track review progress and update word status based on performance.

---

## Requirements

1. Flashcard component with flip animation
2. Practice session (queue of words)
3. Show word → flip to see definition
4. Mark as "Know" or "Don't Know"
5. Update word status after review
6. Track learning progress
7. Filter practice words by status

---

## Architecture

**Pattern**: Client Component for interactivity + Server Actions for updates
- Client component for flashcard UI and state
- Server Action to update progress after review
- Simple queue: fetch words → iterate through → update DB

**Review Logic**:
- "Know" → progress status forward (new → learning → review → mastered)
- "Don't Know" → reset to "learning"
- Track review count in `learning_progress` table

---

## Implementation Steps

### 1. Create Practice Page

Create `app/(protected)/practice/page.tsx`:

```typescript
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PracticeSession } from "@/components/practice-session";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function PracticePage() {
  const user = await requireAuth();
  const supabase = await createClient();

  // Fetch words eligible for practice (exclude mastered)
  const { data: words, error } = await supabase
    .from("words")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["new", "learning", "review"])
    .order("created_at", { ascending: true })
    .limit(20);

  if (error) {
    console.error("Error fetching practice words:", error);
  }

  if (!words || words.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center p-8">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold">Không có từ để luyện tập</h1>
          <p className="mb-8 text-muted-foreground">
            Hãy thêm từ vựng mới hoặc tất cả từ đã thuộc rồi!
          </p>
          <Link href="/vocabulary">
            <Button>Thêm từ vựng</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Luyện tập Flashcard</h1>
        <p className="mt-2 text-muted-foreground">
          {words.length} từ cần ôn tập
        </p>
      </div>

      <PracticeSession words={words} />
    </div>
  );
}
```

### 2. Create Practice Session Component

Create `components/practice-session.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Word } from "@/types/database";
import { Flashcard } from "./flashcard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { reviewWord } from "@/lib/actions/practice";

interface PracticeSessionProps {
  words: Word[];
}

export function PracticeSession({ words }: PracticeSessionProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  const handleNext = async (know: boolean) => {
    // Update word progress
    await reviewWord(currentWord.id, know);

    // Move to next word
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setCompleted(true);
    }
  };

  if (completed) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <div className="rounded-lg border bg-card p-12">
          <h2 className="mb-4 text-2xl font-bold">Hoàn thành!</h2>
          <p className="mb-8 text-muted-foreground">
            Bạn đã ôn tập xong {words.length} từ vựng.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => router.push("/vocabulary")}>
              Xem từ vựng
            </Button>
            <Button variant="outline" onClick={() => router.refresh()}>
              Luyện tập lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Từ {currentIndex + 1} / {words.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <Flashcard word={currentWord} isFlipped={isFlipped} />

      <div className="mt-8 flex justify-center gap-4">
        {!isFlipped ? (
          <Button size="lg" onClick={() => setIsFlipped(true)}>
            Xem nghĩa
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              variant="destructive"
              onClick={() => handleNext(false)}
            >
              Chưa thuộc
            </Button>
            <Button size="lg" onClick={() => handleNext(true)}>
              Đã thuộc
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
```

### 3. Create Flashcard Component

Create `components/flashcard.tsx`:

```typescript
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Word } from "@/types/database";
import { cn } from "@/lib/utils";

interface FlashcardProps {
  word: Word;
  isFlipped: boolean;
}

const statusLabels = {
  new: "Mới",
  learning: "Đang học",
  review: "Ôn tập",
  mastered: "Đã thuộc",
};

export function Flashcard({ word, isFlipped }: FlashcardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-300",
        isFlipped && "bg-accent/50"
      )}
    >
      <CardContent className="flex min-h-[400px] flex-col items-center justify-center p-12">
        <Badge className="mb-4">{statusLabels[word.status]}</Badge>

        {!isFlipped ? (
          <div className="text-center">
            <h2 className="mb-4 text-5xl font-bold">{word.word}</h2>
            {word.phonetic && (
              <p className="text-xl text-muted-foreground">{word.phonetic}</p>
            )}
          </div>
        ) : (
          <div className="text-center">
            <h2 className="mb-2 text-4xl font-bold text-muted-foreground">
              {word.word}
            </h2>
            {word.phonetic && (
              <p className="mb-6 text-lg text-muted-foreground">
                {word.phonetic}
              </p>
            )}
            <div className="mt-8 rounded-lg bg-background p-6">
              <p className="text-2xl font-semibold">{word.definition}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 4. Create Practice Actions

Create `lib/actions/practice.ts`:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { WordStatus } from "@/types/database";

const statusProgression: Record<WordStatus, WordStatus> = {
  new: "learning",
  learning: "review",
  review: "mastered",
  mastered: "mastered",
};

export async function reviewWord(wordId: string, know: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Get current word
  const { data: word, error: wordError } = await supabase
    .from("words")
    .select("status")
    .eq("id", wordId)
    .eq("user_id", user.id)
    .single();

  if (wordError || !word) {
    return { error: "Word not found" };
  }

  // Determine new status
  const newStatus: WordStatus = know
    ? statusProgression[word.status as WordStatus]
    : "learning";

  // Update word status
  const { error: updateError } = await supabase
    .from("words")
    .update({ status: newStatus })
    .eq("id", wordId)
    .eq("user_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  // Update or create learning progress
  const { data: progress } = await supabase
    .from("learning_progress")
    .select("*")
    .eq("word_id", wordId)
    .eq("user_id", user.id)
    .single();

  const now = new Date().toISOString();

  if (progress) {
    // Update existing progress
    await supabase
      .from("learning_progress")
      .update({
        review_count: progress.review_count + 1,
        last_reviewed: now,
        next_review: calculateNextReview(progress.review_count + 1, know),
      })
      .eq("id", progress.id);
  } else {
    // Create new progress
    await supabase.from("learning_progress").insert({
      word_id: wordId,
      user_id: user.id,
      review_count: 1,
      last_reviewed: now,
      next_review: calculateNextReview(1, know),
    });
  }

  revalidatePath("/practice");
  revalidatePath("/vocabulary");
  revalidatePath("/stats");

  return { success: true };
}

// Simple spaced repetition: 1 day, 3 days, 7 days, 14 days
function calculateNextReview(reviewCount: number, know: boolean): string {
  if (!know) {
    // Review again tomorrow if don't know
    return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  }

  const intervals = [1, 3, 7, 14, 30]; // days
  const dayIndex = Math.min(reviewCount - 1, intervals.length - 1);
  const daysUntilNext = intervals[dayIndex];

  return new Date(
    Date.now() + daysUntilNext * 24 * 60 * 60 * 1000
  ).toISOString();
}
```

### 5. Add Progress Component (shadcn)

```bash
npx shadcn@latest add progress
```

### 6. Add Practice Link to Navigation

Update `app/(protected)/layout.tsx` to include Practice link (already done in Phase 2).

### 7. Create Practice Variants (Optional)

Create `app/(protected)/practice/status/[status]/page.tsx`:

```typescript
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PracticeSession } from "@/components/practice-session";
import type { WordStatus } from "@/types/database";

export default async function PracticeByStatusPage({
  params,
}: {
  params: { status: WordStatus };
}) {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: words } = await supabase
    .from("words")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", params.status)
    .order("created_at", { ascending: true })
    .limit(20);

  if (!words || words.length === 0) {
    return <div>Không có từ nào ở trạng thái này</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <PracticeSession words={words} />
    </div>
  );
}
```

### 8. Test Practice Flow

1. Add several vocabulary words
2. Go to `/practice`
3. Click "Xem nghĩa" to flip card
4. Click "Đã thuộc" or "Chưa thuộc"
5. Verify word status updated in vocabulary list
6. Complete session → see completion screen
7. Verify `learning_progress` table updated

---

## Success Criteria

- [ ] User can start practice session
- [ ] Flashcard displays word (front) and definition (back)
- [ ] User can flip card to reveal answer
- [ ] User can mark word as "Know" or "Don't Know"
- [ ] Word status progresses: new → learning → review → mastered
- [ ] "Don't Know" resets to "learning"
- [ ] Progress bar shows session completion
- [ ] Completion screen displayed at end
- [ ] Learning progress tracked in database
- [ ] No words available shows helpful message

---

## Related Files

**Created**:
- `app/(protected)/practice/page.tsx` - Practice page
- `components/practice-session.tsx` - Session manager
- `components/flashcard.tsx` - Flashcard UI
- `lib/actions/practice.ts` - Practice actions

---

## Enhancement Ideas (Phase 2)

- Keyboard shortcuts (Space to flip, Arrow keys for Know/Don't Know)
- Audio playback on flashcard
- Spaced repetition algorithm (FSRS)
- Daily review reminder
- Streak tracking
- Card shuffle option
- Review history

---

## Notes

- Simple progression: new → learning → review → mastered
- "Don't Know" always resets to "learning"
- Spaced repetition intervals: 1, 3, 7, 14, 30 days
- Progress component provides visual feedback
- Empty state guides users to add vocabulary

---

## Next Phase

[Phase 6: Statistics Dashboard](./phase-06-statistics.md)
