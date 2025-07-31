import ComingSoonPage from '@/components/ComingSoonPage'

export default function MatchStatsPage() {
  return (
    <ComingSoonPage
      title="Match Analytics"
      description="Comprehensive residency match statistics and predictive analytics"
      icon="📈"
      estimatedLaunch="Q3 2025"
      requiresAuth={true}
      requiresPaid={true}
      features={[
        "Real-time match statistics by specialty and program",
        "ERAS application analytics and trends",
        "Step score and GPA impact analysis",
        "Geographic match preferences and outcomes",
        "IMG vs US MD/DO match rate comparisons",
        "Residency program competitiveness rankings",
        "Match prediction calculator based on your profile",
        "Historical match data and trend analysis"
      ]}
      currentAlternatives={[
        {
          title: "Program Comparator",
          description: "Compare residency programs",
          icon: "🏥",
          href: "/compare"
        },
        {
          title: "Community",
          description: "Discuss match strategies",
          icon: "💬",
          href: "https://t.me/+666ywZFkke5lMjQx"
        },
        {
          title: "School Comparison",
          description: "Compare medical schools",
          icon: "⚖️",
          href: "/tools/school-comparison"
        }
      ]}
    />
  )
}