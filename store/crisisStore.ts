import { create } from 'zustand'
import {
  Report,
  ParsedReport,
  Task,
  Volunteer,
  Notification,
} from '@/types'
import { parseReport } from '@/core/ai/parser'
import { calculateUrgency } from '@/core/scoring/urgency'
import { matchVolunteers } from '@/core/matching/algorithm'

interface CrisisStore {
  // State
  reports: Report[]
  parsedReports: ParsedReport[]
  tasks: Task[]
  volunteers: Volunteer[]
  notifications: Notification[]

  // Report operations
  submitReport: (text: string) => void
  processReport: (reportId: string) => void

  // Task operations
  assignTask: (taskId: string, volunteerId: string) => void
  updateTaskStatus: (
    taskId: string,
    status: Task['status']
  ) => void

  // Volunteer operations
  setVolunteerAvailability: (
    volunteerId: string,
    available: boolean
  ) => void

  // Notification operations
  addNotification: (
    message: string,
    type: Notification['type']
  ) => void
  markNotificationAsRead: (notificationId: string) => void
}

const DEFAULT_VOLUNTEERS: Volunteer[] = [
  {
    id: 'v1',
    name: 'Sarah Johnson',
    skills: ['medical', 'nurse'],
    lat: 12.95,
    lng: 77.6,
    available: true,
  },
  {
    id: 'v2',
    name: 'Raj Kumar',
    skills: ['construction', 'shelter'],
    lat: 12.98,
    lng: 77.55,
    available: true,
  },
  {
    id: 'v3',
    name: 'Priya Singh',
    skills: ['food', 'cooking', 'nutrition'],
    lat: 12.92,
    lng: 77.62,
    available: true,
  },
  {
    id: 'v4',
    name: 'Michael Chen',
    skills: ['logistics', 'coordination'],
    lat: 13.0,
    lng: 77.5,
    available: true,
  },
  {
    id: 'v5',
    name: 'Emma Wilson',
    skills: ['medical', 'paramedic'],
    lat: 12.93,
    lng: 77.58,
    available: false,
  },
]

export const useCrisisStore = create<CrisisStore>((set, get) => ({
  reports: [],
  parsedReports: [],
  tasks: [],
  volunteers: DEFAULT_VOLUNTEERS,
  notifications: [],

  submitReport: (text: string) => {
    const report: Report = {
      id: `report-${Date.now()}`,
      rawText: text,
      createdAt: new Date(),
      processed: false,
    }

    set((state) => ({
      reports: [...state.reports, report],
    }))

    // Auto-process the report
    setTimeout(() => {
      get().processReport(report.id)
    }, 100)
  },

  processReport: (reportId: string) => {
    const report = get().reports.find((r) => r.id === reportId)
    if (!report) return

    // Parse the report
    const parsedReport = parseReport(report.rawText, reportId)

    // Calculate urgency
    const urgencyScore = calculateUrgency(parsedReport)
    parsedReport.urgency = urgencyScore

    // Get matched volunteers
    const matchedVolunteers = matchVolunteers(
      get().volunteers,
      parsedReport
    )

    // Create task
    const task: Task = {
      id: `task-${Date.now()}`,
      reportId,
      parsedReportId: parsedReport.id,
      status: 'pending',
      matchedVolunteers,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    set((state) => ({
      parsedReports: [...state.parsedReports, parsedReport],
      tasks: [...state.tasks, task],
      reports: state.reports.map((r) =>
        r.id === reportId ? { ...r, processed: true } : r
      ),
    }))

    // Add notification
    get().addNotification(
      `New crisis: ${parsedReport.type.join(', ')} at ${parsedReport.location}`,
      'assignment'
    )
  },

  assignTask: (taskId: string, volunteerId: string) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: 'assigned',
              assignedVolunteerId: volunteerId,
              updatedAt: new Date(),
            }
          : task
      ),
    }))

    const task = get().tasks.find((t) => t.id === taskId)
    const volunteer = get().volunteers.find((v) => v.id === volunteerId)

    if (task && volunteer) {
      get().addNotification(
        `Task assigned to ${volunteer.name}`,
        'assignment'
      )
    }
  },

  updateTaskStatus: (taskId: string, status: Task['status']) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, status, updatedAt: new Date() }
          : task
      ),
    }))

    const statusMessages = {
      pending: 'Task pending',
      assigned: 'Task assigned',
      in_progress: 'Task in progress',
      completed: 'Task completed',
    }

    get().addNotification(
      statusMessages[status],
      'update'
    )
  },

  setVolunteerAvailability: (volunteerId: string, available: boolean) => {
    set((state) => ({
      volunteers: state.volunteers.map((v) =>
        v.id === volunteerId ? { ...v, available } : v
      ),
    }))
  },

  addNotification: (message: string, type: Notification['type']) => {
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      message,
      time: new Date(),
      read: false,
      type,
    }

    set((state) => ({
      notifications: [notification, ...state.notifications],
    }))
  },

  markNotificationAsRead: (notificationId: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    }))
  },
}))
