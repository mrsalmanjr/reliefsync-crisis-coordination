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
    const requiredSkills =
      SKILL_MAPPING[need as keyof typeof SKILL_MAPPING] || []
    requiredSkills.forEach((skill) => {
      if (
        volunteerSkills.some((vs) =>
          vs.toLowerCase().includes(skill)
        )
      ) {
        matches++
      }
    })
  })
  return Math.min(matches * 25, 100) // Max 100
}

export function matchVolunteers(
  volunteers: Volunteer[],
  parsedReport: ParsedReport
): MatchedVolunteer[] {
  const crisisLocation = parseLocation(parsedReport.location)

  const scored = volunteers
    .filter((v) => v.available)
    .map((volunteer) => {
      const skillMatch = calculateSkillMatch(
        volunteer.skills,
        parsedReport.type
      )
      const distance = calculateDistance(
        crisisLocation.lat,
        crisisLocation.lng,
        volunteer.lat,
        volunteer.lng
      )

      // Proximity score: inverse of distance (closer = higher score)
      // Max score at 0km, decreases with distance
      const proximityScore = Math.max(
        0,
        Math.min(100, 100 / (1 + distance * 0.5))
      )

      // Skill match score (0-100)
      const skillScore = skillMatch

      // Availability multiplier
      const availabilityMultiplier = volunteer.available ? 1 : 0.5

      // Combined score using specified weights:
      // Skill match: 50%, Proximity: 30%, Availability: 20%
      const matchScore =
        Math.round(
          (skillScore * 0.5 + proximityScore * 0.3 + 100 * 0.2) *
            availabilityMultiplier
        )

      // Determine reason based on highest contributing factor
      let reason = 'Available volunteer'
      if (skillScore > 50) reason = 'Skill match'
      if (distance < 2 && skillScore > 50) reason = 'Skilled & nearby'
      if (distance < 1) reason = 'Very close by'

      return {
        volunteer,
        distance: Math.round(distance * 10) / 10,
        matchScore,
        reason,
      }
    })

  // Return top 3 with highest match scores
  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3)
}
