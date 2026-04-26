'use client'

import { useCrisisStore } from '@/store/crisisStore'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AIOutputPreview() {
  const parsedReports = useCrisisStore((state) => state.parsedReports)
  const latestReport = parsedReports[parsedReports.length - 1]

  if (!latestReport) {
    return (
      <Card className="p-6 text-gray-500">
        No reports processed yet. Submit a crisis report to see AI analysis.
      </Card>
    )
  }

  const urgencyColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  }

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-xl font-bold">AI Analysis Results</h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <p className="text-sm text-gray-600">Urgency Score</p>
          <p className="text-2xl font-bold">
            {latestReport.urgency.score}/100
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Urgency Level</p>
          <Badge className={urgencyColors[latestReport.urgency.level]}>
            {latestReport.urgency.level.toUpperCase()}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-gray-600">People Affected</p>
          <p className="text-2xl font-bold">{latestReport.people}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Need Types</p>
          <div className="flex gap-1 flex-wrap">
            {latestReport.type.map((t) => (
              <Badge key={t} variant="outline">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <p className="text-sm text-gray-600 mb-2">Location</p>
        <p className="font-semibold">{latestReport.location}</p>
      </div>

      <div>
        <p className="text-sm text-gray-600 mb-2">Detected Keywords</p>
        <div className="flex gap-2 flex-wrap">
          {latestReport.keywords.map((k) => (
            <Badge key={k} variant="secondary">
              {k}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  )
}
