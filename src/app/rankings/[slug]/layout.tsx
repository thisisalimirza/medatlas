import type { Metadata } from 'next'
import { getRankingPageBySlug, getAllRankingPages } from '@/lib/rankings-data'

export async function generateStaticParams() {
  return getAllRankingPages().map(page => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = getRankingPageBySlug(slug)

  if (!page) {
    return {
      title: 'Medical School Rankings',
      description: 'Compare and rank medical schools across the United States.',
    }
  }

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical: `https://mymedstack.com/rankings/${slug}`,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `https://mymedstack.com/rankings/${slug}`,
      type: 'website',
      siteName: 'MedStack',
    },
  }
}

export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return children
}
