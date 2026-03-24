import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IMG Resources – Guide for International Medical Graduates | MedStack',
  description: 'Comprehensive guide for IMGs: ECFMG certification, visa options (J-1, H-1B), IMG-friendly specialties and match rates, USCE guide, and application strategy. Free for international medical graduates.',
  keywords: ['IMG residency guide', 'international medical graduate', 'ECFMG certification', 'IMG match rate', 'J-1 visa residency', 'IMG friendly programs', 'USCE guide', 'IMG USMLE'],
  openGraph: {
    title: 'IMG Resources – Guide for International Medical Graduates | MedStack',
    description: 'Everything IMGs need to know about matching into US residency programs.',
    type: 'website',
  },
}

export default function IMGResourcesLayout({ children }: { children: React.ReactNode }) {
  return children
}
