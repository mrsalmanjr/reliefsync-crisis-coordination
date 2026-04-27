'use client'

import { useCrisisStore } from '@/store/crisisStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Zap, User, MapPin, TrendingUp, Sparkles, Clock, PlayCircle, DoneAll, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { StaggerContainer, StaggerItem } from './PremiumWrapper'
import { toast } from 'sonner'
import { Task } from '@/types'

export function AssignmentPanel() {
  const tasks = useCrisisStore((state) => state.tasks)
  const volunteers = useCrisisStore((state) => state.volunteers)
  const assignTask = useCrisisStore((state) => state.assignTask)
  const updateTaskStatus = useCrisisStore((state) => state.updateTaskStatus)

  const handleAssign = (volunteerId: string, taskId: string, volunteerName: string) => {
    assignTask(taskId, volunteerId)
    toast.success(`Responder assigned to task`, {
      description: `${volunteerName} is now en route.`,
      icon: <Zap className="w-4 h-4 text-yellow-400" />,
    })
  }

  const handleStatusUpdate = (taskId: string, status: Task['status']) => {
    updateTaskStatus(taskId, status)
    toast.success(`Task status updated to ${status.replace('_', ' ')}`, {
      icon: status === 'completed' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Clock className="w-4 h-4 text-blue-400" />,
    })
  }

  const getStatusConfig = (status: Task['status']) => {
    switch (status) {
      case 'detected':
        return { label: 'DETECTED', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle }
      case 'analyzed':
        return { label: 'ANALYZED', color: 'bg-accent/20 text-accent border-accent/30', icon: Sparkles }
      case 'assigned':
        return { label: 'ASSIGNED', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: User }
      case 'in_progress':
        return { label: 'IN PROGRESS', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: PlayCircle }
      case 'completed':
        return { label: 'COMPLETED', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle }
      default:
        return { label: 'UNKNOWN', color: 'bg-white/5 text-muted-foreground', icon: Clock }
    }
  }

  // Filter out completed tasks from the main list, or show them at the bottom
  const activeTasks = tasks.filter((t) => t.status !== 'completed').sort((a, b) => {
    const order = { detected: 0, analyzed: 1, assigned: 2, in_progress: 3 }
    return order[a.status as keyof typeof order] - order[b.status as keyof typeof order]
  })

  if (activeTasks.length === 0) {
    return (
      <div className="glass rounded-xl p-12 text-center min-h-[300px] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-accent/40" />
        </div>
        <p className="text-muted-foreground font-medium">No active missions</p>
        <p className="text-xs text-muted-foreground mt-1">All incidents are currently closed or monitored</p>
      </div>
    )
  }

  return (
    <StaggerContainer className="space-y-6">
      {activeTasks.map((task) => {
        const config = getStatusConfig(task.status)
        const StatusIcon = config.icon

        return (
          <StaggerItem key={task.id}>
            <motion.div
              layout
              className="glass rounded-xl p-6 space-y-6 border-accent/10 relative overflow-hidden"
            >
              {/* Status Glow Effect */}
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] -mr-16 -mt-16 opacity-20 ${config.color.split(' ')[1]}`} />

              {/* Task Header */}
              <div className="flex justify-between items-start pb-4 border-b border-white/10 relative z-10">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <StatusIcon className="w-5 h-5" />
                    Mission {task.id.slice(-6).toUpperCase()}
                  </h3>
                  <p className="text-xs text-muted-foreground">Strategic incident coordination active</p>
                </div>
                <Badge className={`${config.color} font-black uppercase tracking-widest px-3 py-1`}>
                  {config.label}
                </Badge>
              </div>

              {/* Lifecycle Actions */}
              <div className="flex gap-2 flex-wrap pb-4 border-b border-white/5">
                {task.status === 'analyzed' && (
                  <p className="text-xs text-muted-foreground font-medium italic">Waiting for responder assignment...</p>
                )}
                
                {task.status === 'assigned' && (
                  <Button 
                    onClick={() => handleStatusUpdate(task.id, 'in_progress')}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-widest h-9"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start Mission
                  </Button>
                )}

                {task.status === 'in_progress' && (
                  <Button 
                    onClick={() => handleStatusUpdate(task.id, 'completed')}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-black uppercase tracking-widest h-9"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Completed
                  </Button>
                )}

                {task.status === 'detected' && (
                  <p className="text-xs text-accent font-black animate-pulse uppercase tracking-widest">AI analyzing report...</p>
                )}
              </div>

              {/* Matched Volunteers (Only for analyzed/assigned/in_progress) */}
              {(task.status === 'analyzed' || task.status === 'assigned' || task.status === 'in_progress') && (
                <div className="space-y-4">
                  <h4 className="font-black text-foreground flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-60">
                    <Sparkles className="w-4 h-4 text-accent" />
                    {task.status === 'analyzed' ? `Intelligent Matches (${task.matchedVolunteers.length})` : 'Assigned Asset'}
                  </h4>

                  <div className="space-y-3">
                    {task.matchedVolunteers
                      .filter(m => !task.assignedVolunteerId || m.volunteer.id === task.assignedVolunteerId)
                      .map((match, index) => {
                        const isAssigned = task.assignedVolunteerId === match.volunteer.id
                        const scorePercent = (match.matchScore / 100) * 100
                        const isBestMatch = index === 0 && !task.assignedVolunteerId

                        return (
                          <div
                            key={match.volunteer.id}
                            className={`glass-hover rounded-lg p-4 flex flex-col gap-4 transition-all relative overflow-hidden ${
                              isBestMatch ? 'border-accent/40 bg-accent/5' : 'border-white/5'
                            } border`}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-foreground">
                                    {match.volunteer.name}
                                  </p>
                                  {isBestMatch && <Sparkles className="w-3 h-3 text-accent animate-pulse" />}
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                  {match.volunteer.skills.map((skill) => (
                                    <Badge key={skill} className="bg-white/5 text-muted-foreground border-white/10 text-[10px] font-medium uppercase tracking-tighter">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {isAssigned ? (
                                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 whitespace-nowrap font-black uppercase text-[10px] tracking-widest">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Active
                                </Badge>
                              ) : (
                                <Button
                                  onClick={() => handleAssign(match.volunteer.id, task.id, match.volunteer.name)}
                                  className={`font-black uppercase tracking-widest text-[10px] h-8 px-4 ${
                                    isBestMatch 
                                      ? 'bg-accent hover:bg-accent/90 text-primary-foreground' 
                                      : 'bg-white/5 hover:bg-white/10 text-foreground border border-white/10'
                                  }`}
                                >
                                  Assign
                                </Button>
                              )}
                            </div>

                            {/* Match Stats */}
                            <div className="grid grid-cols-3 gap-3 text-xs border-t border-white/5 pt-3">
                              <div>
                                <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest opacity-50">Match</p>
                                <p className="text-sm font-black text-accent">{match.matchScore}%</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest opacity-50">Distance</p>
                                <p className="text-sm font-black text-foreground">{match.distance} km</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest opacity-50">Logistics</p>
                                <p className="text-[11px] text-foreground font-bold truncate">Route Optimized</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {task.status === 'detected' && (
                <div className="py-10 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Extracting Intelligence...</p>
                </div>
              )}
            </motion.div>
          </StaggerItem>
        )
      })}
    </StaggerContainer>
  )
}
