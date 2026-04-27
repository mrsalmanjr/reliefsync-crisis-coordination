import { generateText, Output } from 'ai'
import { z } from 'zod'

const CrisisAnalysisSchema = z.object({
  category: z.enum(['Medical', 'Food', 'Shelter', 'Water', 'Transportation', 'Other']),
  priority: z.enum(['High', 'Medium', 'Low']),
  people: z.number().min(0),
  location: z.string(),
  action: z.string(),
  keywords: z.array(z.string()),
})

export type CrisisAnalysis = z.infer<typeof CrisisAnalysisSchema>

export async function analyzeCrisisReport(reportText: string): Promise<CrisisAnalysis & { useFallback?: boolean }> {
  const lowerText = reportText.toLowerCase()
  
  // Rule-based fallback logic (Robust detection)
  const getFallbackAnalysis = (): CrisisAnalysis => {
    let category: 'Medical' | 'Food' | 'Shelter' | 'Water' | 'Transportation' | 'Other' = 'Other'
    let priority: 'High' | 'Medium' | 'Low' = 'Low'
    
    // Category detection
    if (lowerText.match(/injured|hospital|medical|doctor|blood|wound|sick|pain/)) category = 'Medical'
    else if (lowerText.match(/food|hungry|hunger|starv|meal|water|drink/)) category = 'Food'
    else if (lowerText.match(/homeless|shelter|house|roof|stay|sleep/)) category = 'Shelter'
    
    // Priority detection
    if (lowerText.match(/urgent|immediate|dying|critical|emergency|asap|help now/)) priority = 'High'
    else if (lowerText.match(/soon|need|help|lack|missing/)) priority = 'Medium'
    
    // People detection
    const peopleMatch = reportText.match(/(\d+)\s+(?:people|person|victims|survivors|families?)/i)
    const people = peopleMatch ? parseInt(peopleMatch[1]) : 1
    
    // Location detection
    const locationMatch = reportText.match(/(?:in|near|at|around)\s+([A-Za-z\s]+?)(?:\.|,|$)/i)
    const location = locationMatch ? locationMatch[1].trim() : 'Unknown'

    return {
      category,
      priority,
      people,
      location,
      action: `Deploy ${category} relief team to ${location} immediately.`,
      keywords: category !== 'Other' ? [category.toLowerCase()] : [],
    }
  }

  try {
    const result = await generateText({
      model: 'google/gemini-2.0-flash',
      output: Output.object({ schema: CrisisAnalysisSchema }),
      prompt: `You are a crisis management AI. Analyze the following crisis report and extract:
1. Category: Medical, Food, Shelter, Water, Transportation, or Other
2. Priority: High (immediate danger), Medium (urgent), or Low (non-urgent)
3. Number of people affected
4. Location: Extract the specific location mentioned
5. Action: Suggested immediate action (concise, actionable)
6. Keywords: Key emergency terms found

Report: "${reportText}"

Provide a structured analysis to help emergency response teams prioritize resources.`,
    })

    return { ...(result.object as CrisisAnalysis), useFallback: false }
  } catch (error) {
    console.error('[ReliefSync AI] Intelligence extraction failed, triggering rule-based fallback:', error)
    return { ...getFallbackAnalysis(), useFallback: true }
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
