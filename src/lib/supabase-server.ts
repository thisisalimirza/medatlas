import { createClient } from '@supabase/supabase-js'
import { cookies, headers } from 'next/headers'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Helper function to get current authenticated user from Supabase
// Reads access token from Authorization header (preferred) or cookies (fallback)
export async function getCurrentUser() {
  try {
    // Try Authorization header first (sent by client-side fetch calls)
    const headerStore = await headers()
    const authHeader = headerStore.get('authorization')
    let accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    // Fallback to cookies
    if (!accessToken) {
      const cookieStore = await cookies()
      accessToken = cookieStore.get('sb-access-token')?.value || null
    }

    if (!accessToken) return null

    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken)

    if (error || !user) return null

    // Get the user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) return null

    return profile
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}