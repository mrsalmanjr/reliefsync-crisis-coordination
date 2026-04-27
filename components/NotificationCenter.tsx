'use client'

import { useState } from 'react'
import { useCrisisStore } from '@/store/crisisStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Bell,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Radio,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const notifications = useCrisisStore((state) => state.notifications)
  const activities = useCrisisStore((state) => state.activities)
  const markNotificationAsRead = useCrisisStore((state) => state.markNotificationAsRead)

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
    <div className="relative">
      {/* Bell Icon Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all relative group"
      >
        <Bell className={`w-5 h-5 transition-colors ${unreadCount > 0 ? 'text-accent' : 'text-muted-foreground'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#050505] animate-bounce">
            {unreadCount}
          </span>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <div 
              className="fixed inset-0 z-[110]" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Popover Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-12 right-0 w-80 max-h-[500px] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-[120] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-accent animate-pulse" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Mission Intelligence</h3>
                </div>
                <Badge variant="outline" className="text-[10px] opacity-50 border-white/10">
                  {notifications.length} Total
                </Badge>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <Clock className="w-8 h-8 text-muted-foreground/20 mx-auto" />
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">No Active Comms</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const IconComponent = typeIcons[notif.type] || Clock
                    const colors = typeColors[notif.type] || typeColors.update

                    return (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-xl border transition-all relative overflow-hidden group ${
                          notif.read
                            ? 'border-white/5 bg-transparent opacity-60'
                            : `bg-white/5 ${colors.border}`
                        }`}
                      >
                        <div className="flex gap-3 items-start relative z-10">
                          <div className={`${colors.bg} ${colors.text} rounded-lg p-2 flex-shrink-0`}>
                            <IconComponent className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground font-bold leading-tight">{notif.message}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono uppercase">
                              {new Date(notif.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          {!notif.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                markNotificationAsRead(notif.id)
                              }}
                              className="p-1 rounded-md hover:bg-white/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="p-3 bg-white/[0.02] border-t border-white/5">
                <Button 
                  variant="ghost" 
                  className="w-full text-[10px] font-black uppercase tracking-widest h-8 hover:bg-white/5"
                  onClick={() => setIsOpen(false)}
                >
                  Close Operational Feed
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
