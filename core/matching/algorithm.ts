import { Volunteer, MatchedVolunteer, ParsedReport } from '@/types'

// Skill mapping to need types
const SKILL_MAPPING = {
  medical: ['medical', 'nurse', 'doctor', 'paramedic', 'healthcare'],
  food: ['cooking', 'food', 'nutrition', 'catering'],
  shelter: ['construction', 'carpentry', 'shelter', 'housing'],
  general: ['general', 'logistics', 'coordination'],
}

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  // Haversine formula for accurate geographic distance in kilometers
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}

function parseLocation(locationString: string): {
  lat: number
  lng: number
} {
  // Simplified location parsing - in real world this would use geocoding
  const locationMap: Record<string, { lat: number; lng: number }> = {
    bangalore: { lat: 12.9716, lng: 77.5946 },
    delhi: { lat: 28.7041, lng: 77.1025 },
    mumbai: { lat: 19.076, lng: 72.8777 },
    pune: { lat: 18.5204, lng: 73.8567 },
    hyderabad: { lat: 17.3850, lng: 78.4867 },
    default: { lat: 13.0, lng: 77.0 },
  }

  const key = locationString.toLowerCase()
  return (
    Object.entries(locationMap).find(([k]) =>
      key.includes(k)
    )?.[1] || locationMap.default
  )
}

function calculateSkillMatch(
  volunteerSkills: string[],
  needTypes: string[]
): number {
  let matches = 0
  needTypes.forEach((need) => {
    const requiredSkills = SKILL_MAPPING[need as keyof typeof SKILL_MAPPING] || []
    if (volunteerSkills.some(vs => requiredSkills.some(rs => vs.toLowerCase().includes(rs)))) {
      matches++
    }
  })
  return needTypes.length > 0 ? matches / needTypes.length : 0
}

export function matchVolunteers(
  volunteers: Volunteer[],
  parsedReport: ParsedReport
): MatchedVolunteer[] {
  const crisisLocation = parseLocation(parsedReport.location)

  const scored = volunteers
    .filter((v) => v.available)
    .map((volunteer) => {
      const skillMatchRatio = calculateSkillMatch(
        volunteer.skills,
        parsedReport.type
      )
      const distance = calculateDistance(
        crisisLocation.lat,
        crisisLocation.lng,
        volunteer.lat,
        volunteer.lng
      )

      // formula: score = (skill_match * 50) + (1 / distance * 30)
      // distance adjusted to avoid division by zero
      const distanceFactor = 1 / (Math.max(0.1, distance))
      const matchScore = Math.round((skillMatchRatio * 50) + (distanceFactor * 30))

      let reason = 'Available volunteer'
      if (skillMatchRatio > 0.8) reason = 'Perfect skill match'
      else if (distance < 1) reason = 'Extremely close'
      else if (skillMatchRatio > 0.5) reason = 'Strong skill match'

      return {
        volunteer,
        distance: Math.round(distance * 10) / 10,
        matchScore,
        reason,
      }
    })

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3)
}
