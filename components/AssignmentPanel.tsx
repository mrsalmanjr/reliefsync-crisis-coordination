'use client'

import { useCrisisStore } from '@/store/crisisStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Zap, User, MapPin, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { StaggerContainer, StaggerItem } from './PremiumWrapper'

export function AssignmentPanel() {
  const tasks = useCrisisStore((state) => state.tasks)
  const volunteers = useCrisisStore((state) => state.volunteers)
  const assignTask = useCrisisStore((state) => state.assignTask)

  const pendingTasks = tasks.filter((t) => t.status === 'pending')

  if (pendingTasks.length === 0) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <p className="text-muted-foreground">No pending assignments</p>
      </div>
    )
  }

  return (
    <StaggerContainer className="space-y-6">
      {pendingTasks.map((task) => {
        return (
          <StaggerItem key={task.id}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="glass rounded-xl p-6 space-y-6 slide-in-up"
            >
            {/* Task Header */}
            <div className="flex justify-between items-start pb-4 border-b border-white/10">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent" />
                  Task {task.id.slice(-6)}
                </h3>
                <p className="text-xs text-muted-foreground">Awaiting volunteer assignment</p>
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                Pending
              </Badge>
            </div>

            {/* Matched Volunteers */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-accent" />
                Smart Matches ({task.matchedVolunteers.length})
              </h4>

              {task.matchedVolunteers.length > 0 ? (
                <div className="space-y-3">
                  {task.matchedVolunteers.map((match) => {
                    const isAssigned = task.assignedVolunteerId === match.volunteer.id
                    const scorePercent = (match.matchScore / 100) * 100

                    return (
                      <div
                        key={match.volunteer.id}
                        className={`glass-hover rounded-lg p-4 flex flex-col gap-4 transition-all ${
                          isAssigned ? 'ring-2 ring-green-500/50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-2">
                            <p className="font-semibold text-foreground">
                              {match.volunteer.name}
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {match.volunteer.skills.map((skill) => (
                                <Badge key={skill} className="bg-accent/20 text-accent border-0 text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {isAssigned ? (
                            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 whitespace-nowrap">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Assigned
                            </Badge>
                          ) : (
                            <Button
                              onClick={() =>
                                assignTask(task.id, match.volunteer.id)
                              }
                              className="bg-gradient-to-r from-accent to-blue-500 hover:from-accent hover:to-blue-600 text-primary-foreground font-semibold whitespace-nowrap"
                            >
                              Assign
                            </Button>
                          )}
                        </div>

                        {/* Match Details */}
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Match Score</p>
                            <div className="mt-1 space-y-1">
                              <p className="text-sm font-bold text-accent">{match.matchScore}%</p>
                              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-accent to-blue-500 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${scorePercent}%` }}
                                  transition={{ duration: 0.8, delay: 0.2 }}
                                />
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Distance</p>
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-accent" />
                              <p className="text-sm font-bold text-foreground">{match.distance} km</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Reason</p>
                            <p className="text-sm text-foreground mt-1 font-medium">{match.reason}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    No available volunteers matched
                  </p>
                </div>
              )}
            </div>
            </motion.div>
          </StaggerItem>
        )
      })}
    </StaggerContainer>
  )
}
