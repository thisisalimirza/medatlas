import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/SupabaseAuthContext'

export const metadata: Metadata = {
  title: 'MedAtlas - Medical School & Residency Explorer',
  description: 'Filterable, searchable directory of medical schools, rotation sites, and residency programs with community-driven features.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}