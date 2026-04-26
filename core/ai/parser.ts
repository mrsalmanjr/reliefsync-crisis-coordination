import { ParsedReport } from '@/types'

const NEED_TYPES = {
  medical: ['medical', 'injured', 'hospital', 'doctor', 'healthcare', 'sick', 'wound', 'emergency'],
  food: ['food', 'hungry', 'hunger', 'meal', 'eat', 'starving', 'nutrition', 'supplies'],
  shelter: ['shelter', 'homeless', 'home', 'house', 'roof', 'accommodation', 'place to stay'],
}

const URGENCY_KEYWORDS = {
  critical: ['critical', 'dying', 'life-threatening', 'severe', 'extreme'],
  urgent: ['urgent', 'emergency', 'asap', 'immediately', 'dire'],
  injured: ['injured', 'wounded', 'hurt', 'fracture', 'bleeding'],
}

export function parseReport(text: string, reportId: string): ParsedReport {
  const lowerText = text.toLowerCase()

  // Extract need types
  const type: string[] = []
  if (
    NEED_TYPES.medical.some((keyword) => lowerText.includes(keyword))
  ) {
    type.push('medical')
  }
  if (
    NEED_TYPES.food.some((keyword) => lowerText.includes(keyword))
  ) {
    type.push('food')
  }
  if (
    NEED_TYPES.shelter.some((keyword) => lowerText.includes(keyword))
  ) {
    type.push('shelter')
  }

  // Extract number of people
  const peopleRegex = /(\d+)\s+(?:people|person|victims|survivors|families?)/i
  const peopleMatch = text.match(peopleRegex)
  const people = peopleMatch ? parseInt(peopleMatch[1]) : 1

  // Extract location (simplified - looks for common location patterns)
  const locationRegex =
    /(?:in|near|at|around)\s+([A-Za-z\s]+?)(?:\.|,|$)/i
  const locationMatch = text.match(locationRegex)
  const location = locationMatch ? locationMatch[1].trim() : 'Unknown'

  // Extract keywords
  const keywords: string[] = []
  Object.entries(URGENCY_KEYWORDS).forEach(([level, words]) => {
    words.forEach((word) => {
      if (lowerText.includes(word)) {
        keywords.push(word)
      }
    })
  })

  return {
    id: `parsed-${Date.now()}`,
    reportId,
    type: type.length > 0 ? type : ['unknown'],
    people,
    location,
    keywords,
    urgency: { score: 0, level: 'low' },
    createdAt: new Date(),
  }
}
