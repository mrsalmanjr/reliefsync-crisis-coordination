'use client'

import { useCrisisStore } from '@/store/crisisStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Play, User } from 'lucide-react'

interface VolunteerPanelProps {
  volunteerId: string
  volunteerName: string
}

export function VolunteerPanel({
  volunteerId,
  volunteerName,
}: VolunteerPanelProps) {
  const tasks = useCrisisStore((state) => state.tasks)
  const updateTaskStatus = useCrisisStore(
    (state) => state.updateTaskStatus
  )
  const setVolunteerAvailability = useCrisisStore(
    (state) => state.setVolunteerAvailability
  )
  const volunteer = useCrisisStore((state) =>
    state.volunteers.find((v) => v.id === volunteerId)
  )

  const assignedTasks = tasks.filter(
    (t) => t.assignedVolunteerId === volunteerId
  )

  if (!volunteer) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <p className="text-red-400">Volunteer not found</p>
      </div>
    )
  }

  const handleStatusChange = (
    taskId: string,
    newStatus: 'in_progress' | 'completed'
  ) => {
    updateTaskStatus(taskId, newStatus)
  }

  const completedCount = assignedTasks.filter(t => t.status === 'completed').length

  return (
    <div className="space-y-6">
      {/* Volunteer Profile */}
      <div className="glass rounded-xl p-6 space-y-6">
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{volunteer.name}</h2>
              <p className="text-sm text-muted-foreground">Crisis Response Volunteer</p>
            </div>
          </div>
          <Badge
            className={
              volunteer.available
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }
          >
            {volunteer.available ? '● Available' : '● Unavailable'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Specializations</p>
            <div className="flex gap-2 flex-wrap">
              {volunteer.skills.map((skill) => (
                <Badge key={skill} className="bg-accent/20 text-accent border-0">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Performance</p>
            <div className="flex gap-3 items-end">
              <div>
                <p className="text-2xl font-bold text-foreground">{completedCount}</p>
                <p className="text-xs text-muted-foreground">Tasks Completed</p>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant={volunteer.available ? 'destructive' : 'default'}
          onClick={() =>
            setVolunteerAvailability(
              volunteerId,
              !volunteer.available
            )
          }
          className="w-full"
        >
          {volunteer.available ? 'Mark Unavailable' : 'Mark Available'}
        </Button>
      </div>

      {/* Assigned Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Clock className="w-5 h-5 text-accent" />
            Active Assignments ({assignedTasks.length})
          </h3>
        </div>

        {assignedTasks.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <p className="text-muted-foreground">No assigned tasks</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignedTasks.map((task) => {
              const statusColors = {
                pending: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                assigned: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                in_progress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                completed: 'bg-green-500/20 text-green-400 border-green-500/30',
              }
              return (
                <div
                  key={task.id}
                  className="glass rounded-lg p-4 space-y-4 slide-in-up"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-semibold text-foreground">
                        Task {task.id.slice(-6)}
                      </p>
                      <Badge
                        className={`${statusColors[task.status as keyof typeof statusColors]} border mt-2`}
                      >
                        {task.status}
                      </Badge>
                    </div>
                    <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>

                  <div className="flex gap-2">
                    {task.status === 'assigned' && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleStatusChange(task.id, 'in_progress')
                        }
                        className="flex-1 bg-gradient-to-r from-accent to-blue-500 hover:from-accent hover:to-blue-600 text-primary-foreground font-semibold"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}

                    {task.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleStatusChange(task.id, 'completed')
                        }
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    )}

                    {task.status === 'completed' && (
                      <Badge className="w-full justify-center bg-green-500/20 text-green-400 border border-green-500/30">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
