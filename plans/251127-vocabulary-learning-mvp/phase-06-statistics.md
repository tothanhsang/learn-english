# Phase 6: Statistics Dashboard

**Date**: 2025-11-27
**Priority**: Medium
**Status**: Pending
**Estimated Time**: 2 hours

---

## Overview

Display vocabulary statistics: count by status (Mới/Đang học/Ôn tập/Đã thuộc), total words, recent activity. Simple data visualization with cards and charts.

---

## Requirements

1. Total vocabulary count
2. Count by status (new, learning, review, mastered)
3. Recent activity (words added this week)
4. Progress percentage (mastered / total)
5. Review streak (optional)
6. Simple visual cards (no complex charts for MVP)

---

## Architecture

**Pattern**: Server Component with direct DB queries
- Aggregate queries for statistics
- No client-side state needed
- Simple card layout with numbers

**Data Aggregation**:
```sql
SELECT status, COUNT(*) as count
FROM words
WHERE user_id = ?
GROUP BY status
```

---

## Implementation Steps

### 1. Create Stats Page

Create `app/(protected)/stats/page.tsx`:

```typescript
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, Award, Calendar } from "lucide-react";

export default async function StatsPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  // Get total words count
  const { count: totalWords } = await supabase
    .from("words")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get counts by status
  const { data: statusCounts } = await supabase
    .from("words")
    .select("status")
    .eq("user_id", user.id);

  const stats = {
    new: 0,
    learning: 0,
    review: 0,
    mastered: 0,
  };

  statusCounts?.forEach((word) => {
    stats[word.status as keyof typeof stats]++;
  });

  // Get words added this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { count: wordsThisWeek } = await supabase
    .from("words")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", oneWeekAgo.toISOString());

  // Calculate progress percentage
  const progressPercent =
    totalWords && totalWords > 0
      ? Math.round((stats.mastered / totalWords) * 100)
      : 0;

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Thống kê</h1>
        <p className="mt-2 text-muted-foreground">
          Theo dõi tiến độ học từ vựng của bạn
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Words */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng từ vựng</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWords || 0}</div>
            <p className="text-xs text-muted-foreground">từ trong kho</p>
          </CardContent>
        </Card>

        {/* Words This Week */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tuần này</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wordsThisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">từ đã thêm</p>
          </CardContent>
        </Card>

        {/* Mastered Words */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã thuộc</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mastered}</div>
            <p className="text-xs text-muted-foreground">từ thuộc lòng</p>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiến độ</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercent}%</div>
            <p className="text-xs text-muted-foreground">hoàn thành</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Phân loại theo trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">Mới</Badge>
                  <span className="text-sm text-muted-foreground">
                    Từ chưa học
                  </span>
                </div>
                <span className="text-2xl font-bold">{stats.new}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Đang học
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Từ đang luyện tập
                  </span>
                </div>
                <span className="text-2xl font-bold">{stats.learning}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-800">
                    Ôn tập
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Từ cần ôn
                  </span>
                </div>
                <span className="text-2xl font-bold">{stats.review}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    Đã thuộc
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Từ thành thạo
                  </span>
                </div>
                <span className="text-2xl font-bold">{stats.mastered}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity (Optional) */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity userId={user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function RecentActivity({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data: recentWords } = await supabase
    .from("words")
    .select("word, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (!recentWords || recentWords.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Chưa có hoạt động nào.</p>
    );
  }

  return (
    <div className="space-y-2">
      {recentWords.map((word, index) => (
        <div
          key={index}
          className="flex items-center justify-between text-sm"
        >
          <span className="font-medium">{word.word}</span>
          <span className="text-muted-foreground">
            {new Date(word.created_at).toLocaleDateString("vi-VN")}
          </span>
        </div>
      ))}
    </div>
  );
}
```

### 2. Add Stats Link to Dashboard

Update `app/(protected)/dashboard/page.tsx`:

