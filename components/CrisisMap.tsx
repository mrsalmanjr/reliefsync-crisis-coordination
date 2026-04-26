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
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Crisis Map</h2>
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{markers.length}</span> Crisis
          Points
        </div>
      </div>

      {/* Simulated map grid */}
      <div
        className="bg-gray-100 rounded relative overflow-hidden"
        style={{
          width: '100%',
          height: '400px',
          position: 'relative',
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
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1={`${i * 10}%`}
                x2="100%"
                y2={`${i * 10}%`}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            </g>
          ))}
        </svg>

        {/* Markers */}
        <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
          {markers.map((marker) => {
            const x = ((marker.lng - 77) / 1) * 50 + 50
            const y = ((13 - marker.lat) / 1) * 50 + 50

            return (
              <button
                key={marker.id}
                onClick={() =>
                  setSelectedMarker(
                    selectedMarker === marker.id ? null : marker.id
                  )
                }
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125"
                style={{
                  left: `${Math.max(5, Math.min(95, x))}%`,
                  top: `${Math.max(5, Math.min(95, y))}%`,
                }}
                title={marker.title}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                  style={{
                    backgroundColor: urgencyColors[marker.urgency],
                  }}
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend and details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-semibold">Legend</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: urgencyColors.high }}
              />
              <span>High Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: urgencyColors.medium }}
              />
              <span>Medium Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: urgencyColors.low }}
              />
              <span>Low Priority</span>
            </div>
          </div>
        </div>

        {selectedMarker && (
          <div className="space-y-2">
            <h4 className="font-semibold">Details</h4>
            {markers.map((m) => {
              if (m.id !== selectedMarker) return null
              return (
                <div key={m.id} className="text-sm space-y-1">
                  <p className="font-semibold">{m.title}</p>
                  <Badge
                    className={{
                      high: 'bg-red-100 text-red-800',
                      medium: 'bg-yellow-100 text-yellow-800',
                      low: 'bg-blue-100 text-blue-800',
                    }[m.urgency]}
                  >
                    {m.urgency.toUpperCase()}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
