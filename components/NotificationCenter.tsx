'use client'

import { useEffect, useState } from 'react'
import { useCrisisStore } from '@/store/crisisStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Bell,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Zap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const liveActivityLog = [
  'Volunteer assigned to Zone A',
  'New high-priority report received',
  'Medical emergency detected',
  'Relief team activated',
  'Coordinator notified',
]

export function NotificationCenter() {
  const [liveActivities, setLiveActivities] = useState<string[]>([])

  // Simulate live activity stream
  useEffect(() => {
    const interval = setInterval(() => {
      const randomActivity = liveActivityLog[Math.floor(Math.random() * liveActivityLog.length)]
      setLiveActivities((prev) => [
        { message: randomActivity, id: Date.now() },
        ...prev.slice(0, 4),
      ] as any)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const notifications = useCrisisStore(
    (state) => state.notifications
  )
  const markNotificationAsRead = useCrisisStore(
    (state) => state.markNotificationAsRead
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  const typeIcons = {
    assignment: AlertCircle,
    update: Clock,
    completion: CheckCircle,
  }

  const typeColors = {
    assignment: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    update: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    completion: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  }

  return (
    <div className="glass rounded-xl p-6 space-y-4 flex flex-col h-full">
      <div className="flex justify-between items-center pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Activity</h3>
            <p className="text-xs text-muted-foreground">Real-time updates</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Badge className="bg-red-500 animate-pulse">{unreadCount}</Badge>
        )}
      </div>

      {/* Live Activity Stream */}
      <div className="space-y-2 flex-1 overflow-hidden">
        <p className="text-xs text-muted-foreground px-2 font-medium">Live Activity</p>
        <div className="space-y-1 max-h-32 overflow-y-auto pr-2">
          <AnimatePresence>
            {liveActivities.map((activity: any) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/5 text-xs text-muted-foreground hover:border-white/10"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="truncate">{activity.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length === 0 ? (
        <div className="flex items-center justify-center text-center py-4">
          <p className="text-muted-foreground text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto flex-1 pr-2 border-t border-white/10 pt-4">
          {notifications.map((notif) => {
            const IconComponent = typeIcons[notif.type]
            const colors = typeColors[notif.type]

            return (
              <div
                key={notif.id}
                className={`p-3 rounded-lg border transition-all duration-300 ${
                  notif.read
                    ? 'border-white/5 hover:border-white/10'
                    : `glass ${colors.border} scale-in`
                }`}
              >
                <div className="flex gap-3 items-start">
                  <div className={`${colors.bg} ${colors.text} rounded-lg p-2 flex-shrink-0 mt-0.5`}>
                    <IconComponent className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notif.time.toLocaleTimeString()}
                    </p>
                  </div>

                  {!notif.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        markNotificationAsRead(notif.id)
                      }
                      className="flex-shrink-0 hover:bg-white/10 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
