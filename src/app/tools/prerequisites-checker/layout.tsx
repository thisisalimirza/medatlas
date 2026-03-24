import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Medical School Prerequisites Checker | MedAtlas',
  description: 'Track your medical school prerequisite courses. Check off completed requirements for biology, chemistry, physics, and more. Free prerequisite tracker for pre-med students.',
  keywords: ['medical school prerequisites', 'pre-med requirements', 'med school prerequisite checker', 'pre-med course requirements', 'BCPM courses'],
  openGraph: {
    title: 'Medical School Prerequisites Checker | MedAtlas',
    description: 'Track and verify your medical school prerequisite courses.',
    type: 'website',
  },
}

export default function PrerequisitesCheckerLayout({ children }: { children: React.ReactNode }) {
  return children
}
