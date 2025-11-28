'use client'

import { useState } from 'react'
import { demoSignIn } from '@/lib/actions/auth'
import { Loader2, Play } from 'lucide-react'

export function DemoButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDemo = async () => {
    setIsLoading(true)
    setError(null)
    const result = await demoSignIn()
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleDemo}
        disabled={isLoading}
        className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2 text-lg font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Đang vào...
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            Dùng thử ngay
          </>
        )}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
