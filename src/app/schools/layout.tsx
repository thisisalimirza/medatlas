import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Medical School Directory & Rankings | MedAtlas',
  description: 'Browse and compare all U.S. medical schools with admissions data, MCAT averages, GPA requirements, tuition costs, and acceptance rates. Find your best-fit medical school.',
  keywords: ['medical school rankings', 'medical school directory', 'med school list', 'medical school admissions', 'MCAT requirements by school', 'medical school acceptance rates', 'best medical schools', 'medical school comparison'],
  openGraph: {
    title: 'Medical School Directory & Rankings | MedAtlas',
    description: 'Browse and compare all U.S. medical schools with admissions stats, MCAT averages, and acceptance rates.',
    type: 'website',
    siteName: 'MedAtlas',
  },
}

export default function SchoolsLayout({ children }: { children: React.ReactNode }) {
  return children
}
