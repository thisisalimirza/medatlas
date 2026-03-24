import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Physician Salary Negotiator – Compensation Benchmarks & Strategy | MedStack',
  description: 'Negotiate your physician salary with specialty-specific benchmarks, regional adjustments, total compensation calculator, and expert negotiation strategies. Pro feature.',
  keywords: ['physician salary negotiation', 'doctor salary benchmarks', 'physician compensation data', 'medical salary calculator', 'attending salary by specialty'],
  openGraph: {
    title: 'Physician Salary Negotiator | MedStack',
    description: 'Data-driven salary benchmarks and negotiation strategies for physicians.',
    type: 'website',
  },
}

export default function SalaryNegotiatorLayout({ children }: { children: React.ReactNode }) {
  return children
}
