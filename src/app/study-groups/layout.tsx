import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Medical School Study Groups | MedAtlas',
  description: 'Find and join study groups with fellow medical students. Collaborate on coursework, board prep, and clinical rotations. Connect with peers at your school or across the country.',
  keywords: ['medical school study groups', 'med student study group', 'USMLE study group', 'medical school collaboration', 'study partners medical school'],
  openGraph: {
    title: 'Medical School Study Groups | MedAtlas',
    description: 'Find and join study groups with fellow medical students for coursework and board prep.',
    type: 'website',
    siteName: 'MedAtlas',
  },
}

export default function StudyGroupsLayout({ children }: { children: React.ReactNode }) {
  return children
}
