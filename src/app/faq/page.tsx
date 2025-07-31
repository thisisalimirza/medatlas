'use client'

import Header from '@/components/Header'
import { useState } from 'react'

const faqs = [
  {
    category: "Getting Started",
    items: [
      {
        question: "What is MedAtlas?",
        answer: "MedAtlas is a comprehensive platform for pre-med students, medical students, residents, and attending physicians. We provide tools, resources, and community features to help you navigate your medical career journey."
      },
      {
        question: "How much does MedAtlas cost?",
        answer: "MedAtlas Pro is a one-time payment of $99 that provides lifetime access to all premium features, including detailed school reviews, cost calculators, timeline tools, and community features."
      },
      {
        question: "What's included in the free version?",
        answer: "The free version includes basic school browsing, limited access to calculators, and the ability to view basic school information. Upgrading to Pro unlocks detailed reviews, advanced tools, and community features."
      }
    ]
  },
  {
    category: "Pre-Med Tools",
    items: [
      {
        question: "How accurate are the GPA and MCAT calculators?",
        answer: "Our calculators use the most current AMCAS and AACOMAS conversion formulas. For MCAT scoring, we use official AAMC scoring guidelines. However, always verify with official sources for the most up-to-date information."
      },
      {
        question: "Can I save my timeline and track progress?",
        answer: "Yes! Pro users can save their custom premed timelines, mark completed tasks, and receive reminders for upcoming deadlines."
      },
      {
        question: "How often are secondary essay prompts updated?",
        answer: "We update secondary essay prompts as soon as schools release them each cycle, typically starting in May/June for the upcoming application cycle."
      }
    ]
  },
  {
    category: "Account & Billing",
    items: [
      {
        question: "Is there a money-back guarantee?",
        answer: "Yes! We offer a 30-day money-back guarantee. If you're not satisfied with MedAtlas Pro, contact us within 30 days for a full refund."
      },
      {
        question: "Can I change my stage (premed, MS1, etc.) later?",
        answer: "Absolutely! You can update your stage anytime in your profile settings. This will customize the tools and content shown to match your current level."
      },
      {
        question: "Do you offer student discounts?",
        answer: "Our one-time $99 lifetime access is already heavily discounted compared to other platforms. We believe in making medical education resources affordable for all students."
      }
    ]
  },
  {
    category: "Technical Support",
    items: [
      {
        question: "I'm having trouble logging in. What should I do?",
        answer: "First, try refreshing the page and clearing your browser cache. If issues persist, check that you're using the correct email address. Contact support if you continue having problems."
      },
      {
        question: "Can I access MedAtlas on mobile?",
        answer: "Yes! MedAtlas is fully responsive and works great on mobile devices. We're also working on dedicated mobile apps for an even better experience."
      },
      {
        question: "How do I report a bug or suggest a feature?",
        answer: "We love feedback! Join our Telegram community or email us directly. We actively monitor suggestions and regularly implement user-requested features."
      }
    ]
  }
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Everything you need to know about MedAtlas
          </p>
          
          {/* Quick Contact */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-center space-x-4">
              <span className="text-2xl">💬</span>
              <div>
                <p className="font-medium text-blue-900">Still have questions?</p>
                <p className="text-blue-700 text-sm">
                  Join our{' '}
                  <a 
                    href="https://t.me/+666ywZFkke5lMjQx" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:no-underline font-medium"
                  >
                    community chat
                  </a>
                  {' '}or email us at help@medatlas.com
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={category.category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">{category.category}</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {category.items.map((item, itemIndex) => {
                  const itemId = `${categoryIndex}-${itemIndex}`
                  const isOpen = openItems.includes(itemId)
                  
                  return (
                    <div key={itemId}>
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 pr-4">{item.question}</h3>
                          <span className={`flex-shrink-0 transform transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}>
                            ⌄
                          </span>
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <div className="bg-brand-red text-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to join MedAtlas?</h2>
            <p className="text-red-100 mb-6">
              Join 2,800+ medical students and residents who are already using MedAtlas to navigate their careers.
            </p>
            <button 
              onClick={() => window.location.href = '/?signup=true'}
              className="bg-white text-brand-red px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}