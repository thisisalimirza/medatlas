import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore Medical Schools & Residencies on the Map | MedStack',
  description: 'Discover medical schools, residency programs, and rotation sites on an interactive map. Filter by location, specialty, MCAT score, acceptance rate, and more.',
  keywords: ['medical school map', 'residency program map', 'find medical schools near me', 'medical school locations', 'residency program locations', 'interactive medical school map'],
  openGraph: {
    title: 'Explore Medical Schools & Residencies on the Map | MedStack',
    description: 'Discover medical schools and residency programs on an interactive map with powerful filters.',
    type: 'website',
    siteName: 'MedStack',
  },
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children
}
