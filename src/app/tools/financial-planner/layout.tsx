import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Medical Career Financial Planner – Income & Loan Projections | MedAtlas',
  description: 'Plan your financial future as a physician. Project income across specialties, estimate loan repayment timelines, and compare career paths. Free financial planning tool.',
  keywords: ['physician financial planner', 'medical school loan calculator', 'doctor salary projection', 'medical student debt calculator', 'physician income planner'],
  openGraph: {
    title: 'Medical Career Financial Planner | MedAtlas',
    description: 'Project your financial future across different medical career paths.',
    type: 'website',
  },
}

export default function FinancialPlannerLayout({ children }: { children: React.ReactNode }) {
  return children
}
