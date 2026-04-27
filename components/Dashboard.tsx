'use client'

import { useCrisisStore } from '@/store/crisisStore'
import { AlertTriangle, Users, TrendingUp, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { StaggerContainer, StaggerItem } from './PremiumWrapper'
import { AnimatedCounter } from './AnimatedCounter'
import { PredictiveInsights } from './PredictiveInsights'

export function Dashboard() {
  const tasks = useCrisisStore((state) => state.tasks)
  const volunteers = useCrisisStore((state) => state.volunteers)
  const parsedReports = useCrisisStore((state) => state.parsedReports)

  const highPriorityTasks = tasks.filter(
    (t) =>
      t.status !== 'completed' &&
      parsedReports.find((p) => p.id === t.parsedReportId)?.urgency
        .level === 'high'
  ).length

  const availableVolunteers = volunteers.filter((v) => v.available).length
  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const activeTasks = tasks.filter((t) => t.status === 'assigned' || t.status === 'in_progress').length

  const StatCard = ({ icon: Icon, label, value, subtext, color, pulseColor }: any) => (
    <StaggerItem>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ duration: 0.2 }}
        className="glass-hover group relative overflow-hidden rounded-xl p-6 cursor-pointer border border-white/5"
      >
        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <motion.div
              className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-lg`}
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Icon className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              className={`w-2 h-2 rounded-full ${pulseColor}`}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-black uppercase tracking-widest opacity-60">{label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <AnimatedCounter 
                value={value} 
                className="text-4xl font-black text-foreground tracking-tighter" 
              />
            </div>
            {subtext && <p className="text-[10px] text-muted-foreground mt-2 font-medium opacity-50">{subtext}</p>}
          </div>
        </div>
      </motion.div>
    </StaggerItem>
  )

  const stats = [
    {
      label: 'High Priority',
      value: highPriorityTasks,
      icon: AlertTriangle,
      subtext: 'Urgent medical & safety needs',
      color: 'bg-red-500 shadow-red-500/20',
      pulseColor: 'bg-red-500',
    },
    {
      label: 'Active Responses',
      value: activeTasks,
      icon: Activity,
      subtext: 'Deployed assets in field',
      color: 'bg-accent shadow-accent/20',
      pulseColor: 'bg-accent',
    },
    {
      label: 'Completed missions',
      value: completedTasks,
      icon: TrendingUp,
      subtext: 'Successfully resolved tasks',
      color: 'bg-purple-500 shadow-purple-500/20',
      pulseColor: 'bg-purple-400',
    },
    {
      label: 'Ground assets',
      value: availableVolunteers,
      icon: Users,
      subtext: 'Available for deployment',
      color: 'bg-emerald-500 shadow-emerald-500/20',
      pulseColor: 'bg-emerald-400',
    },
  ]

  return (
    <div className="space-y-8">
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </StaggerContainer>

      <PredictiveInsights />
    </div>
  )
}
