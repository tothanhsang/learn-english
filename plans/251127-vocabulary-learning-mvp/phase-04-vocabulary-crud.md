# Phase 4: Vocabulary CRUD

**Date**: 2025-11-27
**Priority**: High
**Status**: Pending
**Estimated Time**: 3-4 hours

---

## Overview

Implement Create, Read, Update, Delete (CRUD) operations for vocabulary words. Server Actions for mutations, Server Components for display. Form validation with Zod.

---

## Requirements

1. Vocabulary list page (read all words)
2. Add vocabulary form with validation
3. Edit vocabulary modal/page
4. Delete vocabulary with confirmation
5. Status update (new → learning → review → mastered)
6. Search/filter by word or status
7. Pagination for large word lists

---

## Architecture

**Pattern**: Server Components + Server Actions
- List page: Server Component (direct DB query)
- Add form: Server Action for mutation
- Edit: Server Action + optimistic UI
- Delete: Server Action with confirmation

**Data Flow**:
```
User → Form Submit → Server Action → Supabase → Revalidate → UI Update
```

**Validation**:
- Client-side: React Hook Form + Zod (UX)
- Server-side: Zod schema validation (security)

---

## Implementation Steps

### 1. Create Zod Schemas

Create `lib/validations/vocabulary.ts`:

```typescript
import { z } from "zod";

export const vocabularySchema = z.object({
  word: z.string().min(1, "Word is required").max(100, "Word too long"),
  definition: z.string().min(1, "Definition is required").max(500, "Definition too long"),
  phonetic: z.string().max(100, "Phonetic too long").optional().nullable(),
  status: z.enum(["new", "learning", "review", "mastered"]).default("new"),
});

export type VocabularyFormData = z.infer<typeof vocabularySchema>;
```

### 2. Create Vocabulary Server Actions

Create `lib/actions/vocabulary.ts`:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { vocabularySchema } from "@/lib/validations/vocabulary";
import type { WordStatus } from "@/types/database";

export async function addVocabulary(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const data = {
    word: formData.get("word") as string,
    definition: formData.get("definition") as string,
    phonetic: formData.get("phonetic") as string | null,
    status: (formData.get("status") as WordStatus) || "new",
  };

  const validated = vocabularySchema.safeParse(data);

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from("words").insert({
    user_id: user.id,
    ...validated.data,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/vocabulary");
  return { success: true };
}

export async function updateVocabulary(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const data = {
    word: formData.get("word") as string,
    definition: formData.get("definition") as string,
    phonetic: formData.get("phonetic") as string | null,
    status: formData.get("status") as WordStatus,
  };

  const validated = vocabularySchema.safeParse(data);

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from("words")
    .update(validated.data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/vocabulary");
  return { success: true };
}

export async function deleteVocabulary(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("words")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/vocabulary");
  return { success: true };
}

export async function updateWordStatus(id: string, status: WordStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("words")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/vocabulary");
  revalidatePath("/practice");
  return { success: true };
}
```

### 3. Create Vocabulary List Page

Create `app/(protected)/vocabulary/page.tsx`:

```typescript
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { VocabularyTable } from "@/components/vocabulary-table";

export default async function VocabularyPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string };
}) {
  const user = await requireAuth();
  const supabase = await createClient();

  let query = supabase
    .from("words")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (searchParams.search) {
    query = query.ilike("word", `%${searchParams.search}%`);
  }

  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }

  const { data: words, error } = await query;

  if (error) {
    console.error("Error fetching words:", error);
  }

  const wordCount = words?.length || 0;

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Từ vựng của tôi</h1>
          <p className="mt-2 text-muted-foreground">
            {wordCount} từ vựng
          </p>
        </div>
        <Link href="/vocabulary/add">
          <Button>Thêm từ vựng</Button>
        </Link>
      </div>

      <VocabularyTable words={words || []} />
    </div>
  );
}
```

### 4. Create Vocabulary Table Component

Create `components/vocabulary-table.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import type { Word } from "@/types/database";
import { deleteVocabulary } from "@/lib/actions/vocabulary";
import { useRouter } from "next/navigation";
import { EditVocabularyDialog } from "./edit-vocabulary-dialog";

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  learning: "bg-yellow-100 text-yellow-800",
  review: "bg-orange-100 text-orange-800",
  mastered: "bg-green-100 text-green-800",
};

const statusLabels = {
  new: "Mới",
  learning: "Đang học",
  review: "Ôn tập",
  mastered: "Đã thuộc",
};

