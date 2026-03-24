import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Medical School Application Timeline & Deadlines | MedStack',
  description: 'Complete timeline for medical school applications: AMCAS, AACOMAS, and TMDSAS deadlines, secondary essays, interviews, and decision dates. Free for pre-med students.',
  keywords: ['medical school application timeline', 'AMCAS deadlines', 'medical school application deadlines', 'when to apply medical school', 'AACOMAS timeline'],
  openGraph: {
    title: 'Medical School Application Timeline | MedStack',
    description: 'Never miss a deadline with the complete medical school application timeline.',
    type: 'website',
  },
}

export default function ApplicationTimelineLayout({ children }: { children: React.ReactNode }) {
  return children
}
