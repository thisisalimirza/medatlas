import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | MedAtlas',
  description: 'Get answers to common questions about medical school admissions, the residency match process, MCAT preparation, and how to use MedAtlas tools for your pre-med and medical school journey.',
  keywords: ['medical school FAQ', 'pre-med questions', 'medical school admissions help', 'residency match FAQ', 'MCAT FAQ', 'MedAtlas help'],
  openGraph: {
    title: 'Frequently Asked Questions | MedAtlas',
    description: 'Answers to common questions about medical school admissions, residency matching, and MedAtlas tools.',
    type: 'website',
    siteName: 'MedAtlas',
  },
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
