import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Medical School Grade Tracker – GPA Calculator & Board Scores | MedAtlas',
  description: 'Track your medical school grades, GPA, USMLE Step scores, COMLEX scores, and NBME shelf exams. Supports letter grades, Pass/Fail, and Honors systems. Free for medical students.',
  keywords: ['medical school GPA calculator', 'grade tracker med school', 'USMLE score tracker', 'NBME shelf scores', 'medical school transcript', 'preclinical grades', 'clerkship grades'],
  openGraph: {
    title: 'Medical School Grade Tracker | MedAtlas',
    description: 'Track grades, GPA trends, and board exam scores throughout medical school.',
    type: 'website',
  },
}

export default function GradesLayout({ children }: { children: React.ReactNode }) {
  return children
}
