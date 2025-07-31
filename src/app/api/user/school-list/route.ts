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

    // Get user's school list
    const schoolList = db.prepare(`
      SELECT sl.*, p.name as school_name, p.city, p.state
      FROM school_list sl
      JOIN places p ON sl.place_id = p.id
      WHERE sl.user_id = ?
      ORDER BY sl.added_date DESC
    `).all(decoded.id)

    return NextResponse.json({
      success: true,
      data: schoolList
    })
  } catch (error) {
    console.error('Get school list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get school list' },
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
    const { place_id, category, notes = '' } = body

    if (!place_id || !category) {
      return NextResponse.json(
        { success: false, error: 'Place ID and category are required' },
        { status: 400 }
      )
    }

    // Create school_list table if it doesn't exist
    db.prepare(`
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
    `).run()

    // Calculate acceptance odds based on user stats and school data
    const userStats = db.prepare(`
      SELECT mcat, gpa FROM user_stats WHERE user_id = ?
    `).get(decoded.id) as { mcat: number; gpa: number } | undefined

    const school = db.prepare(`
      SELECT metrics 
      FROM places WHERE id = ?
    `).get(place_id) as { metrics: string } | undefined

    let acceptanceOdds = 0
    if (userStats && school && userStats.mcat && userStats.gpa) {
      // Parse school metrics
      let schoolMetrics = {}
      try {
        schoolMetrics = JSON.parse(school.metrics || '{}')
      } catch (e) {
        schoolMetrics = {}
      }
      
      const mcatAvg = (schoolMetrics as any).mcat_avg || 500
      const gpaAvg = (schoolMetrics as any).gpa_avg || 3.0
      const acceptanceRate = (schoolMetrics as any).acceptance_rate || 5
      
      // Simple algorithm to calculate odds
      const mcatDiff = (userStats.mcat - mcatAvg) / 28 // Normalize to ~-1 to 1
      const gpaDiff = (userStats.gpa - gpaAvg) / 1.0 // Normalize to ~-3 to 1
      
      // Adjust base rate based on stats
      const adjustment = (mcatDiff + gpaDiff) * 20 // Can adjust odds by up to ±40%
      acceptanceOdds = Math.max(1, Math.min(95, acceptanceRate + adjustment))
    }

    // Check if already in list
    const existing = db.prepare(`
      SELECT id FROM school_list WHERE user_id = ? AND place_id = ?
    `).get(decoded.id, place_id)

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'School already in your list' },
        { status: 400 }
      )
    }

    // Add to school list
    const result = db.prepare(`
      INSERT INTO school_list (user_id, place_id, category, acceptance_odds, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(decoded.id, place_id, category, Math.round(acceptanceOdds), notes)

    return NextResponse.json({
      success: true,
      data: {
        id: result.lastInsertRowid,
        acceptance_odds: Math.round(acceptanceOdds)
      }
    })
  } catch (error) {
    console.error('Add to school list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add to school list' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, application_status, notes, category } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'School list ID is required' },
        { status: 400 }
      )
    }

    // Update school list entry
    const updates = []
    const values = []
    
    if (application_status) {
      updates.push('application_status = ?')
      values.push(application_status)
    }
    
    if (notes !== undefined) {
      updates.push('notes = ?')
      values.push(notes)
    }
    
    if (category) {
      updates.push('category = ?')
      values.push(category)
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(decoded.id, id)

    db.prepare(`
      UPDATE school_list 
      SET ${updates.join(', ')}
      WHERE user_id = ? AND id = ?
    `).run(...values)

    return NextResponse.json({
      success: true,
      message: 'School list updated successfully'
    })
  } catch (error) {
    console.error('Update school list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update school list' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'School list ID is required' },
        { status: 400 }
      )
    }

    // Remove from school list
    db.prepare(`
      DELETE FROM school_list 
      WHERE user_id = ? AND id = ?
    `).run(decoded.id, id)

    return NextResponse.json({
      success: true,
      message: 'School removed from list'
    })
  } catch (error) {
    console.error('Remove from school list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove from school list' },
      { status: 500 }
    )
  }
}