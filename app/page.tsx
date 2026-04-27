'use client'

import { useState } from 'react'
import { useCrisisStore } from '@/store/crisisStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dashboard } from '@/components/Dashboard'
import { ReportInput } from '@/components/ReportInput'
import { AIOutputPreview } from '@/components/AIOutputPreview'
import { CrisisMap } from '@/components/CrisisMap'
import { AssignmentPanel } from '@/components/AssignmentPanel'
import { NotificationCenter } from '@/components/NotificationCenter'
import { VolunteerPanel } from '@/components/VolunteerPanel'
import { PremiumFooter } from '@/components/PremiumFooter'
import { QuickActionFAB } from '@/components/QuickActionFAB'
import { Shield, Zap, Users, Map, Settings, Radio, Maximize2 } from 'lucide-react'
import { LiveActivityFeed } from '@/components/LiveActivityFeed'
import { SettingsPanel } from '@/components/SettingsPanel'

import { CommandCenter } from '@/components/CommandCenter'
import { ActiveIncidentList } from '@/components/ActiveIncidentList'
import { useEffect } from 'react'
import { AudioEngine } from '@/components/AudioEngine'
import { AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [selectedVolunteer, setSelectedVolunteer] = useState('v1')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const activeTab = useCrisisStore((state) => state.activeTab)
  const setActiveTab = useCrisisStore((state) => state.setActiveTab)
  const checkSystemHealth = useCrisisStore((state) => state.checkSystemHealth)
  const isCommandMode = useCrisisStore((state) => state.isCommandMode)
  const toggleCommandMode = useCrisisStore((state) => state.toggleCommandMode)
  const initializeSupabase = useCrisisStore((state) => state.initializeSupabase)
  const submitReport = useCrisisStore((state) => state.submitReport)
  const updateTaskStatus = useCrisisStore((state) => state.updateTaskStatus)
  const tasks = useCrisisStore((state) => state.tasks)
  const settings = useCrisisStore((state) => state.settings)
  useEffect(() => {
    initializeSupabase()
    const healthInterval = setInterval(() => {
      checkSystemHealth()
    }, 10000)

    // Demo Auto-Event Simulator
    const demoInterval = setInterval(() => {
      if (settings.systemMode !== 'demo') return

      const roll = Math.random()
      
      // 30% chance of new incident
      if (roll < 0.3) {
        const scenarios = [
          'Emergency: Water rising rapidly near city outskirts',
          'Medical: 3 people injured in minor landslide',
          'Shelter: 15 families displaced by fire in East Zone',
          'Resource: Critical shortage of drinking water in Sector 4'
        ]
        submitReport(scenarios[Math.floor(Math.random() * scenarios.length)])
      }
      
      // 20% chance of mission completion
      if (roll > 0.8) {
        const inProgressTask = tasks.find(t => t.status === 'in_progress' || t.status === 'assigned')
        if (inProgressTask) {
          updateTaskStatus(inProgressTask.id, 'completed')
        }
      }
    }, 7000)

    return () => {
      clearInterval(healthInterval)
      clearInterval(demoInterval)
    }
  }, [checkSystemHealth, submitReport, updateTaskStatus, tasks, settings.systemMode])

  const navItems = [
    { value: 'dashboard', label: 'Dashboard', icon: Zap },
    { value: 'report', label: 'Reports', icon: Shield },
    { value: 'map', label: 'Map', icon: Map },
    { value: 'assign', label: 'Assign', icon: Users },
    { value: 'volunteer', label: 'Volunteer', icon: Users },
  ]

  return (
    <main className="min-h-screen bg-[#050505] text-foreground p-4 md:p-8 selection:bg-accent/30 overflow-x-hidden">
      <AudioEngine />
      <AnimatePresence>
        {isCommandMode && <CommandCenter />}
      </AnimatePresence>
      
      <div className="max-w-7xl mx-auto space-y-8 relative">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                RELIEFSYNC <span className="text-accent">AI</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-sm font-medium tracking-wide opacity-80 uppercase">
              Next-Gen Crisis Coordination & Response
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={toggleCommandMode}
              variant="outline"
              className="glass border-accent/30 text-accent hover:bg-accent hover:text-white font-black uppercase tracking-widest text-[10px] h-10 px-4 rounded-xl shadow-lg shadow-accent/5 hidden md:flex"
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Enter Command Mode
            </Button>
            
            {/* System Status Pulse */}
            <div className="glass px-4 py-2 rounded-full border-accent/20 flex items-center gap-3">
              <div className="relative w-2.5 h-2.5">
                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                <div className="relative rounded-full w-2.5 h-2.5 bg-green-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-green-400">System Active</span>
            </div>
            <NotificationCenter />
            <div 
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors group"
            >
              <Settings className="w-5 h-5 text-muted-foreground group-hover:rotate-90 transition-transform duration-500" />
            </div>
          </div>
        </div>

        <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-8"
        >
          <TabsList className="glass w-full grid grid-cols-5 rounded-xl p-1 mb-8">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-accent/20 data-[state=active]:text-accent transition-all"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8 fade-in">
            <Dashboard />
            <ActiveIncidentList />
            <div className="w-full">
              <CrisisMap />
            </div>
          </TabsContent>

          {/* Report Tab */}
          <TabsContent value="report" className="space-y-8 fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReportInput />
              <AIOutputPreview />
            </div>
            <ActiveIncidentList />
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="fade-in">
            <CrisisMap />
          </TabsContent>

          {/* Assignment Tab */}
          <TabsContent value="assign" className="space-y-6 fade-in">
            <div>
              <h2 className="text-2xl font-bold mb-6">Smart Volunteer Matching</h2>
              <AssignmentPanel />
            </div>
          </TabsContent>

          {/* Volunteer Tab */}
          <TabsContent value="volunteer" className="fade-in">
            <div className="space-y-6">
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: 'v1', name: 'Sarah Johnson' },
                  { id: 'v2', name: 'Raj Kumar' },
                  { id: 'v3', name: 'Priya Singh' },
                  { id: 'v4', name: 'Michael Chen' },
                  { id: 'v5', name: 'Emma Wilson' },
                ].map((vol) => (
                  <button
                    key={vol.id}
                    onClick={() => setSelectedVolunteer(vol.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedVolunteer === vol.id
                        ? 'glass glow-primary'
                        : 'glass-hover'
                    }`}
                  >
                    {vol.name}
                  </button>
                ))}
              </div>
              <VolunteerPanel
                volunteerId={selectedVolunteer}
                volunteerName="Volunteer"
              />
            </div>
          </TabsContent>
        </Tabs>
        <PremiumFooter />
      </div>
      <QuickActionFAB />
      <LiveActivityFeed />
    </main>
  )
}
