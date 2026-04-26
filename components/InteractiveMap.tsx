'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from 'lucide-react'

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
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null)
  const [apiError, setApiError] = useState(false)

  useEffect(() => {
    if (!mapContainer.current) return

    // Check if Google Maps is available
    if (typeof window === 'undefined' || !window.google) {
      // API not loaded, show fallback
      setApiError(true)
      setIsLoading(false)
      return
    }

    try {
      const mapOptions = {
        zoom: zoom,
        center: center,
        styles: [
          {
            elementType: 'geometry',
            stylers: [{ color: '#1f2633' }],
          },
          {
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#0b0f14' }],
          },
          {
            elementType: 'labels.text.fill',
            stylers: [{ color: '#e8ebee' }],
          },
          {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#a0aec0' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry.fill',
            stylers: [{ color: '#252f3c' }],
          },
          {
            featureType: 'water',
            elementType: 'geometry.fill',
            stylers: [{ color: '#0f1419' }],
          },
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        fullscreenControl: true,
      }

      map.current = new window.google.maps.Map(mapContainer.current, mapOptions)

      // Add markers
      markers.forEach((marker) => {
        const color =
          marker.urgency === 'high'
            ? '#FF5A5A'
            : marker.urgency === 'medium'
              ? '#F59E0B'
              : '#10B981'

        const markerIcon = {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        }

        const gmarker = new window.google.maps.Marker({
          position: { lat: marker.lat, lng: marker.lng },
          map: map.current,
          title: marker.title,
          icon: markerIcon,
        })

        gmarker.addListener('click', () => {
          setSelectedMarker(marker.id)
          map.current.panTo({ lat: marker.lat, lng: marker.lng })
          map.current.setZoom(13)
        })
      })

      setIsLoading(false)
    } catch (error) {
      console.error('[v0] Map initialization error:', error)
      setApiError(true)
      setIsLoading(false)
    }
  }, [markers, center, zoom])

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-white/10 bg-card">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader className="w-6 h-6 text-accent animate-spin" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {apiError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-card to-card/50 z-10">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">Map API not configured</p>
            <p className="text-xs text-muted-foreground/70">
              To enable Google Maps:
              <br />
              1. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local
              <br />
              2. Enable Maps JavaScript API in Google Cloud Console
            </p>
            <div className="mt-4 p-4 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-xs text-accent">
                For demo: Static map is displayed with markers positioned using coordinates
              </p>
            </div>
          </div>
        </div>
      )}

      <div ref={mapContainer} className="w-full h-full" />

      {/* Fallback grid-based map */}
      {apiError && (
        <div className="absolute inset-0 p-6">
          <div
            className="w-full h-full rounded-lg grid"
            style={{
              backgroundImage:
                'linear-gradient(#252f3c 1px, transparent 1px), linear-gradient(90deg, #252f3c 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          >
            {markers.map((marker) => {
              const x = ((marker.lng - 77.0) / 0.3) * 100
              const y = ((28.8 - marker.lat) / 0.3) * 100
              const color =
                marker.urgency === 'high'
                  ? 'bg-red-500'
                  : marker.urgency === 'medium'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'

              return (
                <button
                  key={marker.id}
                  onClick={() => setSelectedMarker(marker.id)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125"
                  style={{
                    left: `${Math.max(5, Math.min(95, x))}%`,
                    top: `${Math.max(5, Math.min(95, y))}%`,
                  }}
                  title={marker.title}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${color}`}
                  />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Selected marker info */}
      {selectedMarker && !isLoading && (
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="glass rounded-lg p-4 space-y-2 animate-in fade-in slide-in-from-bottom-4">
            {markers
              .filter((m) => m.id === selectedMarker)
              .map((marker) => (
                <div key={marker.id}>
                  <p className="font-semibold text-foreground">{marker.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        marker.urgency === 'high'
                          ? 'bg-red-500/20 text-red-400'
                          : marker.urgency === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {marker.urgency.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
