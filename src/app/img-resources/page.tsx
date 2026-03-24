'use client'

import { useState } from 'react'
import Header from '@/components/Header'

interface ResourceSection {
  title: string
  icon: string
  items: { label: string; detail: string; link?: string }[]
}

const PATHWAY_STEPS = [
  { step: 1, title: 'ECFMG Certification', desc: 'Pass USMLE Step 1 (P/F) and Step 2 CK. Complete ECFMG pathway requirements including medical school verification.', timeline: '12-24 months' },
  { step: 2, title: 'Gain US Clinical Experience (USCE)', desc: 'Complete observerships, externships, or research rotations at US hospitals. Aim for at least 3-6 months of hands-on experience.', timeline: '3-12 months' },
  { step: 3, title: 'Build Your Application', desc: 'Get strong US letters of recommendation, craft a compelling personal statement, and build your research portfolio.', timeline: '3-6 months' },
  { step: 4, title: 'Apply Through ERAS', desc: 'Submit ERAS application in September. Apply broadly — IMGs typically apply to 100-200+ programs depending on specialty.', timeline: 'Sep-Oct' },
  { step: 5, title: 'Interview Season', desc: 'Attend virtual and in-person interviews. Prepare for common IMG-specific questions about why you chose US training.', timeline: 'Oct-Feb' },
  { step: 6, title: 'Rank & Match', desc: 'Submit your rank list by late February. Match Day is in mid-March. Have a backup plan including SOAP if needed.', timeline: 'Feb-Mar' },
]

const VISA_INFO = [
  { type: 'J-1', title: 'J-1 Exchange Visitor', pros: ['Most common for IMGs', 'Sponsored by ECFMG', 'No employer petition needed', 'Spouse can get EAD after waiver'], cons: ['2-year home residency requirement', 'Limited moonlighting', 'Requires waiver for H-1B conversion', 'Geographic restrictions with Conrad 30'], note: 'The J-1 visa is the standard pathway for most IMGs entering residency. ECFMG sponsors J-1 visas for matched residents.' },
  { type: 'H-1B', title: 'H-1B Specialty Worker', pros: ['No home residency requirement', 'Dual intent (can pursue green card)', 'Moonlighting permitted', 'More geographic flexibility'], cons: ['Employer must petition and sponsor', 'More expensive for programs', 'Subject to cap (unless cap-exempt)', 'Fewer programs willing to sponsor'], note: 'H-1B is preferred for long-term US career plans. Academic/non-profit hospitals are cap-exempt.' },
  { type: 'O-1', title: 'O-1 Extraordinary Ability', pros: ['For exceptional researchers/physicians', 'No home residency requirement', 'Dual intent'], cons: ['Very high bar — extraordinary ability', 'Extensive documentation needed', 'Rare for residency entry'], note: 'Typically not used for residency entry but relevant for research-track physicians with exceptional accomplishments.' },
]

const IMG_FRIENDLY_SPECIALTIES = [
  { specialty: 'Internal Medicine', matchRate: '52%', positions: '~9,500', difficulty: 'Most accessible', note: 'By far the most IMG-friendly specialty. Many community programs actively recruit IMGs.' },
  { specialty: 'Family Medicine', matchRate: '51%', positions: '~4,800', difficulty: 'Very accessible', note: 'Second most accessible. Rural and underserved area programs especially open to IMGs.' },
  { specialty: 'Pediatrics', matchRate: '48%', positions: '~2,900', difficulty: 'Accessible', note: 'Good option with many IMG-friendly programs, especially in urban centers.' },
  { specialty: 'Psychiatry', matchRate: '45%', positions: '~2,100', difficulty: 'Moderately accessible', note: 'Growing field with increasing IMG acceptance. Demand exceeds supply.' },
  { specialty: 'Neurology', matchRate: '46%', positions: '~1,000', difficulty: 'Moderately accessible', note: 'Smaller field but relatively IMG-friendly, especially academic programs.' },
  { specialty: 'Pathology', matchRate: '48%', positions: '~600', difficulty: 'Accessible', note: 'Research-heavy field that values IMG research experience.' },
  { specialty: 'Anesthesiology', matchRate: '42%', positions: '~1,900', difficulty: 'Moderate', note: 'Becoming more competitive but still has IMG-friendly programs.' },
  { specialty: 'Emergency Medicine', matchRate: '38%', positions: '~2,700', difficulty: 'Challenging', note: 'Historically difficult for IMGs but slowly improving.' },
]

