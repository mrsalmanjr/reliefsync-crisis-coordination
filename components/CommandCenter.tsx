'use client'

import { useCrisisStore } from '@/store/crisisStore'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Maximize2, 
  Minimize2, 
  Zap, 
  AlertTriangle, 
  Users, 
  Activity, 
  Target, 
  ChevronRight, 
  Shield, 
  Map as MapIcon, 
  Clock,
  Compass
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import { useState } from 'react'

const GoogleMapView = dynamic(() => import('@/components/GoogleMapView'), { ssr: false })

export function CommandCenter() {
  const isCommandMode = useCrisisStore((state) => state.isCommandMode)
  const toggleCommandMode = useCrisisStore((state) => state.toggleCommandMode)
  const tasks = useCrisisStore((state) => state.tasks)
  const volunteers = useCrisisStore((state) => state.volunteers)
  const parsedReports = useCrisisStore((state) => state.parsedReports)
  const alerts = useCrisisStore((state) => state.alerts)
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  if (!isCommandMode) return null

  const activeTasks = tasks.filter(t => t.status !== 'completed')
  const totalResponders = volunteers.length
  const criticalAlerts = alerts.filter(a => a.type === 'critical').length

  const Panel = ({ title, icon: Icon, children, className = "" }: any) => (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`glass bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/20 overflow-hidden flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)] ${className}`}
    >
      <div className="bg-white/10 px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-accent" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{title}</h3>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(var(--accent),0.6)] animate-pulse" />
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {children}
      </div>
    </motion.div>
  )

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black flex flex-col backdrop-blur-md"
    >
      {/* Vignette Effect */}
      <div className="absolute inset-0 z-50 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
      {/* Background Map - Full Screen */}
      <div className="absolute inset-0 z-0 opacity-80 transition-all duration-1000">
        <GoogleMapView 
          tasks={tasks}
          parsedReports={parsedReports}
          volunteers={volunteers}
          selectedTaskId={selectedTaskId}
        />
      </div>

      {/* Grid Overlay for Tactical Feel */}
      <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />

      {/* Header Overlay */}
      <div className="relative z-10 p-6 flex justify-between items-start pointer-events-none">
        <div className="flex items-center gap-6 pointer-events-auto">
          <div className="glass rounded-2xl p-4 border-accent/30 bg-accent/5 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shadow-2xl shadow-accent/40">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter text-white uppercase">Command Center</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent opacity-80">Tactical Operations Mode</p>
              </div>
            </div>
          </div>

          {/* Tactical Stats */}
          <div className="flex gap-4">
            {[
              { label: 'Incidents', val: activeTasks.length, color: 'text-red-400' },
              { label: 'Assets', val: totalResponders, color: 'text-blue-400' },
              { label: 'Critical', val: criticalAlerts, color: 'text-yellow-400' },
            ].map(s => (
              <div key={s.label} className="glass rounded-xl px-5 py-3 border-white/5 backdrop-blur-xl">
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">{s.label}</p>
                <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-auto">
          <Button 
            onClick={toggleCommandMode}
            className="bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-xs h-12 px-6 rounded-xl shadow-2xl shadow-red-500/20"
          >
            <Minimize2 className="w-4 h-4 mr-2" />
            Exit Command Mode
          </Button>
        </div>
      </div>

      {/* Lateral Panels Overlay */}
      <div className="absolute inset-0 z-10 p-6 pt-32 flex justify-between pointer-events-none">
        {/* Left Side: Active Incidents */}
        <Panel title="Active Incidents" icon={Target} className="w-80 h-[calc(100vh-160px)] pointer-events-auto">
          <div className="space-y-2">
            {activeTasks.map(task => {
              const report = parsedReports.find(r => r.id === task.parsedReportId)
              const isSelected = selectedTaskId === task.id
              return (
                <div 
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected ? 'bg-accent/10 border-accent/40' : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-white/10 text-white uppercase tracking-tighter">
                      TASK-{task.id.slice(-4).toUpperCase()}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'in_progress' ? 'bg-blue-400 animate-pulse' : 'bg-yellow-400'
                    }`} />
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{report?.type.join(' / ') || 'ANALYZING...'}</h4>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ETA: {Math.floor(Math.random() * 20 + 5)} mins
                  </p>
                </div>
              )
            })}
          </div>
        </Panel>

        {/* Right Side: Responders & Alerts */}
        <div className="w-80 space-y-6 flex flex-col pointer-events-auto h-[calc(100vh-160px)]">
          <Panel title="Responder Assets" icon={Users} className="flex-1">
            <div className="space-y-3">
              {volunteers.map(vol => (
                <div key={vol.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/20">
                      <Users className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{vol.name}</p>
                      <p className={`text-[9px] font-black uppercase tracking-widest ${vol.available ? 'text-green-400' : 'text-blue-400'}`}>
                        {vol.available ? 'Available' : 'Deployed'}
                      </p>
                    </div>
                  </div>
                  <Compass className="w-3 h-3 text-white/20" />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Tactical Alerts" icon={AlertTriangle} className="h-64">
            <div className="space-y-2">
              {alerts.length > 0 ? alerts.map(alert => (
                <div key={alert.id} className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-[10px] font-black text-red-400 uppercase leading-tight mb-1">{alert.title}</p>
                  <p className="text-[9px] text-red-400/70 leading-relaxed">{alert.message}</p>
                </div>
              )) : (
                <p className="text-[10px] text-muted-foreground text-center py-4 italic">No active tactical alerts</p>
              )}
            </div>
          </Panel>
        </div>
      </div>

      {/* Footer Tactical HUD */}
      <div className="relative z-10 mt-auto p-6 flex justify-center pointer-events-none">
        <div className="glass rounded-full px-8 py-3 border-white/10 backdrop-blur-3xl pointer-events-auto flex items-center gap-10">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-accent animate-pulse" />
            <div className="h-4 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Signal Integrity</span>
              <span className="text-xs font-black text-white">98.4% NOMINAL</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Compass className="w-5 h-5 text-blue-400 animate-spin-slow" />
            <div className="h-4 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Sat-Coordination</span>
              <span className="text-xs font-black text-white">ACTIVE (LATENCY 42ms)</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-red-500" />
            <div className="h-4 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Response Time</span>
              <span className="text-xs font-black text-white">AVG 12.4 MINS</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  )
}
