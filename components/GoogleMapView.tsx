'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { GoogleMap, Marker, InfoWindow, useJsApiLoader, Polyline } from '@react-google-maps/api'
import { ParsedReport, Volunteer, Task } from '@/types'
import { useCrisisStore } from '@/store/crisisStore'

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
]

interface GoogleMapViewProps {
  tasks: Task[]
  parsedReports: ParsedReport[]
  volunteers: Volunteer[]
  onMarkerClick?: (reportId: string) => void
  selectedTaskId?: string | null
}

function MockTacticalGrid({ tasks, parsedReports, volunteers, onMarkerClick, activeTaskId, setInternalSelectedId, setSelectedVolunteerId }: any) {
  const [selectedPos, setSelectedPos] = useState<{ x: number, y: number, lat: number, lng: number } | null>(null)
  const setInitialReportDraft = useCrisisStore((state) => state.setInitialReportDraft)
  const setActiveTab = useCrisisStore((state) => state.setActiveTab)

  // Map lat/lng to grid %
  const toGrid = (lat: number, lng: number) => {
    const x = ((lng - 77.4) / (77.8 - 77.4)) * 100
    const y = 100 - ((lat - 12.8) / (13.1 - 12.8)) * 100
    return { x, y }
  }

  const gridTasks = tasks.map((t: any) => {
    const report = parsedReports.find((p: any) => p.id === t.parsedReportId)
    const coords = t.coords || (report ? { lat: report.lat || 12.97, lng: report.lng || 77.59 } : { lat: 12.97, lng: 77.59 })
    return { ...t, report, ...toGrid(coords.lat, coords.lng), coords }
  })

  const gridVolunteers = volunteers.map((v: any) => ({ ...v, ...toGrid(v.lat, v.lng) }))

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'detected': return '#EF4444'
      case 'analyzed': return '#7C3AED'
      case 'assigned': return '#EAB308'
      case 'in_progress': return '#3B82F6'
      case 'completed': return '#10B981'
      default: return '#9CA3AF'
    }
  }

  return (
    <div 
      className="w-full h-full bg-[#0a0a0a] relative overflow-hidden cursor-crosshair border border-accent/20 rounded-xl"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        const lat = 13.1 - (y / 100) * 0.3
        const lng = 77.4 + (x / 100) * 0.4
        setSelectedPos({ x, y, lat, lng })
      }}
    >
      {/* Tactical Grid Lines */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px' 
        }} 
      />
      
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded bg-red-500/10 border border-red-500/20">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Simulated Grid Mode (Quota Fallback)</span>
      </div>

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        {gridTasks.filter((t: any) => (t.status === 'assigned' || t.status === 'in_progress') && t.assignedVolunteerId).map((t: any) => {
          const vol = gridVolunteers.find((v: any) => v.id === t.assignedVolunteerId)
          if (!vol) return null
          return (
            <motion.line
              key={`path-${t.id}`}
              x1={`${vol.x}%`} y1={`${vol.y}%`}
              x2={`${t.x}%`} y2={`${t.y}%`}
              stroke="#3B82F6"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1 }}
            />
          )
        })}
      </svg>

      {/* Task Markers */}
      {gridTasks.map((t: any) => (
        <motion.div
          key={t.id}
          className="absolute z-10 cursor-pointer"
          style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}
          onClick={(e) => {
            e.stopPropagation()
            setInternalSelectedId(t.id)
            if (t.parsedReportId) onMarkerClick?.(t.parsedReportId)
          }}
          whileHover={{ scale: 1.2 }}
        >
          <div className="relative">
            <motion.div 
              animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: getStatusColor(t.status) }}
            />
            <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg relative z-10`} style={{ backgroundColor: getStatusColor(t.status) }} />
            {activeTaskId === t.id && (
              <div className="absolute -inset-1 border border-white rounded-full animate-ping z-0" />
            )}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 px-1.5 py-0.5 rounded border border-white/10">
              <p className="text-[8px] font-black uppercase text-white tracking-tighter">
                {t.report?.type[0] || 'MISSION'}
              </p>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Volunteer Markers */}
      {gridVolunteers.map((v: any) => (
        <div
          key={v.id}
          className="absolute z-10 cursor-pointer"
          style={{ left: `${v.x}%`, top: `${v.y}%`, transform: 'translate(-50%, -50%)' }}
          onClick={(e) => { e.stopPropagation(); setSelectedVolunteerId(v.id); }}
        >
          <div className={`w-3 h-3 rotate-45 border border-white ${v.available ? 'bg-emerald-500' : 'bg-blue-500'}`} title={v.name} />
        </div>
      ))}

      {/* Selected Pos Info */}
      <AnimatePresence>
        {selectedPos && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-30 p-3 glass bg-black/90 border border-white/20 rounded-xl w-48 shadow-2xl"
            style={{ left: `${selectedPos.x}%`, top: `${selectedPos.y}%`, transform: 'translate(10px, 10px)' }}
          >
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-accent">Grid Coordinates</p>
              <p className="text-[10px] font-mono text-muted-foreground">{selectedPos.lat.toFixed(4)}, {selectedPos.lng.toFixed(4)}</p>
              <Button
                size="sm"
                className="w-full h-8 bg-accent text-white text-[10px] font-black uppercase"
                onClick={() => {
                  setInitialReportDraft({
                    location: `${selectedPos.lat.toFixed(4)}, ${selectedPos.lng.toFixed(4)}`,
                    lat: selectedPos.lat,
                    lng: selectedPos.lng
                  })
                  setActiveTab('report')
                }}
              >
                Create Mission
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Window Simulation */}
      <AnimatePresence>
        {activeTaskId && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 z-40 w-64 glass bg-black/95 border border-accent/30 rounded-xl p-4 shadow-2xl"
          >
            {(() => {
              const marker = gridTasks.find((t: any) => t.id === activeTaskId)
              if (!marker) return null
              return (
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-[10px] uppercase tracking-widest">{marker.report?.type.join(' / ') || 'ANALYZING...'}</h3>
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: getStatusColor(marker.status) }}>
                      {marker.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-black">Location</p>
                    <p className="text-[11px] font-bold text-foreground">{marker.report?.location || 'Coordinating...'}</p>
                  </div>
                  <Button 
                    onClick={() => setActiveTab('assign')}
                    className="w-full h-8 text-[9px] bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 font-black uppercase tracking-widest"
                  >
                    View Operational Details
                  </Button>
                </div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function GoogleMapView({ tasks, parsedReports, volunteers, onMarkerClick, selectedTaskId: externalSelectedId }: GoogleMapViewProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null)
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string | null>(null)
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null)
  
  const activeTaskId = externalSelectedId || internalSelectedId
  const setActiveTab = useCrisisStore((state) => state.setActiveTab)
  const setInitialReportDraft = useCrisisStore((state) => state.setInitialReportDraft)
  const isCommandMode = useCrisisStore((state) => state.isCommandMode)

  const locationCoords: Record<string, { lat: number; lng: number }> = {
    bangalore: { lat: 12.9716, lng: 77.5946 },
    delhi: { lat: 28.7041, lng: 77.1025 },
    mumbai: { lat: 19.076, lng: 72.8777 },
    chennai: { lat: 13.0827, lng: 80.2707 },
    hyderabad: { lat: 17.3850, lng: 78.4867 },
    pune: { lat: 18.5204, lng: 73.8567 },
    kolkata: { lat: 22.5726, lng: 88.3639 },
  }

  const taskMarkers = useMemo(() => {
    return tasks.map((task) => {
      const report = parsedReports.find(p => p.id === task.parsedReportId)
      let coords = { lat: 12.97, lng: 77.59 }

      if ((task as any).lat && (task as any).lng) {
        coords = { lat: (task as any).lat, lng: (task as any).lng }
      } else if (report && report.lat && report.lng) {
        coords = { lat: report.lat, lng: report.lng }
      } else if (report) {
        const locKey = report.location.toLowerCase()
        const preDefined = Object.entries(locationCoords).find(([k]) => locKey.includes(k))?.[1]
        if (preDefined) coords = preDefined
      }

      return {
        ...task,
        report,
        coords
      }
    }).filter(m => m.status !== 'completed')
  }, [tasks, parsedReports])

  const onLoad = useCallback((mapInstance: google.maps.Map) => setMap(mapInstance), [])
  const onUnmount = useCallback(() => setMap(null), [])

  useEffect(() => {
    if (map && isLoaded && externalSelectedId) {
      const task = taskMarkers.find(t => t.id === externalSelectedId)
      if (task) {
        map.panTo(task.coords)
        map.setZoom(14)
      }
    }
  }, [map, isLoaded, externalSelectedId, taskMarkers])

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'detected': return '#EF4444'
      case 'analyzed': return '#7C3AED'
      case 'assigned': return '#EAB308'
      case 'in_progress': return '#3B82F6'
      case 'completed': return '#10B981'
      default: return '#9CA3AF'
    }
  }

  const assignmentPaths = useMemo(() => {
    return tasks
      .filter(t => (t.status === 'assigned' || t.status === 'in_progress') && t.assignedVolunteerId)
      .map(t => {
        const vol = volunteers.find(v => v.id === t.assignedVolunteerId)
        const taskMarker = taskMarkers.find(tm => tm.id === t.id)
        if (vol && taskMarker) {
          return {
            taskId: t.id,
            path: [
              { lat: vol.lat, lng: vol.lng },
              { lat: taskMarker.coords.lat, lng: taskMarker.coords.lng }
            ]
          }
        }
        return null
      }).filter(Boolean) as { taskId: string, path: { lat: number, lng: number }[] }[]
  }, [tasks, volunteers, taskMarkers])

  // Fallback if Quota reached or Loading fails
  if (loadError) return (
    <MockTacticalGrid 
      tasks={tasks} 
      parsedReports={parsedReports} 
      volunteers={volunteers} 
      onMarkerClick={onMarkerClick}
      activeTaskId={activeTaskId}
      setInternalSelectedId={setInternalSelectedId}
      setSelectedVolunteerId={setSelectedVolunteerId}
    />
  )
  
  if (!isLoaded) return (
    <div className="w-full h-full glass animate-pulse flex flex-col items-center justify-center gap-4 border border-white/5">
      <div className="w-12 h-12 rounded-full border-t-2 border-accent animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Initializing Tactical Link...</p>
    </div>
  )

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={{ lat: 12.9716, lng: 77.5946 }}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={(e) => {
          if (e.latLng) {
            setClickedCoords({ lat: e.latLng.lat(), lng: e.latLng.lng() })
            setInternalSelectedId(null)
            setSelectedVolunteerId(null)
          }
        }}
        options={{ 
          styles: darkMapStyle, 
          disableDefaultUI: !isCommandMode,
          zoomControl: isCommandMode,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        }}
      >
        {clickedCoords && (
          <InfoWindow position={clickedCoords} onCloseClick={() => setClickedCoords(null)}>
            <div className="p-2 min-w-[140px] text-black text-center space-y-2">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">New Incident</p>
              <button
                onClick={() => {
                  setInitialReportDraft({
                    location: `${clickedCoords.lat.toFixed(4)}, ${clickedCoords.lng.toFixed(4)}`,
                    lat: clickedCoords.lat,
                    lng: clickedCoords.lng
                  })
                  setActiveTab('report')
                }}
                className="w-full bg-accent text-white px-3 py-1.5 rounded text-xs font-black uppercase"
              >
                Create Report
              </button>
            </div>
          </InfoWindow>
        )}

        {assignmentPaths.map((ap) => (
          <Polyline
            key={ap.taskId}
            path={ap.path}
            options={{
              strokeColor: '#3B82F6',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              geodesic: true,
              icons: [{
                icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2 },
                offset: '50%',
                repeat: '100px'
              }]
            }}
          />
        ))}

        {taskMarkers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.coords}
            onClick={() => {
              setInternalSelectedId(marker.id)
              setSelectedVolunteerId(null)
              if (marker.parsedReportId) onMarkerClick?.(marker.parsedReportId)
            }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: activeTaskId === marker.id ? 14 : (marker.status === 'detected' ? 10 : 12),
              fillColor: getStatusColor(marker.status),
              fillOpacity: 1,
              strokeColor: activeTaskId === marker.id ? '#ffffff' : '#000000',
              strokeWeight: activeTaskId === marker.id ? 4 : 2,
            }}
          />
        ))}

        {volunteers.map((vol) => (
          <Marker
            key={vol.id}
            position={{ lat: vol.lat, lng: vol.lng }}
            onClick={() => { setSelectedVolunteerId(vol.id); setInternalSelectedId(null); }}
            icon={{
              path: 'M -2,0 0,-2 2,0 0,2 z',
              scale: selectedVolunteerId === vol.id ? 10 : 6,
              fillColor: vol.available ? '#10B981' : '#3B82F6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
          />
        ))}

        {activeTaskId && (
          <InfoWindow
            position={taskMarkers.find(t => t.id === activeTaskId)?.coords || { lat: 0, lng: 0 }}
            onCloseClick={() => { setInternalSelectedId(null); }}
          >
            <div className="p-1 min-w-[200px] text-black">
              {(() => {
                const marker = taskMarkers.find(t => t.id === activeTaskId)
                if (!marker) return null
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-xs uppercase">{marker.report?.type.join(' / ') || 'PENDING ANALYSIS'}</h3>
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: getStatusColor(marker.status) }}>
                        {marker.status.toUpperCase()}
                      </span>
                    </div>
                    {marker.report && <p className="text-[10px] m-0 font-medium">Location: {marker.report.location}</p>}
                    <button 
                      onClick={() => setActiveTab('assign')}
                      className="w-full mt-2 text-[9px] bg-accent text-white py-1 rounded font-black uppercase"
                    >
                      View Details
                    </button>
                  </div>
                )
              })()}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}
