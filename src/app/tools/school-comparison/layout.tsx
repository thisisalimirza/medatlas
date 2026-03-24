import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Medical School Comparison Tool – Compare Schools Side by Side | MedStack',
  description: 'Compare medical schools side-by-side on tuition, MCAT scores, GPA, acceptance rates, class size, and more. Free comparison tool for pre-med students.',
  keywords: ['medical school comparison', 'compare medical schools', 'med school rankings comparison', 'medical school statistics', 'best medical schools compare'],
  openGraph: {
    title: 'Medical School Comparison Tool | MedStack',
    description: 'Compare medical schools side-by-side on the metrics that matter most.',
    type: 'website',
  },
}

export default function SchoolComparisonLayout({ children }: { children: React.ReactNode }) {
  return children
}
