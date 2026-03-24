import { MetadataRoute } from 'next'

const BASE_URL = 'https://medatlas-omega.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // Core public pages - high SEO value
  const publicPages = [
    { url: '/', changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: '/specialties', changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: '/step1-prep', changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: '/rotation-tracker', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/interviews', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/grades', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/rank-list', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/schools', changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: '/residencies', changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: '/explore', changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: '/compare', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/match-stats', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/img-resources', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/faq', changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: '/rotations', changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: '/clinical-skills', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/study-groups', changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/mentorship', changeFrequency: 'monthly' as const, priority: 0.6 },
  ]

  // Tools pages
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

  const allPages = [...publicPages, ...toolPages, ...careerPages]

  return allPages.map(page => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
}
