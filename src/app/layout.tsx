import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/SupabaseAuthContext'

export const metadata: Metadata = {
  title: {
    default: 'MedStack - Medical School & Residency Explorer',
    template: '%s | MedStack',
  },
  description: 'Explore and compare medical schools, residency programs, and rotation sites. Free tools for pre-med students including MCAT calculator, GPA calculator, application timeline, and match statistics.',
  keywords: ['medical school', 'residency programs', 'MCAT calculator', 'GPA calculator', 'medical school admissions', 'residency match', 'pre-med tools', 'medical school rankings', 'rotation sites', 'medical school comparison'],
  metadataBase: new URL('https://mymedstack.com'),
  openGraph: {
    title: 'MedStack - Medical School & Residency Explorer',
    description: 'Explore and compare medical schools, residency programs, and rotation sites with free tools for pre-med and medical students.',
    url: 'https://mymedstack.com',
    siteName: 'MedStack',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MedStack - Medical School & Residency Explorer',
    description: 'Explore and compare medical schools, residency programs, and rotation sites with free tools for pre-med and medical students.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://mymedstack.com',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'MedStack',
  url: 'https://mymedstack.com',
  description: 'Explore and compare medical schools, residency programs, and rotation sites. Free tools for pre-med and medical students including MCAT calculator, GPA calculator, application timeline, and match statistics.',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  audience: {
    '@type': 'EducationalAudience',
    educationalRole: 'student',
    audienceType: 'Pre-medical and medical students',
  },
  creator: {
    '@type': 'Organization',
    name: 'MedStack',
    url: 'https://mymedstack.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}