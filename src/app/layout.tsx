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
    images: [{
      url: 'https://mymedstack.com/opengraph-image',
      width: 1200,
      height: 630,
      alt: 'MedStack - Medical School & Residency Explorer',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MedStack - Medical School & Residency Explorer',
    description: 'Explore and compare medical schools, residency programs, and rotation sites with free tools for pre-med and medical students.',
    images: ['https://mymedstack.com/opengraph-image'],
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

// Multiple structured data types for rich Google results
const jsonLd = [
  {
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
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MedStack',
    url: 'https://mymedstack.com',
    logo: 'https://mymedstack.com/logo.png',
    sameAs: [],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MedStack',
    url: 'https://mymedstack.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://mymedstack.com/?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Free Medical School Tools',
    itemListElement: [
      { '@type': 'SiteNavigationElement', position: 1, name: 'MCAT Score Calculator', url: 'https://mymedstack.com/tools/mcat-calculator' },
      { '@type': 'SiteNavigationElement', position: 2, name: 'GPA Calculator', url: 'https://mymedstack.com/tools/gpa-calculator' },
      { '@type': 'SiteNavigationElement', position: 3, name: 'Medical School Cost Calculator', url: 'https://mymedstack.com/tools/cost-calculator' },
      { '@type': 'SiteNavigationElement', position: 4, name: 'Medical Specialty Explorer', url: 'https://mymedstack.com/specialties' },
      { '@type': 'SiteNavigationElement', position: 5, name: 'Residency Match Statistics', url: 'https://mymedstack.com/match-stats' },
      { '@type': 'SiteNavigationElement', position: 6, name: 'USMLE Step 1 Study Planner', url: 'https://mymedstack.com/step1-prep' },
      { '@type': 'SiteNavigationElement', position: 7, name: 'Medical School Prerequisites Checker', url: 'https://mymedstack.com/tools/prerequisites-checker' },
      { '@type': 'SiteNavigationElement', position: 8, name: 'Application Timeline', url: 'https://mymedstack.com/tools/application-timeline' },
    ],
  },
]

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