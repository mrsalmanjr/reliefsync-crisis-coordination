import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')

// ── Keyword-based fallback classifier ──────────────────────────────────────
function classifyFallback(text: string) {
  const lower = text.toLowerCase()

  // Category detection
  let category = 'General Crisis'
  if (/dead|died|killed|casualt|injur|wound|bleed|fracture|medical|hospital|sick|pain/.test(lower)) {
    category = 'Medical Emergency'
  } else if (/flood|water\s*ris|drown|submerge|rain|overflow|dam\s*break/.test(lower)) {
    category = 'Flood Risk'
  } else if (/fire|burn|blaze|smoke|flame|arson/.test(lower)) {
    category = 'Fire Hazard'
  } else if (/conflict|attack|violen|shoot|bomb|explo|weapon|terror/.test(lower)) {
    category = 'Conflict Zone'
  } else if (/collaps|crack|structur|bridge|road\s*block|infrastruct|building/.test(lower)) {
    category = 'Infrastructure Damage'
  } else if (/food|hunger|starv|supply|shortage|drink|water\s*short/.test(lower)) {
    category = 'Supply Chain Disruption'
  } else if (/shelter|homeless|displac|evacuate|refuge|tent/.test(lower)) {
    category = 'Shelter Crisis'
  } else if (/earthquake|quake|tremor|seismic/.test(lower)) {
    category = 'Earthquake'
  } else if (/storm|cyclone|hurricane|tornado|typhoon/.test(lower)) {
    category = 'Severe Weather'
  }

  // Priority detection
  let priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
  if (/dead|died|killed|critical|life.?threaten|dying|severe|100\+|\d{3,}\s*(?:people|dead|killed|injur)/.test(lower)) {
    priority = 'HIGH'
  } else if (/urgent|emergency|immediate|asap|help\s*now|trapped/.test(lower)) {
    priority = 'HIGH'
  } else if (/minor|small|low|stable|non.?urgent/.test(lower)) {
    priority = 'LOW'
  }

  // People count extraction
  const peopleMatch = text.match(/(\d+)\s*(?:people|person|victims|survivors|dead|killed|injured|affected|families|civilians|trapped)/i)
  const standaloneNumber = text.match(/\b(\d+)\b/)
  const peopleAffected = peopleMatch ? parseInt(peopleMatch[1]) : (standaloneNumber ? Math.min(parseInt(standaloneNumber[1]), 10000) : 1)

  // Location extraction
  const locationMatch = text.match(/(?:in|near|at|around|from)\s+([A-Z][A-Za-z\s]+?)(?:\.|,|!|\?|$)/i)
  const location = locationMatch ? locationMatch[1].trim() : 'Reported Zone'

  // Action generation
  const actionMap: Record<string, string> = {
    'Medical Emergency': 'Deploy emergency medical and triage units immediately.',
    'Flood Risk': 'Activate flood response: evacuate low-lying areas, deploy rescue boats.',
    'Fire Hazard': 'Deploy fire suppression units and evacuate surrounding areas.',
    'Conflict Zone': 'Deploy security and emergency medical containment units.',
    'Infrastructure Damage': 'Deploy engineering assessment teams and establish safety perimeter.',
    'Supply Chain Disruption': 'Activate emergency supply routes and distribute relief kits.',
    'Shelter Crisis': 'Deploy temporary shelter units and coordinate evacuation logistics.',
    'Earthquake': 'Activate search and rescue teams, deploy structural assessment units.',
    'Severe Weather': 'Issue emergency warnings, activate emergency shelters.',
    'General Crisis': 'Deploy rapid assessment team to evaluate and coordinate response.',
  }

  return {
    category,
    priority,
    peopleAffected,
    location,
    summary: 'AI fallback classification applied based on keyword analysis.',
    action: actionMap[category] || actionMap['General Crisis'],
    confidence: 72,
  }
}

// ── Main API handler ───────────────────────────────────────────────────────
export async function POST(req: Request) {
  let inputText = ''
  try {
    const { text } = await req.json()
    inputText = text || ''
    console.log('[ReliefSync AI] INPUT:', inputText)

    // Check API key
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY === 'your-gemini-api-key') {
      console.log('[ReliefSync AI] No API key configured — using fallback classifier')
      const fallback = classifyFallback(inputText)
      console.log('[ReliefSync AI] FALLBACK RESPONSE:', fallback)
      return NextResponse.json({ analysis: fallback, mock: true })
    }

    // ── Call Gemini API ──────────────────────────────────────────────────
    console.log('[ReliefSync AI] Sending request to Gemini...')
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `You are a tactical crisis coordination AI. Analyze the following emergency report.

REPORT: "${inputText}"

You MUST return ONLY a valid JSON object with NO extra text, NO markdown, NO explanation.
Return STRICT JSON in this EXACT format:

{
  "category": "Medical Emergency | Flood Risk | Fire Hazard | Conflict Zone | Infrastructure Damage | Supply Chain Disruption | Shelter Crisis | Earthquake | Severe Weather | General Crisis",
  "priority": "LOW | MEDIUM | HIGH",
  "peopleAffected": <number>,
  "location": "<extracted location string>",
  "summary": "<one-line tactical summary>",
  "action": "<recommended immediate response action>",
  "confidence": <number 0-100>
}

RULES:
1. category MUST be one of the exact values listed above.
2. priority MUST be "LOW", "MEDIUM", or "HIGH". Deaths or mass casualties = HIGH.
3. peopleAffected must be a number. If not stated, estimate from context.
4. location: extract from text. If unclear, use "Reported Zone".
5. summary: 1 sentence max. Be tactical and direct.
6. action: specific, actionable deployment recommendation.
7. confidence: your confidence level 0-100.

RESPOND WITH JSON ONLY. NO OTHER TEXT.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysisText = response.text()
    console.log('[ReliefSync AI] Raw Gemini response:', analysisText)

    // ── Parse response safely ────────────────────────────────────────────
    try {
      const cleanedJson = analysisText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim()

      const analysis = JSON.parse(cleanedJson)

      // Validate required fields exist
      const validated = {
        category: analysis.category || classifyFallback(inputText).category,
        priority: ['LOW', 'MEDIUM', 'HIGH'].includes(analysis.priority) ? analysis.priority : 'MEDIUM',
        peopleAffected: typeof analysis.peopleAffected === 'number' ? analysis.peopleAffected : (analysis.people || 1),
        location: analysis.location || 'Reported Zone',
        summary: analysis.summary || 'AI analysis complete.',
        action: analysis.action || analysis.recommended_action || 'Deploy assessment team.',
        confidence: typeof analysis.confidence === 'number' ? analysis.confidence : 85,
      }

      console.log('[ReliefSync AI] PARSED RESPONSE:', validated)
      return NextResponse.json({ analysis: validated })
    } catch (parseError) {
      console.error('[ReliefSync AI] JSON parse failed, using fallback:', parseError)
      const fallback = classifyFallback(inputText)
      console.log('[ReliefSync AI] FALLBACK RESPONSE:', fallback)
      return NextResponse.json({ analysis: fallback, parseError: true })
    }
  } catch (error) {
    console.error('[ReliefSync AI] Gemini API call failed:', error)
    const fallback = classifyFallback(inputText)
    console.log('[ReliefSync AI] API ERROR FALLBACK:', fallback)
    return NextResponse.json({ analysis: fallback, apiError: true })
  }
}
