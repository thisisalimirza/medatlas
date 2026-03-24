import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ERAS Application Manager – Timeline, Checklist & Cost Calculator | MedAtlas',
  description: 'Manage your ERAS residency application with timeline tracking, document checklists, application status management, and cost estimation. Free for medical students.',
  keywords: ['ERAS application manager', 'residency application timeline', 'ERAS cost calculator', 'ERAS checklist', 'residency application tracker', 'ERAS deadlines'],
  openGraph: {
    title: 'ERAS Application Manager | MedAtlas',
    description: 'Track your ERAS application timeline, documents, and costs in one place.',
    type: 'website',
  },
}

export default function ERASLayout({ children }: { children: React.ReactNode }) {
  return children
}
