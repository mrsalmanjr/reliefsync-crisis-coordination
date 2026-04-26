'use client'

import { useCrisisStore } from '@/store/crisisStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, User, MapPin } from 'lucide-react'

export function AssignmentPanel() {
  const tasks = useCrisisStore((state) => state.tasks)
  const volunteers = useCrisisStore((state) => state.volunteers)
  const assignTask = useCrisisStore((state) => state.assignTask)

  const pendingTasks = tasks.filter((t) => t.status === 'pending')

  if (pendingTasks.length === 0) {
    return (
      <Card className="p-6 text-gray-500">
        No pending tasks. Submit a crisis report to start assignments.
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {pendingTasks.map((task) => {
        const report = tasks.find((t) => t.id === task.id)

        return (
          <Card key={task.id} className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">Task {task.id.slice(-6)}</h3>
                <p className="text-sm text-gray-600">
                  Status: <Badge variant="outline">{task.status}</Badge>
                </p>
              </div>
              <Clock className="w-5 h-5 text-orange-500" />
            </div>

            {/* Matched volunteers */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Suggested Volunteers
              </h4>

              {task.matchedVolunteers.length > 0 ? (
                <div className="space-y-2">
                  {task.matchedVolunteers.map((match) => {
                    const isAssigned =
                      task.assignedVolunteerId ===
                      match.volunteer.id

                    return (
                      <div
                        key={match.volunteer.id}
                        className="border rounded p-3 flex justify-between items-start gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">
                            {match.volunteer.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Skills: {match.volunteer.skills.join(', ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            Match Score: {match.matchScore}/100
                          </p>
                          <p className="text-sm text-gray-600">
                            {match.reason}
                          </p>
                        </div>

                        {isAssigned ? (
                          <Badge className="bg-green-100 text-green-800 whitespace-nowrap">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Assigned
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() =>
                              assignTask(task.id, match.volunteer.id)
                            }
                            className="whitespace-nowrap"
                          >
                            Assign
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No available volunteers matched
                </p>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
