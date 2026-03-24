import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Medical School Secondary Essay Prompts Database | MedStack',
  description: 'Browse secondary essay prompts from top medical schools. Prepare your responses with prompt databases, word counts, and tips. Free secondary prompts for pre-med students.',
  keywords: ['medical school secondary prompts', 'secondary essay prompts', 'med school secondary questions', 'secondary application prompts', 'medical school essay topics'],
  openGraph: {
    title: 'Medical School Secondary Essay Prompts | MedStack',
    description: 'Browse and prepare for secondary essay prompts from top medical schools.',
    type: 'website',
  },
}

export default function SecondaryPromptsLayout({ children }: { children: React.ReactNode }) {
  return children
}
