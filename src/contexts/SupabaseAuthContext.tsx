'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  username: string
  display_name: string
  stage: string
  bio: string
  location_city: string
  location_state: string
  undergraduate_school: string
  medical_school: string
  graduation_year: number
  is_paid: boolean
  created_at: string
}

interface AuthContextType {
  user: UserProfile | null
  session: Session | null
  loading: boolean
  sendMagicLink: (email: string, stage?: string, displayName?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get initial session with better error handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        setSession(session)
        if (session?.user) {
          await loadUserProfile(session.user)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timeout, setting loading to false')
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (!mounted) return

      console.log('Auth state change:', event, session?.user?.email)
      setSession(session)
      
      if (session?.user) {
        await loadUserProfile(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  // Periodically check auth state to catch any issues
  useEffect(() => {
    const checkAuthPeriodically = setInterval(async () => {
      // Only check if we think we have a user but no session, or vice versa
      if ((user && !session) || (!user && session)) {
        console.log('Auth state mismatch detected, attempting recovery...')
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        if (currentSession && currentSession.user && !user) {
          console.log('Recovering user from session...')
          await loadUserProfile(currentSession.user)
        } else if (!currentSession && user) {
          console.log('Session lost, clearing user...')
          setUser(null)
          setSession(null)
        }
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(checkAuthPeriodically)
  }, [user, session])

  const loadUserProfile = async (authUser: SupabaseUser, retryCount = 0) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error) {
        console.error('Error loading user profile:', error)
        
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116' && retryCount === 0) {
          console.log('Profile not found, attempting to create...')
          try {
            const { data: newProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert({
                id: authUser.id,
                email: authUser.email || '',
                username: authUser.email?.split('@')[0] || '',
                display_name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || '',
                stage: authUser.user_metadata?.stage || 'premed',
                bio: '',
                location_city: '',
                location_state: '',
                undergraduate_school: '',
                medical_school: '',
                graduation_year: 0,
                is_paid: false
              })
              .select()
              .single()

            if (createError) {
              console.error('Error creating profile:', createError)
              setUser(null)
            } else {
              setUser(newProfile)
            }
          } catch (createError) {
            console.error('Error creating profile:', createError)
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } else {
        setUser(profile)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const sendMagicLink = async (email: string, stage?: string, displayName?: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            stage: stage || 'premed',
            display_name: displayName || email.split('@')[0]
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Magic link error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const refreshUser = async () => {
    try {
      // First try to refresh the session
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Error refreshing session:', error)
        // Fallback to getting current session
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        if (currentSession?.user) {
          await loadUserProfile(currentSession.user)
        }
      } else if (refreshedSession?.user) {
        setSession(refreshedSession)
        await loadUserProfile(refreshedSession.user)
      }
    } catch (error) {
      console.error('Error in refreshUser:', error)
      // Last resort - check if we have a session
      if (session?.user) {
        await loadUserProfile(session.user)
      }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      sendMagicLink,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}