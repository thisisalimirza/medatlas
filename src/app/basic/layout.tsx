import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MedAtlas - Basic Test',
  description: 'Basic test page without auth provider',
}

export default function BasicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5; 
          }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}