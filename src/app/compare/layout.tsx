import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare Medical Schools & Residency Programs Side by Side | MedAtlas',
  description: 'Compare medical schools and residency programs head-to-head. See tuition, MCAT averages, acceptance rates, match rates, and rankings in a side-by-side comparison.',
  keywords: ['compare medical schools', 'medical school comparison tool', 'compare residency programs', 'medical school vs', 'school comparison', 'residency comparison', 'medical school tuition comparison'],
  openGraph: {
    title: 'Compare Medical Schools & Residency Programs | MedAtlas',
    description: 'Compare medical schools and residency programs side by side with detailed stats.',
    type: 'website',
    siteName: 'MedAtlas',
  },
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children
}
