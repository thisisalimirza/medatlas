import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Medical School GPA Calculator – Science & Cumulative GPA | MedStack',
  description: 'Calculate your science GPA (BCPM), cumulative GPA, and non-science GPA for medical school applications. Supports AMCAS grade conversions. Free for pre-med students.',
  keywords: ['medical school GPA calculator', 'science GPA calculator', 'BCPM GPA', 'AMCAS GPA', 'pre-med GPA calculator', 'cumulative GPA'],
  openGraph: {
    title: 'Medical School GPA Calculator | MedStack',
    description: 'Calculate your science and cumulative GPA for medical school applications.',
    type: 'website',
  },
}

export default function GPACalculatorLayout({ children }: { children: React.ReactNode }) {
  return children
}
