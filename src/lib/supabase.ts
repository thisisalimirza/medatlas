import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a dummy client if environment variables are missing (for build time)
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables - using dummy client')
    // Return a dummy client for build time that throws errors on actual usage
    return {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        getUser: () => Promise.reject(new Error('Supabase not configured')),
        signIn: () => Promise.reject(new Error('Supabase not configured')),
        signOut: () => Promise.reject(new Error('Supabase not configured')),
      },
      from: () => ({
        select: () => Promise.reject(new Error('Supabase not configured')),
        insert: () => Promise.reject(new Error('Supabase not configured')),
        update: () => Promise.reject(new Error('Supabase not configured')),
        delete: () => Promise.reject(new Error('Supabase not configured')),
      })
    } as any
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}

export const supabase = createSupabaseClient()

// For server-side operations
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Missing Supabase server environment variables - using dummy client')
    // Return a dummy client that throws errors on actual usage
    return {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        getUser: () => Promise.reject(new Error('Supabase server not configured')),
      },
      from: () => ({
        select: () => Promise.reject(new Error('Supabase server not configured')),
        insert: () => Promise.reject(new Error('Supabase server not configured')),
        update: () => Promise.reject(new Error('Supabase server not configured')),
        delete: () => Promise.reject(new Error('Supabase server not configured')),
      })
    } as any
  }
  
  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}