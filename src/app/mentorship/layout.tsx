import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Medical School Mentorship Program | MedAtlas',
  description: 'Connect with mentors in medicine. Find guidance from upper-year medical students, residents, and attending physicians for medical school admissions, board exams, and career planning.',
  keywords: ['medical school mentor', 'pre-med mentorship', 'medical student mentorship', 'physician mentor', 'residency mentor', 'medical career guidance'],
  openGraph: {
    title: 'Medical School Mentorship Program | MedAtlas',
    description: 'Connect with mentors in medicine for admissions guidance, board prep, and career planning.',
    type: 'website',
    siteName: 'MedAtlas',
  },
}

export default function MentorshipLayout({ children }: { children: React.ReactNode }) {
  return children
}
