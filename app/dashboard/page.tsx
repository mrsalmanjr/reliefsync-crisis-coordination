'use client'

import { motion } from 'framer-motion'
import { Dashboard } from '@/components/Dashboard'
import { CrisisMap } from '@/components/CrisisMap'
import { ReportInput } from '@/components/ReportInput'
import { NotificationCenter } from '@/components/NotificationCenter'
import { Zap } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export default function DashboardPage() {
  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Crisis Dashboard</h1>
            <p className="text-muted-foreground">Real-time incident tracking and response</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants}>
        <Dashboard />
      </motion.div>

      {/* Main Content Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CrisisMap />
        </div>
        <NotificationCenter />
      </motion.div>

      {/* Quick Report Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportInput />
        <div className="glass rounded-xl p-8 flex items-center justify-center text-center">
          <div className="space-y-4">
            <p className="text-muted-foreground">AI Analysis Panel</p>
            <p className="text-sm text-muted-foreground">Submit a report to see Gemini AI analysis</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
