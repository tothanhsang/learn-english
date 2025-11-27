import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { UserStats } from '@/types/database'
import Link from 'next/link'
import { GraduationCap, CheckCircle } from 'lucide-react'

interface StatsOverviewProps {
  stats: UserStats
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="space-y-4">
      {/* Practice shortcuts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tập luyện</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link
            href="/practice"
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-medium text-gray-900">FlashCard</span>
            </div>
            <span className="text-sm text-gray-500">({stats.total})</span>
          </Link>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Thống kê</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
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
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-xl font-bold ${colorClasses[color]}`}>{value}</p>
    </div>
  )
}
