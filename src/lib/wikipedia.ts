/**
 * Fetch a Wikipedia thumbnail image for a given school/institution name.
 * Uses the free Wikipedia REST API — no API key required.
 */
export async function fetchWikipediaImage(schoolName: string): Promise<string | null> {
  const variations = buildTitleVariations(schoolName)

  for (const title of variations) {
    const encoded = encodeURIComponent(title.replace(/ /g, '_'))
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`

    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'MedStack/1.0 (medical school explorer; contact@mymedstack.com)' },
        next: { revalidate: 604800 },
      })

      if (!res.ok) continue

      const data = await res.json()

      if (data.thumbnail?.source) {
        return data.thumbnail.source
      }

      if (data.originalimage?.source) {
        return data.originalimage.source
      }
    } catch {
      continue
    }
  }

  return null
}

function buildTitleVariations(name: string): string[] {
  const variations: string[] = [name]
  const lower = name.toLowerCase()

  const cleaned = name
    .replace(/^The\s+/i, '')
    .replace(/\s*\(.*?\)\s*/g, '')
    .trim()

  if (cleaned !== name) {
    variations.push(cleaned)
  }

  const specialties = [
    'Internal Medicine', 'Surgery', 'Pediatrics', 'Psychiatry', 'Radiology',
    'Anesthesiology', 'Dermatology', 'Neurology', 'Orthopedic Surgery',
    'Emergency Medicine', 'Family Medicine', 'Obstetrics and Gynecology',
    'Ophthalmology', 'Pathology', 'Urology',
  ]
  for (const specialty of specialties) {
    if (lower.includes(specialty.toLowerCase())) {
      const withoutSpecialty = name.replace(new RegExp(`\\s*[-–]?\\s*${specialty}`, 'i'), '').trim()
      if (withoutSpecialty && withoutSpecialty !== name) {
        variations.push(withoutSpecialty)
      }
    }
  }

  const schoolOfMatch = name.match(/^(.+?)\s+(?:School|College)\s+of\s+(?:Medicine|Osteopathic Medicine)/i)
  if (schoolOfMatch) {
    variations.push(schoolOfMatch[1])
    if (!schoolOfMatch[1].toLowerCase().includes('university')) {
      variations.push(`${schoolOfMatch[1]} University`)
    }
  }

  return [...new Set(variations)]
}
