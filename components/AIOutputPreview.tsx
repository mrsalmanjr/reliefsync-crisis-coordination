'use client'

import { useCrisisStore } from '@/store/crisisStore'
import { Badge } from '@/components/ui/badge'
import { Sparkles, MapPin, AlertCircle } from 'lucide-react'

export function AIOutputPreview() {
  const parsedReports = useCrisisStore((state) => state.parsedReports)
  const latestReport = parsedReports[parsedReports.length - 1]

  if (!latestReport) {
    return (
      <div className="glass rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
        <Sparkles className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <p className="text-muted-foreground">
          Submit a crisis report to see AI analysis
        </p>
      </div>
    )
  }

  const getUrgencyColor = (level: string) => {
    const colors = {
      low: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
      medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
      high: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    }
    return colors[level as keyof typeof colors] || colors.medium
  }

  const urgencyColor = getUrgencyColor(latestReport.urgency.level)
  const scorePercentage = (latestReport.urgency.score / 100) * 100

  return (
    <div className="glass rounded-xl p-8 space-y-6 overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">AI Analysis</h3>
          <p className="text-xs text-muted-foreground">Real-time crisis parsing</p>
        </div>
      </div>

      {/* Urgency Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Urgency Level</p>
          <div className={`px-3 py-1 rounded-full ${urgencyColor.bg} ${urgencyColor.text} border ${urgencyColor.border} text-xs font-semibold`}>
            {latestReport.urgency.level.toUpperCase()}
          </div>
        </div>
        
        {/* Score Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="text-sm font-bold text-accent">{latestReport.urgency.score}/100</p>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-accent to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Affected People</p>
          <p className="text-2xl font-bold text-foreground">{latestReport.people}</p>
        </div>
        <div className="glass rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Categories</p>
          <div className="flex gap-1 flex-wrap">
            {latestReport.type.slice(0, 2).map((t) => (
              <Badge key={t} className="bg-accent/30 text-accent text-xs">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="flex gap-2 items-start">
        <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-muted-foreground">Location</p>
          <p className="text-sm font-medium text-foreground mt-0.5">{latestReport.location}</p>
        </div>
      </div>

      {/* Keywords */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-accent" />
          <p className="text-xs text-muted-foreground">Detected Keywords</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {latestReport.keywords.map((k) => (
            <Badge key={k} variant="outline" className="bg-white/5 border-white/20">
              {k}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
