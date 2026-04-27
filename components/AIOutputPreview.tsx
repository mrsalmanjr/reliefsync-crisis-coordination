'use client'

import { useCrisisStore } from '@/store/crisisStore'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bot, 
  Zap, 
  AlertCircle, 
  ShieldCheck, 
  Users, 
  MapPin, 
  ArrowRight, 
  Loader2,
  TrendingUp,
  Brain
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AIOutputPreview() {
  const tasks = useCrisisStore((state) => state.tasks)
  const parsedReports = useCrisisStore((state) => state.parsedReports)
  const assignTask = useCrisisStore((state) => state.assignTask)
  const volunteers = useCrisisStore((state) => state.volunteers)
  const setActiveTab = useCrisisStore((state) => state.setActiveTab)

  // Find the most recent task that is either detected or just analyzed
  const latestTask = [...tasks].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
  
  if (!latestTask) return null

  const report = parsedReports.find(p => p.id === latestTask.parsedReportId)
  const isDetected = latestTask.status === 'detected'

  const urgencyColors = {
    high: 'text-red-400 border-red-500/30 bg-red-500/10',
    medium: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    low: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  }

  return (
    <div className="glass rounded-xl p-6 border border-white/10 h-full relative overflow-hidden flex flex-col">
      {/* Background Brain Effect */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDetected ? 'bg-accent/20 animate-pulse' : 'bg-gradient-to-br from-accent to-blue-500 shadow-lg shadow-accent/20'}`}>
            <Bot className={`w-6 h-6 ${isDetected ? 'text-accent' : 'text-white'}`} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              Strategic Analysis
              {!isDetected && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-black bg-accent/20 text-accent border border-accent/30 animate-pulse">
                  AI Tactical Engine Active
                </span>
              )}
            </h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
              {isDetected ? 'AI extracting tactical intelligence...' : 'Intelligence Verified & Actionable'}
            </p>
          </div>
        </div>
        {!isDetected && report && (
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-sm font-black text-accent">{report.confidence}% Confidence</span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isDetected ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center space-y-6 py-12"
          >
            <div className="relative">
              <Loader2 className="w-16 h-16 text-accent animate-spin opacity-40" />
              <Brain className="w-8 h-8 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-black tracking-tight text-white uppercase italic">AI analyzing multi-source inputs...</p>
              <div className="flex gap-1 justify-center">
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-accent" />
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-accent" />
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-accent" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 flex-1"
          >
            {/* Tactical Grid Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-xl p-4 border-white/5 bg-white/[0.02]">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Intelligence Category</p>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <span className="text-xl font-black text-white capitalize">{report?.type[0] || 'Mission Critical'}</span>
                </div>
              </div>
              <div className={`glass rounded-xl p-4 border-white/5 ${urgencyColors[report?.urgency.level || 'medium']}`}>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Threat Priority</p>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xl font-black uppercase">{report?.urgency.level === 'high' ? 'CRITICAL / LVL 1' : report?.urgency.level === 'medium' ? 'ELEVATED / LVL 2' : 'MONITOR / LVL 3'}</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-4 border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Population Impact</p>
                  <p className="text-lg font-black text-white">{report?.people || 1} Assets Detected</p>
                </div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Geospatial Fix</p>
                  <p className="text-lg font-black text-white">{report?.location || 'Zone Delta'}</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-5 border-accent/20 bg-accent/5 relative">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <ShieldCheck className="w-12 h-12 text-accent" />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-2">AI-Derived Mission Protocol</h4>
              <p className="text-lg font-bold text-white leading-snug">
                {report?.action || "Initiate rapid response deployment to establish theater security and provide medical oversight."}
              </p>
            </div>

            <div className="pt-4 mt-auto">
              <Button 
                onClick={() => {
                  useCrisisStore.getState().triggerAudio('deploy')
                  const bestVol = volunteers.find(v => v.available) || volunteers[0]
                  assignTask(latestTask.id, bestVol.id)
                  setActiveTab('assign')
                }}
                className="w-full bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest h-14 rounded-xl shadow-xl shadow-accent/20 transition-all active:scale-95 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="relative flex items-center">
                  Auto-Deploy Best Responder
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
