'use client'

import { useState } from 'react'

interface MapMarker {
  id: string
  lat: number
  lng: number
  title: string
  urgency: 'high' | 'medium' | 'low'
}

interface InteractiveMapProps {
  markers?: MapMarker[]
  center?: { lat: number; lng: number }
  zoom?: number
}

export function InteractiveMap({
  markers = [
    { id: '1', lat: 28.6139, lng: 77.209, title: 'Medical Emergency', urgency: 'high' },
    { id: '2', lat: 28.5355, lng: 77.391, title: 'Food Relief', urgency: 'medium' },
    { id: '3', lat: 28.7041, lng: 77.1025, title: 'Shelter Request', urgency: 'low' },
  ],
  center = { lat: 28.6139, lng: 77.209 },
  zoom = 11,
}: InteractiveMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null)

  // Calculate relative positions for markers on the grid
  const getMarkerPosition = (marker: MapMarker) => {
    const x = ((marker.lng - 76.9) / 0.4) * 100
    const y = ((28.8 - marker.lat) / 0.3) * 100
    return {
      left: Math.max(5, Math.min(95, x)),
      top: Math.max(5, Math.min(95, y)),
    }
  }

  const getMarkerColor = (urgency: 'high' | 'medium' | 'low') => {
    switch (urgency) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
    }
  }

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-white/10 glass">
      {/* Grid background */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#252f3c"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Markers */}
      {markers.map((marker) => {
        const pos = getMarkerPosition(marker)
        const isSelected = selectedMarker === marker.id
        const color = getMarkerColor(marker.urgency)

        return (
          <button
            key={marker.id}
            onClick={() => setSelectedMarker(isSelected ? null : marker.id)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-150 z-10 group"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
            }}
            title={marker.title}
          >
            {/* Pulse ring for high urgency */}
            {marker.urgency === 'high' && (
              <div className="absolute inset-0 w-4 h-4 rounded-full bg-red-500/30 animate-pulse" />
            )}
            {/* Marker dot */}
            <div
              className={`relative w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all ${
                marker.urgency === 'high'
                  ? 'bg-red-500'
                  : marker.urgency === 'medium'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              } ${isSelected ? 'ring-2 ring-accent ring-offset-2' : ''}`}
            />
          </button>
        )
      })}

      {/* Selected marker info popup */}
      {selectedMarker && (
        <div className="absolute bottom-4 left-4 right-4 z-20 animate-in fade-in slide-in-from-bottom-2">
          <div className="glass rounded-lg p-4 space-y-2 border border-white/20">
            {markers
              .filter((m) => m.id === selectedMarker)
              .map((marker) => (
                <div key={marker.id}>
                  <p className="font-semibold text-foreground text-sm">
                    {marker.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    📍 {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${getMarkerColor(
                        marker.urgency
                      )}`}
                    >
                      {marker.urgency.toUpperCase()} PRIORITY
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 right-4 z-20 glass rounded-lg p-3 border border-white/20">
        <p className="text-xs text-muted-foreground mb-2 font-semibold">
          Priority Levels
        </p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-muted-foreground">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Low</span>
          </div>
        </div>
      </div>
    </div>
  )
}
