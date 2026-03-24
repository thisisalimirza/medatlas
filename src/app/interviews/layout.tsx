import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Residency Interview Tracker – Schedule, Notes & Travel Costs | MedAtlas',
  description: 'Track residency interview invitations, schedules, impressions, and travel costs. Log interview questions, pros and cons, and manage your interview season efficiently. Free for medical students.',
  keywords: ['residency interview tracker', 'interview season management', 'medical school interviews', 'residency application tracker', 'interview questions log', 'ERAS interview tracker'],
  openGraph: {
    title: 'Residency Interview Tracker | MedAtlas',
    description: 'Manage your residency interview season with scheduling, notes, and travel cost tracking.',
    type: 'website',
  },
}

export default function InterviewsLayout({ children }: { children: React.ReactNode }) {
  return children
}
