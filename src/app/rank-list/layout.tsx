import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Residency Rank List Builder – Program Comparison & Match Strategy | MedAtlas',
  description: 'Build and organize your residency rank list with structured program evaluations. Compare programs across 7 dimensions, track interview impressions, and optimize your Match strategy. Free for medical students.',
  keywords: ['residency rank list builder', 'NRMP Match strategy', 'program comparison', 'residency interview tracker', 'rank list tool', 'match day preparation', 'residency application'],
  openGraph: {
    title: 'Residency Rank List Builder | MedAtlas',
    description: 'Build your residency rank list with structured evaluations and side-by-side program comparisons.',
    type: 'website',
  },
}

export default function RankListLayout({ children }: { children: React.ReactNode }) {
  return children
}
