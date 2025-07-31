import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MedAtlas - Medical School Discovery',
  description: 'Find and research medical schools',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}