import ComingSoonPage from '@/components/ComingSoonPage'

export default function SalaryNegotiatorPage() {
  return (
    <ComingSoonPage
      title="Salary Negotiator"
      description="Master salary negotiations with data-driven insights and strategies"
      icon="💰"
      estimatedLaunch="Q4 2025"
      requiresAuth={true}
      requiresPaid={true}
      features={[
        "Specialty-specific salary benchmarking by location",
        "Negotiation strategy guides and templates",
        "Total compensation package analyzer",
        "Benefits comparison and valuation tools",
        "Market rate research and trend analysis",
        "Negotiation scenario practice simulator",
        "Contract red flag identification system",
        "Success tracking and outcome analysis"
      ]}
      currentAlternatives={[
        {
          title: "Contract Analyzer",
          description: "Review employment contracts",
          icon: "📊",
          href: "/contracts"
        },
        {
          title: "Community",
          description: "Discuss salary and negotiations",
          icon: "💬",
          href: "https://t.me/+666ywZFkke5lMjQx"
        },
        {
          title: "Fellowship Finder",
          description: "Explore fellowship opportunities",
          icon: "🏛️",
          href: "/fellowships"
        }
      ]}
    />
  )
}