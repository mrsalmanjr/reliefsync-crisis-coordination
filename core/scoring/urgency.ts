import { ParsedReport, UrgencyScore } from '@/types'

const TYPE_SCORES = {
  medical: 50,
  food: 30,
  shelter: 20,
}

const KEYWORD_SCORES = {
  critical: 30,
  'life-threatening': 30,
  dying: 30,
  severe: 25,
  extreme: 25,
  urgent: 20,
  emergency: 20,
  asap: 15,
  immediately: 15,
  dire: 20,
  injured: 25,
  wounded: 25,
  hurt: 15,
}

export function calculateUrgency(
  parsedReport: ParsedReport
): UrgencyScore {
  let score = 0

  // Add type scores
  parsedReport.type.forEach((type) => {
    score += TYPE_SCORES[type as keyof typeof TYPE_SCORES] || 0
  })

  // Add people count (2 points per person)
  score += parsedReport.people * 2

  // Add keyword scores
  parsedReport.keywords.forEach((keyword) => {
    score += KEYWORD_SCORES[keyword as keyof typeof KEYWORD_SCORES] || 0
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
