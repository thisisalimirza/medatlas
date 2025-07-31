import Database from 'better-sqlite3'
import { Place } from '@/types'
import path from 'path'

const dbPath = path.join(process.cwd(), 'medatlas.db')
const db = new Database(dbPath)

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL')
db.pragma('synchronous = NORMAL')
db.pragma('cache_size = 1000000')
db.pragma('foreign_keys = ON')

// Initialize database schema
export function initDatabase() {
  // Create places table
  db.exec(`
    CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      type TEXT CHECK(type IN ('school','rotation','residency')) NOT NULL,
      institution TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      country TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      photo_url TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      rank_overall REAL,
      metrics TEXT NOT NULL DEFAULT '{}',
      scores TEXT NOT NULL DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      stage TEXT NOT NULL,
      display_name TEXT,
      avatar_url TEXT,
      is_paid INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create checkins table
  db.exec(`
    CREATE TABLE IF NOT EXISTS checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      place_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('now','soon','been')) NOT NULL,
      private INTEGER DEFAULT 0,
      eta_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, place_id, status),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (place_id) REFERENCES places (id)
    )
  `)

  // Create reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      place_id INTEGER NOT NULL,
      rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      body TEXT NOT NULL,
      is_anonymous INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, place_id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (place_id) REFERENCES places (id)
    )
  `)

  // Create photos table
  db.exec(`
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      place_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (place_id) REFERENCES places (id)
    )
  `)

  // Create favorites table
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      place_id INTEGER NOT NULL,
      notes TEXT,
      application_deadline TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, place_id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (place_id) REFERENCES places (id)
    )
  `)

  // Create payments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      stripe_session_id TEXT,
      amount_cents INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `)

  // Create user_stats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mcat INTEGER,
      gpa REAL,
      state TEXT,
      research_months INTEGER DEFAULT 0,
      clinical_hours INTEGER DEFAULT 0,
      volunteer_hours INTEGER DEFAULT 0,
      shadowing_hours INTEGER DEFAULT 0,
      leadership BOOLEAN DEFAULT FALSE,
      publications INTEGER DEFAULT 0,
      specialty_interest TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `)

  // Create school_list table
  db.exec(`
    CREATE TABLE IF NOT EXISTS school_list (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      place_id INTEGER NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('reach', 'target', 'safety')),
      acceptance_odds REAL DEFAULT 0,
      notes TEXT,
      application_status TEXT DEFAULT 'planning' CHECK (
        application_status IN (
          'planning', 'primary_submitted', 'secondary_received', 
          'secondary_submitted', 'interview_invite', 'interviewed', 
          'accepted', 'waitlisted', 'rejected'
        )
      ),
      added_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (place_id) REFERENCES places (id),
      UNIQUE(user_id, place_id)
    )
  `)

  // Create FTS5 search index
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS place_search USING fts5(
      slug, name, city, tags,
      content='places',
      content_rowid='id'
    )
  `)

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_places_type ON places(type);
    CREATE INDEX IF NOT EXISTS idx_places_location ON places(country, state, city);
    CREATE INDEX IF NOT EXISTS idx_places_rank ON places(rank_overall);
    CREATE INDEX IF NOT EXISTS idx_checkins_place ON checkins(place_id, status);
    CREATE INDEX IF NOT EXISTS idx_reviews_place ON reviews(place_id);
  `)
}

// Calculate and update overall rankings
export function updateRankings() {
  const places = db.prepare(`
    SELECT id, scores FROM places WHERE scores != '{}'
  `).all()

  const updateStmt = db.prepare(`
    UPDATE places SET rank_overall = ? WHERE id = ?
  `)

  const calculateOverallScore = (scores: any) => {
    return (
      0.25 * (scores.quality_of_training / 10) +
      0.20 * (scores.community_score / 10) +
      0.20 * (scores.lifestyle / 10) +
      0.20 * (1 - scores.burnout / 10) + // Inverse burnout (lower is better)
      0.15 * (scores.match_strength / 10)
    ) * 10
  }

  for (const place of places) {
    try {
      const placeData = place as { id: number; scores: string }
      const scores = JSON.parse(placeData.scores)
      const overallScore = calculateOverallScore(scores)
      updateStmt.run(overallScore, placeData.id)
    } catch (error) {
      console.error(`Error updating ranking for place ${(place as any).id}:`, error)
    }
  }
}

// Populate FTS index
export function populateSearchIndex() {
  db.exec(`
    INSERT OR REPLACE INTO place_search(rowid, slug, name, city, tags)
    SELECT id, slug, name, city, tags FROM places
  `)
}

export { db }