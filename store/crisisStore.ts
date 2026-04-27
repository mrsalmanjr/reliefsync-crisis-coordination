import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  Report,
  ParsedReport,
  Task,
  Volunteer,
  Notification,
  Insight,
} from '@/types'
import { parseReport } from '@/core/ai/parser'
import { calculateUrgency } from '@/core/scoring/urgency'
import { matchVolunteers } from '@/core/matching/algorithm'
import { supabase } from '@/lib/supabaseClient'

export interface Activity {
  id: string
  message: string
  timestamp: Date
  type: 'incident' | 'assignment' | 'system' | 'completion'
}

export interface SystemAlert {
  id: string
  title: string
  message: string
  type: 'critical' | 'warning' | 'info'
  location: string
  suggestedAction: string
  timestamp: Date
}

export interface AppSettings {
  systemMode: 'demo' | 'live'
  notificationsEnabled: boolean
  aiMode: 'smart' | 'rules'
  mapMode: 'real' | 'simulated'
  audioMode: 'off' | 'minimal' | 'full'
}

export interface CrisisStore {
  // State
  reports: Report[]
  parsedReports: ParsedReport[]
  tasks: Task[]
  volunteers: Volunteer[]
  notifications: Notification[]
  activities: Activity[]
  insights: Insight[]
  isCommandMode: boolean
  activeTab: string
  settings: AppSettings
  lastAudioTrigger: { type: string; timestamp: number } | null

  // Navigation
  setActiveTab: (tab: string) => void

  // Report operations
  submitReport: (text: string) => void
  submitParsedReport: (report: Report, parsedReport: ParsedReport) => void
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

  // Notification & Activity operations
  addNotification: (
    message: string,
    type: Notification['type']
  ) => void
  markNotificationAsRead: (notificationId: string) => void
  addActivity: (message: string, type: Activity['type']) => void
  addInsight: (insight: Omit<Insight, 'id' | 'timestamp'>) => void
  
  // Health
  checkSystemHealth: () => void

  // UI Actions
  initialReportDraft: { location: string; lat?: number; lng?: number } | null
  setInitialReportDraft: (draft: { location: string; lat?: number; lng?: number } | null) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  toggleCommandMode: () => void
  resetSystem: () => void
  triggerAudio: (type: 'critical' | 'processing' | 'success' | 'ping' | 'deploy') => void

  // Supabase Sync
  initializeSupabase: () => void
}

const DEFAULT_VOLUNTEERS: Volunteer[] = [
  { id: 'v1', name: 'Alpha Response Unit', skills: ['medical', 'emergency'], lat: 12.95, lng: 77.6, available: true },
  { id: 'v2', name: 'Bravo Engineering', skills: ['infrastructure', 'rescue'], lat: 12.98, lng: 77.55, available: true },
  { id: 'v3', name: 'Charlie Logistics', skills: ['supply', 'transport'], lat: 12.92, lng: 77.62, available: true },
  { id: 'v4', name: 'Delta Medical', skills: ['triage', 'paramedic'], lat: 13.0, lng: 77.5, available: true },
  { id: 'v5', name: 'Echo Support', skills: ['communication', 'scouting'], lat: 12.93, lng: 77.58, available: false },
]

const DEFAULT_SETTINGS: AppSettings = {
  systemMode: 'demo',
  notificationsEnabled: true,
  aiMode: 'smart',
  mapMode: 'real',
  audioMode: 'minimal',
}

