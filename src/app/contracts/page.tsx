import ComingSoonPage from '@/components/ComingSoonPage'

export default function ContractAnalyzerPage() {
  return (
    <ComingSoonPage
      title="Contract Analyzer"
      description="Analyze and understand employment contracts with AI-powered insights"
      icon="📊"
      estimatedLaunch="Q4 2025"
      requiresAuth={true}
      requiresPaid={true}
      features={[
        "AI-powered contract analysis and review",
        "Red flag identification and risk assessment",
        "Clause-by-clause explanations in plain English",
        "Industry standard comparison and benchmarking",
        "Negotiation point recommendations",
        "Contract template library by specialty",
        "Legal term glossary and definitions",
        "Version comparison and change tracking"
      ]}
      currentAlternatives={[
        {
          title: "Salary Negotiator",
          description: "Prepare for salary discussions",
          icon: "💰",
          href: "/salary-negotiator"
        },
        {
          title: "Community",
          description: "Get contract advice from peers",
          icon: "💬",
          href: "https://t.me/+666ywZFkke5lMjQx"
        },
        {
          title: "Mentorship Hub",
          description: "Find mentors for career guidance",
          icon: "👨‍🏫",
          href: "/mentorship"
        }
      ]}
    />
  )
}