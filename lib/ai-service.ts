import { generateText, Output } from 'ai'
import { z } from 'zod'

const CrisisAnalysisSchema = z.object({
  category: z.enum(['Medical', 'Food', 'Shelter', 'Water', 'Transportation', 'Other']),
  priority: z.enum(['High', 'Medium', 'Low']),
  people_affected: z.number().min(0),
  suggested_action: z.string(),
  keywords: z.array(z.string()),
  location_hints: z.array(z.string()).nullable(),
})

export type CrisisAnalysis = z.infer<typeof CrisisAnalysisSchema>

export async function analyzeCrisisReport(reportText: string): Promise<CrisisAnalysis> {
  try {
    const result = await generateText({
      model: 'google/gemini-2.0-flash',
      output: Output.object({ schema: CrisisAnalysisSchema }),
      prompt: `You are a crisis management AI. Analyze the following crisis report and extract:
1. Category: Medical, Food, Shelter, Water, Transportation, or Other
2. Priority: High (immediate danger), Medium (urgent), or Low (non-urgent)
3. Number of people affected
4. Suggested immediate action
5. Key emergency keywords found
6. Location hints if mentioned

Report: "${reportText}"

Provide a structured analysis that helps emergency response teams prioritize and allocate resources.`,
    })

    return result.object as CrisisAnalysis
  } catch (error) {
    console.error('[v0] Error analyzing crisis report:', error)
    
    // Fallback response if AI fails
    return {
      category: 'Other' as const,
      priority: 'Medium' as const,
      people_affected: 0,
      suggested_action: 'Manual review required',
      keywords: [],
      location_hints: [],
    }
  }
}

export async function generateVolunteerRecommendations(
  crisis: CrisisAnalysis,
  volunteers: Array<{ id: string; name: string; skills: string[] }>
) {
  const skillMap: Record<string, string[]> = {
    Medical: ['First Aid', 'Nursing', 'Doctor', 'EMT'],
    Food: ['Cooking', 'Food Safety', 'Distribution'],
    Shelter: ['Construction', 'Logistics', 'Organization'],
    Water: ['Engineering', 'Sanitization', 'Chemistry'],
    Transportation: ['Driving', 'Logistics', 'Planning'],
  }

  const requiredSkills = skillMap[crisis.category] || []

  return volunteers
    .map((volunteer) => {
      const matchingSkills = volunteer.skills.filter((skill) =>
        requiredSkills.some((req) => req.toLowerCase().includes(skill.toLowerCase()))
      )

      const matchScore = Math.min(
        100,
        (matchingSkills.length / Math.max(1, requiredSkills.length)) * 100
      )

      return {
        volunteerId: volunteer.id,
        name: volunteer.name,
        matchScore: Math.round(matchScore),
        matchingSkills,
        priority: matchScore > 75 ? 'High' : matchScore > 50 ? 'Medium' : 'Low',
      }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)
}
