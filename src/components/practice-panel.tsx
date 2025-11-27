import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { GraduationCap, Zap, BookOpen, PenTool, CheckCircle } from 'lucide-react'

interface PracticePanelProps {
  wordCount: number
}

const practiceItems = [
  {
    href: '/practice',
    icon: GraduationCap,
    label: 'FlashCard',
    color: 'bg-green-100 text-green-600',
    available: true,
  },
  {
    href: '#',
    icon: Zap,
    label: 'Test nhanh',
    color: 'bg-blue-100 text-blue-600',
    available: false,
  },
  {
    href: '#',
    icon: BookOpen,
    label: 'Luyện đọc',
    color: 'bg-purple-100 text-purple-600',
    available: false,
  },
  {
    href: '#',
    icon: PenTool,
    label: 'Luyện viết',
    color: 'bg-orange-100 text-orange-600',
    available: false,
  },
]

export function PracticePanel({ wordCount }: PracticePanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Tập luyện</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {practiceItems.map((item) => {
          const Icon = item.icon
          const content = (
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-900">{item.label}</span>
                {item.label === 'FlashCard' && (
                  <span className="text-xs text-gray-500">({wordCount})</span>
                )}
              </div>
              {item.available ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <span className="text-xs text-gray-400">Sắp ra mắt</span>
              )}
            </div>
          )

          if (item.available) {
            return (
              <Link key={item.label} href={item.href}>
                {content}
              </Link>
            )
          }

          return <div key={item.label} className="opacity-60 cursor-not-allowed">{content}</div>
        })}

        <p className="text-xs text-gray-500 text-center pt-2">
          Tập luyện càng nhiều, tiến bộ càng nhanh! 💪
        </p>
      </CardContent>
    </Card>
  )
}
