import Link from 'next/link'
import { DemoButton } from '@/components/demo-button'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Learn English
        </h1>
        <p className="text-lg text-gray-600">
          Học từ vựng tiếng Anh đơn giản và hiệu quả
        </p>

        {/* Demo button - no signup required */}
        <DemoButton />

        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="h-px bg-gray-300 w-16" />
          <span>hoặc</span>
          <div className="h-px bg-gray-300 w-16" />
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
            className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  )
}
