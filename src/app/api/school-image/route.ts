import { NextRequest, NextResponse } from 'next/server'
import { fetchWikipediaImage } from '@/lib/wikipedia'

/**
 * GET /api/school-image?name=Harvard+Medical+School
 *
 * Looks up a school on Wikipedia and returns its thumbnail image URL.
 * No API key required — uses the free Wikipedia REST API.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')

    if (!name) {
      return NextResponse.json(
        { imageUrl: null, source: null, error: 'Missing "name" query parameter' },
        { status: 400 }
      )
    }

    const imageUrl = await fetchWikipediaImage(name)

    if (!imageUrl) {
      return NextResponse.json(
        { imageUrl: null, source: null },
        {
          status: 200,
          headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' },
        }
      )
    }

    return NextResponse.json(
      { imageUrl, source: 'wikipedia' },
      {
        status: 200,
        headers: { 'Cache-Control': 'public, max-age=604800, s-maxage=604800' },
      }
    )
  } catch (error) {
    console.error('school-image error:', error)
    return NextResponse.json(
      { imageUrl: null, source: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
