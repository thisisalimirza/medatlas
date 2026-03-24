import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clinical Rotation Sites & Reviews | MedStack',
  description: 'Find and compare clinical rotation sites across the country. Read reviews, see ratings for training quality and lifestyle, and plan your clinical rotations.',
  keywords: ['clinical rotations', 'rotation sites', 'medical school rotations', 'clinical rotation reviews', 'away rotations', 'rotation site ratings', 'best rotation sites'],
  openGraph: {
    title: 'Clinical Rotation Sites & Reviews | MedStack',
    description: 'Find and compare clinical rotation sites with reviews and ratings.',
    type: 'website',
    siteName: 'MedStack',
  },
}

export default function RotationsLayout({ children }: { children: React.ReactNode }) {
  return children
}
