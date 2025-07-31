import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get user stats
    const stats = db.prepare(`
      SELECT mcat, gpa, state, research_months, clinical_hours, volunteer_hours, 
             shadowing_hours, leadership, publications, specialty_interest
      FROM user_stats 
      WHERE user_id = ?
    `).get(decoded.id)

    return NextResponse.json({
      success: true,
      data: stats || {}
    })
  } catch (error) {
    console.error('Get user stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get user stats' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      mcat,
      gpa,
      state,
      research_months = 0,
      clinical_hours = 0,
      volunteer_hours = 0,
      shadowing_hours = 0,
      leadership = false,
      publications = 0,
      specialty_interest = ''
    } = body

    // Validate required fields
    if (!mcat || !gpa) {
      return NextResponse.json(
        { success: false, error: 'MCAT and GPA are required' },
        { status: 400 }
      )
    }

    // Create user_stats table if it doesn't exist
    db.prepare(`
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
    `).run()

    // Insert or update user stats
    const existing = db.prepare('SELECT id FROM user_stats WHERE user_id = ?').get(decoded.id)
    
    if (existing) {
      db.prepare(`
        UPDATE user_stats 
        SET mcat = ?, gpa = ?, state = ?, research_months = ?, clinical_hours = ?,
            volunteer_hours = ?, shadowing_hours = ?, leadership = ?, publications = ?,
            specialty_interest = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(mcat, gpa, state, research_months, clinical_hours, volunteer_hours, 
             shadowing_hours, leadership, publications, specialty_interest, decoded.id)
    } else {
      db.prepare(`
        INSERT INTO user_stats (user_id, mcat, gpa, state, research_months, clinical_hours,
                               volunteer_hours, shadowing_hours, leadership, publications, specialty_interest)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(decoded.id, mcat, gpa, state, research_months, clinical_hours, volunteer_hours, 
             shadowing_hours, leadership, publications, specialty_interest)
    }

    return NextResponse.json({
      success: true,
      message: 'Stats updated successfully'
    })
  } catch (error) {
    console.error('Update user stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update stats' },
      { status: 500 }
    )
  }
}