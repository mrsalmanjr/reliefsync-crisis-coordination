'use client'

import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api'
import { useJsApiLoader } from '@react-google-maps/api'
import { useState } from 'react'
import { motion } from 'framer-motion'

const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#242f3e' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#242f3e' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [{ color: '#4f6156' }],
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#27412b' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
]

interface MarkerData {
  id: string
  lat: number
  lng: number
  title: string
  priority: 'high' | 'medium' | 'low'
  description: string
}

interface GoogleMapViewProps {
  markers: MarkerData[]
  center?: { lat: number; lng: number }
  onMarkerClick?: (marker: MarkerData) => void
}

export function GoogleMapView({
  markers,
  center = { lat: 28.6139, lng: 77.209 },
  onMarkerClick,
}: GoogleMapViewProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null)

  const getMarkerColor = (priority: string) => {
    const colors = {
      high: '#FF5A5A',
      medium: '#F59E0B',
      low: '#4F9DFF',
    }
    return colors[priority as keyof typeof colors] || colors.low
  }

  if (!isLoaded) {
    return (
      <div className="glass rounded-xl p-8 flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl overflow-hidden h-96">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={12}
        options={{
          styles: darkMapStyle,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
        }}
      >
        {markers.map((marker) => (
          <motion.div
            key={marker.id}
            whileHover={{ scale: 1.1 }}
            className="cursor-pointer"
          >
            <Marker
              position={{ lat: marker.lat, lng: marker.lng }}
              onClick={() => {
                setSelectedMarker(marker)
                onMarkerClick?.(marker)
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: marker.priority === 'high' ? 12 : 8,
                fillColor: getMarkerColor(marker.priority),
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2,
              }}
            />
          </motion.div>
        ))}

        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-2 text-sm text-black bg-white rounded"
            >
              <p className="font-semibold">{selectedMarker.title}</p>
              <p className="text-xs text-gray-600">{selectedMarker.description}</p>
              <p className="text-xs font-medium mt-1 text-red-600">
                Priority: {selectedMarker.priority.toUpperCase()}
              </p>
            </motion.div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}
