import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: words } = await supabase
    .from('words')
    .select('*')
    .eq('user_id', user!.id)

  const stats = {
    total: words?.length ?? 0,
    new: words?.filter(w => w.status === 'new').length ?? 0,
    learning: words?.filter(w => w.status === 'learning').length ?? 0,
    reviewing: words?.filter(w => w.status === 'reviewing').length ?? 0,
    mastered: words?.filter(w => w.status === 'mastered').length ?? 0,
  }

  const masteredPercentage = stats.total > 0
    ? Math.round((stats.mastered / stats.total) * 100)
    : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thống kê học tập</h1>
        <p className="text-gray-600">Theo dõi tiến độ học từ vựng của bạn</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Tổng từ vựng"
          value={stats.total}
          color="gray"
        />
        <StatCard
          label="Từ mới"
          value={stats.new}
          color="purple"
        />
        <StatCard
          label="Đang học"
          value={stats.learning}
          color="orange"
        />
        <StatCard
          label="Đã thuộc"
          value={stats.mastered}
          color="green"
        />
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Tiến độ học tập</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tỷ lệ hoàn thành</span>
              <span className="text-2xl font-bold text-green-600">{masteredPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all"
                style={{ width: `${masteredPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">
              {stats.mastered} / {stats.total} từ đã thuộc
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết trạng thái</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ProgressBar label="Từ mới" value={stats.new} total={stats.total} color="bg-purple-500" />
            <ProgressBar label="Đang học" value={stats.learning} total={stats.total} color="bg-orange-500" />
            <ProgressBar label="Ôn tập" value={stats.reviewing} total={stats.total} color="bg-blue-500" />
            <ProgressBar label="Đã thuộc" value={stats.mastered} total={stats.total} color="bg-green-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: 'gray' | 'purple' | 'orange' | 'green'
}) {
  const colorClasses = {
    gray: 'border-gray-200 bg-gray-50',
    purple: 'border-purple-200 bg-purple-50',
    orange: 'border-orange-200 bg-orange-50',
    green: 'border-green-200 bg-green-50',
  }

  const textColors = {
    gray: 'text-gray-900',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    green: 'text-green-600',
  }

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`text-3xl font-bold ${textColors[color]}`}>{value}</p>
    </div>
  )
}

function ProgressBar({
  label,
  value,
  total,
  color,
}: {
  label: string
  value: number
  total: number
  color: string
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-900 font-medium">{value} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
