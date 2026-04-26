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
  // Simplified Euclidean distance
  const dx = lat2 - lat1
  const dy = lng2 - lng1
  return Math.sqrt(dx * dx + dy * dy)
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

      // Distance score (inverse - closer is better)
      const distanceScore = Math.max(
        0,
        100 - distance * 10
      )

      // Availability bonus
      const availabilityBonus = volunteer.available ? 10 : 0

      // Combined score
      const matchScore =
        (skillMatch * 0.5 +
          distanceScore * 0.3 +
          availabilityBonus) |
        0

      return {
        volunteer,
        distance: Math.round(distance * 100) / 100,
        matchScore: Math.round(matchScore),
        reason: `${skillMatch > 0 ? 'Skill match ' : ''}${distance < 2 ? '+ nearby' : '+ available'}`,
      }
    })

  // Return top 3
  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3)
}
