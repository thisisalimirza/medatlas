import ComingSoonPage from '@/components/ComingSoonPage'

export default function RankListBuilderPage() {
  return (
    <ComingSoonPage
      title="Rank List Builder"
      description="Build and optimize your residency rank list for the best match outcomes"
      icon="🎯"
      estimatedLaunch="Q3 2025"
      requiresAuth={true}
      requiresPaid={true}
      features={[
        "Interactive drag-and-drop rank list builder",
        "Program fit assessment and scoring",
        "Match probability calculator for each position",
        "Geographic preference optimization",
        "Couples match rank list coordination",
        "Last-minute rank list adjustment tools",
        "Strategic ranking recommendations",
        "Match outcome prediction modeling"
      ]}
      currentAlternatives={[
        {
          title: "Program Comparator",
          description: "Compare programs to help rank",
          icon: "🏥",
          href: "/compare"
        },
        {
          title: "Interview Tracker",
          description: "Track interview impressions",
          icon: "📝",
          href: "/interviews"
        },
        {
          title: "Match Analytics",
          description: "Research match statistics",
          icon: "📈",
          href: "/match-stats"
        }
      ]}
    />
  )
}