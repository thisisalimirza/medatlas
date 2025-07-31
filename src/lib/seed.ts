import { db, initDatabase, updateRankings, populateSearchIndex } from './database'
import { Place } from '@/types'
import seedData from '../../seed_places.json'

export function seedDatabase() {
  console.log('Initializing database...')
  initDatabase()

  console.log('Importing seed data...')
  
  const insertPlace = db.prepare(`
    INSERT OR REPLACE INTO places (
      slug, name, type, institution, city, state, country, 
      lat, lng, photo_url, tags, metrics, scores
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `)

  const insertMany = db.transaction((places: any[]) => {
    for (const place of places) {
      insertPlace.run(
        place.slug,
        place.name,
        place.type,
        place.institution,
        place.city,
        place.state,
        place.country,
        place.lat,
        place.lng,
        place.photo_url,
        JSON.stringify(place.tags || []),
        JSON.stringify(place.metrics || {}),
        JSON.stringify(place.scores || {})
      )
    }
  })

  try {
    insertMany(seedData)
    console.log(`Imported ${seedData.length} places`)
    
    console.log('Updating rankings...')
    updateRankings()
    
    console.log('Populating search index...')
    populateSearchIndex()
    
    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

// Helper function to get all places
export function getAllPlaces(): Place[] {
  const places = db.prepare(`
    SELECT 
      id, slug, name, type, institution, city, state, country,
      lat, lng, photo_url, tags, rank_overall, metrics, scores,
      created_at, updated_at
    FROM places 
    ORDER BY rank_overall DESC
  `).all()

  return places.map(place => {
    const placeData = place as any
    return {
      ...placeData,
      tags: JSON.parse(placeData.tags || '[]'),
      metrics: JSON.parse(placeData.metrics || '{}'),
      scores: JSON.parse(placeData.scores || '{}'),
    } as Place
  })
}

// Helper function to get place by slug
export function getPlaceBySlug(slug: string): Place | null {
  const place = db.prepare(`
    SELECT 
      id, slug, name, type, institution, city, state, country,
      lat, lng, photo_url, tags, rank_overall, metrics, scores,
      created_at, updated_at
    FROM places 
    WHERE slug = ?
  `).get(slug)

  if (!place) return null

  const placeData = place as any
  return {
    ...placeData,
    tags: JSON.parse(placeData.tags || '[]'),
    metrics: JSON.parse(placeData.metrics || '{}'),
    scores: JSON.parse(placeData.scores || '{}'),
  } as Place
}

// Helper function to filter places
export function getFilteredPlaces(filters: {
  type?: string
  search?: string
  limit?: number
  offset?: number
}): { places: Place[]; total: number } {
  let query = `
    SELECT 
      id, slug, name, type, institution, city, state, country,
      lat, lng, photo_url, tags, rank_overall, metrics, scores,
      created_at, updated_at
    FROM places 
    WHERE 1=1
  `
  let countQuery = `SELECT COUNT(*) as total FROM places WHERE 1=1`
  const params: any[] = []

  if (filters.type && filters.type !== 'all') {
    query += ` AND type = ?`
    countQuery += ` AND type = ?`
    params.push(filters.type)
  }

  if (filters.search) {
    query += ` AND (name LIKE ? OR city LIKE ? OR institution LIKE ?)`
    countQuery += ` AND (name LIKE ? OR city LIKE ? OR institution LIKE ?)`
    const searchTerm = `%${filters.search}%`
    params.push(searchTerm, searchTerm, searchTerm)
  }

  query += ` ORDER BY rank_overall DESC`

  if (filters.limit) {
    query += ` LIMIT ?`
    params.push(filters.limit)
    
    if (filters.offset) {
      query += ` OFFSET ?`
      params.push(filters.offset)
    }
  }

  const places = db.prepare(query).all(...params)
  const totalResult = db.prepare(countQuery).get(...params.slice(0, -2)) as { total: number }

  return {
    places: places.map(place => {
      const placeData = place as any
      return {
        ...placeData,
        tags: JSON.parse(placeData.tags || '[]'),
        metrics: JSON.parse(placeData.metrics || '{}'),
        scores: JSON.parse(placeData.scores || '{}'),
      } as Place
    }),
    total: totalResult.total
  }
}