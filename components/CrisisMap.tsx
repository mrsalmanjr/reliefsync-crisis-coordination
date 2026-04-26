'use client'

import { useState } from 'react'
import { useCrisisStore } from '@/store/crisisStore'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface MapMarker {
  id: string
  lat: number
  lng: number
  type: string
  urgency: 'low' | 'medium' | 'high'
  title: string
}

export function CrisisMap() {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null)
  const parsedReports = useCrisisStore((state) => state.parsedReports)
  const tasks = useCrisisStore((state) => state.tasks)

  // Simplified location to coordinates
  const locationCoords: Record<string, { lat: number; lng: number }> = {
    bangalore: { lat: 12.9716, lng: 77.5946 },
    delhi: { lat: 28.7041, lng: 77.1025 },
    mumbai: { lat: 19.076, lng: 72.8777 },
    default: { lat: 13.0, lng: 77.0 },
  }

  const markers: MapMarker[] = parsedReports.map((report, idx) => {
    const locKey = report.location.toLowerCase()
    const coords =
      Object.entries(locationCoords).find(([k]) =>
        locKey.includes(k)
      )?.[1] || locationCoords.default

    return {
      id: report.id,
      lat: coords.lat + (idx * 0.05 - (parsedReports.length * 0.025)),
      lng: coords.lng + (idx * 0.03 - (parsedReports.length * 0.015)),
      type: report.type[0] || 'unknown',
      urgency: report.urgency.level,
      title: `${report.type.join('/')} - ${report.people} people`,
    }
  })

  const gridSize = 100
  const cellSize = gridSize / 10

  const urgencyColors = {
    low: '#3b82f6',
    medium: '#eab308',
    high: '#ef4444',
  }

  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-center pb-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-bold">Heat Map</h2>
          <p className="text-xs text-muted-foreground mt-1">Real-time crisis zones</p>
        </div>
        <div className="glass rounded-lg px-3 py-2">
          <p className="text-xs text-muted-foreground">Active Zones</p>
          <p className="text-xl font-bold text-accent">{markers.length}</p>
        </div>
      </div>

      {/* Map Container */}
      <div
        className="rounded-lg relative overflow-hidden backdrop-blur-sm border border-white/10"
        style={{
          width: '100%',
          height: '400px',
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(20, 30, 48, 0.8) 0%, rgba(25, 35, 60, 0.8) 100%)',
        }}
      >
        {/* Grid background */}
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {Array.from({ length: 11 }).map((_, i) => (
            <g key={`grid-${i}`}>
              <line
                x1={`${i * 10}%`}
                y1="0"
                x2={`${i * 10}%`}
                y2="100%"
                stroke="rgba(79, 157, 255, 0.1)"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1={`${i * 10}%`}
                x2="100%"
                y2={`${i * 10}%`}
                stroke="rgba(79, 157, 255, 0.1)"
                strokeWidth="1"
              />
            </g>
          ))}
        </svg>

        {/* Markers with pulse effect */}
        <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
          {markers.map((marker) => {
            const x = ((marker.lng - 77) / 1) * 50 + 50
            const y = ((13 - marker.lat) / 1) * 50 + 50
            const isSelected = selectedMarker === marker.id

            return (
              <button
                key={marker.id}
                onClick={() =>
                  setSelectedMarker(
                    selectedMarker === marker.id ? null : marker.id
                  )
                }
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-150"
                style={{
                  left: `${Math.max(5, Math.min(95, x))}%`,
                  top: `${Math.max(5, Math.min(95, y))}%`,
                }}
                title={marker.title}
              >
                {marker.urgency === 'high' && (
                  <div
                    className="absolute inset-0 rounded-full animate-pulse"
                    style={{
                      backgroundColor: urgencyColors[marker.urgency],
                      opacity: 0.5,
                      width: '24px',
                      height: '24px',
                      marginLeft: '-12px',
                      marginTop: '-12px',
                    }}
                  />
                )}
                <div
                  className={`w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all ${
                    isSelected ? 'ring-2 ring-accent ring-offset-2' : ''
                  }`}
                  style={{
                    backgroundColor: urgencyColors[marker.urgency],
                  }}
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend and Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div className="glass rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-foreground">Zone Priority</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 pulse-soft" />
              <span className="text-muted-foreground">High Priority</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: urgencyColors.medium }} />
              <span className="text-muted-foreground">Medium Priority</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: urgencyColors.low }} />
              <span className="text-muted-foreground">Low Priority</span>
            </div>
          </div>
        </div>

        {selectedMarker ? (
          <div className="glass rounded-lg p-4 space-y-3 slide-in-up">
            <h4 className="font-semibold text-foreground">Zone Details</h4>
            {markers.map((m) => {
              if (m.id !== selectedMarker) return null
              const statusColor = {
                high: 'bg-red-500/20 text-red-400 border-red-500/30',
                medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
              }[m.urgency]
              return (
                <div key={m.id} className="text-sm space-y-2">
                  <p className="font-semibold text-foreground">{m.title}</p>
                  <Badge
                    className={`${statusColor} border`}
                  >
                    {m.urgency.toUpperCase()}
                  </Badge>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="glass rounded-lg p-4 flex items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">Click a zone for details</p>
          </div>
        )}
      </div>
    </div>
  )
}
