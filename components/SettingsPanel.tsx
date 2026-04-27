'use client'

import { useCrisisStore, AppSettings } from '@/store/crisisStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Settings2, Shield, Bell, Cpu, Map as MapIcon, Trash2, AlertTriangle, Check, Zap, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const settings = useCrisisStore((state) => state.settings)
  const updateSettings = useCrisisStore((state) => state.updateSettings)
  const resetSystem = useCrisisStore((state) => state.resetSystem)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const SettingRow = ({ icon: Icon, title, description, children }: any) => (
    <div className="flex items-center justify-between p-4 glass border-white/5 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium opacity-60">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )

  const handleReset = () => {
    resetSystem()
    setShowResetConfirm(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-[101] shadow-2xl p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/20 shadow-lg shadow-accent/10">
                  <Settings2 className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tighter text-foreground uppercase">Control Center</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">System Configurations</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/5">
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              <SettingRow 
                icon={Shield} 
                title="System Mode" 
                description={settings.systemMode === 'demo' ? 'Using Synthetic Data' : 'Live Operations'}
              >
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                  <button 
                    onClick={() => updateSettings({ systemMode: 'demo' })}
                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${settings.systemMode === 'demo' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted-foreground'}`}
                  >
                    Demo
                  </button>
                  <button 
                    onClick={() => updateSettings({ systemMode: 'live' })}
                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${settings.systemMode === 'live' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted-foreground'}`}
                  >
                    Live
                  </button>
                </div>
              </SettingRow>

              <SettingRow 
                icon={Bell} 
                title="Real-time Alerts" 
                description={settings.notificationsEnabled ? 'Alerts Enabled' : 'Silent Mode'}
              >
                <Switch 
                  checked={settings.notificationsEnabled} 
                  onCheckedChange={(val) => updateSettings({ notificationsEnabled: val })}
                />
              </SettingRow>

              <SettingRow 
                icon={Cpu} 
                title="AI Intelligence" 
                description={settings.aiMode === 'smart' ? 'Neural Processing' : 'Direct Logic'}
              >
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                  <button 
                    onClick={() => updateSettings({ aiMode: 'smart' })}
                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${settings.aiMode === 'smart' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted-foreground'}`}
                  >
                    Smart
                  </button>
                  <button 
                    onClick={() => updateSettings({ aiMode: 'rules' })}
                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${settings.aiMode === 'rules' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted-foreground'}`}
                  >
                    Rules
                  </button>
                </div>
              </SettingRow>

              <SettingRow 
                icon={MapIcon} 
                title="Geospatial Mode" 
                description={settings.mapMode === 'real' ? 'Global GPS' : 'Simulated Grid'}
              >
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                  <button 
                    onClick={() => updateSettings({ mapMode: 'real' })}
                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${settings.mapMode === 'real' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted-foreground'}`}
                  >
                    Real
                  </button>
                  <button 
                    onClick={() => updateSettings({ mapMode: 'simulated' })}
                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${settings.mapMode === 'simulated' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted-foreground'}`}
                  >
                    Sim
                  </button>
                </div>
              </SettingRow>

              <SettingRow 
                icon={Volume2} 
                title="System Audio Mode" 
                description={settings.audioMode === 'off' ? 'Silent Mode' : settings.audioMode === 'minimal' ? 'Alerts Only' : 'Immersive HUD'}
              >
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                  <button 
                    onClick={() => updateSettings({ audioMode: 'off' })}
                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${settings.audioMode === 'off' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted-foreground'}`}
                  >
                    Off
                  </button>
                  <button 
                    onClick={() => updateSettings({ audioMode: 'minimal' })}
                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${settings.audioMode === 'minimal' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted-foreground'}`}
                  >
                    Min
                  </button>
                  <button 
                    onClick={() => updateSettings({ audioMode: 'full' })}
                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${settings.audioMode === 'full' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted-foreground'}`}
                  >
                    Full
                  </button>
                </div>
              </SettingRow>

              <div className="p-4 glass bg-accent/5 border border-accent/20 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-accent">Audio Diagnostics</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-60">Verify Tactical Signals</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-8 px-4 text-[10px] font-black uppercase tracking-widest bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20"
                    onClick={() => {
                      useCrisisStore.getState().triggerAudio('success')
                    }}
                  >
                    Test Signal
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-white/5">
              <div className="space-y-4">
                <Button 
                  onClick={onClose}
                  className="w-full h-14 bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-accent/20 transition-all active:scale-95"
                >
                  Apply System Changes
                </Button>

                {!showResetConfirm ? (
                  <Button 
                    onClick={() => setShowResetConfirm(true)}
                    variant="outline" 
                    className="w-full h-12 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-400 font-bold uppercase tracking-widest bg-transparent"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All System Data
                  </Button>
                ) : (
                  <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30 space-y-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-red-500">Destructive Action</p>
                        <p className="text-xs text-red-500/70">This will permanently delete all incidents, activities, and custom configurations. This cannot be undone.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="ghost" 
                        onClick={() => setShowResetConfirm(false)}
                        className="text-xs font-bold uppercase tracking-widest"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleReset}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest"
                      >
                        Confirm Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-2 opacity-30">
                <Check className="w-3 h-3 text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest">Configuration Active</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
