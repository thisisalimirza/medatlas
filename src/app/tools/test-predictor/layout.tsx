import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Test Value Predictor – PPV & NPV Calculator for Physicians | MedStack',
  description: 'Quickly calculate the true probability a positive or negative test result is accurate for your patient. Uses Bayes\' theorem with pre-loaded sensitivity/specificity data for common clinical tests.',
  keywords: ['PPV calculator', 'NPV calculator', 'positive predictive value', 'negative predictive value', 'Bayes theorem clinical', 'test accuracy calculator', 'physician decision support'],
  openGraph: {
    title: 'Test Value Predictor | MedStack',
    description: 'Find out how much to trust a test result — get the real probability in seconds.',
    type: 'website',
  },
}

export default function TestPredictorLayout({ children }: { children: React.ReactNode }) {
  return children
}
