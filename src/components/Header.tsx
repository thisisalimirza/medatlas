'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from './AuthModal'
import MainNavigation from './MainNavigation'

interface HeaderProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
  isFiltersSidebarOpen?: boolean
  onToggleFiltersSidebar?: () => void
}

export default function Header({ searchQuery = '', onSearchChange, isFiltersSidebarOpen, onToggleFiltersSidebar }: HeaderProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup')
  const { user, logout, loading } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Navigation and Filters */}
          <div className="flex items-center space-x-4">
            <MainNavigation />
            <div className="hidden md:block h-6 w-px bg-gray-300"></div>
            <button 
              onClick={onToggleFiltersSidebar}
              className={`hidden md:flex border items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                isFiltersSidebarOpen 
                  ? 'bg-brand-red text-white border-brand-red' 
                  : 'text-brand-red border-brand-red hover:bg-red-50'
              }`}
            >
              <span>🔧</span>
              <span>Filters</span>
            </button>
          </div>

          {/* Search Bar (Center) */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Search medical schools or programs..."
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-full focus:ring-2 focus:ring-brand-red focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 text-sm"
              />
              <div className="absolute right-3 top-3 text-gray-400">
                🔍
              </div>
            </div>
          </div>

          {/* Right side - User Menu */}
          <div className="flex items-center space-x-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-2">
                {/* Simple notification indicator */}
                <button 
                  onClick={() => alert('🔔 Notifications coming soon! Get alerts for new reviews, match updates, and application deadlines.')}
                  className="relative p-2 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-lg transition-all duration-200 group"
                >
                  <span className="group-hover:scale-110 transition-transform inline-block">🔔</span>
                </button>

                {/* Simplified User Profile */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-brand-red rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.display_name ? user.display_name[0].toUpperCase() : user.email[0].toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-gray-900 max-w-24 truncate">
                        {user.display_name || user.email.split('@')[0]}
                      </div>
                    </div>
                    <div className="text-gray-400">
                      ⌄
                    </div>
                  </button>

                  {/* Simplified Dropdown Menu */}
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.display_name || user.email}
                      </div>
                      <div className="text-xs text-gray-500 capitalize flex items-center">
                        {user.stage}{user.is_paid && <span className="ml-1 text-yellow-500">⭐</span>}
                      </div>
                    </div>
                    <div className="py-1">
                      <a href="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-brand-red transition-all duration-200 group">
                        <span className="mr-3 group-hover:scale-110 transition-transform">📊</span>
                        Dashboard
                      </a>
                      <a href="/favorites" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-brand-red transition-all duration-200 group">
                        <span className="mr-3 group-hover:scale-110 transition-transform">❤️</span>
                        Favorites
                      </a>
                      {!user.is_paid && (
                        <button 
                          onClick={() => {
                            setAuthModalMode('signup')
                            setIsAuthModalOpen(true)
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-brand-red hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
                        >
                          <span className="mr-3 group-hover:scale-110 transition-transform">⭐</span>
                          Upgrade to Pro
                        </button>
                      )}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
                      >
                        <span className="mr-3 group-hover:scale-110 transition-transform">🚪</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    setAuthModalMode('login')
                    setIsAuthModalOpen(true)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-brand-red hover:bg-red-50 rounded-lg transition-all duration-200 group"
                >
                  <span className="group-hover:scale-110 transition-transform inline-block mr-1">🔑</span>
                  Log in
                </button>
                <button 
                  onClick={() => {
                    setAuthModalMode('signup')
                    setIsAuthModalOpen(true)
                  }}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-full hover:bg-red-600 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Join MedAtlas +
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