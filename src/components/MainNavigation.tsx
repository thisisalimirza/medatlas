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

// Toggle requiresPaid on any item to gate it behind PremiumGate on-page.
// All items are always clickable — the paywall overlay shows on the page itself.
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
      { icon: "🎓", label: "Specialty Explorer", href: "/specialties" },
      { icon: "📖", label: "Board Exam Prep", href: "/step1-prep" },
      { icon: "🧾", label: "Rotation Tracker", href: "/rotation-tracker" },
      { icon: "📊", label: "Grade Tracker", href: "/grades" },
      { icon: "📊", label: "Financial Planner", href: "/tools/financial-planner" },
      { icon: "🏥", label: "Summer Programs", href: "/tools/summer-programs" }
    ]
  },
  {
    label: "Residency Tools",
    items: [
      { icon: "📈", label: "Match Analytics", href: "/match-stats" },
      { icon: "📝", label: "Interview Tracker", href: "/interviews" },
      { icon: "🎯", label: "Rank List Builder", href: "/rank-list" },
      { icon: "🌍", label: "IMG Resources", href: "/img-resources" },
      { icon: "💼", label: "ERAS Manager", href: "/eras" },
      { icon: "🏥", label: "Program Comparator", href: "/compare", requiresAuth: true, requiresPaid: true }
    ]
  },
  {
    label: "Attending Tools",
    items: [
      { icon: "💰", label: "Salary Negotiator", href: "/salary-negotiator", requiresAuth: true, requiresPaid: true },
      { icon: "📊", label: "Contract Analyzer", href: "/contracts", requiresAuth: true, requiresPaid: true },
      { icon: "🏛️", label: "Fellowship Finder", href: "/fellowships", requiresAuth: true, requiresPaid: true },
      { icon: "🧪", label: "Test Value Predictor", href: "/tools/test-predictor" },
      { icon: "👨‍🏫", label: "Mentorship Hub", href: "/mentorship", requiresAuth: true }
    ]
  },
  {
    label: "Community",
    items: [
      { icon: "💬", label: "Live Chat", href: "https://t.me/+666ywZFkke5lMjQx", external: true, requiresPaid: true },
      { icon: "🧑‍🤝‍🧑", label: "Study Partners", href: "/study-partners" },
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
    setIsOpen(false)

    if (item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer')
    } else {
      router.push(item.href)
    }
  }

  const isPremiumItem = (item: NavItem) => {
    return item.requiresPaid && (!user || !user.is_paid)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* MedStack Menu Button - Logo + hamburger hint */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-2 sm:px-3 py-1.5 rounded-full bg-white border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ${
          isOpen ? 'ring-2 ring-brand-red ring-opacity-30 border-brand-red' : 'hover:border-brand-red'
        }`}
        aria-label="Open MedStack Navigation"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src="/logo.png"
            alt="MedStack Logo"
            width={32}
            height={32}
            className="object-contain"
            priority
          />
        </div>
        {/* Hamburger icon to signal this is a menu */}
        <div className="flex flex-col justify-center space-y-[5px]">
          <span className={`block w-4 h-0.5 bg-gray-600 rounded-full transition-all duration-300 origin-center ${isOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-4 h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isOpen ? 'opacity-0 scale-0' : ''}`} />
          <span className={`block w-4 h-0.5 bg-gray-600 rounded-full transition-all duration-300 origin-center ${isOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </div>
      </button>

      {/* Mobile overlay backdrop - starts below header to not block it */}
      {isOpen && (
        <div
          className="fixed inset-0 top-14 z-40 bg-black/20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Menu - responsive width */}
      {isOpen && (
        <div className="absolute top-14 left-0 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-[85vh] overflow-y-auto overscroll-contain">
          {/* Simple Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 cursor-pointer hover:text-brand-red transition-colors">
                <span className="text-lg">🌐</span>
                <span className="font-medium text-gray-900">MedStack Tools</span>
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
                  {section.items
                    .filter((item) => {
                      // Hide external premium links (e.g. Telegram) from non-paid users
                      if (item.external && item.requiresPaid && (!user || !user.is_paid)) return false
                      return true
                    })
                    .map((item) => (
                    <div
                      key={item.href}
                      onClick={() => handleItemClick(item)}
                      className="flex items-center space-x-3 text-sm cursor-pointer py-2 px-3 rounded-lg transition-all duration-200 text-gray-700 hover:text-brand-red hover:bg-red-50 hover:scale-[1.02]"
                    >
                      <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                      <span className="flex-1 font-medium">{item.label}</span>
                      <div className="flex items-center space-x-1">
                        {item.external && <span className="text-xs text-gray-400">↗</span>}
                        {isPremiumItem(item) && <span className="text-xs text-yellow-600">⭐</span>}
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