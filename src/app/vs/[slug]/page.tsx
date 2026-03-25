import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-server'
import { parseComparisonSlug, makeComparisonSlug } from '@/lib/comparisons-data'
import Header from '@/components/Header'

interface SchoolData {
  slug: string
  name: string
  type: string
  city: string
  state: string
  rank_overall: number | null
  tags: string[]
  metrics: {
    mcat_avg?: number
    gpa_avg?: number
    acceptance_rate?: number
    tuition?: number
    tuition_oos?: number
    match_rate?: number
    img_friendly?: boolean
    step1_pass_rate?: number
  }
}

function parseSchool(raw: Record<string, unknown>): SchoolData {
  const metrics = typeof raw.metrics === 'string'
    ? JSON.parse(raw.metrics)
    : (raw.metrics || {})
  const tags = Array.isArray(raw.tags)
    ? raw.tags
    : (typeof raw.tags === 'string' ? JSON.parse(raw.tags) : [])

  return {
    slug: raw.slug as string,
    name: raw.name as string,
    type: raw.type as string,
    city: raw.city as string,
    state: raw.state as string,
    rank_overall: raw.rank_overall as number | null,
    tags,
    metrics,
  }
}

function shortName(name: string): string {
  // Common abbreviations for long medical school names
  const replacements: [RegExp, string][] = [
    [/^University of California,?\s*/i, 'UC '],
    [/^University of /i, 'U. of '],
    [/ School of Medicine$/i, ''],
    [/ College of Medicine$/i, ''],
    [/ Medical School$/i, ''],
    [/ Grossman /i, ' '],
    [/ Perelman /i, 'Perelman '],
    [/ Vagelos College.*$/i, ''],
  ]
  let short = name
  for (const [pattern, replacement] of replacements) {
    short = short.replace(pattern, replacement)
  }
  // If still too long, take first 4 words
  if (short.length > 30) {
    short = short.split(' ').slice(0, 4).join(' ')
  }
  return short.trim()
}

function fmt(val: number | undefined | null, type: 'money' | 'pct' | 'num' | 'gpa'): string {
  if (val == null) return 'N/A'
  switch (type) {
    case 'money': return `$${val.toLocaleString()}`
    case 'pct': return `${val}%`
    case 'gpa': return val.toFixed(2)
    case 'num': return String(val)
  }
}

