import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Medical Specialty Explorer – Compare Salary, Lifestyle, Match Rates | MedStack',
  description: 'Compare 20+ medical specialties side-by-side. Explore salary ranges, residency competitiveness, lifestyle ratings, match rates, Step scores, and fellowship paths. Free tool for medical students.',
  keywords: ['medical specialty comparison', 'residency match rates', 'doctor salary by specialty', 'medical specialty lifestyle', 'NRMP match data', 'specialty competitiveness', 'IMG friendly specialties'],
  openGraph: {
    title: 'Medical Specialty Explorer | MedStack',
    description: 'Compare medical specialties by salary, match rates, lifestyle, and more. Free interactive tool for medical students.',
    type: 'website',
  },
}

export default function SpecialtyLayout({ children }: { children: React.ReactNode }) {
  return children
}
