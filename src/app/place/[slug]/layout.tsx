import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'

interface PlaceLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  const { data: place, error } = await supabaseAdmin
    .from('places')
    .select('name, type, location_city, location_state, tags, metrics, scores, mcat_avg, gpa_avg, acceptance_rate, match_rate, tuition_in_state')
    .eq('slug', slug)
    .single()

  if (error || !place) {
    return {
      title: 'Place Not Found | MedStack',
      description: 'The requested medical school, residency program, or rotation site could not be found.',
    }
  }

  const tags = place.tags ? (Array.isArray(place.tags) ? place.tags : (typeof place.tags === 'string' ? JSON.parse(place.tags) : place.tags)) : []
  const metrics = place.metrics ? (typeof place.metrics === 'string' ? JSON.parse(place.metrics) : place.metrics) : {}

  const typeLabel = place.type === 'school' ? 'Medical School' : place.type === 'residency' ? 'Residency Program' : 'Rotation Site'
  const location = [place.location_city, place.location_state].filter(Boolean).join(', ')

  // Build a rich, natural description
  const descParts: string[] = []
  descParts.push(`${place.name} is a ${typeLabel.toLowerCase()} in ${location}.`)

  if (place.type === 'school') {
    const mcat = place.mcat_avg || metrics.mcat_avg
    const gpa = place.gpa_avg || metrics.gpa_avg
    const acceptance = place.acceptance_rate || metrics.acceptance_rate
    if (mcat) descParts.push(`Average MCAT: ${mcat}.`)
    if (gpa) descParts.push(`Average GPA: ${gpa}.`)
    if (acceptance) descParts.push(`Acceptance rate: ${acceptance}%.`)
  }

  if (place.type === 'residency') {
    const matchRate = place.match_rate || metrics.match_rate
    if (matchRate) descParts.push(`Match rate: ${matchRate}%.`)
  }

  if (tags.length > 0) {
    descParts.push(`Known for: ${tags.slice(0, 4).join(', ')}.`)
  }

  descParts.push('View stats, reviews, and comparisons on MedStack.')

  const description = descParts.join(' ')

  // Keywords
  const keywords: string[] = [
    place.name,
    typeLabel,
    location,
    `${place.name} admissions`,
    `${place.name} reviews`,
    `${place.name} ranking`,
  ]
  if (place.type === 'school') {
    keywords.push(`${place.name} MCAT`, `${place.name} GPA`, `${place.name} acceptance rate`, 'medical school admissions')
  }
  if (place.type === 'residency') {
    keywords.push(`${place.name} match rate`, 'residency match', 'residency program')
  }
  keywords.push(...tags.slice(0, 3))

  return {
    title: `${place.name} - ${typeLabel} in ${location} | MedStack`,
    description,
    keywords,
    openGraph: {
      title: `${place.name} - ${typeLabel} | MedStack`,
      description,
      type: 'website',
      siteName: 'MedStack',
    },
  }
}

export default function PlaceLayout({ children }: PlaceLayoutProps) {
  return children
}