export default async function ComparisonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const parsed = parseComparisonSlug(slug)

  if (!parsed) notFound()

  const { data: rawSchools } = await supabaseAdmin
    .from('places')
    .select('*')
    .in('slug', [parsed.schoolA, parsed.schoolB])

  if (!rawSchools || rawSchools.length < 2) notFound()

  const schoolA = parseSchool(rawSchools.find((s: Record<string, unknown>) => s.slug === parsed.schoolA)!)
  const schoolB = parseSchool(rawSchools.find((s: Record<string, unknown>) => s.slug === parsed.schoolB)!)

  const a = schoolA.metrics
  const b = schoolB.metrics

  // Build rows for comparison table
  const rows: { label: string; valA: string; valB: string; aNum?: number | null; bNum?: number | null; lowerWins?: boolean }[] = [
    { label: 'Overall Rank', valA: schoolA.rank_overall ? `#${schoolA.rank_overall}` : 'N/A', valB: schoolB.rank_overall ? `#${schoolB.rank_overall}` : 'N/A', aNum: schoolA.rank_overall, bNum: schoolB.rank_overall, lowerWins: true },
    { label: 'Location', valA: `${schoolA.city}, ${schoolA.state}`, valB: `${schoolB.city}, ${schoolB.state}` },
    { label: 'School Type', valA: schoolA.tags.includes('private') ? 'Private' : schoolA.tags.includes('public') ? 'Public' : 'N/A', valB: schoolB.tags.includes('private') ? 'Private' : schoolB.tags.includes('public') ? 'Public' : 'N/A' },
    { label: 'Acceptance Rate', valA: fmt(a.acceptance_rate, 'pct'), valB: fmt(b.acceptance_rate, 'pct'), aNum: a.acceptance_rate, bNum: b.acceptance_rate, lowerWins: true },
    { label: 'Average MCAT', valA: fmt(a.mcat_avg, 'num'), valB: fmt(b.mcat_avg, 'num'), aNum: a.mcat_avg, bNum: b.mcat_avg },
    { label: 'Average GPA', valA: fmt(a.gpa_avg, 'gpa'), valB: fmt(b.gpa_avg, 'gpa'), aNum: a.gpa_avg, bNum: b.gpa_avg },
    { label: 'In-State Tuition', valA: fmt(a.tuition, 'money'), valB: fmt(b.tuition, 'money'), aNum: a.tuition, bNum: b.tuition, lowerWins: true },
    { label: 'Out-of-State Tuition', valA: fmt(a.tuition_oos, 'money'), valB: fmt(b.tuition_oos, 'money'), aNum: a.tuition_oos, bNum: b.tuition_oos, lowerWins: true },
    { label: 'IMG Friendly', valA: a.img_friendly ? 'Yes' : 'No', valB: b.img_friendly ? 'Yes' : 'No' },
  ]

  // Determine "advantages" for each school
  const advantagesA: string[] = []
  const advantagesB: string[] = []
  rows.forEach(r => {
    if (r.aNum == null || r.bNum == null) return
    const aWins = r.lowerWins ? r.aNum < r.bNum : r.aNum > r.bNum
    if (r.aNum === r.bNum) return
    if (aWins) advantagesA.push(r.label)
    else advantagesB.push(r.label)
  })

  // Get other top schools for "compare with" links
  const { data: topSchools } = await supabaseAdmin
    .from('places')
    .select('slug, name')
    .eq('type', 'school')
    .not('rank_overall', 'is', null)
    .order('rank_overall', { ascending: true })
    .limit(20)

  const otherSchools = (topSchools || []).filter(
    s => s.slug !== schoolA.slug && s.slug !== schoolB.slug
  ).slice(0, 8)

  // JSON-LD structured data — safe: all values are from our database, not user input
  const jsonLdString = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${schoolA.name} vs ${schoolB.name}`,
    description: `Side-by-side comparison of ${schoolA.name} and ${schoolB.name} medical schools.`,
    publisher: {
      '@type': 'Organization',
      name: 'MedStack',
      url: 'https://mymedstack.com',
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* JSON-LD: safe — all values are server-generated from our own database */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-brand-red">Home</Link>
          {' / '}
          <Link href="/compare" className="hover:text-brand-red">Compare</Link>
          {' / '}
          <span className="text-gray-900">{schoolA.name} vs {schoolB.name}</span>
        </nav>

        {/* H1 */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {schoolA.name} vs {schoolB.name}
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-3xl">
          A detailed side-by-side comparison of these two medical schools to help you decide which program is the best fit for your goals.
        </p>

        {/* Quick verdict cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg border-2 border-red-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold bg-red-100 text-brand-red px-2 py-0.5 rounded">A</span>
              <Link href={`/place/${schoolA.slug}`} className="font-bold text-gray-900 hover:text-brand-red">
                {schoolA.name}
              </Link>
            </div>
            <div className="text-sm text-gray-600">
              {schoolA.city}, {schoolA.state} {schoolA.rank_overall && `· Ranked #${schoolA.rank_overall}`}
            </div>
            {advantagesA.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-semibold text-gray-500 mb-1">Advantages:</div>
                <div className="flex flex-wrap gap-1">
                  {advantagesA.map(adv => (
                    <span key={adv} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">{adv}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border-2 border-blue-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">B</span>
              <Link href={`/place/${schoolB.slug}`} className="font-bold text-gray-900 hover:text-brand-red">
                {schoolB.name}
              </Link>
            </div>
            <div className="text-sm text-gray-600">
              {schoolB.city}, {schoolB.state} {schoolB.rank_overall && `· Ranked #${schoolB.rank_overall}`}
            </div>
            {advantagesB.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-semibold text-gray-500 mb-1">Advantages:</div>
                <div className="flex flex-wrap gap-1">
                  {advantagesB.map(adv => (
                    <span key={adv} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">{adv}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 w-1/3">Metric</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-brand-red">
                  <span className="hidden sm:inline">{schoolA.name}</span>
                  <span className="sm:hidden">School A</span>
                </th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-blue-700">
                  <span className="hidden sm:inline">{schoolB.name}</span>
                  <span className="sm:hidden">School B</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">{row.label}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900">
                    {row.valA}
                    {row.aNum != null && row.bNum != null && row.aNum !== row.bNum && (
                      <span className="ml-1.5">
                        {(row.lowerWins ? row.aNum < row.bNum : row.aNum > row.bNum)
                          ? <span className="text-green-600 text-xs">&#x2713;</span>
                          : null}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900">
                    {row.valB}
                    {row.aNum != null && row.bNum != null && row.aNum !== row.bNum && (
                      <span className="ml-1.5">
                        {(row.lowerWins ? row.bNum < row.aNum : row.bNum > row.aNum)
                          ? <span className="text-green-600 text-xs">&#x2713;</span>
                          : null}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SEO content - detailed analysis */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Analysis</h2>
          <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
            {a.acceptance_rate != null && b.acceptance_rate != null && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Admissions Competitiveness</h3>
                <p>
                  {schoolA.name} has an acceptance rate of {a.acceptance_rate}%,
                  {a.acceptance_rate < b.acceptance_rate
                    ? ` making it more selective than ${schoolB.name} at ${b.acceptance_rate}%.`
                    : a.acceptance_rate > b.acceptance_rate
                    ? ` while ${schoolB.name} is more selective at ${b.acceptance_rate}%.`
                    : ` matching ${schoolB.name}'s ${b.acceptance_rate}%.`}
                  {a.mcat_avg && b.mcat_avg && ` Average MCAT scores are ${a.mcat_avg} and ${b.mcat_avg} respectively.`}
                </p>
              </div>
            )}

            {a.tuition != null && b.tuition != null && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Cost of Attendance</h3>
                <p>
                  In-state tuition at {schoolA.name} is {fmt(a.tuition, 'money')} compared to {fmt(b.tuition, 'money')} at {schoolB.name}.
                  {a.tuition < b.tuition
                    ? ` ${schoolA.name} offers a more affordable option, saving students ${fmt(b.tuition - a.tuition, 'money')} per year.`
                    : a.tuition > b.tuition
                    ? ` ${schoolB.name} is the more affordable choice, with savings of ${fmt(a.tuition - b.tuition, 'money')} per year.`
                    : ' Both programs have comparable tuition costs.'}
                </p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
              <p>
                {schoolA.name} is located in {schoolA.city}, {schoolA.state}, while {schoolB.name} is in {schoolB.city}, {schoolB.state}.
                Both locations offer unique clinical training environments and lifestyle considerations for medical students.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Want a Deeper Comparison?</h2>
          <p className="text-gray-600 mb-4 text-sm">
            Use our interactive comparison tool to compare these schools across 20+ data points.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/compare" className="bg-brand-red text-white px-5 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors">
              Full Comparison Tool
            </Link>
            <Link href={`/place/${schoolA.slug}`} className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              View {shortName(schoolA.name)}
            </Link>
            <Link href={`/place/${schoolB.slug}`} className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              View {shortName(schoolB.name)}
            </Link>
          </div>
        </div>

        {/* Compare with other schools — internal linking */}
        {otherSchools.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Compare With Other Top Schools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {otherSchools.map(school => (
                <div key={school.slug} className="flex gap-2">
                  <Link
                    href={`/vs/${makeComparisonSlug(schoolA.slug, school.slug)}`}
                    className="flex-1 bg-white rounded-lg border border-gray-200 px-3 py-2 text-sm hover:border-brand-red transition-colors"
                  >
                    {shortName(schoolA.name)} vs {shortName(school.name)}
                  </Link>
                  <Link
                    href={`/vs/${makeComparisonSlug(schoolB.slug, school.slug)}`}
                    className="flex-1 bg-white rounded-lg border border-gray-200 px-3 py-2 text-sm hover:border-brand-red transition-colors"
                  >
                    {shortName(schoolB.name)} vs {shortName(school.name)}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-8">
          Data sourced from publicly available information. Always verify details directly with each institution.
        </p>
      </div>
    </div>
  )
}
