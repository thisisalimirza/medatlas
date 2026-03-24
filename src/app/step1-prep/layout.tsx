import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'USMLE Step 1 & Step 2 Study Planner – Free Board Prep Tool | MedAtlas',
  description: 'Generate a personalized USMLE Step 1 or Step 2 CK study plan. Compare resources (UWorld, First Aid, Pathoma, Anki), get weekly schedules, and practice test strategies. Free for medical students.',
  keywords: ['USMLE Step 1 study plan', 'Step 2 CK study schedule', 'board exam prep', 'UWorld study plan', 'medical student board prep', 'USMLE resources', 'Step 1 study timeline'],
  openGraph: {
    title: 'USMLE Board Exam Study Planner | MedAtlas',
    description: 'Personalized USMLE Step 1 & Step 2 CK study plans with resource guides, weekly schedules, and practice test strategies.',
    type: 'website',
  },
}

export default function StepPrepLayout({ children }: { children: React.ReactNode }) {
  return children
}
