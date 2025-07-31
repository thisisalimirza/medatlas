import ComingSoonPage from '@/components/ComingSoonPage'

export default function GradeTrackerPage() {
  return (
    <ComingSoonPage
      title="Grade Tracker"
      description="Monitor your academic performance throughout medical school"
      icon="📊"
      estimatedLaunch="Q2 2025"
      requiresAuth={true}
      requiresPaid={true}
      features={[
        "GPA calculation across all years",
        "Subject-wise performance analytics",
        "Exam and assignment grade tracking",
        "Trend analysis and performance insights",
        "Goal setting and progress monitoring",
        "Class rank estimation and comparison",
        "Transcript organization and export",
        "Residency application readiness assessment"
      ]}
      currentAlternatives={[
        {
          title: "GPA Calculator",
          description: "Calculate undergraduate GPA",
          icon: "📈",
          href: "/tools/gpa-calculator"
        },
        {
          title: "Profile",
          description: "Track academic milestones",
          icon: "👤",
          href: "/profile"
        },
        {
          title: "Timeline Tools",
          description: "Plan academic goals",
          icon: "🗓️",
          href: "/tools/premed-timeline"
        }
      ]}
    />
  )
}