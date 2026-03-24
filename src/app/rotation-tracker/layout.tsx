import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clinical Rotation Tracker – Log Hours, Procedures & Evaluations | MedAtlas',
  description: 'Track your clinical rotations with procedure logs, hours tracking, shelf exam scores, and self-evaluations. Built for MS3 and MS4 medical students. Free rotation management tool.',
  keywords: ['clinical rotation tracker', 'medical student rotation log', 'procedure log medical school', 'clerkship tracker', 'shelf exam scores', 'clinical hours tracker', 'rotation evaluation'],
  openGraph: {
    title: 'Clinical Rotation Tracker | MedAtlas',
    description: 'Track clinical rotations, procedures, hours, and evaluations throughout your clerkship years.',
    type: 'website',
  },
}

export default function RotationTrackerLayout({ children }: { children: React.ReactNode }) {
  return children
}
