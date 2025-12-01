import Link from 'next/link'
import { DemoButton } from '@/components/demo-button'
import { ThemeToggle } from '@/components/theme-toggle'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-transparent transition-colors relative">
      {/* Floating orbs for dark mode background effect */}
      <div className="hidden dark:block fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent-pink/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-blue/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl" />
      </div>

      {/* Theme toggle in top right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Learn English
        </h1>
        <p className="text-lg text-gray-600 dark:text-white/70">
          Học từ vựng tiếng Anh đơn giản và hiệu quả
        </p>

        {/* Demo button - no signup required */}
        <DemoButton />

        <div className="flex items-center gap-4 text-sm text-gray-400 dark:text-white/40">
          <div className="h-px bg-gray-300 dark:bg-white/20 w-16" />
          <span>hoặc</span>
          <div className="h-px bg-gray-300 dark:bg-white/20 w-16" />
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition dark:bg-gradient-to-r dark:from-accent-pink dark:to-pink-500 dark:hover:shadow-lg dark:hover:shadow-accent-pink/30"
          >
            Đăng nhập
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 border border-primary-600 text-primary-600 dark:border-white/20 dark:text-white rounded-xl hover:bg-primary-50 dark:hover:bg-white/10 transition"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  )
}
