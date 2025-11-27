import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Learn English - Học Tiếng Anh',
  description: 'Ứng dụng học từ vựng tiếng Anh đơn giản và hiệu quả',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}
