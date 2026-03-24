import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pre-Med Timeline – Year-by-Year Guide to Medical School | MedAtlas',
  description: 'Plan your pre-med journey from freshman year through application. Year-by-year timeline with coursework, extracurriculars, MCAT prep, and application milestones.',
  keywords: ['pre-med timeline', 'pre-med roadmap', 'medical school preparation timeline', 'pre-med checklist by year', 'when to take MCAT'],
  openGraph: {
    title: 'Pre-Med Timeline – Year-by-Year Guide | MedAtlas',
    description: 'Your complete pre-med roadmap from freshman year to medical school acceptance.',
    type: 'website',
  },
}

export default function PremedTimelineLayout({ children }: { children: React.ReactNode }) {
  return children
}
