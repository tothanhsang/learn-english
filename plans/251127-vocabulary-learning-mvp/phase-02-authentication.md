# Phase 2: Authentication

**Date**: 2025-11-27
**Priority**: Critical
**Status**: Pending
**Estimated Time**: 2-3 hours

---

## Overview

Implement email/password authentication using Supabase Auth with cookie-based sessions. Server-side auth validation via middleware. Protected routes for authenticated users.

---

## Requirements

1. Signup page with email/password
2. Login page with email/password
3. Email confirmation flow
4. Logout functionality
5. Protected routes middleware
6. Auth utilities (getUser, getSession)
7. Redirect logic (logged in → dashboard, logged out → login)

---

## Architecture

**Pattern**: Server-side auth with cookie-based sessions
- Use `@supabase/ssr` for SSR-safe auth
- `getUser()` (validates JWT server-side) > `getSession()` (client-side only)
- httpOnly cookies for session storage
- Middleware refreshes session on every request

**Security**:
- Never expose service role key to client
- Use RLS for all database queries
- Validate session server-side before protected operations

---

## Implementation Steps

### 1. Configure Supabase Auth Settings

In Supabase dashboard:
1. Go to Authentication → URL Configuration
2. Set Site URL: `http://localhost:3000` (dev), production URL (prod)
3. Add Redirect URLs:
   - `http://localhost:3000/auth/confirm`
   - `http://localhost:3000/dashboard`
4. Go to Authentication → Email Templates
5. Update "Confirm signup" template:

```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your email:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm email</a></p>
```

### 2. Create Auth Actions

Create `lib/actions/auth.ts`:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
```

### 3. Create Auth Utilities

Create `lib/auth.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
```

### 4. Create Signup Page

Create `app/(auth)/signup/page.tsx`:

```typescript
import { signup } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Đăng ký tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Đăng ký
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Đăng nhập
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 5. Create Login Page

Create `app/(auth)/login/page.tsx`:

```typescript
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Đăng nhập</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Đăng nhập
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Đăng ký
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 6. Create Email Confirmation Handler

Create `app/auth/confirm/route.ts`:

```typescript
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Error: redirect to error page
  return NextResponse.redirect(new URL("/login?error=confirmation_failed", request.url));
}
```

### 7. Create Auth Layout (No Header)

Create `app/(auth)/layout.tsx`:

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

### 8. Update Protected Routes Middleware

Update `middleware.ts`:

```typescript
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createClient } from "@/lib/supabase/server";

const publicRoutes = ["/login", "/signup", "/auth/confirm"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Update session
  const response = await updateSession(request);

  // Check auth for protected routes
  if (!publicRoutes.includes(pathname) && pathname !== "/") {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### 9. Create Protected Dashboard Page

Create `app/(protected)/dashboard/page.tsx`:

```typescript
import { requireAuth } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Xin chào, {user.email}</p>
        </div>
        <form action={logout}>
          <Button variant="outline" type="submit">
            Đăng xuất
          </Button>
        </form>
      </div>
    </div>
  );
}
```

### 10. Update Home Page with Redirect Logic

Update `app/page.tsx`:

```typescript
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">English Vocabulary Learning</h1>
      <p className="mt-4 text-muted-foreground">
        Học từ vựng tiếng Anh hiệu quả
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/login">
          <Button>Đăng nhập</Button>
        </Link>
        <Link href="/signup">
          <Button variant="outline">Đăng ký</Button>
        </Link>
      </div>
    </main>
  );
}
```

### 11. Create Protected Layout

Create `app/(protected)/layout.tsx`:

```typescript
import { requireAuth } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold">
              Vocabulary
            </Link>
            <nav className="flex gap-4">
              <Link
                href="/vocabulary"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Từ vựng
              </Link>
              <Link
                href="/practice"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Luyện tập
              </Link>
              <Link
                href="/stats"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Thống kê
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <form action={logout}>
              <Button variant="ghost" size="sm" type="submit">
                Đăng xuất
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

### 12. Test Authentication Flow

1. Start dev server: `npm run dev`
2. Visit `/signup` - create account
3. Check email for confirmation link
4. Click link → redirected to `/dashboard`
5. Logout → redirected to `/login`
6. Login with credentials → dashboard
7. Try accessing `/vocabulary` without auth → redirected to `/login`

---

## Success Criteria

- [ ] User can signup with email/password
- [ ] Confirmation email sent successfully
- [ ] Email link confirms account and redirects to dashboard
- [ ] User can login with credentials
- [ ] User can logout
- [ ] Protected routes require authentication
- [ ] Logged-in users redirected from auth pages to dashboard
- [ ] Session persists across page refreshes
- [ ] Middleware validates session on every request

---

## Related Files

**Created**:
- `lib/actions/auth.ts` - Auth server actions
- `lib/auth.ts` - Auth utilities
- `app/(auth)/signup/page.tsx` - Signup page
- `app/(auth)/login/page.tsx` - Login page
- `app/(auth)/layout.tsx` - Auth layout
- `app/auth/confirm/route.ts` - Email confirmation handler
- `app/(protected)/dashboard/page.tsx` - Dashboard page
- `app/(protected)/layout.tsx` - Protected layout

**Modified**:
- `middleware.ts` - Add auth check for protected routes
- `app/page.tsx` - Add redirect logic

---

## Security Notes

- Always use `getUser()` (validates JWT) over `getSession()` (client-side)
- Never expose service role key to client
- httpOnly cookies prevent XSS attacks
- Middleware refreshes session automatically
- RLS policies enforce data isolation (Phase 3)

---

## Unresolved Questions

- Error handling UI (toast notifications?) - defer to implementation
- Password reset flow - Phase 2 (nice-to-have)
- Remember me functionality - Phase 2 (nice-to-have)

---

## Next Phase

[Phase 3: Database Schema](./phase-03-database-schema.md)
