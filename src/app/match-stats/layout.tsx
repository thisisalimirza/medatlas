import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Residency Match Statistics & Analytics – Match Rates by Specialty | MedAtlas',
  description: 'Explore NRMP Match statistics for 20 specialties. Compare match rates for US MD, DO, and IMG applicants. Step 2 CK averages, research expectations, and match probability calculator. Free for medical students.',
  keywords: ['NRMP match statistics', 'residency match rates', 'match data by specialty', 'IMG match rate', 'Step 2 CK average score', 'match probability calculator', 'competitive specialties', 'residency match analytics'],
  openGraph: {
    title: 'Residency Match Statistics & Analytics | MedAtlas',
    description: 'Compare match rates, Step 2 averages, and competitiveness across 20 medical specialties.',
    type: 'website',
  },
}

export default function MatchStatsLayout({ children }: { children: React.ReactNode }) {
  return children
}
