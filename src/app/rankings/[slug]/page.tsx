import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getRankingPageBySlug, getAllRankingPages, REGIONS, STATE_NAMES } from '@/lib/rankings-data'
import Header from '@/components/Header'

// Raw DB columns (not the aliased names from the API)
interface PlaceRow {
  id: number
  slug: string
  name: string
  type: string
  city: string
  state: string
  country: string
  tags: string[] | string | null
  rank_overall: number | null
  metrics: Record<string, unknown> | string | null
  scores: Record<string, unknown> | string | null
}

// Parsed place with extracted metrics
interface ParsedPlace {
  id: number
  slug: string
  name: string
  type: string
  location_city: string
  location_state: string
  tags: string[]
  rank_overall: number | null
  tuition_in_state: number | null
  mcat_avg: number | null
  gpa_avg: number | null
  acceptance_rate: number | null
  img_friendly: boolean
}

function parsePlace(place: PlaceRow): ParsedPlace {
  const metrics: Record<string, unknown> = typeof place.metrics === 'string'
    ? JSON.parse(place.metrics)
    : (place.metrics || {})
  const tags = Array.isArray(place.tags)
    ? place.tags
    : (typeof place.tags === 'string' ? JSON.parse(place.tags) : [])

  return {
    id: place.id,
    slug: place.slug,
    name: place.name,
    type: place.type,
    location_city: place.city,
    location_state: place.state,
    tags,
    rank_overall: place.rank_overall,
    tuition_in_state: (metrics.tuition as number) ?? null,
    mcat_avg: (metrics.mcat_avg as number) ?? null,
    gpa_avg: (metrics.gpa_avg as number) ?? null,
    acceptance_rate: (metrics.acceptance_rate as number) ?? null,
    img_friendly: !!(metrics.img_friendly),
  }
}

async function getFilteredPlaces(pageDef: NonNullable<ReturnType<typeof getRankingPageBySlug>>) {
  // Use select('*') because metrics are stored in a JSONB column
  const { data: rawPlaces, error } = await supabaseAdmin
    .from('places')
    .select('*')
    .eq('type', 'school')
    .order('rank_overall', { ascending: true })
    .limit(500)

  if (error) {
    console.error('Rankings fetch error:', error)
    return []
  }
  if (!rawPlaces) return []

  const places = (rawPlaces as PlaceRow[]).map(parsePlace)

  // Apply filter
  let filtered: typeof places
  switch (pageDef.filterType) {
    case 'state':
      filtered = places.filter(p => p.location_state === pageDef.filterValue)
      break
    case 'region':
      const regionStates = REGIONS[pageDef.filterValue] || []
      filtered = places.filter(p => regionStates.includes(p.location_state))
      break
    case 'feature':
      switch (pageDef.filterValue) {
        case 'img_friendly':
          filtered = places.filter(p => p.img_friendly)
          break
        case 'affordable':
          filtered = places.filter(p => p.tuition_in_state != null).sort((a, b) => (a.tuition_in_state || 0) - (b.tuition_in_state || 0))
          break
        case 'hardest':
          filtered = places.filter(p => p.acceptance_rate != null).sort((a, b) => (a.acceptance_rate || 100) - (b.acceptance_rate || 100)).slice(0, 50)
          break
        case 'easiest':
          filtered = places.filter(p => p.acceptance_rate != null).sort((a, b) => (b.acceptance_rate || 0) - (a.acceptance_rate || 0)).slice(0, 50)
          break
        case 'top_ranked':
          filtered = places.filter(p => p.rank_overall != null).sort((a, b) => (a.rank_overall || 999) - (b.rank_overall || 999)).slice(0, 50)
          break
        case 'research':
          filtered = places.filter(p => p.tags.includes('research-heavy'))
          break
        case 'public':
          filtered = places.filter(p => p.tags.includes('public'))
          break
        case 'private':
          filtered = places.filter(p => p.tags.includes('private'))
          break
        case 'highest_mcat':
          filtered = places.filter(p => p.mcat_avg != null).sort((a, b) => (b.mcat_avg || 0) - (a.mcat_avg || 0)).slice(0, 50)
          break
        case 'lowest_mcat':
          filtered = places.filter(p => p.mcat_avg != null).sort((a, b) => (a.mcat_avg || 999) - (b.mcat_avg || 999)).slice(0, 50)
          break
        default:
          filtered = places
      }
      break
    default:
      filtered = places
  }

  // Apply sort if not already sorted by filter
  if (!['affordable', 'hardest', 'easiest', 'top_ranked', 'highest_mcat', 'lowest_mcat'].includes(pageDef.filterValue)) {
    filtered.sort((a, b) => {
      const aVal = a[pageDef.sortBy as keyof typeof a] as number | null
      const bVal = b[pageDef.sortBy as keyof typeof b] as number | null
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      return pageDef.sortAsc ? aVal - bVal : bVal - aVal
    })
  }

  return filtered
}

