'use client'

import { useCrisisStore } from '@/store/crisisStore'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Bell,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
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

  const typeBadgeColors = {
    assignment: 'bg-red-100 text-red-800',
    update: 'bg-blue-100 text-blue-800',
    completion: 'bg-green-100 text-green-800',
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </h3>
        {unreadCount > 0 && (
          <Badge className="bg-red-500">{unreadCount}</Badge>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {notifications.map((notif) => {
            const IconComponent = typeIcons[notif.type]

            return (
              <div
                key={notif.id}
                className={`p-3 rounded border flex gap-3 items-start ${
                  notif.read
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <IconComponent className="w-4 h-4 mt-0.5 flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notif.time.toLocaleTimeString()}
                  </p>
                </div>

                <Badge className={typeBadgeColors[notif.type]}>
                  {notif.type}
                </Badge>

                {!notif.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      markNotificationAsRead(notif.id)
                    }
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
