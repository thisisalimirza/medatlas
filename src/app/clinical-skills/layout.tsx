import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clinical Skills Tracker for Medical Students | MedAtlas',
  description: 'Track your clinical skills progress throughout medical school. Log procedures, clinical encounters, and skill milestones to stay on top of your clinical training requirements.',
  keywords: ['clinical skills tracker', 'medical student skills', 'clinical encounters log', 'procedure log medical school', 'clinical competencies', 'medical school clinical requirements'],
  openGraph: {
    title: 'Clinical Skills Tracker for Medical Students | MedAtlas',
    description: 'Track clinical skills, procedures, and encounters throughout medical school.',
    type: 'website',
    siteName: 'MedAtlas',
  },
}

export default function ClinicalSkillsLayout({ children }: { children: React.ReactNode }) {
  return children
}
