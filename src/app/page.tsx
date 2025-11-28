import Link from 'next/link'
import { DemoButton } from '@/components/demo-button'
import { ThemeToggle } from '@/components/theme-toggle'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Theme toggle in top right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Learn English
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Học từ vựng tiếng Anh đơn giản và hiệu quả
        </p>

        {/* Demo button - no signup required */}
        <DemoButton />

        <div className="flex items-center gap-4 text-sm text-gray-400 dark:text-gray-500">
          <div className="h-px bg-gray-300 dark:bg-gray-700 w-16" />
          <span>hoặc</span>
          <div className="h-px bg-gray-300 dark:bg-gray-700 w-16" />
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Đăng nhập
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 border border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  )
}
