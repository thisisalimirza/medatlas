// Programmatic SEO page definitions
// Each entry generates a unique page targeting a specific long-tail keyword

export interface RankingPageDef {
  slug: string
  title: string
  h1: string
  description: string
  keywords: string[]
  // Filter function applied server-side to the places array
  filterType: 'state' | 'feature' | 'region'
  filterValue: string
  // Sort: which metric to sort by (descending unless specified)
  sortBy: 'rank_overall' | 'acceptance_rate' | 'mcat_avg' | 'gpa_avg' | 'tuition_in_state' | 'match_rate'
  sortAsc?: boolean
  // Intro paragraph for the page (unique content for SEO)
  intro: string
  // What metric to highlight in the cards
  highlightMetric?: string
}

// State name mapping
export const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DC: 'Washington DC', DE: 'Delaware', FL: 'Florida',
  GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana',
  IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine',
  MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', PR: 'Puerto Rico',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas',
  UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',
  WI: 'Wisconsin', WY: 'Wyoming',
}

// Region definitions
export const REGIONS: Record<string, string[]> = {
  northeast: ['CT', 'DC', 'DE', 'MA', 'MD', 'ME', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VT'],
  southeast: ['AL', 'AR', 'FL', 'GA', 'KY', 'LA', 'MS', 'NC', 'PR', 'SC', 'TN', 'VA', 'WV'],
  midwest: ['IA', 'IL', 'IN', 'KS', 'MI', 'MN', 'MO', 'ND', 'NE', 'OH', 'SD', 'WI'],
  southwest: ['AZ', 'NM', 'NV', 'OK', 'TX'],
  west: ['CA', 'CO', 'HI', 'ID', 'MT', 'OR', 'UT', 'WA'],
}

const REGION_NAMES: Record<string, string> = {
  northeast: 'the Northeast',
  southeast: 'the Southeast',
  midwest: 'the Midwest',
  southwest: 'the Southwest',
  west: 'the West Coast',
}

// Generate state pages
function generateStatePages(): RankingPageDef[] {
  const statesWithSchools = [
    'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'FL', 'GA', 'HI',
    'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME',
    'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ',
    'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'PR', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV',
  ]

  return statesWithSchools.map(code => {
    const name = STATE_NAMES[code] || code
    const slug = `best-medical-schools-in-${name.toLowerCase().replace(/\s+/g, '-')}`
    return {
      slug,
      title: `Best Medical Schools in ${name} (${new Date().getFullYear()} Rankings)`,
      h1: `Best Medical Schools in ${name}`,
      description: `Compare all medical schools in ${name} ranked by acceptance rate, MCAT scores, GPA requirements, tuition costs, and student reviews. Find the right program for you.`,
      keywords: [
        `medical schools in ${name}`,
        `best medical schools ${name}`,
        `${name} medical school rankings`,
        `${name} MD programs`,
        `medical school ${name} acceptance rate`,
      ],
      filterType: 'state' as const,
      filterValue: code,
      sortBy: 'rank_overall' as const,
      sortAsc: true,
      intro: `${name} is home to some of the nation's top medical schools. Whether you're a ${name} resident looking for in-state tuition benefits or an out-of-state applicant drawn to the state's programs, this guide ranks every accredited MD program in ${name} by admissions data, student outcomes, and overall quality.`,
      highlightMetric: 'acceptance_rate',
    }
  })
}

// Generate region pages
function generateRegionPages(): RankingPageDef[] {
  return Object.entries(REGIONS).map(([key, states]) => {
    const regionName = REGION_NAMES[key]
    return {
      slug: `best-medical-schools-in-${key}`,
      title: `Best Medical Schools in ${regionName} (${new Date().getFullYear()} Rankings)`,
      h1: `Best Medical Schools in ${regionName.charAt(0).toUpperCase() + regionName.slice(1)}`,
      description: `Explore top-ranked medical schools in ${regionName} United States. Compare MCAT scores, acceptance rates, tuition, and more across ${states.length} states.`,
      keywords: [
        `medical schools ${regionName}`,
        `best medical schools ${regionName}`,
        `${regionName} medical school rankings`,
        `MD programs ${regionName} US`,
      ],
      filterType: 'region' as const,
      filterValue: key,
      sortBy: 'rank_overall' as const,
      sortAsc: true,
      intro: `The ${regionName.replace('the ', '')} region of the United States offers a diverse range of medical education options across ${states.length} states. From research powerhouses to community-focused programs, here are all the medical schools in ${regionName}, ranked by overall quality.`,
      highlightMetric: 'acceptance_rate',
    }
  })
}

// Feature-based pages
const featurePages: RankingPageDef[] = [
  {
    slug: 'img-friendly-medical-schools',
    title: `IMG-Friendly Medical Schools in the US (${new Date().getFullYear()} List)`,
    h1: 'IMG-Friendly Medical Schools',
    description: 'Complete list of US medical schools that are friendly to International Medical Graduates (IMGs). Compare acceptance rates, MCAT requirements, and application tips for IMG applicants.',
    keywords: ['IMG friendly medical schools', 'international medical graduate schools', 'IMG medical schools US', 'medical schools that accept IMGs', 'best schools for international students medicine'],
    filterType: 'feature',
    filterValue: 'img_friendly',
    sortBy: 'rank_overall',
    sortAsc: true,
    intro: 'International Medical Graduates (IMGs) face unique challenges when applying to US medical schools. These schools have demonstrated a track record of welcoming and supporting international graduates, with established pathways and support systems for IMG applicants.',
    highlightMetric: 'acceptance_rate',
  },
  {
    slug: 'most-affordable-medical-schools',
    title: `Most Affordable Medical Schools (${new Date().getFullYear()} Tuition Rankings)`,
    h1: 'Most Affordable Medical Schools',
    description: 'Find the cheapest medical schools in the US ranked by in-state and out-of-state tuition. Compare costs, financial aid, and cost of living to minimize your medical school debt.',
    keywords: ['cheapest medical schools', 'affordable medical schools', 'lowest tuition medical schools', 'medical school costs', 'free medical schools'],
    filterType: 'feature',
    filterValue: 'affordable',
    sortBy: 'tuition_in_state',
    sortAsc: true,
    intro: 'Medical school debt averages over $200,000 for many graduates. Choosing an affordable program can significantly impact your financial future. These schools offer the lowest tuition rates in the country, helping you start your medical career with less debt.',
    highlightMetric: 'tuition_in_state',
  },
  {
    slug: 'hardest-medical-schools-to-get-into',
    title: `Hardest Medical Schools to Get Into (${new Date().getFullYear()} Data)`,
    h1: 'Hardest Medical Schools to Get Into',
    description: 'The most competitive medical schools in the US ranked by acceptance rate, average MCAT scores, and GPA requirements. See what it takes to get accepted.',
    keywords: ['hardest medical schools', 'most competitive medical schools', 'lowest acceptance rate medical schools', 'selective medical schools', 'top medical school requirements'],
    filterType: 'feature',
    filterValue: 'hardest',
    sortBy: 'acceptance_rate',
    sortAsc: true,
    intro: 'The most selective medical schools in the country accept fewer than 5% of applicants. These programs demand exceptional academic credentials, research experience, and extracurricular involvement. Here are the hardest medical schools to get into, ranked by acceptance rate.',
    highlightMetric: 'acceptance_rate',
  },
  {
    slug: 'easiest-medical-schools-to-get-into',
    title: `Easiest Medical Schools to Get Into (${new Date().getFullYear()} Acceptance Rates)`,
    h1: 'Medical Schools with Highest Acceptance Rates',
    description: 'Medical schools with the highest acceptance rates in the US. Compare programs with more accessible admissions while still providing quality medical education.',
    keywords: ['easiest medical schools to get into', 'highest acceptance rate medical schools', 'medical schools easy to get into', 'most accepting medical schools'],
    filterType: 'feature',
    filterValue: 'easiest',
    sortBy: 'acceptance_rate',
    sortAsc: false,
    intro: 'While no medical school is "easy" to get into, some programs have significantly higher acceptance rates than others. These schools may offer more accessible pathways to a medical degree while still maintaining rigorous academic standards.',
    highlightMetric: 'acceptance_rate',
  },
  {
    slug: 'top-ranked-medical-schools',
    title: `Top Ranked Medical Schools in the US (${new Date().getFullYear()} Rankings)`,
    h1: 'Top Ranked Medical Schools',
    description: 'The highest-ranked medical schools in the United States. Compare top programs by research output, student outcomes, match rates, and overall prestige.',
    keywords: ['top medical schools', 'best medical schools', 'medical school rankings', 'top 50 medical schools', 'best MD programs'],
    filterType: 'feature',
    filterValue: 'top_ranked',
    sortBy: 'rank_overall',
    sortAsc: true,
    intro: 'These are the highest-ranked medical schools in the United States, evaluated across multiple dimensions including academic quality, research output, student satisfaction, and residency match outcomes.',
    highlightMetric: 'rank_overall',
  },
  {
    slug: 'research-focused-medical-schools',
    title: `Best Research Medical Schools (${new Date().getFullYear()} Rankings)`,
    h1: 'Research-Focused Medical Schools',
    description: 'Top medical schools for research. Compare programs with strong research funding, publications, and opportunities for students interested in academic medicine.',
    keywords: ['research medical schools', 'best medical schools for research', 'research focused MD programs', 'academic medicine schools', 'medical school research ranking'],
    filterType: 'feature',
    filterValue: 'research',
    sortBy: 'rank_overall',
    sortAsc: true,
    intro: 'For students interested in academic medicine, physician-scientist careers, or research-intensive training, these medical schools stand out for their research infrastructure, funding, and opportunities.',
    highlightMetric: 'acceptance_rate',
  },
  {
    slug: 'best-public-medical-schools',
    title: `Best Public Medical Schools (${new Date().getFullYear()} Rankings)`,
    h1: 'Best Public Medical Schools',
    description: 'Top public (state-funded) medical schools ranked by quality, acceptance rate, and in-state tuition. Find affordable public medical schools near you.',
    keywords: ['best public medical schools', 'public medical school rankings', 'state medical schools', 'affordable public medical schools'],
    filterType: 'feature',
    filterValue: 'public',
    sortBy: 'rank_overall',
    sortAsc: true,
    intro: 'Public medical schools typically offer significantly lower tuition for in-state residents, making them an excellent value. These state-funded programs combine affordability with quality medical education.',
    highlightMetric: 'tuition_in_state',
  },
  {
    slug: 'best-private-medical-schools',
    title: `Best Private Medical Schools (${new Date().getFullYear()} Rankings)`,
    h1: 'Best Private Medical Schools',
    description: 'Top private medical schools in the US. Compare tuition, acceptance rates, and program quality for the best privately-funded medical education.',
    keywords: ['best private medical schools', 'private medical school rankings', 'top private MD programs'],
    filterType: 'feature',
    filterValue: 'private',
    sortBy: 'rank_overall',
    sortAsc: true,
    intro: 'Private medical schools often lead in research funding, smaller class sizes, and alumni networks. While tuition may be higher, many offer generous financial aid packages that make them competitive with public institutions.',
    highlightMetric: 'acceptance_rate',
  },
  {
    slug: 'highest-mcat-medical-schools',
    title: `Medical Schools with Highest MCAT Scores (${new Date().getFullYear()})`,
    h1: 'Medical Schools with Highest Average MCAT Scores',
    description: 'Medical schools that admit students with the highest average MCAT scores. See what MCAT score you need for the most competitive programs.',
    keywords: ['highest MCAT medical schools', 'average MCAT by medical school', 'MCAT scores by school', 'medical school MCAT requirements'],
    filterType: 'feature',
    filterValue: 'highest_mcat',
    sortBy: 'mcat_avg',
    sortAsc: false,
    intro: 'MCAT scores are one of the most important factors in medical school admissions. These programs admit students with the highest average MCAT scores, reflecting their competitive applicant pools.',
    highlightMetric: 'mcat_avg',
  },
  {
    slug: 'lowest-mcat-medical-schools',
    title: `Medical Schools with Lowest MCAT Requirements (${new Date().getFullYear()})`,
    h1: 'Medical Schools with Lowest Average MCAT Scores',
    description: 'Medical schools that accept students with lower MCAT scores. Find programs where a competitive application doesn\'t require a 520+ MCAT.',
    keywords: ['lowest MCAT medical schools', 'low MCAT score medical schools', 'medical schools low MCAT', 'medical schools 500 MCAT'],
    filterType: 'feature',
    filterValue: 'lowest_mcat',
    sortBy: 'mcat_avg',
    sortAsc: true,
    intro: 'Not every competitive medical school requires a 520+ MCAT. These programs evaluate applicants holistically and admit students with a wider range of MCAT scores, focusing on the complete application rather than a single metric.',
    highlightMetric: 'mcat_avg',
  },
]

// Combine all pages
export function getAllRankingPages(): RankingPageDef[] {
  return [
    ...featurePages,
    ...generateRegionPages(),
    ...generateStatePages(),
  ]
}

// Get a single page definition by slug
export function getRankingPageBySlug(slug: string): RankingPageDef | undefined {
  return getAllRankingPages().find(p => p.slug === slug)
}
