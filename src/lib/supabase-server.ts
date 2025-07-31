import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Helper function to get current authenticated user from Supabase
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value
    
    if (!accessToken) return null

    // Set the session using the tokens
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