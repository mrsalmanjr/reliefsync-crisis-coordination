'use client'

import { useCrisisStore } from '@/store/crisisStore'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, AlertCircle, Shield, Clock, Zap, Loader2, Activity, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function ActiveIncidentList() {
  const tasks = useCrisisStore((state) => state.tasks)
  const parsedReports = useCrisisStore((state) => state.parsedReports)

  const assignTask = useCrisisStore((state) => state.assignTask)
  const volunteers = useCrisisStore((state) => state.volunteers)
  const setActiveTab = useCrisisStore((state) => state.setActiveTab)

  // Get active tasks (not completed)
  const activeTasks = [...tasks]
    .filter(t => t.status !== 'completed')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'detected': return 'border-red-500/30 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
      case 'analyzed': return 'border-accent/30 bg-accent/5 shadow-[0_0_15px_rgba(var(--accent),0.1)]'
      case 'assigned': return 'border-yellow-500/30 bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
      case 'in_progress': return 'border-blue-500/30 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
      default: return 'border-white/10'
    }
  }

  if (activeTasks.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" />
          Active Incidents ({activeTasks.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {activeTasks.map((task) => {
            const report = parsedReports.find(p => p.id === task.parsedReportId)
            const isDetected = task.status === 'detected'
            const isAnalyzed = task.status === 'analyzed'
            
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`glass rounded-xl p-4 border transition-all relative overflow-hidden flex flex-col h-full ${getStatusColor(task.status)}`}
              >
                {/* Status Indicator */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isDetected ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 
                      task.status === 'analyzed' ? 'bg-accent animate-pulse shadow-[0_0_8px_rgba(var(--accent),0.6)]' : 
                      task.status === 'assigned' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70">
                      {task.status === 'detected' ? 'AI Extraction' : task.status === 'analyzed' ? 'AI Classified' : task.status.toUpperCase()}
                    </span>
                  </div>
                  <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-tighter ${
                    report?.urgency.level === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-lg shadow-red-500/5' : 'text-muted-foreground'
                  }`}>
                    {report?.urgency.level ? `${report.urgency.level === 'high' ? 'CRITICAL / LVL 1' : report.urgency.level === 'medium' ? 'ELEVATED / LVL 2' : 'MONITOR / LVL 3'}` : 'TACTICAL SCAN...'}
                  </Badge>
                </div>

                {/* Content */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-accent" />
                    <p className="text-xs font-bold text-foreground truncate">
                      {report?.location || 'Fixing Coordinates...'}
                    </p>
                  </div>
                  <h4 className="text-sm font-black text-white leading-tight mb-1">
                    {report?.type.join(' / ') || 'Extracting intelligence strings...'}
                  </h4>
                  
                  {isDetected ? (
                    <div className="flex items-center gap-2 pt-1">
                      <Loader2 className="w-3 h-3 text-accent animate-spin" />
                      <p className="text-[10px] font-medium text-muted-foreground italic">
                        AI analyzing multi-source inputs...
                      </p>
                    </div>
                  ) : report && (
                    <div className="flex items-center gap-4 pt-1">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-foreground">{report.people || 0} Assets Affected</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-foreground uppercase">
                          T +{Math.floor((Date.now() - task.createdAt.getTime()) / 60000)}m
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {isAnalyzed && (
                  <Button 
                    size="sm"
                    onClick={() => {
                      useCrisisStore.getState().triggerAudio('deploy')
                      const bestVol = volunteers.find(v => v.available) || volunteers[0]
                      assignTask(task.id, bestVol.id)
                    }}
                    className="w-full mt-4 bg-accent hover:bg-accent/90 text-white font-black uppercase text-[10px] tracking-[0.2em] h-10 rounded-lg shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative">Deploy Best Responder</span>
                  </Button>
                )}

                {/* Tactical Footer */}
                <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[9px] font-mono text-muted-foreground/50">ID: {task.id.slice(-6).toUpperCase()}</span>
                  <div className="flex items-center gap-1.5">
                    {task.assignedVolunteerId && (
                      <span className="text-[8px] font-black uppercase text-accent">Deployed to {volunteers.find(v => v.id === task.assignedVolunteerId)?.name.split(' ')[0]}</span>
                    )}
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