```typescript
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, Brain, BarChart3 } from "lucide-react";

export default async function DashboardPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  // Get quick stats
  const { count: totalWords } = await supabase
    .from("words")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: practiceWords } = await supabase
    .from("words")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("status", ["new", "learning", "review"]);

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Xin chào, {user.email}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/vocabulary">
          <Card className="transition-colors hover:bg-accent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Từ vựng</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWords || 0}</div>
              <p className="text-xs text-muted-foreground">
                Quản lý từ vựng của bạn
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/practice">
          <Card className="transition-colors hover:bg-accent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Luyện tập</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{practiceWords || 0}</div>
              <p className="text-xs text-muted-foreground">
                Từ cần ôn tập hôm nay
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/stats">
          <Card className="transition-colors hover:bg-accent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thống kê</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalWords ? Math.round(((totalWords - (practiceWords || 0)) / totalWords) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Tiến độ học tập</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
```

### 3. Add Lucide Icons

Icons already installed in Phase 1, but verify:

```typescript
import { BookOpen, TrendingUp, Award, Calendar, Brain, BarChart3 } from "lucide-react";
```

### 4. Create Simple Progress Chart (Optional)

Create `components/progress-chart.tsx`:

```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProgressChartProps {
  stats: {
    new: number;
    learning: number;
    review: number;
    mastered: number;
  };
}

export function ProgressChart({ stats }: ProgressChartProps) {
  const total = stats.new + stats.learning + stats.review + stats.mastered;

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tiến độ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Chưa có dữ liệu để hiển thị
          </p>
        </CardContent>
      </Card>
    );
  }

  const percentages = {
    new: (stats.new / total) * 100,
    learning: (stats.learning / total) * 100,
    review: (stats.review / total) * 100,
    mastered: (stats.mastered / total) * 100,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân bố từ vựng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex h-8 w-full overflow-hidden rounded-lg">
            {percentages.new > 0 && (
              <div
                className="bg-blue-500"
                style={{ width: `${percentages.new}%` }}
              />
            )}
            {percentages.learning > 0 && (
              <div
                className="bg-yellow-500"
                style={{ width: `${percentages.learning}%` }}
              />
            )}
            {percentages.review > 0 && (
              <div
                className="bg-orange-500"
                style={{ width: `${percentages.review}%` }}
              />
            )}
            {percentages.mastered > 0 && (
              <div
                className="bg-green-500"
                style={{ width: `${percentages.mastered}%` }}
              />
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-blue-500" />
              <span>Mới ({stats.new})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-yellow-500" />
              <span>Học ({stats.learning})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-orange-500" />
              <span>Ôn ({stats.review})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-green-500" />
              <span>Thuộc ({stats.mastered})</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5. Test Statistics

1. Add vocabulary with different statuses
2. Visit `/stats`
3. Verify counts match vocabulary list
4. Practice words and see stats update
5. Check progress percentage calculation

---

## Success Criteria

- [ ] Total vocabulary count displayed
- [ ] Count by status (new, learning, review, mastered) accurate
- [ ] Words added this week calculated correctly
- [ ] Progress percentage calculated (mastered / total)
- [ ] Recent activity shows latest words
- [ ] Stats update after practice sessions
- [ ] Empty state handled gracefully
- [ ] Dashboard quick stats display correctly

---

## Related Files

**Created**:
- `app/(protected)/stats/page.tsx` - Stats page
- `components/progress-chart.tsx` - Visual chart (optional)

**Modified**:
- `app/(protected)/dashboard/page.tsx` - Add quick stats cards

---

## Enhancement Ideas (Phase 2)

- Daily/weekly/monthly charts
- Learning streak tracking
- Review accuracy percentage
- Time spent learning
- Most difficult words
- Export statistics as CSV/PDF

---

## Notes

- Server Components for all stats (no client state)
- Direct DB queries for aggregations
- Simple card layout (KISS principle)
- Progress chart optional (defer if time-constrained)
- Focus on accuracy over visual complexity

---

## Next Phase

[Phase 7: Audio TTS Integration](./phase-07-audio-tts.md)
