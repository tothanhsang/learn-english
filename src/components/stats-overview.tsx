import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { UserStats } from '@/types/database'
import Link from 'next/link'
import { GraduationCap, CheckCircle } from 'lucide-react'

interface StatsOverviewProps {
  stats: UserStats
  label?: string
}

export function StatsOverview({ stats, label = 'Từ vựng' }: StatsOverviewProps) {
  return (
    <div className="space-y-3">
      {/* Practice shortcut */}
      <Card>
        <CardHeader className="px-3 py-2 pb-2">
          <CardTitle className="text-sm">Tập luyện</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0">
          <Link
            href="/practice"
            className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 transition"
          >
            <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-800 flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-900 dark:text-white">FlashCard</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({stats.total})</span>
            </div>
            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0" />
          </Link>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader className="px-3 py-2 pb-2">
          <CardTitle className="text-sm">Thống kê {label}</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0">
          <div className="grid grid-cols-2 gap-2">
            <StatItem label="Từ mới" value={stats.new} color="purple" />
            <StatItem label="Đang học" value={stats.learning} color="orange" />
            <StatItem label="Ôn tập" value={stats.reviewing} color="blue" />
            <StatItem label="Đã thuộc" value={stats.mastered} color="green" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: 'purple' | 'orange' | 'blue' | 'green'
}) {
  const colorClasses = {
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-orange-600 dark:text-orange-400',
    blue: 'text-blue-600 dark:text-accent-blue',
    green: 'text-green-600 dark:text-green-400',
  }

  return (
    <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-2 text-center">
      <p className="text-[10px] text-gray-500 dark:text-white/50">{label}</p>
      <p className={`text-lg font-bold ${colorClasses[color]}`}>{value}</p>
    </div>
  )
}
