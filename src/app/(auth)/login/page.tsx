"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signIn, type AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Đang đăng nhập..." : "Đăng nhập"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState<AuthState, FormData>(signIn, {});
  console.log(state);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-transparent px-4 transition-colors relative">
      {/* Floating orbs for dark mode background effect */}
      <div className="hidden dark:block fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent-pink/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-blue/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="w-full max-w-md space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Trang chủ
        </Link>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Đăng nhập</h1>
          <p className="mt-2 text-gray-600 dark:text-white/60">Chào mừng bạn quay trở lại</p>
        </div>

        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 dark:text-white/80"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 dark:text-white/80"
            >
              Mật khẩu
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <SubmitButton />
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-white/60">
          Chưa có tài khoản?{" "}
          <Link
            href="/signup"
            className="text-primary-600 dark:text-accent-pink hover:underline font-medium"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
