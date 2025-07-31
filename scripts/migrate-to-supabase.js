const Database = require('better-sqlite3')
const { createClient } = require('@supabase/supabase-js')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const dbPath = path.join(process.cwd(), 'medatlas.db')
const db = new Database(dbPath)

async function migrateData() {
  try {
    console.log('Starting data migration from SQLite to Supabase...')

    // 1. Migrate places
    console.log('Migrating places...')
    const places = db.prepare('SELECT * FROM places').all()
    
    if (places.length > 0) {
      // Use upsert to handle duplicates
      const { error } = await supabase
        .from('places')
        .upsert(places.map(place => ({
          id: place.id,
          slug: place.slug,
          name: place.name,
          type: place.type,
          institution: place.institution,
          city: place.city,
          state: place.state,
          country: place.country,
          lat: place.lat,
          lng: place.lng,
          photo_url: place.photo_url,
          tags: JSON.parse(place.tags || '[]'),
          rank_overall: place.rank_overall,
          metrics: JSON.parse(place.metrics || '{}'),
          scores: JSON.parse(place.scores || '{}'),
          created_at: place.created_at,
          updated_at: place.updated_at
        })), {
          onConflict: 'id'
        })
      
      if (error) {
        console.error('Error migrating places:', error)
      } else {
        console.log(`Migrated ${places.length} places`)
      }
    } else {
      console.log('No places to migrate')
    }

    // 2. Migrate users (create user_profiles for existing auth users)
    console.log('Note: Users will need to be migrated manually through Supabase Auth')
    console.log('User profiles will be created automatically when users sign up')

    // 3. Show summary of data that needs manual migration
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count
    const reviewCount = db.prepare('SELECT COUNT(*) as count FROM reviews').get().count
    const checkinCount = db.prepare('SELECT COUNT(*) as count FROM checkins').get().count
    const favoriteCount = db.prepare('SELECT COUNT(*) as count FROM favorites').get().count

    console.log('\nMigration Summary:')
    console.log(`✅ Places: ${places.length} migrated`)
    console.log(`⚠️  Users: ${userCount} (need to re-register through Supabase Auth)`)
    console.log(`⚠️  Reviews: ${reviewCount} (will be empty until users re-register)`)
    console.log(`⚠️  Checkins: ${checkinCount} (will be empty until users re-register)`)
    console.log(`⚠️  Favorites: ${favoriteCount} (will be empty until users re-register)`)

    console.log('\nMigration completed! Users will need to:')
    console.log('1. Create new accounts through Supabase Auth')
    console.log('2. Re-add their favorites and school lists')
    console.log('3. Re-enter their stats and preferences')

  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    db.close()
  }
}

// Run migration
migrateData()