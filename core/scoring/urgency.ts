import { ParsedReport, UrgencyScore } from '@/types'

const TYPE_SCORES: Record<string, number> = {
  'Medical Emergency': 50,
  'Flood Risk': 40,
  'Fire Hazard': 45,
  'Conflict Zone': 50,
  'Infrastructure Damage': 30,
  'Supply Chain Disruption': 25,
  'Shelter Crisis': 30,
  'Earthquake': 50,
  'Severe Weather': 35,
  'General Crisis': 20,
  // Legacy lowercase categories
  medical: 50,
  food: 30,
  shelter: 20,
}

const KEYWORD_SCORES: Record<string, number> = {
  critical: 30,
  'life-threatening': 30,
  dying: 30,
  dead: 30,
  killed: 30,
  severe: 25,
  extreme: 25,
  urgent: 20,
  emergency: 20,
  asap: 15,
  immediately: 15,
  'help now': 15,
  trapped: 25,
  dire: 20,
  injured: 25,
  wounded: 25,
  hurt: 15,
  fracture: 15,
  bleeding: 20,
}

export function calculateUrgency(
  parsedReport: ParsedReport
): UrgencyScore {
  let score = 0

  // Add type scores
  parsedReport.type.forEach((type) => {
    score += TYPE_SCORES[type] || 10
  })

  // Add people count (2 points per person, capped contribution at 40)
  score += Math.min(parsedReport.people * 2, 40)

  // Add keyword scores
  parsedReport.keywords.forEach((keyword) => {
    score += KEYWORD_SCORES[keyword.toLowerCase()] || 0
  })

  // Cap at 100
  score = Math.min(score, 100)

  // Determine level
  let level: 'low' | 'medium' | 'high' = 'low'
  if (score >= 70) {
    level = 'high'
  } else if (score >= 40) {
    level = 'medium'
  }

  return {
    score: Math.round(score),
    level,
  }
}
