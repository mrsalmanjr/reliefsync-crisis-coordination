import { ParsedReport } from '@/types'

const NEED_TYPES: Record<string, string[]> = {
  'Medical Emergency': ['medical', 'injured', 'hospital', 'doctor', 'healthcare', 'sick', 'wound', 'emergency', 'dead', 'died', 'killed', 'casualty', 'casualties', 'bleed', 'fracture', 'pain', 'trauma', 'paramedic', 'ambulance', 'triage'],
  'Flood Risk': ['flood', 'water rising', 'drown', 'submerge', 'rain', 'overflow', 'dam break', 'waterlog', 'deluge', 'monsoon', 'inundation'],
  'Fire Hazard': ['fire', 'burn', 'blaze', 'smoke', 'flame', 'arson', 'wildfire', 'inferno'],
  'Infrastructure Damage': ['collapse', 'crack', 'structural', 'bridge', 'road block', 'infrastructure', 'building damage', 'power line', 'power outage', 'rubble'],
  'Supply Chain Disruption': ['food', 'hunger', 'starving', 'supply', 'shortage', 'drinking water', 'water shortage', 'ration', 'logistics'],
  'Shelter Crisis': ['shelter', 'homeless', 'displaced', 'evacuate', 'refugee', 'tent', 'accommodation', 'roof'],
  'Conflict Zone': ['conflict', 'attack', 'violence', 'shooting', 'bomb', 'explosion', 'weapon', 'terror', 'riot', 'unrest', 'gunfire'],
  'Earthquake': ['earthquake', 'quake', 'tremor', 'seismic', 'aftershock', 'richter'],
  'Severe Weather': ['storm', 'cyclone', 'hurricane', 'tornado', 'typhoon', 'hail', 'lightning'],
}

const URGENCY_KEYWORDS = {
  critical: ['critical', 'dying', 'life-threatening', 'severe', 'extreme', 'dead', 'killed'],
  urgent: ['urgent', 'emergency', 'asap', 'immediately', 'dire', 'help now', 'trapped'],
  injured: ['injured', 'wounded', 'hurt', 'fracture', 'bleeding'],
}

export function parseReport(text: string, reportId: string): ParsedReport {
  const lowerText = text.toLowerCase()

  // Extract need types with the new comprehensive categories
  const type: string[] = []
  for (const [category, keywords] of Object.entries(NEED_TYPES)) {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      type.push(category)
    }
  }

  // FALLBACK: If no category matched, do a smart guess
  if (type.length === 0) {
    // Check for numbers indicating casualties/people → likely Medical
    if (/\d+\s*(dead|people|person|victim)/i.test(text)) {
      type.push('Medical Emergency')
    } else if (/help|need|crisis|disaster|danger/i.test(lowerText)) {
      type.push('General Crisis')
    } else {
      // Final fallback — never return "unknown"
      type.push('General Crisis')
    }
  }

  // Extract number of people
  const peopleRegex = /(\d+)\s*(?:people|person|victims|survivors|families?|dead|killed|injured|affected|civilians|trapped)/i
  const peopleMatch = text.match(peopleRegex)
  // Also try standalone numbers if no match
  const standaloneMatch = text.match(/\b(\d+)\b/)
  const people = peopleMatch ? parseInt(peopleMatch[1]) : (standaloneMatch ? Math.min(parseInt(standaloneMatch[1]), 10000) : 1)

  // Extract location (simplified - looks for common location patterns)
  const locationRegex = /(?:in|near|at|around|from)\s+([A-Z][A-Za-z\s]+?)(?:\.|,|!|\?|$)/i
  const locationMatch = text.match(locationRegex)
  const location = locationMatch ? locationMatch[1].trim() : 'Reported Zone'

  // Extract keywords
  const keywords: string[] = []
  Object.entries(URGENCY_KEYWORDS).forEach(([, words]) => {
    words.forEach((word) => {
      if (lowerText.includes(word)) {
        keywords.push(word)
      }
    })
  })

  // Generate action based on category
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

  const action = actionMap[type[0]] || actionMap['General Crisis']

  return {
    id: `parsed-${Date.now()}`,
    reportId,
    type,
    people,
    location,
    keywords,
    action,
    urgency: { score: 0, level: 'low' },
    confidence: 0,
    createdAt: new Date(),
  }
}