export const useCrisisStore = create<CrisisStore>()(
  persist(
    (set, get) => ({
      tasks: [
        { id: 'task-d1', reportId: 'r1', status: 'assigned', assignedVolunteerId: 'v1', matchedVolunteers: [], createdAt: new Date(Date.now() - 1200000), updatedAt: new Date() },
        { id: 'task-d2', reportId: 'r2', status: 'analyzed', matchedVolunteers: [], createdAt: new Date(Date.now() - 600000), updatedAt: new Date() },
        { id: 'task-d3', reportId: 'r3', status: 'detected', matchedVolunteers: [], createdAt: new Date(Date.now() - 300000), updatedAt: new Date() },
      ],
      parsedReports: [
        { id: 'p1', reportId: 'r1', type: ['Medical Emergency'], location: 'North Sector Hub', lat: 12.98, lng: 77.62, urgency: { level: 'high', reason: 'Multiple casualties reported' }, people: 12, action: 'Deploy emergency medical units and paramedics.', confidence: 98 },
        { id: 'p2', reportId: 'r2', type: ['Infrastructure Damage'], location: 'Industrial District', lat: 12.94, lng: 77.58, urgency: { level: 'medium', reason: 'Structural stability compromised' }, people: 0, action: 'Engineers required for site assessment and stabilization.', confidence: 92 },
        { id: 'p3', reportId: 'r3', type: ['Supply Chain Disruption'], location: 'Downtown Transit', lat: 12.96, lng: 77.54, urgency: { level: 'high', reason: 'Critical supply route blocked' }, people: 250, action: 'Redirect logistics and clear transport corridor.', confidence: 89 },
      ],
      reports: [
        { id: 'r1', rawText: '12 casualties at North Sector Hub. Need ambulances.', createdAt: new Date(Date.now() - 1200000), processed: true },
        { id: 'r2', rawText: 'Structural cracks in Industrial District factory.', createdAt: new Date(Date.now() - 600000), processed: true },
        { id: 'r3', rawText: 'Transit line blocked in Downtown. Supplies not moving.', createdAt: new Date(Date.now() - 300000), processed: false },
      ],
      volunteers: DEFAULT_VOLUNTEERS,
      notifications: [],
      activities: [
        { id: 'a1', message: 'ReliefSync Tactical AI online', type: 'system', timestamp: new Date() },
        { id: 'a2', message: 'Global intelligence sync complete', type: 'system', timestamp: new Date() },
        { id: 'a3', message: 'Ready for emergency deployment', type: 'system', timestamp: new Date() },
      ],
      insights: [
        {
          id: 'i1',
          title: 'Potential Flash Flood Escalation',
          description: 'Multiple reports indicating rising water levels in Zone A.',
          riskLevel: 'high',
          location: 'Zone A',
          prepAction: 'Deploy water rescue units and sandbags.',
          confidence: 92,
          timestamp: new Date(),
        }
      ],
      isCommandMode: false,
      activeTab: 'dashboard',
      initialReportDraft: null,
      settings: DEFAULT_SETTINGS,
      lastAudioTrigger: null,

      triggerAudio: (type) => set({ lastAudioTrigger: { type, timestamp: Date.now() } }),

      setInitialReportDraft: (draft) => set({ initialReportDraft: draft }),
      setActiveTab: (tab: string) => set({ activeTab: tab }),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      checkSystemHealth: () => {
        const { tasks, parsedReports } = get()
        const now = new Date().getTime()

        // 1. Check for high priority clusters
        const highPriorityLocations = parsedReports
          .filter(p => p.urgency.level === 'high')
          .map(p => p.location)
        
        const counts = highPriorityLocations.reduce((acc, loc) => {
          acc[loc] = (acc[loc] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        Object.entries(counts).forEach(([loc, count]) => {
          if (count >= 2) {
            get().addActivity(`CRITICAL: Cluster of ${count} incidents in ${loc}`, 'system')
          }
        })

        // 2. Check for delayed responses
        tasks.forEach(task => {
          const waitTime = now - task.updatedAt.getTime()
          if (task.status === 'analyzed' && waitTime > 300000) { // 5 mins
            get().addActivity(`WARNING: Response delay for mission ${task.id.slice(-4)}`, 'system')
          }
        })
      },

      toggleCommandMode: () => set((state) => ({ isCommandMode: !state.isCommandMode })),

      resetSystem: () => {
        set({
          reports: [],
          parsedReports: [],
          tasks: [],
          volunteers: DEFAULT_VOLUNTEERS,
          notifications: [],
          activities: [
            { id: 'a-reset', message: 'System reset initiated', type: 'system', timestamp: new Date() },
            { id: 'a-ready', message: 'Ready for fresh deployment', type: 'system', timestamp: new Date() },
          ],
          insights: [],
          initialReportDraft: null,
          settings: DEFAULT_SETTINGS,
        })
      },

      submitReport: async (text: string) => {
        const report: Report = {
          id: `report-${Date.now()}`,
          rawText: text,
          createdAt: new Date(),
          processed: false,
        }

        const locations: Record<string, { lat: number, lng: number }> = {
          bangalore: { lat: 12.9716, lng: 77.5946 },
          delhi: { lat: 28.7041, lng: 77.1025 },
          mumbai: { lat: 19.076, lng: 72.8777 },
          chennai: { lat: 13.0827, lng: 80.2707 },
          hyderabad: { lat: 17.3850, lng: 78.4867 },
          pune: { lat: 18.5204, lng: 73.8567 },
          kolkata: { lat: 22.5726, lng: 88.3639 },
        }
        
        const textLower = text.toLowerCase()
        const detectedLoc = Object.keys(locations).find(loc => textLower.includes(loc))
        const coords = detectedLoc ? locations[detectedLoc] : { lat: 12.97 + (Math.random() * 0.1 - 0.05), lng: 77.59 + (Math.random() * 0.1 - 0.05) }

        // Local state update
        set((state) => ({ reports: [...state.reports, report] }))

        const initialTask: Task = {
          id: `task-${Date.now()}`,
          reportId: report.id,
          parsedReportId: '', 
          status: 'detected',
          matchedVolunteers: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          ...({ lat: coords.lat, lng: coords.lng } as any)
        }

        set((state) => ({ tasks: [...state.tasks, initialTask] }))

        // Supabase Push
        try {
          await supabase.from('incidents').insert({
            id: initialTask.id,
            title: text.slice(0, 50),
            location: detectedLoc || 'Unknown',
            lat: coords.lat,
            lng: coords.lng,
            status: 'DETECTED',
            priority: 'medium',
            raw_text: text
          })
        } catch (e) {
          console.warn('Supabase push failed, staying in local mode.')
        }

        get().addNotification(`Tactical Intelligence: AI Analyzing multi-source inputs...`, 'assignment')
        get().addActivity(`AI detecting tactical patterns in mission ${report.id.slice(-4)}...`, 'system')

        setTimeout(() => {
          get().processReport(report.id)
        }, 1500)
      },
      
      submitParsedReport: async (report: Report, parsedReport: ParsedReport) => {
        if (!parsedReport.confidence) {
          parsedReport.confidence = Math.floor(Math.random() * (98 - 75 + 1)) + 75
        }
        
        const matchedVolunteers = matchVolunteers(get().volunteers, parsedReport)

        const task: Task = {
          id: `task-${Date.now()}`,
          reportId: report.id,
          parsedReportId: parsedReport.id,
          status: 'analyzed',
          matchedVolunteers,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => ({
          reports: [...state.reports, report],
          parsedReports: [...state.parsedReports, parsedReport],
          tasks: [...state.tasks, task],
        }))

        // Auto-Dispatch Logic for High Priority
        if (parsedReport.urgency.level === 'high') {
          const bestMatch = matchedVolunteers[0]
          if (bestMatch && bestMatch.volunteer.available) {
            setTimeout(() => {
              get().assignTask(task.id, bestMatch.volunteer.id)
              get().addActivity(`AUTO-DISPATCH: Assigned ${bestMatch.volunteer.name} to mission ${task.id.slice(-4)}`, 'assignment')
              get().addNotification(`Auto-dispatch complete: ${bestMatch.volunteer.name} is en route.`, 'assignment')
            }, 1000)
          }
        }

        // Supabase Update
        try {
          await supabase.from('incidents').upsert({
            id: task.id,
            status: task.status.toUpperCase(),
            priority: parsedReport.urgency.level,
            metadata: parsedReport
          })
        } catch (e) {}

        get().addNotification(`AI Classified & Prioritized: ${parsedReport.type.join(', ')} in ${parsedReport.location}`, 'assignment')
        get().addActivity(`Intelligence synchronized: Mission ${parsedReport.id.slice(-4)} verified in ${parsedReport.location}`, 'system')
      },

      processReport: async (reportId: string) => {
        const report = get().reports.find((r) => r.id === reportId)
        if (!report) return

        const { settings } = get()
        let parsedReport = parseReport(report.rawText, reportId)
        parsedReport.confidence = settings.aiMode === 'rules' ? 100 : Math.floor(Math.random() * (98 - 85 + 1)) + 85
        parsedReport.urgency = calculateUrgency(parsedReport)
        const matchedVolunteers = matchVolunteers(get().volunteers, parsedReport)

        set((state) => {
          const existingTask = state.tasks.find(t => t.reportId === reportId && t.status === 'detected')
          const update = { parsedReportId: parsedReport.id, status: 'analyzed' as const, matchedVolunteers, updatedAt: new Date() }
          
          if (existingTask) {
            return {
              parsedReports: [...state.parsedReports, parsedReport],
              tasks: state.tasks.map(t => t.id === existingTask.id ? { ...t, ...update } : t),
              reports: state.reports.map((r) => r.id === reportId ? { ...r, processed: true } : r),
            }
          }

          const newTask: Task = {
            id: `task-${Date.now()}`,
            reportId,
            ...update,
            createdAt: new Date(),
          }

          return {
            parsedReports: [...state.parsedReports, parsedReport],
            tasks: [...state.tasks, newTask],
            reports: state.reports.map((r) => r.id === reportId ? { ...r, processed: true } : r),
          }
        })

        // Supabase Update
        try {
          const taskId = get().tasks.find(t => t.reportId === reportId)?.id
          if (taskId) {
            await supabase.from('incidents').update({
              status: 'ANALYZED',
              priority: parsedReport.urgency.level
            }).eq('id', taskId)
          }
        } catch (e) {}

        get().addNotification(`New crisis: ${parsedReport.type.join(', ')} at ${parsedReport.location}`, 'assignment')
        get().addActivity(`AI Analysis complete for report ${reportId.slice(-4)}`, 'system')
      },

      assignTask: async (taskId: string, volunteerId: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, status: 'assigned', assignedVolunteerId: volunteerId, updatedAt: new Date() } : task
          ),
          volunteers: state.volunteers.map((v) => v.id === volunteerId ? { ...v, available: false } : v),
        }))

        // Supabase Push
        try {
          await supabase.from('assignments').insert({
            id: `assign-${Date.now()}`,
            incident_id: taskId,
            responder_id: volunteerId,
            status: 'ACTIVE',
            eta: '12 mins'
          })
          await supabase.from('incidents').update({ status: 'ASSIGNED' }).eq('id', taskId)
          await supabase.from('responders').update({ status: 'BUSY' }).eq('id', volunteerId)
        } catch (e) {}

        const task = get().tasks.find((t) => t.id === taskId)
        const volunteer = get().volunteers.find((v) => v.id === volunteerId)

        if (task && volunteer) {
          get().addNotification(`Task assigned to ${volunteer.name}`, 'assignment')
          get().addActivity(`${volunteer.name} deployed to Zone ${task.id.slice(-4).toUpperCase()}`, 'assignment')
        }
      },

      updateTaskStatus: async (taskId, status) => {
        const task = get().tasks.find((t) => t.id === taskId)
        
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, status, updatedAt: new Date() } : task
          ),
          volunteers: status === 'completed' && task?.assignedVolunteerId 
            ? state.volunteers.map(v => v.id === task.assignedVolunteerId ? { ...v, available: true } : v)
            : state.volunteers
        }))

        // Supabase Update
        try {
          await supabase.from('incidents').update({ 
            status: status === 'completed' ? 'RESOLVED' : status.toUpperCase() 
          }).eq('id', taskId)
          
          if (status === 'completed' && task?.assignedVolunteerId) {
            await supabase.from('responders').update({ status: 'AVAILABLE' }).eq('id', task.assignedVolunteerId)
          }
        } catch (e) {}

        const statusMessages = { 
          detected: 'Incident detected',
          analyzed: 'AI Analysis complete',
          assigned: 'Responder assigned', 
          in_progress: 'Mission in progress', 
          completed: 'Mission successfully completed' 
        }
        
        get().addNotification(statusMessages[status] || 'Status updated', 'update')
        
        if (status === 'completed') {
          get().addActivity(`Mission completed for task ${taskId.slice(-4)}`, 'completion')
        }
      },

      setVolunteerAvailability: (volunteerId, available) => {
        set((state) => ({
          volunteers: state.volunteers.map((v) => v.id === volunteerId ? { ...v, available } : v),
        }))
      },

      addNotification: (message, type) => {
        if (!get().settings.notificationsEnabled) return
        const notification: Notification = { id: `notif-${Date.now()}`, message, time: new Date(), read: false, type }
        set((state) => ({ notifications: [notification, ...state.notifications] }))
      },

      markNotificationAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map((n) => n.id === notificationId ? { ...n, read: true } : n),
        }))
      },

      addActivity: (message, type) => {
        const activity: Activity = { id: `act-${Date.now()}`, message, type, timestamp: new Date() }
        set((state) => ({ activities: [activity, ...state.activities].slice(0, 20) }))
      },

      addInsight: (insightData) => {
        const insight: Insight = { ...insightData, id: `insight-${Date.now()}`, timestamp: new Date() }
        set((state) => ({ insights: [insight, ...state.insights].slice(0, 5) }))
        get().addActivity(`New Predictive Insight: ${insight.title}`, 'system')
        get().addNotification(`Strategic Insight generated for ${insight.location}`, 'alert')
      },

      initializeSupabase: () => {
        if (!supabase || (get() as any)._supabaseInitialized) return
        (set as any)({ _supabaseInitialized: true })

        // 1. Initial Data Fetch
        supabase.from('incidents').select('*').then(({ data }) => {
          if (data) {
            // Mapping logic here if needed
          }
        })

        // 2. Realtime Subscriptions
        const channel = supabase
          .channel('incidents-channel')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, (payload) => {
            const { eventType, new: newRecord } = payload
            
            if (eventType === 'INSERT') {
              get().addActivity(`Remote incident detected: ${newRecord.location}`, 'incident')
              // In a real app, we would merge this into local state
            }
          })
          .subscribe()
      }
    }),
    {
      name: 'reliefsync-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        return (rehydratedState, error) => {
          if (error) {
            console.error('An error occurred during rehydration', error)
          } else if (rehydratedState) {
            const fixDates = (item: any) => {
              if (item.createdAt) item.createdAt = new Date(item.createdAt)
              if (item.updatedAt) item.updatedAt = new Date(item.updatedAt)
              if (item.timestamp) item.timestamp = new Date(item.timestamp)
              if (item.time) item.time = new Date(item.time)
              return item
            }
            rehydratedState.reports = rehydratedState.reports.map(fixDates)
            rehydratedState.parsedReports = rehydratedState.parsedReports.map(fixDates)
            rehydratedState.tasks = rehydratedState.tasks.map(fixDates)
            rehydratedState.notifications = rehydratedState.notifications.map(fixDates)
            rehydratedState.activities = rehydratedState.activities.map(fixDates)
            rehydratedState.insights = rehydratedState.insights.map(fixDates)
          }
        }
      },
    }
  )
)
