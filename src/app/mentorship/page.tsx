import ComingSoonPage from '@/components/ComingSoonPage'

export default function MentorshipHubPage() {
  return (
    <ComingSoonPage
      title="Mentorship Hub"
      description="Connect with mentors and build meaningful professional relationships"
      icon="👨‍🏫"
      estimatedLaunch="Coming Soon"
      requiresAuth={true}
      requiresPaid={false}
      features={[
        "Smart mentor-mentee matching algorithm",
        "Structured mentorship program frameworks",
        "Goal setting and progress tracking tools",
        "Meeting scheduling and communication platform",
        "Resource sharing and recommendation system",
        "Mentorship circle and group formation",
        "Professional development milestone tracking",
        "Feedback and evaluation system for relationships"
      ]}
      currentAlternatives={[
        {
          title: "Specialty Explorer",
          description: "Learn about different specialties",
          icon: "🎓",
          href: "/specialties"
        },
        {
          title: "IMG Resources",
          description: "International graduate resources",
          icon: "🌍",
          href: "/img-resources"
        },
        {
          title: "Match Analytics",
          description: "Residency match statistics",
          icon: "📈",
          href: "/match-stats"
        }
      ]}
    />
  )
}