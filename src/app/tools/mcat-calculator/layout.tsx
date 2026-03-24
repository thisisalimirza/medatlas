import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MCAT Score Calculator & Percentile Estimator | MedAtlas',
  description: 'Calculate your MCAT score, see percentile rankings, and understand how your score compares across sections. Free MCAT calculator for pre-med students.',
  keywords: ['MCAT calculator', 'MCAT score percentile', 'MCAT section scores', 'MCAT score estimator', 'pre-med MCAT tool'],
  openGraph: {
    title: 'MCAT Score Calculator & Percentile Estimator | MedAtlas',
    description: 'Calculate your MCAT score and see where you stand among applicants.',
    type: 'website',
  },
}

export default function MCATCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children
}
