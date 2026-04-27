'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useCrisisStore } from '@/store/crisisStore'

export function AudioEngine() {
  const audioMode = useCrisisStore((state) => state.settings.audioMode)
  const activities = useCrisisStore((state) => state.activities)
  const tasks = useCrisisStore((state) => state.tasks)
  const notifications = useCrisisStore((state) => state.notifications)
  
  const lastAudioTrigger = useCrisisStore((state) => state.lastAudioTrigger)
  
  const lastActivityId = useRef<string | null>(null)
  const lastNotificationId = useRef<string | null>(null)
  const lastTriggerTimestamp = useRef<number>(0)
  const processingAudio = useRef<any>(null)
  const lastAlertTime = useRef<number>(0)
  const isUnlocked = useRef(false)

  const playSound = useCallback((type: 'critical' | 'processing' | 'success' | 'ping' | 'deploy', volume = 0.25) => {
    if (audioMode === 'off') return
    if (audioMode === 'minimal' && type !== 'critical') return

    try {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      const now = ctx.currentTime
      
      if (type === 'ping') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(1200, now)
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1)
        gain.gain.setValueAtTime(volume * 0.5, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
        osc.start(now)
        osc.stop(now + 0.1)
      } else if (type === 'deploy') {
        osc.type = 'square'
        osc.frequency.setValueAtTime(200, now)
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.3)
        gain.gain.setValueAtTime(volume * 0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
        osc.start(now)
        osc.stop(now + 0.3)
      } else if (type === 'success') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(523.25, now)
        osc.frequency.setValueAtTime(659.25, now + 0.1)
        gain.gain.setValueAtTime(volume * 0.4, now)
        gain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.2)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
        osc.start(now)
        osc.stop(now + 0.3)
      } else if (type === 'critical') {
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(440, now)
        osc.frequency.linearRampToValueAtTime(880, now + 0.1)
        osc.frequency.linearRampToValueAtTime(440, now + 0.2)
        gain.gain.setValueAtTime(volume * 0.6, now)
        gain.gain.linearRampToValueAtTime(0.01, now + 0.5)
        osc.start(now)
        osc.stop(now + 0.5)
      } else if (type === 'processing') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(60, now)
        osc.frequency.linearRampToValueAtTime(80, now + 2)
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(volume * 0.2, now + 0.5)
        osc.start(now)
        return ctx
      }
      
      if (type !== 'processing') {
        setTimeout(() => ctx.close(), 1000)
      }
    } catch (err: any) {
      // Web Audio API errors are non-critical — log but don't crash
      if (err?.name !== 'NotAllowedError') {
        console.warn('[AudioEngine] Synthesis warning:', err?.message || err)
      }
    }
  }, [audioMode])

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (!isUnlocked.current) {
        playSound('ping', 0)
        isUnlocked.current = true
      }

      const target = e.target as HTMLElement
      if (target.closest('button')) {
        playSound('ping', 0.1)
      }
    }

    if (lastAudioTrigger && lastAudioTrigger.timestamp !== lastTriggerTimestamp.current) {
      lastTriggerTimestamp.current = lastAudioTrigger.timestamp
      playSound(lastAudioTrigger.type as any, 0.25)
    }

    window.addEventListener('click', handleGlobalClick)
    return () => window.removeEventListener('click', handleGlobalClick)
  }, [audioMode, lastAudioTrigger, playSound])

  useEffect(() => {
    if (activities.length > 0) {
      const latest = activities[0]
      if (latest.id !== lastActivityId.current) {
        lastActivityId.current = latest.id
        if (latest.type === 'incident') {
          playSound('ping', 0.3)
        } else if (latest.type === 'assignment') {
          playSound('deploy', 0.3)
        } else if (audioMode === 'full') {
          playSound('ping', 0.15)
        }
      }
    }
  }, [activities, audioMode, playSound])

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0]
      if (latest.id !== lastNotificationId.current) {
        lastNotificationId.current = latest.id
        const now = Date.now()
        if (latest.message.toLowerCase().includes('critical') || latest.message.toLowerCase().includes('emergency') || latest.message.toLowerCase().includes('priority')) {
          if (now - lastAlertTime.current > 15000) {
            playSound('critical', 0.4)
            lastAlertTime.current = now
          }
        } else if (latest.type === 'assignment' || latest.type === 'completion') {
          playSound('success', 0.2)
        }
      }
    }
  }, [notifications, audioMode, playSound])

  useEffect(() => {
    const isProcessing = tasks.some(t => t.status === 'detected')
    
    if (isProcessing && audioMode === 'full') {
      if (!processingAudio.current) {
        processingAudio.current = playSound('processing', 0.2)
      }
    } else {
      if (processingAudio.current) {
        processingAudio.current.close().catch(() => {})
        processingAudio.current = null
      }
    }
    
    return () => {
      if (processingAudio.current) {
        processingAudio.current.close().catch(() => {})
      }
    }
  }, [tasks, audioMode, playSound])

  return null
}
