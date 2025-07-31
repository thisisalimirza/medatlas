#!/usr/bin/env node

/**
 * Script to populate the medical schools data into Supabase
 * This script reads from medical_schools_data.json and inserts into the places table
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function populateMedicalSchools() {
  try {
    console.log('🏥 Starting medical schools population...')
    
    // Read the JSON data
    const jsonPath = path.join(__dirname, '..', 'medical_schools_data.json')
    const jsonData = fs.readFileSync(jsonPath, 'utf8')
    const schools = JSON.parse(jsonData)
    
    console.log(`📊 Found ${schools.length} medical schools to insert`)
    
    // First, check if we already have data
    const { count, error: countError } = await supabase
      .from('places')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'school')
    
    if (countError) {
      console.error('❌ Error checking existing data:', countError)
      return
    }
    
    console.log(`📍 Current medical schools in database: ${count}`)
    
    if (count > 0) {
      console.log('⚠️  Database already contains medical school data.')
      console.log('   To prevent duplicates, this script will clear existing schools first.')
      console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...')
      
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Clear existing medical schools
      const { error: deleteError } = await supabase
        .from('places')
        .delete()
        .eq('type', 'school')
      
      if (deleteError) {
        console.error('❌ Error clearing existing data:', deleteError)
        return
      }
      
      console.log('🗑️  Cleared existing medical school data')
    }
    
    // Transform the data to match our database schema
    const transformedSchools = schools.map(school => {
      // Parse JSON strings in the original data
      let tags = []
      let metrics = {}
      let scores = {}
      
      try {
        tags = JSON.parse(school.tags || '[]')
      } catch (e) {
        console.warn(`Warning: Invalid tags JSON for ${school.name}:`, school.tags)
      }
      
      try {
        metrics = JSON.parse(school.metrics || '{}')
      } catch (e) {
        console.warn(`Warning: Invalid metrics JSON for ${school.name}:`, school.metrics)
      }
      
      try {
        scores = JSON.parse(school.scores || '{}')
      } catch (e) {
        console.warn(`Warning: Invalid scores JSON for ${school.name}:`, school.scores)
      }
      
      return {
        // Don't include id - let PostgreSQL auto-generate it
        slug: school.slug,
        name: school.name,
        type: school.type,
        institution: school.institution,
        city: school.city,
        state: school.state,
        country: school.country,
        lat: school.lat,
        lng: school.lng,
        photo_url: school.photo_url,
        tags: tags,
        rank_overall: school.rank_overall,
        metrics: metrics,
        scores: scores
        // created_at and updated_at will be set automatically
      }
    })
    
    console.log('🔄 Transformed data, beginning insert...')
    
    // Insert in batches to avoid overwhelming the database
    const BATCH_SIZE = 50
    let inserted = 0
    let errors = []
    
    for (let i = 0; i < transformedSchools.length; i += BATCH_SIZE) {
      const batch = transformedSchools.slice(i, i + BATCH_SIZE)
      
      const { data, error } = await supabase
        .from('places')
        .insert(batch)
        .select('id, name')
      
      if (error) {
        console.error(`❌ Batch ${Math.floor(i/BATCH_SIZE) + 1} failed:`, error)
        errors.push({ batch: Math.floor(i/BATCH_SIZE) + 1, error })
      } else {
        inserted += data.length
        console.log(`✅ Batch ${Math.floor(i/BATCH_SIZE) + 1}: Inserted ${data.length} schools (Total: ${inserted}/${transformedSchools.length})`)
      }
    }
    
    console.log('\n🎉 Medical schools population complete!')
    console.log(`✅ Successfully inserted: ${inserted} schools`)
    
    if (errors.length > 0) {
      console.log(`❌ Failed batches: ${errors.length}`)
      errors.forEach(err => {
        console.log(`   Batch ${err.batch}: ${err.error.message}`)
      })
    }
    
    // Verify the final count
    const { count: finalCount, error: finalCountError } = await supabase
      .from('places')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'school')
    
    if (!finalCountError) {
      console.log(`📊 Final count in database: ${finalCount} medical schools`)
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
populateMedicalSchools()
  .then(() => {
    console.log('🏁 Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })