import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { fetchWikipediaImage } from '@/lib/wikipedia'

const PLACEHOLDER_PATTERNS = [
  'placehold.co',
  'placeholder',
  'example.com',
  'via.placeholder',
]

/**
 * POST /api/update-images
 *
 * Admin endpoint: fetches Wikipedia images for all places that have
 * missing or placeholder photo_urls and updates them in Supabase.
 *
 * Requires header: x-admin-key matching env ADMIN_API_KEY
 *
 * Query params:
 *   ?dry_run=true  — preview changes without writing to DB
 *   ?limit=10      — max number of places to process (default 50)
 */
export async function POST(request: NextRequest) {
  try {
    // --- Auth check ---
    const adminKey = process.env.ADMIN_API_KEY
    const providedKey = request.headers.get('x-admin-key')

    if (!adminKey || providedKey !== adminKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const dryRun = searchParams.get('dry_run') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)

    // --- Fetch places with missing / placeholder images ---
    const { data: places, error } = await supabaseAdmin
      .from('places')
      .select('id, name, institution, photo_url')
      .order('rank_overall', { ascending: false })
      .limit(1000)

    if (error) {
      console.error('Supabase fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch places from Supabase' },
        { status: 500 }
      )
    }

    // Filter to places that need an image
    const needsImage = (places || []).filter((p: any) => {
      if (!p.photo_url) return true
      const url = p.photo_url.toLowerCase()
      return PLACEHOLDER_PATTERNS.some(pattern => url.includes(pattern))
    })

    const toProcess = needsImage.slice(0, limit)

    const results: Array<{
      id: string
      name: string
      status: 'updated' | 'no_image_found' | 'error'
      imageUrl?: string
    }> = []

    // --- Process each place ---
    for (const place of toProcess) {
      // Small delay to be respectful to Wikipedia API
      await new Promise(resolve => setTimeout(resolve, 200))

      try {
        // Try the place name first, then the institution name
        let imageUrl = await fetchWikipediaImage(place.name)

        if (!imageUrl && place.institution && place.institution !== place.name) {
          imageUrl = await fetchWikipediaImage(place.institution)
        }

        if (!imageUrl) {
          results.push({ id: place.id, name: place.name, status: 'no_image_found' })
          continue
        }

        if (!dryRun) {
          const { error: updateError } = await supabaseAdmin
            .from('places')
            .update({ photo_url: imageUrl })
            .eq('id', place.id)

          if (updateError) {
            console.error(`Failed to update ${place.name}:`, updateError)
            results.push({ id: place.id, name: place.name, status: 'error' })
            continue
          }
        }

        results.push({ id: place.id, name: place.name, status: 'updated', imageUrl })
      } catch (err) {
        console.error(`Error processing ${place.name}:`, err)
        results.push({ id: place.id, name: place.name, status: 'error' })
      }
    }

    const summary = {
      success: true,
      dryRun,
      totalPlaces: (places || []).length,
      needingImages: needsImage.length,
      processed: toProcess.length,
      updated: results.filter(r => r.status === 'updated').length,
      noImageFound: results.filter(r => r.status === 'no_image_found').length,
      errors: results.filter(r => r.status === 'error').length,
      results,
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('update-images error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