const RESOURCES: ResourceSection[] = [
  {
    title: 'ECFMG & Certification',
    icon: '📋',
    items: [
      { label: 'ECFMG Certification', detail: 'Required for all IMGs. Involves medical school credential verification and passing USMLE Steps 1 & 2 CK.' },
      { label: 'ECFMG Pathways', detail: 'Multiple pathways available (Pathway 1-6) to meet certification requirements. Check which applies to your medical school.' },
      { label: 'Medical School Verification', detail: 'ECFMG verifies your medical diploma and credentials. Start this process early — it can take months.' },
      { label: 'USMLE Timeline', detail: 'Take Step 1 first (now P/F), then Step 2 CK (scored, very important for IMGs). Score 240+ on Step 2 CK for competitive specialties.' },
    ]
  },
  {
    title: 'US Clinical Experience (USCE)',
    icon: '🏥',
    items: [
      { label: 'Observerships', detail: 'Shadowing experience at US hospitals. No hands-on care but builds connections and LOrs. Easiest to obtain.' },
      { label: 'Externships/Clerkships', detail: 'Hands-on clinical rotations (preferred). Some schools offer IMG-specific externship programs.' },
      { label: 'Research Positions', detail: 'Research experience at US institutions counts as USCE and strengthens your application significantly.' },
      { label: 'Recommended Duration', detail: 'Aim for minimum 3-6 months total USCE. Some competitive programs want 6-12 months.' },
    ]
  },
  {
    title: 'Application Strategy',
    icon: '📝',
    items: [
      { label: 'Apply Broadly', detail: 'IMGs should apply to 100-250+ programs depending on specialty. Focus on programs with IMG match history.' },
      { label: 'Letters of Recommendation', detail: 'US-based LORs are critical. Get at least 2-3 from US physicians who know your clinical work.' },
      { label: 'Personal Statement', detail: 'Address why US training, what unique perspective you bring, and your commitment to the specialty.' },
      { label: 'Year of Graduation', detail: 'More recent graduates have higher match rates. >5 years since graduation is a red flag for some programs.' },
    ]
  },
  {
    title: 'Financial Planning',
    icon: '💰',
    items: [
      { label: 'USMLE Costs', detail: 'Step 1: $1,000+, Step 2 CK: $1,000+, ECFMG certification: $900+. Budget $3,000-5,000 total for exams.' },
      { label: 'ERAS Application', detail: 'ERAS registration: $180 + $11-26 per program. Applying to 200 programs can cost $3,000-5,000.' },
      { label: 'USCE Costs', detail: 'Observership fees: $500-3,000/month. Living expenses in the US: $1,500-3,000/month.' },
      { label: 'Interview Travel', detail: 'Many interviews are virtual now, but in-person interviews cost $500-1,500 each including flights and hotels.' },
    ]
  },
]