function formatTuition(amount: number | null): string {
  if (amount == null) return 'N/A'
  return `$${amount.toLocaleString()}`
}

function formatPercent(value: number | null): string {
  if (value == null) return 'N/A'
  return `${value}%`
}

// Compute aggregate stats for the intro section
function computeStats(places: ParsedPlace[]) {
  const withAcceptance = places.filter(p => p.acceptance_rate != null)
  const withMcat = places.filter(p => p.mcat_avg != null)
  const withTuition = places.filter(p => p.tuition_in_state != null)
  const withGpa = places.filter(p => p.gpa_avg != null)

  return {
    count: places.length,
    avgAcceptance: withAcceptance.length > 0
      ? (withAcceptance.reduce((sum, p) => sum + (p.acceptance_rate || 0), 0) / withAcceptance.length).toFixed(1)
      : null,
    avgMcat: withMcat.length > 0
      ? Math.round(withMcat.reduce((sum, p) => sum + (p.mcat_avg || 0), 0) / withMcat.length)
      : null,
    avgTuition: withTuition.length > 0
      ? Math.round(withTuition.reduce((sum, p) => sum + (p.tuition_in_state || 0), 0) / withTuition.length)
      : null,
    avgGpa: withGpa.length > 0
      ? (withGpa.reduce((sum, p) => sum + (p.gpa_avg || 0), 0) / withGpa.length).toFixed(2)
      : null,
  }
}

