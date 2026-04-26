'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dashboard } from '@/components/Dashboard'
import { ReportInput } from '@/components/ReportInput'
import { AIOutputPreview } from '@/components/AIOutputPreview'
import { CrisisMap } from '@/components/CrisisMap'
import { AssignmentPanel } from '@/components/AssignmentPanel'
import { NotificationCenter } from '@/components/NotificationCenter'
import { VolunteerPanel } from '@/components/VolunteerPanel'
import { Shield, Zap, Users, Map, Settings } from 'lucide-react'

export default function Home() {
  const [selectedVolunteer, setSelectedVolunteer] = useState('v1')
  const [activeTab, setActiveTab] = useState('dashboard')

  const navItems = [
    { value: 'dashboard', label: 'Dashboard', icon: Zap },
    { value: 'report', label: 'Reports', icon: Shield },
    { value: 'map', label: 'Map', icon: Map },
    { value: 'assign', label: 'Assign', icon: Users },
    { value: 'volunteer', label: 'Volunteer', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="glass sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">
                  ReliefSync AI
                </h1>
                <p className="text-xs text-muted-foreground">System Active</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-xs text-green-400">
                ✓ Online
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
          <TabsContent value="dashboard" className="space-y-6 fade-in">
            <Dashboard />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CrisisMap />
              </div>
              <NotificationCenter />
            </div>
          </TabsContent>

          {/* Report Tab */}
          <TabsContent value="report" className="space-y-6 fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReportInput />
              <AIOutputPreview />
            </div>
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
      </main>
    </div>
  )
}
