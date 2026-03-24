import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Medical Summer Programs & Research Opportunities | MedStack',
  description: 'Find summer research programs, clinical experiences, and enrichment opportunities for pre-med and medical students. Browse programs by type, deadline, and eligibility.',
  keywords: ['medical summer programs', 'pre-med summer research', 'medical student research programs', 'summer clinical experience', 'NIH summer internship medicine'],
  openGraph: {
    title: 'Medical Summer Programs & Research Opportunities | MedStack',
    description: 'Discover summer programs and research opportunities for aspiring physicians.',
    type: 'website',
  },
}

export default function SummerProgramsLayout({ children }: { children: React.ReactNode }) {
  return children
}
