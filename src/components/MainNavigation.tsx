'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface NavItem {
  icon: string
  label: string
  href: string
  requiresAuth?: boolean
  requiresPaid?: boolean
  external?: boolean
}

interface NavSection {
  label: string
  items: NavItem[]
}

const navigationData: NavSection[] = [
  {
    label: "General",
    items: [
      { icon: "🏠", label: "Home", href: "/" },
      { icon: "❤️", label: "My Dashboard", href: "/dashboard", requiresAuth: true, requiresPaid: true },
      { icon: "🧭", label: "Program Explorer", href: "/explore" },
      { icon: "📊", label: "Favorites", href: "/favorites", requiresAuth: true, requiresPaid: true }
    ]
  },
  {
    label: "Pre-Med Tools",
    items: [
      { icon: "🧮", label: "MCAT Calculator", href: "/tools/mcat-calculator" },
      { icon: "📈", label: "GPA Calculator", href: "/tools/gpa-calculator" },
      { icon: "✅", label: "Prerequisites Checker", href: "/tools/prerequisites-checker" },
      { icon: "📅", label: "Application Timeline", href: "/tools/application-timeline" },
      { icon: "🗓️", label: "Premed Timeline", href: "/tools/premed-timeline" },
      { icon: "📝", label: "Secondary Prompts", href: "/tools/secondary-prompts" },
      { icon: "💰", label: "Cost Calculator", href: "/tools/cost-calculator" },
      { icon: "⚖️", label: "School Comparison", href: "/tools/school-comparison" }
    ]
  },
  {
    label: "Med Student Tools",
    items: [
      { icon: "🏥", label: "Summer Programs", href: "/tools/summer-programs" },
      { icon: "📖", label: "Step 1 Prep", href: "/step1-prep", requiresAuth: true, requiresPaid: true },
      { icon: "🩺", label: "Clinical Skills", href: "/clinical-skills", requiresAuth: true, requiresPaid: true },
      { icon: "🧾", label: "Rotation Tracker", href: "/rotation-tracker", requiresAuth: true, requiresPaid: true },
      { icon: "📊", label: "Grade Tracker", href: "/grades", requiresAuth: true, requiresPaid: true },
      { icon: "🎓", label: "Specialty Explorer", href: "/specialties", requiresAuth: true },
      { icon: "📱", label: "Study Groups", href: "/study-groups", requiresAuth: true }
    ]
  },
  {
    label: "Residency Tools",
    items: [
      { icon: "🏥", label: "Program Comparator", href: "/compare", requiresAuth: true, requiresPaid: true },
      { icon: "📈", label: "Match Analytics", href: "/match-stats", requiresAuth: true, requiresPaid: true },
      { icon: "📝", label: "Interview Tracker", href: "/interviews", requiresAuth: true, requiresPaid: true },
      { icon: "🎯", label: "Rank List Builder", href: "/rank-list", requiresAuth: true, requiresPaid: true },
      { icon: "💼", label: "ERAS Manager", href: "/eras", requiresAuth: true, requiresPaid: true },
      { icon: "🌍", label: "IMG Resources", href: "/img-resources", requiresAuth: true }
    ]
  },
  {
    label: "Attending Tools",
    items: [
      { icon: "💰", label: "Salary Negotiator", href: "/salary-negotiator", requiresAuth: true, requiresPaid: true },
      { icon: "📊", label: "Contract Analyzer", href: "/contracts", requiresAuth: true, requiresPaid: true },
      { icon: "🏛️", label: "Fellowship Finder", href: "/fellowships", requiresAuth: true, requiresPaid: true },
      { icon: "👨‍🏫", label: "Mentorship Hub", href: "/mentorship", requiresAuth: true }
    ]
  },
  {
    label: "Community",
    items: [
      { icon: "💬", label: "Live Chat", href: "https://t.me/+666ywZFkke5lMjQx", external: true },
      { icon: "🧑‍🤝‍🧑", label: "Study Partners", href: "/study-partners", requiresAuth: true },
      { icon: "📍", label: "Member Map", href: "/map", requiresAuth: true },
      { icon: "❓", label: "FAQ & Help", href: "/faq" }
    ]
  }
]

