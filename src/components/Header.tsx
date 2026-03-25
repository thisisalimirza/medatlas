'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import AuthModal from './AuthModal'
import MainNavigation from './MainNavigation'

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup')
  const { user, logout, loading, refreshUser } = useAuth()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close user menu on click outside or Escape
  useEffect(() => {
    if (!isUserMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isUserMenuOpen])

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left side - Navigation */}
          <div className="flex items-center">
            <MainNavigation />
          </div>

          {/* Right side - User Menu */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* Simple notification indicator - hidden on very small screens */}
                <button 
                  onClick={() => alert('🔔 Notifications coming soon! Get alerts for new reviews, match updates, and application deadlines.')}
                  className="hidden xs:block relative p-2 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-lg transition-all duration-200 group"
                >
                  <span className="group-hover:scale-110 transition-transform inline-block text-lg">🔔</span>
                </button>

                {/* User Profile - click-based dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1 sm:space-x-2 p-1 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-expanded={isUserMenuOpen}
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-brand-red rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.display_name ? user.display_name[0].toUpperCase() : user.email[0].toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-gray-900 max-w-24 truncate">
                        {user.display_name || user.email.split('@')[0]}
                      </div>
                    </div>
                    <div className={`text-gray-400 hidden sm:block transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}>
                      ⌄
                    </div>
                  </button>

                  {/* Dropdown Menu - click-toggled */}
                  {isUserMenuOpen && (
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    {/* User info header */}
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {user.display_name ? user.display_name[0].toUpperCase() : user.email[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {user.display_name || user.email.split('@')[0]}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{user.email}</div>
                          <div className="flex items-center mt-0.5">
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                              user.is_paid
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {user.is_paid ? '⭐ Pro' : 'Free'} · {user.stage?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation items */}
                    <div className="py-1.5">
                      <a href="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-brand-red transition-all duration-150">
                        <span className="mr-3 w-5 text-center">👤</span>
                        My Profile
                      </a>
                      <a href="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-brand-red transition-all duration-150">
                        <span className="mr-3 w-5 text-center">📊</span>
                        Dashboard
                      </a>
                      <a href="/favorites" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-brand-red transition-all duration-150">
                        <span className="mr-3 w-5 text-center">❤️</span>
                        Favorites
                      </a>
                    </div>

                    {/* Upgrade CTA or Pro badge */}
                    {!user.is_paid && (
                      <div className="px-3 py-2 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            setAuthModalMode('signup')
                            setIsAuthModalOpen(true)
                          }}
                          className="flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-red to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm"
                        >
                          ⭐ Upgrade to Pro
                        </button>
                      </div>
                    )}

                    {/* Sign out */}
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => { setIsUserMenuOpen(false); logout() }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-150"
                      >
                        <span className="mr-3 w-5 text-center">🚪</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button 
                  onClick={() => {
                    setAuthModalMode('login')
                    setIsAuthModalOpen(true)
                  }}
                  className="hidden sm:flex px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:text-brand-red hover:bg-red-50 rounded-lg transition-all duration-200 group"
                >
                  <span className="group-hover:scale-110 transition-transform inline-block mr-1">🔑</span>
                  <span className="hidden sm:inline">Log in</span>
                </button>
                
                {/* Mobile login button */}
                <button 
                  onClick={() => {
                    setAuthModalMode('login')
                    setIsAuthModalOpen(true)
                  }}
                  className="sm:hidden p-2 text-gray-700 hover:text-brand-red hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <span className="text-lg">🔑</span>
                </button>
                
                <button 
                  onClick={() => {
                    setAuthModalMode('signup')
                    setIsAuthModalOpen(true)
                  }}
                  className="px-3 sm:px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-full hover:bg-red-600 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="sm:hidden">Join</span>
                  <span className="hidden sm:inline">Join MedStack +</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </header>
  )
}