import { NextRequest, NextResponse } from 'next/server'
import { analyzeCrisisReport } from '@/lib/ai-service'
import { parseReport } from '@/core/ai/parser'
import { calculateUrgency } from '@/core/scoring/urgency'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, location, latitude, longitude } = body

    let aiAnalysis
    let useFallback = false

    try {
      const result = await analyzeCrisisReport(description)
      aiAnalysis = result
      useFallback = result.useFallback || false
    } catch (aiError) {
      console.error('[API] AI analysis failed:', aiError)
      useFallback = true
    }

    let parsedResult
    if (!aiAnalysis) {
      parsedResult = parseReport(description, `report-${Date.now()}`)
      parsedResult.urgency = calculateUrgency(parsedResult)
    } else {
      const typeMap: Record<string, string[]> = {
        Medical: ['medical'],
        Food: ['food'],
        Shelter: ['shelter'],
        Water: ['water'],
        Transportation: ['transportation'],
        Other: ['other'],
      }

      const category = aiAnalysis.category || 'Other'
      const urgencyLevel = aiAnalysis.priority === 'High' ? 'high' : aiAnalysis.priority === 'Medium' ? 'medium' : 'low'
      const urgencyScore = aiAnalysis.priority === 'High' ? 80 : aiAnalysis.priority === 'Medium' ? 50 : 20

      parsedResult = {
        id: `parsed-${Date.now()}`,
        reportId: `report-${Date.now()}`,
        type: typeMap[category] || ['other'],
        people: aiAnalysis.people || 1,
        location: location || aiAnalysis.location || 'Unknown',
        lat: latitude,
        lng: longitude,
        keywords: aiAnalysis.keywords || [],
        action: aiAnalysis.action, // Pass the suggested action
        urgency: {
          score: Math.min(urgencyScore + (aiAnalysis.people || 1) * 2, 100),
          level: urgencyLevel as 'low' | 'medium' | 'high',
        },
        createdAt: new Date(),
      }
    }

    return NextResponse.json({
      success: true,
      report: {
        id: `report-${Date.now()}`,
        description,
        location: parsedResult.location,
        latitude,
        longitude,
        createdAt: new Date().toISOString(),
      },
      analysis: parsedResult,
      useFallback,
    })
  } catch (error) {
    console.error('[API] Error processing report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process report' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'ReliefSync AI Reports API' })
}