import Link from 'next/link'

const toolLinks = [
  { href: '/tools/mcat-calculator', label: 'MCAT Calculator' },
  { href: '/tools/gpa-calculator', label: 'GPA Calculator' },
  { href: '/tools/cost-calculator', label: 'Cost Calculator' },
  { href: '/tools/application-timeline', label: 'Application Timeline' },
  { href: '/tools/prerequisites-checker', label: 'Prerequisites Checker' },
  { href: '/tools/school-comparison', label: 'School Comparison' },
  { href: '/tools/premed-timeline', label: 'Pre-Med Timeline' },
  { href: '/tools/secondary-prompts', label: 'Secondary Prompts' },
  { href: '/tools/financial-planner', label: 'Financial Planner' },
]

const rankingLinks = [
  { href: '/rankings/top-ranked-medical-schools', label: 'Top Ranked Schools' },
  { href: '/rankings/most-affordable-medical-schools', label: 'Most Affordable' },
  { href: '/rankings/hardest-medical-schools-to-get-into', label: 'Hardest to Get Into' },
  { href: '/rankings/easiest-medical-schools-to-get-into', label: 'Highest Acceptance Rates' },
  { href: '/rankings/img-friendly-medical-schools', label: 'IMG-Friendly Schools' },
  { href: '/rankings/research-focused-medical-schools', label: 'Research Focused' },
  { href: '/rankings/best-public-medical-schools', label: 'Best Public Schools' },
  { href: '/rankings/best-private-medical-schools', label: 'Best Private Schools' },
  { href: '/rankings/highest-mcat-medical-schools', label: 'Highest MCAT' },
  { href: '/rankings/lowest-mcat-medical-schools', label: 'Lowest MCAT' },
]

const stateLinks = [
  { href: '/rankings/best-medical-schools-in-california', label: 'California' },
  { href: '/rankings/best-medical-schools-in-new-york', label: 'New York' },
  { href: '/rankings/best-medical-schools-in-texas', label: 'Texas' },
  { href: '/rankings/best-medical-schools-in-florida', label: 'Florida' },
  { href: '/rankings/best-medical-schools-in-pennsylvania', label: 'Pennsylvania' },
  { href: '/rankings/best-medical-schools-in-illinois', label: 'Illinois' },
  { href: '/rankings/best-medical-schools-in-ohio', label: 'Ohio' },
  { href: '/rankings/best-medical-schools-in-massachusetts', label: 'Massachusetts' },
  { href: '/rankings/best-medical-schools-in-north-carolina', label: 'North Carolina' },
  { href: '/rankings/best-medical-schools-in-georgia', label: 'Georgia' },
]

const resourceLinks = [
  { href: '/schools', label: 'Medical Schools' },
  { href: '/residencies', label: 'Residency Programs' },
  { href: '/specialties', label: 'Specialty Explorer' },
  { href: '/match-stats', label: 'Match Statistics' },
  { href: '/step1-prep', label: 'Step 1 Prep' },
  { href: '/clinical-skills', label: 'Clinical Skills' },
  { href: '/img-resources', label: 'IMG Resources' },
  { href: '/eras', label: 'ERAS Guide' },
  { href: '/compare', label: 'Compare Schools' },
  { href: '/faq', label: 'FAQ' },
]

export default function SEOFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <Link href="/" className="text-white text-xl font-bold">
              MedStack
            </Link>
            <p className="text-sm mt-2 leading-relaxed max-w-xs">
              Free tools and data for pre-med and medical students. Compare 208+ programs, calculate scores, and plan your path to medicine.
            </p>
          </div>

          {/* Free Tools */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Free Tools</h3>
            <ul className="space-y-2">
              {toolLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Rankings */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Rankings</h3>
            <ul className="space-y-2">
              {rankingLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* By State */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Schools by State</h3>
            <ul className="space-y-2">
              {stateLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Resources</h3>
            <ul className="space-y-2">
              {resourceLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} MedStack. All rights reserved.
          </p>
          <p className="text-xs text-center">
            Data sourced from publicly available information. Not affiliated with any medical school or the AAMC.
          </p>
        </div>
      </div>
    </footer>
  )
}
