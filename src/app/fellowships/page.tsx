import ComingSoonPage from '@/components/ComingSoonPage'

export default function FellowshipFinderPage() {
  return (
    <ComingSoonPage
      title="Fellowship Finder"
      description="Discover and apply to fellowship programs across all medical specialties"
      icon="🏛️"
      estimatedLaunch="Q4 2025"
      requiresAuth={true}
      requiresPaid={true}
      features={[
        "Comprehensive fellowship program database",
        "Advanced filtering by specialty, location, and type",
        "Application requirements and deadline tracking",
        "Fellowship match statistics and competitiveness",
        "Program director and faculty information",
        "Research opportunities and publication requirements",
        "Salary and benefits comparison across programs",
        "Application status tracking and management"
      ]}
      currentAlternatives={[
        {
          title: "Program Comparator",
          description: "Compare residency programs",
          icon: "🏥",
          href: "/compare"
        },
        {
          title: "Specialty Explorer",
          description: "Explore medical specialties",
          icon: "🎓",
          href: "/specialties"
        },
        {
          title: "Community",
          description: "Connect with fellowship candidates",
          icon: "💬",
          href: "https://t.me/+666ywZFkke5lMjQx"
        }
      ]}
    />
  )
}