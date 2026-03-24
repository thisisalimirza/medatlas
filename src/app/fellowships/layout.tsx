import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fellowship Finder – Medical Fellowship Programs & Comparison | MedAtlas',
  description: 'Explore medical fellowship programs across specialties. Compare competitiveness, positions, requirements, and top programs. Browse cardiology, GI, pulm/CC, and more.',
  keywords: ['medical fellowship programs', 'fellowship finder', 'cardiology fellowship', 'GI fellowship', 'fellowship competitiveness', 'subspecialty training'],
  openGraph: {
    title: 'Fellowship Finder – Medical Fellowships | MedAtlas',
    description: 'Browse and compare medical fellowship programs across all specialties.',
    type: 'website',
  },
}

export default function FellowshipsLayout({ children }: { children: React.ReactNode }) {
  return children
}