export default function IMGResourcesPage() {
  const [activeTab, setActiveTab] = useState<'pathway' | 'visa' | 'specialties' | 'resources'>('pathway')

  const tabs = [
    { id: 'pathway' as const, label: 'IMG Pathway' },
    { id: 'specialties' as const, label: 'IMG-Friendly Specialties' },
    { id: 'visa' as const, label: 'Visa Guide' },
    { id: 'resources' as const, label: 'Resources' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">🌍 IMG Resources</h1>
            <p className="text-red-100 text-sm md:text-base max-w-2xl">Comprehensive guide for International Medical Graduates applying to US residency programs. From ECFMG certification to visa options and application strategy.</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['ECFMG Guide', 'Visa Info', 'IMG Match Rates', 'USCE Guide', 'Application Strategy'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex gap-0 border-b border-gray-200 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            {/* Pathway Tab */}
            {activeTab === 'pathway' && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-6">Your Path to US Residency</h2>
                <div className="space-y-4">
                  {PATHWAY_STEPS.map((step) => (
                    <div key={step.step} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">{step.step}</div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-gray-900">{step.title}</h3>
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{step.timeline}</span>
                        </div>
                        <p className="text-sm text-gray-600">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <h3 className="font-bold text-yellow-800 mb-1">Important Note for IMGs</h3>
                  <p className="text-sm text-yellow-700">The entire process from starting USMLE preparation to Match Day typically takes 2-4 years. Start planning early, build US connections, and apply broadly. Your medical degree is valuable — the US healthcare system needs IMGs.</p>
                </div>
              </div>
            )}

            {/* Specialties Tab */}
            {activeTab === 'specialties' && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">IMG-Friendly Specialties</h2>
                <p className="text-sm text-gray-500 mb-6">Match rates shown are approximate for IMG applicants based on recent NRMP data.</p>

                <div className="space-y-3">
                  {IMG_FRIENDLY_SPECIALTIES.map(s => (
                    <div key={s.specialty} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{s.specialty}</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{s.positions} positions</span>
                          <span className={`text-sm font-bold ${parseInt(s.matchRate) >= 50 ? 'text-green-600' : parseInt(s.matchRate) >= 40 ? 'text-yellow-600' : 'text-orange-600'}`}>{s.matchRate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          s.difficulty.includes('Most') || s.difficulty.includes('Very') ? 'bg-green-100 text-green-700' :
                          s.difficulty.includes('Accessible') || s.difficulty.includes('Moderately') ? 'bg-yellow-100 text-yellow-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>{s.difficulty}</span>
                      </div>
                      <p className="text-sm text-gray-600">{s.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visa Tab */}
            {activeTab === 'visa' && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Visa Options for IMGs</h2>
                <p className="text-sm text-gray-500 mb-6">Understanding visa types is critical for your residency planning and long-term career strategy in the US.</p>

                <div className="space-y-4">
                  {VISA_INFO.map(visa => (
                    <div key={visa.type} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold">{visa.type}</span>
                        <h3 className="font-bold text-gray-900">{visa.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{visa.note}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-green-700 mb-2">Advantages</h4>
                          <ul className="space-y-1">
                            {visa.pros.map((p, i) => <li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-green-600 flex-shrink-0">+</span>{p}</li>)}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-red-700 mb-2">Limitations</h4>
                          <ul className="space-y-1">
                            {visa.cons.map((c, i) => <li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-red-600 flex-shrink-0">−</span>{c}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="space-y-6">
                {RESOURCES.map(section => (
                  <div key={section.title}>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{section.icon} {section.title}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {section.items.map(item => (
                        <div key={item.label} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 text-sm mb-1">{item.label}</h4>
                          <p className="text-xs text-gray-600">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-12 mb-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Guide for International Medical Graduates</h2>
          <div className="text-sm text-gray-600 space-y-3">
            <p>International Medical Graduates (IMGs) make up approximately 25% of the US physician workforce and play a vital role in American healthcare. The path from international medical school to US residency involves ECFMG certification, USMLE examinations, gaining US clinical experience, and navigating the ERAS application and NRMP Match process.</p>
            <p>The most critical factors for IMG match success are Step 2 CK score (aim for 240+ for competitive specialties), US clinical experience, US-based letters of recommendation, and years since graduation. IMGs who are within 3 years of graduation with strong scores and USCE have significantly higher match rates than those who graduated more than 5 years ago.</p>
            <p>Visa considerations are an important part of IMG career planning. Most IMG residents train on J-1 visas sponsored by ECFMG, though some programs sponsor H-1B visas. Understanding the implications of each visa type — particularly the J-1 two-year home residency requirement and waiver options — is essential for long-term career planning in the United States.</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center pb-8">This information is for educational purposes only. Immigration and visa matters should be discussed with a qualified immigration attorney. Not affiliated with ECFMG, NRMP, or USCIS.</p>
      </div>
    </div>
  )
}
