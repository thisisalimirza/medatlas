import { db } from './database'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'medatlas-secret-key-change-in-production'
)

export interface AuthUser {
  id: number
  email: string
  stage: string
  display_name?: string
  is_paid: boolean
  created_at: string
}

// Create user account
export async function createUser(data: {
  email: string
  password: string
  stage: string
  display_name?: string
}): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email)
    if (existingUser) {
      return { success: false, error: 'User already exists' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Insert user
    const result = db.prepare(`
      INSERT INTO users (email, password_hash, stage, display_name, is_paid)
      VALUES (?, ?, ?, ?, 0)
    `).run(data.email, hashedPassword, data.stage, data.display_name || null)

    // Get created user
    const user = db.prepare(`
      SELECT id, email, stage, display_name, is_paid, created_at 
      FROM users WHERE id = ?
    `).get(result.lastInsertRowid) as AuthUser

    return { success: true, user }
  } catch (error) {
    console.error('Create user error:', error)
    return { success: false, error: 'Failed to create account' }
  }
}

// Authenticate user
export async function authenticateUser(
  email: string, 
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const user = db.prepare(`
      SELECT id, email, password_hash, stage, display_name, is_paid, created_at
      FROM users WHERE email = ?
    `).get(email) as any

    if (!user) {
      return { success: false, error: 'Invalid credentials' }
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return { success: false, error: 'Invalid credentials' }
    }

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user
    return { success: true, user: userWithoutPassword }
  } catch (error) {
    console.error('Auth error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

// Create JWT token
export async function createToken(user: AuthUser): Promise<string> {
  return await new SignJWT({ 
    id: user.id, 
    email: user.email,
    stage: user.stage,
    isPaid: user.is_paid 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .setIssuedAt()
    .sign(JWT_SECRET)
}

// Verify JWT token
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    // Get fresh user data from database
    const user = db.prepare(`
      SELECT id, email, stage, display_name, is_paid, created_at
      FROM users WHERE id = ?
    `).get(payload.id) as AuthUser

    return user || null
  } catch (error) {
    console.error('Token verify error:', error)
    return null
  }
}

// Get current user from request
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) return null
    
    return await verifyToken(token)
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// Update user paid status
export function updateUserPaidStatus(userId: number, isPaid: boolean): boolean {
  try {
    db.prepare('UPDATE users SET is_paid = ? WHERE id = ?').run(isPaid ? 1 : 0, userId)
    return true
  } catch (error) {
    console.error('Update paid status error:', error)
    return false
  }
}

// Get user stats for community growth
export function getUserStats(): {
  totalUsers: number
  paidUsers: number
  newUsersThisWeek: number
  usersByStage: Record<string, number>
} {
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
  const paidUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_paid = 1').get() as { count: number }
  const newUsersThisWeek = db.prepare(`
    SELECT COUNT(*) as count FROM users 
    WHERE created_at > datetime('now', '-7 days')
  `).get() as { count: number }
  
  const stageStats = db.prepare(`
    SELECT stage, COUNT(*) as count 
    FROM users 
    GROUP BY stage
  `).all() as { stage: string; count: number }[]

  const usersByStage = stageStats.reduce((acc, { stage, count }) => {
    acc[stage] = count
    return acc
  }, {} as Record<string, number>)

  return {
    totalUsers: totalUsers.count,
    paidUsers: paidUsers.count,
    newUsersThisWeek: newUsersThisWeek.count,
    usersByStage
  }
}