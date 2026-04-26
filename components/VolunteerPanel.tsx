'use client'

import { useCrisisStore } from '@/store/crisisStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Play, AlertCircle } from 'lucide-react'

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
      <Card className="p-6 text-red-500">
        Volunteer not found
      </Card>
    )
  }

  const handleStatusChange = (
    taskId: string,
    newStatus: 'in_progress' | 'completed'
  ) => {
    updateTaskStatus(taskId, newStatus)
  }

  return (
    <div className="space-y-6">
      {/* Volunteer Info */}
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">{volunteer.name}</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <Badge
              className={
                volunteer.available
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }
            >
              {volunteer.available ? 'Available' : 'Unavailable'}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600">Skills</p>
            <div className="flex gap-1 flex-wrap">
              {volunteer.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
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
      </Card>

      {/* Assigned Tasks */}
      <Card className="p-6 space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Assigned Tasks
        </h3>

        {assignedTasks.length === 0 ? (
          <p className="text-gray-500">No assigned tasks</p>
        ) : (
          <div className="space-y-3">
            {assignedTasks.map((task) => (
              <div
                key={task.id}
                className="border rounded p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      Task {task.id.slice(-6)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status:{' '}
                      <Badge
                        variant="outline"
                        className={{
                          pending: 'bg-blue-50',
                          assigned: 'bg-yellow-50',
                          in_progress: 'bg-purple-50',
                          completed: 'bg-green-50',
                        }[task.status]}
                      >
                        {task.status}
                      </Badge>
                    </p>
                  </div>
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex gap-2">
                  {task.status === 'assigned' && (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleStatusChange(task.id, 'in_progress')
                      }
                      variant="outline"
                      className="flex-1"
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
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  )}

                  {task.status === 'completed' && (
                    <Badge className="w-full justify-center bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
