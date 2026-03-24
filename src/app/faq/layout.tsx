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

// FAQ structured data for Google rich snippets — all hardcoded strings, safe to serialize
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is MedStack?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MedStack is a comprehensive platform for pre-med students, medical students, residents, and attending physicians. We provide tools, resources, and community features to help you navigate your medical career journey.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does MedStack cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Starting at $20/year, MedStack Pro gives you full access to all premium features including detailed data, community access, and advanced tools.',
      },
    },
    {
      '@type': 'Question',
      name: "What's included in the free version?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The free version includes basic school browsing, limited access to calculators, and the ability to view basic school information. Upgrading to Pro unlocks detailed reviews, advanced tools, and community features.',
      },
    },
    {
      '@type': 'Question',
      name: 'How accurate are the GPA and MCAT calculators?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our calculators use the most current AMCAS and AACOMAS conversion formulas. For MCAT scoring, we use official AAMC scoring guidelines.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a money-back guarantee?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes! We offer a 30-day money-back guarantee. If you're not satisfied with MedStack Pro, contact us within 30 days for a full refund.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I access MedStack on mobile?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! MedStack is fully responsive and works great on mobile devices.',
      },
    },
  ],
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  )
}
