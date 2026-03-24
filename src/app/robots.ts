import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/auth/',
          '/admin/',
          '/api/',
          '/dashboard/',
          '/profile/',
          '/payment-success/',
        ],
      },
    ],
    sitemap: 'https://mymedstack.com/sitemap.xml',
  }
}