export default async function RankingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pageDef = getRankingPageBySlug(slug)

  if (!pageDef) {
    notFound()
  }

  const places = await getFilteredPlaces(pageDef)
  const stats = computeStats(places)

  // Get related ranking pages for internal linking
  const allPages = getAllRankingPages()
  const relatedPages = allPages
    .filter(p => p.slug !== slug)
    .filter(p => {
      // Show related feature pages, or same-region state pages
      if (pageDef.filterType === 'state') {
        // Show other states in same region + feature pages
        const stateRegion = Object.entries(REGIONS).find(([, states]) => states.includes(pageDef.filterValue))
        if (p.filterType === 'state' && stateRegion) {
          return REGIONS[stateRegion[0]].includes(p.filterValue)
        }
        return p.filterType === 'feature'
      }
      if (pageDef.filterType === 'feature') return p.filterType === 'feature'
      if (pageDef.filterType === 'region') return p.filterType === 'feature' || p.filterType === 'region'
      return false
    })
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-brand-red">Home</Link>
          {' / '}
          <Link href="/schools" className="hover:text-brand-red">Medical Schools</Link>
          {' / '}
          <span className="text-gray-900">{pageDef.h1}</span>
        </nav>

        {/* H1 + Intro */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {pageDef.h1}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
            {pageDef.intro}
          </p>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-brand-red">{stats.count}</div>
            <div className="text-sm text-gray-600">Programs</div>
          </div>
          {stats.avgAcceptance && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-brand-red">{stats.avgAcceptance}%</div>
              <div className="text-sm text-gray-600">Avg Acceptance Rate</div>
            </div>
          )}
          {stats.avgMcat && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-brand-red">{stats.avgMcat}</div>
              <div className="text-sm text-gray-600">Avg MCAT Score</div>
            </div>
          )}
          {stats.avgTuition && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-brand-red">{formatTuition(stats.avgTuition)}</div>
              <div className="text-sm text-gray-600">Avg In-State Tuition</div>
            </div>
          )}
        </div>

        {/* Rankings Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 w-12">#</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">School</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 hidden md:table-cell">Location</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700">Acceptance</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700 hidden sm:table-cell">MCAT</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700 hidden sm:table-cell">GPA</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700 hidden lg:table-cell">Tuition (In-State)</th>
                </tr>
              </thead>
              <tbody>
                {places.map((place, index) => (
                  <tr key={place.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-500 font-medium">{index + 1}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/place/${place.slug}`}
                        className="text-sm font-medium text-gray-900 hover:text-brand-red transition-colors"
                      >
                        {place.name}
                      </Link>
                      {place.img_friendly && (
                        <span className="ml-2 text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">IMG-Friendly</span>
                      )}
                      <div className="md:hidden text-xs text-gray-500 mt-0.5">
                        {place.location_city}, {place.location_state}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                      {place.location_city}, {STATE_NAMES[place.location_state] || place.location_state}
                    </td>
                    <td className="px-4 py-3 text-sm text-center font-medium text-gray-900">
                      {formatPercent(place.acceptance_rate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700 hidden sm:table-cell">
                      {place.mcat_avg || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700 hidden sm:table-cell">
                      {place.gpa_avg || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700 hidden lg:table-cell">
                      {formatTuition(place.tuition_in_state)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {places.length === 0 && (
            <div className="px-4 py-12 text-center text-gray-500">
              No programs found matching this criteria.
            </div>
          )}
        </div>

        {/* Summary content for SEO */}
        {stats.count > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Key Takeaways</h2>
            <div className="prose prose-gray max-w-none text-gray-700">
              <ul className="space-y-2">
                <li>
                  There {stats.count === 1 ? 'is' : 'are'} <strong>{stats.count} medical school{stats.count !== 1 ? 's' : ''}</strong> matching this criteria.
                </li>
                {stats.avgAcceptance && (
                  <li>
                    The average acceptance rate is <strong>{stats.avgAcceptance}%</strong>
                    {places[0]?.acceptance_rate != null && (
                      <>, ranging from {formatPercent(Math.min(...places.filter(p => p.acceptance_rate != null).map(p => p.acceptance_rate!)))} to {formatPercent(Math.max(...places.filter(p => p.acceptance_rate != null).map(p => p.acceptance_rate!)))}</>
                    )}.
                  </li>
                )}
                {stats.avgMcat && (
                  <li>
                    The average MCAT score is <strong>{stats.avgMcat}</strong>
                    {places.filter(p => p.mcat_avg).length > 1 && (
                      <>, with scores ranging from {Math.min(...places.filter(p => p.mcat_avg != null).map(p => p.mcat_avg!))} to {Math.max(...places.filter(p => p.mcat_avg != null).map(p => p.mcat_avg!))}</>
                    )}.
                  </li>
                )}
                {stats.avgTuition && (
                  <li>
                    Average in-state tuition is <strong>{formatTuition(stats.avgTuition)}</strong> per year.
                  </li>
                )}
                {stats.avgGpa && (
                  <li>
                    The average GPA of admitted students is <strong>{stats.avgGpa}</strong>.
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Compare Schools Side by Side</h2>
          <p className="text-gray-600 mb-4">
            Use our free comparison tool to evaluate programs across 20+ data points.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/compare"
              className="bg-brand-red text-white px-5 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Compare Schools
            </Link>
            <Link
              href="/tools/mcat-calculator"
              className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              MCAT Calculator
            </Link>
            <Link
              href="/tools/gpa-calculator"
              className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              GPA Calculator
            </Link>
          </div>
        </div>

        {/* Related Rankings — Internal Linking */}
        {relatedPages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Related Rankings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPages.map(page => (
                <Link
                  key={page.slug}
                  href={`/rankings/${page.slug}`}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:border-brand-red hover:shadow-sm transition-all"
                >
                  <h3 className="font-medium text-gray-900 text-sm mb-1">{page.h1}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{page.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 text-center mt-8">
          Data sourced from publicly available information. Rankings are based on multiple factors and are updated regularly. Always verify information directly with the institution.
        </p>
      </div>
    </div>
  )
}
