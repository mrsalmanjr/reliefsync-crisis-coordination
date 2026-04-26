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
import { AlertTriangle } from 'lucide-react'

export default function Home() {
  const [selectedVolunteer, setSelectedVolunteer] = useState('v1')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ReliefSync AI
                </h1>
                <p className="text-sm text-gray-600">
                  Real-time Crisis Coordination System
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white border rounded-lg p-1">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="assign">Assign</TabsTrigger>
            <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <Dashboard />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CrisisMap />
              </div>
              <NotificationCenter />
            </div>
          </TabsContent>

          {/* Report Tab */}
          <TabsContent value="report" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReportInput />
              <AIOutputPreview />
            </div>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="mt-6">
            <CrisisMap />
          </TabsContent>

          {/* Assignment Tab */}
          <TabsContent value="assign" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Crisis Task Assignment</h2>
              <AssignmentPanel />
            </div>
          </TabsContent>

          {/* Volunteer Tab */}
          <TabsContent value="volunteer" className="mt-6">
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
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedVolunteer === vol.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border hover:bg-gray-50'
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
