'use client'

import { useCrisisStore } from '@/store/crisisStore'
import { Card } from '@/components/ui/card'
import { AlertTriangle, Users, TrendingUp } from 'lucide-react'

export function Dashboard() {
  const tasks = useCrisisStore((state) => state.tasks)
  const volunteers = useCrisisStore((state) => state.volunteers)
  const parsedReports = useCrisisStore((state) => state.parsedReports)

  const highPriorityTasks = tasks.filter(
    (t) =>
      parsedReports.find((p) => p.id === t.parsedReportId)?.urgency
        .level === 'high'
  )

  const availableVolunteers = volunteers.filter((v) => v.available)

  const completedTasks = tasks.filter((t) => t.status === 'completed')

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* High Priority Tasks */}
      <Card className="p-6 space-y-2 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="text-sm font-semibold text-gray-600">
            High Priority
          </h3>
        </div>
        <p className="text-3xl font-bold text-red-600">
          {highPriorityTasks.length}
        </p>
        <p className="text-xs text-gray-600">Crisis tasks needing urgent attention</p>
      </Card>

      {/* Available Volunteers */}
      <Card className="p-6 space-y-2 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          <h3 className="text-sm font-semibold text-gray-600">
            Available Volunteers
          </h3>
        </div>
        <p className="text-3xl font-bold text-green-600">
          {availableVolunteers.length}/{volunteers.length}
        </p>
        <p className="text-xs text-gray-600">Ready to respond</p>
      </Card>

      {/* Completed Tasks */}
      <Card className="p-6 space-y-2 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-600">
            Completed Tasks
          </h3>
        </div>
        <p className="text-3xl font-bold text-blue-600">
          {completedTasks.length}
        </p>
        <p className="text-xs text-gray-600">Total resolved</p>
      </Card>
    </div>
  )
}
