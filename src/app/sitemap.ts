import { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getAllRankingPages } from '@/lib/rankings-data'
import { makeComparisonSlug } from '@/lib/comparisons-data'

const BASE_URL = 'https://mymedstack.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Core public pages - high SEO value
  const publicPages = [
    { url: '/', changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: '/specialties', changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: '/schools', changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: '/residencies', changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: '/step1-prep', changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: '/match-stats', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/rotations', changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: '/rotation-tracker', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/interviews', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/grades', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/rank-list', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/explore', changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: '/compare', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/img-resources', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/faq', changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: '/clinical-skills', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/study-groups', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/mentorship', changeFrequency: 'monthly' as const, priority: 0.6 },
  ]

  // Tools pages - free tools that rank for long-tail keywords
  const toolPages = [
    { url: '/tools/mcat-calculator', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/tools/gpa-calculator', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/tools/application-timeline', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/tools/cost-calculator', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/tools/prerequisites-checker', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/tools/school-comparison', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/tools/premed-timeline', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/tools/secondary-prompts', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/tools/summer-programs', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/tools/financial-planner', changeFrequency: 'monthly' as const, priority: 0.7 },
  ]

  // Career/residency pages
  const careerPages = [
    { url: '/eras', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/salary-negotiator', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/contracts', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/fellowships', changeFrequency: 'monthly' as const, priority: 0.6 },
  ]

  const staticPages = [...publicPages, ...toolPages, ...careerPages].map(page => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  // Fetch all 208 place pages dynamically from Supabase
  let placePages: MetadataRoute.Sitemap = []
  try {
    const { data: places } = await supabaseAdmin
      .from('places')
      .select('slug, updated_at')
      .order('rank_overall', { ascending: true })

    if (places) {
      placePages = places.map(place => ({
        url: `${BASE_URL}/place/${place.slug}`,
        lastModified: place.updated_at ? new Date(place.updated_at) : now,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))
    }
  } catch (error) {
    console.error('Error fetching places for sitemap:', error)
  }

  // Programmatic SEO ranking pages (state, region, feature pages)
  const rankingPages: MetadataRoute.Sitemap = getAllRankingPages().map(page => ({
    url: `${BASE_URL}/rankings/${page.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Comparison pages (top 30 schools = 435 "vs" pages)
  let comparisonPages: MetadataRoute.Sitemap = []
  try {
    const { data: topSchools } = await supabaseAdmin
      .from('places')
      .select('slug')
      .eq('type', 'school')
      .not('rank_overall', 'is', null)
      .order('rank_overall', { ascending: true })
      .limit(30)

    if (topSchools) {
      for (let i = 0; i < topSchools.length; i++) {
        for (let j = i + 1; j < topSchools.length; j++) {
          comparisonPages.push({
            url: `${BASE_URL}/vs/${makeComparisonSlug(topSchools[i].slug, topSchools[j].slug)}`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: 0.7,
          })
        }
      }
    }
  } catch (error) {
    console.error('Error generating comparison pages for sitemap:', error)
  }

  return [...staticPages, ...placePages, ...rankingPages, ...comparisonPages]
}
