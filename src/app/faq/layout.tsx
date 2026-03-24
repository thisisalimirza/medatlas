import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | MedStack',
  description: 'Get answers to common questions about medical school admissions, the residency match process, MCAT preparation, and how to use MedStack tools for your pre-med and medical school journey.',
  keywords: ['medical school FAQ', 'pre-med questions', 'medical school admissions help', 'residency match FAQ', 'MCAT FAQ', 'MedStack help'],
  openGraph: {
    title: 'Frequently Asked Questions | MedStack',
    description: 'Answers to common questions about medical school admissions, residency matching, and MedStack tools.',
    type: 'website',
    siteName: 'MedStack',
  },
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
