import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'
import { parseComparisonSlug, makeComparisonSlug } from '@/lib/comparisons-data'

const TOP_N = 30 // top 30 schools = 435 comparison pages

export async function generateStaticParams() {
  const { data: schools } = await supabaseAdmin
    .from('places')
    .select('slug')
    .eq('type', 'school')
    .not('rank_overall', 'is', null)
    .order('rank_overall', { ascending: true })
    .limit(TOP_N)

  if (!schools) return []

  const params: { slug: string }[] = []
  for (let i = 0; i < schools.length; i++) {
    for (let j = i + 1; j < schools.length; j++) {
      params.push({
        slug: makeComparisonSlug(schools[i].slug, schools[j].slug),
      })
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const parsed = parseComparisonSlug(slug)

  if (!parsed) {
    return { title: 'School Comparison', description: 'Compare two medical schools side by side.' }
  }

  const { data: schools } = await supabaseAdmin
    .from('places')
    .select('name, slug, city, state, metrics')
    .in('slug', [parsed.schoolA, parsed.schoolB])

  if (!schools || schools.length < 2) {
    return { title: 'School Comparison', description: 'Compare two medical schools side by side.' }
  }

  const a = schools.find(s => s.slug === parsed.schoolA)!
  const b = schools.find(s => s.slug === parsed.schoolB)!

  const title = `${a.name} vs ${b.name} (${new Date().getFullYear()} Comparison)`
  const description = `Compare ${a.name} and ${b.name} side by side. See tuition, MCAT scores, GPA, acceptance rates, rankings, and student reviews to decide which medical school is right for you.`

  return {
    title,
    description,
    keywords: [
      `${a.name} vs ${b.name}`,
      `${b.name} vs ${a.name}`,
      `${a.name} comparison`,
      `${b.name} comparison`,
      'medical school comparison',
      'compare medical schools',
    ],
    alternates: {
      canonical: `https://mymedstack.com/vs/${slug}`,
    },
    openGraph: {
      title: `${a.name} vs ${b.name} | MedStack`,
      description,
      url: `https://mymedstack.com/vs/${slug}`,
      type: 'website',
      siteName: 'MedStack',
    },
  }
}

export default function ComparisonLayout({ children }: { children: React.ReactNode }) {
  return children
}
