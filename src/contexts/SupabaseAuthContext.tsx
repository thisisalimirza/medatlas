'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  display_name: string
  stage: string
  avatar_url: string
  is_paid: boolean
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: UserProfile | null
  session: Session | null
  loading: boolean
  sendMagicLink: (email: string, stage?: string, displayName?: string) => Promise<{ success: boolean; error?: string }>
  signInWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)
  const profileCacheRef = useRef<Record<string, UserProfile>>({})

  const loadUserProfile = useCallback(async (authUser: SupabaseUser, retryCount = 0) => {
    // Check cache first to avoid redundant fetches
    const cached = profileCacheRef.current[authUser.id]
    if (cached && retryCount === 0) {
      setUser(cached)
      setLoading(false)
      return
    }

    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (!mountedRef.current) return

      if (error) {
        // Profile doesn't exist yet — create it (e.g. first login after payment)
        if (error.code === 'PGRST116' && retryCount < 2) {
          console.log('Profile not found, creating...')
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: authUser.id,
              email: authUser.email || '',
              display_name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || '',
              stage: authUser.user_metadata?.stage || 'premed',
              is_paid: false
            })
            .select()
            .single()

          if (!mountedRef.current) return

          if (!createError && newProfile) {
            profileCacheRef.current[authUser.id] = newProfile
            setUser(newProfile)
          } else if (retryCount < 1) {
            // Race condition: profile might have been created by webhook — retry fetch
            setTimeout(() => loadUserProfile(authUser, retryCount + 1), 1000)
            return
          } else {
            setUser(null)
          }
        } else {
          console.error('Error loading user profile:', error)
          setUser(null)
        }
      } else {
        profileCacheRef.current[authUser.id] = profile
        setUser(profile)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      if (mountedRef.current) setUser(null)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true

    // Listen for auth changes FIRST — this is the primary mechanism
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mountedRef.current) return

      console.log('Auth event:', event)
      setSession(newSession)

      if (event === 'SIGNED_OUT') {
        setUser(null)
        profileCacheRef.current = {}
        setLoading(false)
        return
      }

      if (newSession?.user) {
        // Force fresh profile load on sign-in (cache might be stale after payment)
        if (event === 'SIGNED_IN') {
          delete profileCacheRef.current[newSession.user.id]
        }
        await loadUserProfile(newSession.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    // Then get the initial session
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (!mountedRef.current) return
      if (error) {
        console.error('Error getting initial session:', error)
        setLoading(false)
        return
      }
      // Only set if onAuthStateChange hasn't already fired
      if (!session && initialSession?.user) {
        setSession(initialSession)
        loadUserProfile(initialSession.user)
      } else if (!initialSession) {
        setLoading(false)
      }
    })

    // Safety timeout
    const timeoutId = setTimeout(() => {
      if (mountedRef.current && loading) {
        console.warn('Auth init timeout')
        setLoading(false)
      }
    }, 6000)

    return () => {
      mountedRef.current = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sendMagicLink = async (email: string, stage?: string, displayName?: string) => {
    try {
      // Use NEXT_PUBLIC_URL for the redirect so magic links always point to the canonical domain
      const siteUrl = process.env.NEXT_PUBLIC_URL || window.location.origin
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
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

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (error) {
      console.error('Password login error:', error)
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

  const refreshUser = useCallback(async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (currentSession?.user) {
        // Invalidate cache so we get fresh profile data
        delete profileCacheRef.current[currentSession.user.id]
        setSession(currentSession)
        await loadUserProfile(currentSession.user, 1) // skip cache
      }
    } catch (error) {
      console.error('Error in refreshUser:', error)
    }
  }, [loadUserProfile])

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      sendMagicLink,
      signInWithPassword,
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