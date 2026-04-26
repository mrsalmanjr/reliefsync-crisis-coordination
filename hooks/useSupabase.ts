'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function useReports() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial fetch
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (!error && data) {
        setReports(data)
      }
      setLoading(false)
    }

    fetchReports()

    // Subscribe to realtime updates
    const subscription = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        (payload) => {
          console.log('[v0] Report update:', payload)
          if (payload.eventType === 'INSERT') {
            setReports((prev) => [payload.new as any, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setReports((prev) =>
              prev.map((r) => (r.id === payload.new.id ? payload.new : r))
            )
          } else if (payload.eventType === 'DELETE') {
            setReports((prev) => prev.filter((r) => r.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { reports, loading }
}

export function useVolunteers() {
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVolunteers = async () => {
      const { data, error } = await supabase
        .from('volunteers')
        .select('*')
        .eq('availability', true)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setVolunteers(data)
      }
      setLoading(false)
    }

    fetchVolunteers()

    const subscription = supabase
      .channel('volunteers-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'volunteers' },
        (payload) => {
          console.log('[v0] Volunteer update:', payload)
          if (payload.eventType === 'INSERT') {
            setVolunteers((prev) => [payload.new as any, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setVolunteers((prev) =>
              prev.map((v) => (v.id === payload.new.id ? payload.new : v))
            )
          } else if (payload.eventType === 'DELETE') {
            setVolunteers((prev) => prev.filter((v) => v.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { volunteers, loading }
}

export function useAssignments() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssignments = async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('assigned_at', { ascending: false })

      if (!error && data) {
        setAssignments(data)
      }
      setLoading(false)
    }

    fetchAssignments()

    const subscription = supabase
      .channel('assignments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assignments' },
        (payload) => {
          console.log('[v0] Assignment update:', payload)
          if (payload.eventType === 'INSERT') {
            setAssignments((prev) => [payload.new as any, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setAssignments((prev) =>
              prev.map((a) => (a.id === payload.new.id ? payload.new : a))
            )
          } else if (payload.eventType === 'DELETE') {
            setAssignments((prev) => prev.filter((a) => a.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { assignments, loading }
}