export default function MainNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleItemClick = (item: NavItem) => {
    // Check auth requirements
    if (item.requiresAuth && !user) {
      setIsOpen(false)
      // For now, redirect to home where they can sign up
      router.push('/')
      return
    }

    if (item.requiresPaid && (!user || !user.is_paid)) {
      setIsOpen(false)
      // Redirect to home for upgrade
      router.push('/')
      return
    }

    setIsOpen(false)

    if (item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer')
    } else {
      router.push(item.href)
    }
  }

  const canAccessItem = (item: NavItem) => {
    if (item.requiresAuth && !user) return false
    if (item.requiresPaid && (!user || !user.is_paid)) return false
    return true
  }

  const getItemClassName = (item: NavItem) => {
    const baseClass = "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-150 cursor-pointer"
    
    if (!canAccessItem(item)) {
      return `${baseClass} text-gray-400 bg-gray-50 cursor-not-allowed`
    }

    return `${baseClass} text-gray-700 hover:bg-brand-red hover:text-white group`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* MedAtlas Logo Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden ${
          isOpen ? 'ring-4 ring-brand-red ring-opacity-30 scale-105 border-brand-red' : 'hover:border-brand-red'
        }`}
        aria-label="Open MedAtlas Navigation"
      >
        {/* MedAtlas Logo */}
        <Image
          src="/logo.png"
          alt="MedAtlas Logo"
          width={100}
          height={100}
          className="object-contain hover:scale-110 transition-transform duration-200"
          priority
          onError={(e) => {
            // Fallback to simple text if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.innerHTML = '🏥';
            fallback.className = 'text-xl';
            target.parentNode?.appendChild(fallback);
          }}
        />
      </button>

      {/* Dropdown Menu - Clean nomad style */}
      {isOpen && (
        <div className="absolute top-14 left-0 z-50 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-[85vh] overflow-y-auto overscroll-contain">
          {/* Simple Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 cursor-pointer hover:text-brand-red transition-colors">
                <span className="text-lg">🌐</span>
                <span className="font-medium text-gray-900">MedAtlas Tools</span>
              </div>
              <div className="flex items-center space-x-2 cursor-pointer hover:text-brand-red transition-colors">
                <span className="text-lg">👋</span>
                <span className="font-medium text-gray-900">{user ? `${user.stage?.toUpperCase()}` : 'Guest'}</span>
              </div>
            </div>
          </div>

          {/* Navigation - All sections */}
          <div className="p-4">
            {navigationData.map((section, index) => (
              <div key={section.label} className={index > 0 ? 'mt-6 pt-4 border-t border-gray-100' : ''}>
                <h3 className={`font-semibold text-sm mb-3 ${
                  section.label.includes('Pre-Med') ? 'text-blue-700' :
                  section.label.includes('Med Student') ? 'text-green-700' :
                  section.label.includes('Residency') ? 'text-purple-700' :
                  section.label.includes('Attending') ? 'text-orange-700' :
                  'text-gray-900'
                }`}>
                  {section.label.toUpperCase()}
                </h3>
                <div className="grid grid-cols-1 gap-1">
                  {section.items.slice(0, 6).map((item) => (
                    <div
                      key={item.href}
                      onClick={() => handleItemClick(item)}
                      className={`flex items-center space-x-3 text-sm cursor-pointer py-2 px-3 rounded-lg transition-all duration-200 ${
                        !canAccessItem(item) 
                          ? 'text-gray-400 cursor-not-allowed opacity-60' 
                          : 'text-gray-700 hover:text-brand-red hover:bg-red-50 hover:scale-[1.02]'
                      }`}
                    >
                      <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                      <span className="flex-1 font-medium">{item.label}</span>
                      <div className="flex items-center space-x-1">
                        {item.external && <span className="text-xs text-gray-400">↗</span>}
                        {item.requiresPaid && <span className="text-xs text-yellow-600">⭐</span>}
                        {!canAccessItem(item) && <span className="text-xs text-gray-400">🔒</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          </div>
      )}
    </div>
  )
}