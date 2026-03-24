import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Physician Contract Analyzer – Red Flags & Negotiation Guide | MedStack',
  description: 'Analyze physician employment contracts clause by clause. Identify red flags, understand non-compete restrictions, tail coverage, and compensation structures. Pro feature.',
  keywords: ['physician contract review', 'doctor employment contract', 'non-compete clause physician', 'tail coverage malpractice', 'physician contract negotiation'],
  openGraph: {
    title: 'Physician Contract Analyzer | MedStack',
    description: 'Understand every clause in your physician employment contract.',
    type: 'website',
  },
}

export default function ContractsLayout({ children }: { children: React.ReactNode }) {
  return children
}
