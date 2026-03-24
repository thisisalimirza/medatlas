import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Residency Programs Directory & Match Data | MedAtlas',
  description: 'Explore residency programs across all specialties with match rates, program rankings, location data, and reviews. Plan your residency application with comprehensive program data.',
  keywords: ['residency programs', 'residency match rates', 'residency directory', 'residency rankings', 'NRMP match data', 'residency application', 'residency program reviews', 'best residency programs'],
  openGraph: {
    title: 'Residency Programs Directory & Match Data | MedAtlas',
    description: 'Explore residency programs across all specialties with match rates and program data.',
    type: 'website',
    siteName: 'MedAtlas',
  },
}

export default function ResidenciesLayout({ children }: { children: React.ReactNode }) {
  return children
}
