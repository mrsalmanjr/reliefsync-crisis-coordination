'use client'

import { useEffect, useRef, useState } from 'react'
import { useCrisisStore, Activity } from '@/store/crisisStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, Zap, AlertTriangle, CheckCircle } from 'lucide-react'

const MOCK_MESSAGES = [
  { text: 'New crisis report detected in Hubli district', type: 'incident' as const },
  { text: 'Regional responder unit assigned to Zone B', type: 'assignment' as const },
  { text: 'Supply chain optimization algorithm updated', type: 'system' as const },
  { text: 'Medical relief successful in North Sector', type: 'completion' as const },
  { text: 'High priority alert triggered near Bangalore', type: 'incident' as const },
  { text: 'Satellite imaging sync complete', type: 'system' as const },
  { text: 'Volunteer availability updated in Karnataka', type: 'system' as const },
]

export function LiveActivityFeed() {
  const activities = useCrisisStore((state) => state.activities)
  const addActivity = useCrisisStore((state) => state.addActivity)
  const lastMockTime = useRef(Date.now())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      if (Date.now() - lastMockTime.current > 4000) {
        const randomMsg = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)]
        addActivity(randomMsg.text, randomMsg.type)
        lastMockTime.current = Date.now()
      }
    }, 4500)

    return () => clearInterval(interval)
  }, [addActivity])

  if (!mounted) return null

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-xl z-[100] px-4 pointer-events-none">
      <div className="glass rounded-full border border-white/10 h-10 px-4 flex items-center gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl pointer-events-auto overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/10 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        <div className="flex-shrink-0 flex items-center gap-2">
          <div className="relative w-2 h-2">
            <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
            <div className="relative rounded-full w-2 h-2 bg-accent" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Live</span>
        </div>

        <div className="w-px h-4 bg-white/10" />

        <div className="flex-1 relative h-full">
          <AnimatePresence mode="popLayout">
            {activities.slice(0, 1).map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: -20, opacity: 0, filter: 'blur(10px)' }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 30
                }}
                className="absolute inset-0 flex items-center gap-3"
              >
                <span className="text-xs font-bold text-foreground/90 tracking-tight truncate">
                  {activity.message}
                </span>
                <span className="ml-auto text-[9px] font-mono text-muted-foreground/40 tabular-nums">
                  {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