export function VocabularyTable({ words }: { words: Word[] }) {
  const router = useRouter();
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa từ này?")) return;

    const result = await deleteVocabulary(id);
    if (result.error) {
      alert("Lỗi: " + result.error);
    } else {
      router.refresh();
    }
  };

  if (words.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          Chưa có từ vựng nào. Hãy thêm từ vựng đầu tiên!
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Từ</TableHead>
            <TableHead>Phiên âm</TableHead>
            <TableHead>Nghĩa</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[100px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {words.map((word) => (
            <TableRow key={word.id}>
              <TableCell className="font-medium">{word.word}</TableCell>
              <TableCell className="text-muted-foreground">
                {word.phonetic || "-"}
              </TableCell>
              <TableCell>{word.definition}</TableCell>
              <TableCell>
                <Badge className={statusColors[word.status]}>
                  {statusLabels[word.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingWord(word)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(word.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingWord && (
        <EditVocabularyDialog
          word={editingWord}
          open={!!editingWord}
          onOpenChange={(open) => !open && setEditingWord(null)}
        />
      )}
    </>
  );
}
```

### 5. Create Add Vocabulary Page

Create `app/(protected)/vocabulary/add/page.tsx`:

```typescript
import { requireAuth } from "@/lib/auth";
import { VocabularyForm } from "@/components/vocabulary-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AddVocabularyPage() {
  await requireAuth();

  return (
    <div className="container mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <Link href="/vocabulary">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
      </div>

      <h1 className="mb-8 text-3xl font-bold">Thêm từ vựng mới</h1>

      <VocabularyForm />
    </div>
  );
}
```

### 6. Create Vocabulary Form Component

Create `components/vocabulary-form.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { addVocabulary } from "@/lib/actions/vocabulary";

export function VocabularyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await addVocabulary(formData);

    setLoading(false);

    if (result.error) {
      alert("Lỗi: " + JSON.stringify(result.error));
    } else {
      router.push("/vocabulary");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="word">Từ tiếng Anh *</Label>
            <Input
              id="word"
              name="word"
              placeholder="hello"
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="definition">Nghĩa tiếng Việt *</Label>
            <Input
              id="definition"
              name="definition"
              placeholder="xin chào"
              required
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phonetic">Phiên âm (IPA)</Label>
            <Input
              id="phonetic"
              name="phonetic"
              placeholder="/həˈloʊ/"
              maxLength={100}
            />
          </div>

          <input type="hidden" name="status" value="new" />

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Thêm từ vựng"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Hủy
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

### 7. Create Edit Vocabulary Dialog

Create `components/edit-vocabulary-dialog.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateVocabulary } from "@/lib/actions/vocabulary";
import type { Word } from "@/types/database";

interface EditVocabularyDialogProps {
  word: Word;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditVocabularyDialog({
  word,
  open,
  onOpenChange,
}: EditVocabularyDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateVocabulary(word.id, formData);

    setLoading(false);

    if (result.error) {
      alert("Lỗi: " + JSON.stringify(result.error));
    } else {
      onOpenChange(false);
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa từ vựng</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-word">Từ tiếng Anh</Label>
            <Input
              id="edit-word"
              name="word"
              defaultValue={word.word}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-definition">Nghĩa tiếng Việt</Label>
            <Input
              id="edit-definition"
              name="definition"
              defaultValue={word.definition}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-phonetic">Phiên âm</Label>
            <Input
              id="edit-phonetic"
              name="phonetic"
              defaultValue={word.phonetic || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Trạng thái</Label>
            <Select name="status" defaultValue={word.status}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Mới</SelectItem>
                <SelectItem value="learning">Đang học</SelectItem>
                <SelectItem value="review">Ôn tập</SelectItem>
                <SelectItem value="mastered">Đã thuộc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### 8. Add Select Component (shadcn)

```bash
npx shadcn@latest add select
```

### 9. Add Search & Filter (Optional Enhancement)

Create `components/vocabulary-filters.tsx`:

```typescript
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function VocabularyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;

    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    router.push(`/vocabulary?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="mb-6 flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          name="search"
          placeholder="Tìm kiếm từ vựng..."
          className="pl-9"
          defaultValue={searchParams.get("search") || ""}
        />
      </div>
      <Button type="submit">Tìm</Button>
    </form>
  );
}
```

---

## Success Criteria

- [ ] User can view list of vocabulary words
- [ ] User can add new vocabulary with validation
- [ ] User can edit existing vocabulary
- [ ] User can delete vocabulary with confirmation
- [ ] User can update word status
- [ ] Empty state displayed when no words
- [ ] Form errors displayed clearly
- [ ] Changes reflected immediately after action
- [ ] RLS enforces data isolation

---

## Related Files

**Created**:
- `lib/validations/vocabulary.ts` - Zod schemas
- `lib/actions/vocabulary.ts` - Server actions
- `app/(protected)/vocabulary/page.tsx` - List page
- `app/(protected)/vocabulary/add/page.tsx` - Add page
- `components/vocabulary-table.tsx` - Table component
- `components/vocabulary-form.tsx` - Form component
- `components/edit-vocabulary-dialog.tsx` - Edit dialog

---

## Notes

- Use Server Actions for all mutations (add/edit/delete)
- Revalidate paths after mutations for immediate UI updates
- Keep forms simple - no complex validation beyond Zod
- Client components only for interactivity (table actions, modals)
- Empty state improves UX for new users

---

## Next Phase

[Phase 5: Flashcard Practice](./phase-05-flashcard-practice.md)
