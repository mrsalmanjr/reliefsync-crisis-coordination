'use client'

import { useCrisisStore } from '@/store/crisisStore'
import { AlertTriangle, Users, TrendingUp, Activity } from 'lucide-react'

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
  const activeTasks = tasks.filter((t) => t.status === 'in_progress')

  const StatCard = ({ icon: Icon, label, value, subtext, color }: any) => (
    <div className="glass-hover group relative overflow-hidden rounded-xl p-6 cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
        <div>
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="text-3xl font-bold mt-1 text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground mt-2">{subtext}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={AlertTriangle}
        label="High Priority"
        value={highPriorityTasks.length}
        subtext="Urgent crisis needs"
        color="bg-gradient-to-br from-red-600 to-red-500"
      />
      <StatCard
        icon={Activity}
        label="Active Responses"
        value={activeTasks.length}
        subtext="In progress now"
        color="bg-gradient-to-br from-accent to-blue-500"
      />
      <StatCard
        icon={Users}
        label="Available"
        value={`${availableVolunteers.length}/${volunteers.length}`}
        subtext="Ready to assist"
        color="bg-gradient-to-br from-emerald-600 to-emerald-500"
      />
      <StatCard
        icon={TrendingUp}
        label="Completed"
        value={completedTasks.length}
        subtext="Tasks resolved"
        color="bg-gradient-to-br from-purple-600 to-purple-500"
      />
    </div>
  )
}
