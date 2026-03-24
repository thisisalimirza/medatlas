import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Medical School Cost Calculator – Tuition & Living Expenses | MedAtlas',
  description: 'Estimate the total cost of medical school including tuition, fees, living expenses, and loan interest. Compare costs across schools. Free calculator for pre-med students.',
  keywords: ['medical school cost calculator', 'med school tuition calculator', 'medical school expenses', 'cost of medical school', 'medical school financial planning'],
  openGraph: {
    title: 'Medical School Cost Calculator | MedAtlas',
    description: 'Calculate the true cost of medical school with our comprehensive cost estimator.',
    type: 'website',
  },
}

export default function CostCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children
}
