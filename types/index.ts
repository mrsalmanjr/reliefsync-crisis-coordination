export interface Report {
  id: string
  rawText: string
  createdAt: Date
  processed: boolean
}

export interface ParsedReport {
  id: string
  reportId: string
  type: string[]
  people: number
  location: string
  keywords: string[]
  urgency: UrgencyScore
  createdAt: Date
}

export interface UrgencyScore {
  score: number
  level: 'low' | 'medium' | 'high'
}

export interface Task {
  id: string
  reportId: string
  parsedReportId: string
  status: 'pending' | 'assigned' | 'in_progress' | 'completed'
  assignedVolunteerId?: string
  matchedVolunteers: MatchedVolunteer[]
  createdAt: Date
  updatedAt: Date
}

export interface Volunteer {
  id: string
  name: string
  skills: string[]
  lat: number
  lng: number
  available: boolean
}

export interface MatchedVolunteer {
  volunteer: Volunteer
  distance: number
  matchScore: number
  reason: string
}

export interface Notification {
  id: string
  message: string
  time: Date
  read: boolean
  type: 'assignment' | 'update' | 'completion'
}
