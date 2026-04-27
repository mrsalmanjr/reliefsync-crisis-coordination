'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useCrisisStore } from '@/store/crisisStore'
import { Badge } from '@/components/ui/badge'

// Dynamically import the map to avoid SSR issues
const GoogleMapView = dynamic(() => import('@/components/GoogleMapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] flex items-center justify-center bg-black/20 animate-pulse rounded-xl">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-muted-foreground font-medium">Initializing Google Maps...</p>
      </div>
    </div>
  )
})

export function CrisisMap() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const tasks = useCrisisStore((state) => state.tasks)
  const parsedReports = useCrisisStore((state) => state.parsedReports)
  const volunteers = useCrisisStore((state) => state.volunteers)

  const selectedReport = useMemo(() => 
    parsedReports.find(r => r.id === selectedReportId),
    [parsedReports, selectedReportId]
  )

  const urgencyColors = {
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-6 border border-white/10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/10 blur-[100px] pointer-events-none rounded-full"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            <h2 className="text-2xl font-bold tracking-tight">Geospatial Intelligence</h2>
          </div>
          <p className="text-sm text-muted-foreground">Live tracking of crisis reports and relief assets</p>
        </div>
        
        <div className="flex gap-4">
          <div className="glass-hover rounded-xl px-4 py-2 border border-white/5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Active Missions</p>
            <p className="text-2xl font-black text-accent">{tasks.filter(t => t.status !== 'completed').length}</p>
          </div>
          <div className="glass-hover rounded-xl px-4 py-2 border border-white/5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Responders</p>
            <p className="text-2xl font-black text-blue-400">{volunteers.length}</p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative z-10 h-[500px] w-full">
        <GoogleMapView 
          tasks={tasks}
          parsedReports={parsedReports} 
          volunteers={volunteers}
          onMarkerClick={(id) => setSelectedReportId(id === selectedReportId ? null : id)}
        />
      </div>

      {/* Details Panel */}
      {selectedReport && (
        <div className="glass rounded-xl p-5 border border-white/15 slide-in-up bg-white/5 relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-bold text-lg">{selectedReport.type.join(' / ').toUpperCase()}</h4>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span className="opacity-70 text-accent">📍</span> {selectedReport.location}
              </p>
            </div>
            <Badge className={`${urgencyColors[selectedReport.urgency.level]} border px-3 py-1 font-bold`}>
              {selectedReport.urgency.level.toUpperCase()}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-tighter">Impacted</p>
              <p className="font-bold text-base">{selectedReport.people} People</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-tighter">Report ID</p>
              <p className="font-mono text-xs opacity-80">{selectedReport.id.split('-')[1]}</p>
            </div>
            <div className="col-span-2 p-3 rounded-lg bg-white/5 border border-white/5">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-tighter">Keywords detected</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedReport.keywords.length > 0 ? (
                  selectedReport.keywords.map(kw => (
                    <span key={kw} className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] border border-white/10">
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-xs italic opacity-50">None extracted</span>
                )}
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setSelectedReportId(null)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Legend Summary (Desktop only) */}
      {!selectedReport && (
        <div className="hidden md:grid grid-cols-3 gap-4 pt-2">
          <div className="flex items-center gap-3 p-3 glass rounded-xl border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Critical Assets</p>
              <p className="text-[10px] text-muted-foreground">High priority incidents</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 glass rounded-xl border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-blue-500 rotate-45"></div>
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Personnel</p>
              <p className="text-[10px] text-muted-foreground">Active ground volunteers</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 glass rounded-xl border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <div className="w-4 h-0.5 bg-accent/40"></div>
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Real-time Data</p>
              <p className="text-[10px] text-muted-foreground">Geo-referenced reports</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
