'use client'

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

export function NotificationCenter() {
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

      {notifications.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <p className="text-muted-foreground text-sm">No updates yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto flex-1 pr-2">
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
