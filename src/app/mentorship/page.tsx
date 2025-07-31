import ComingSoonPage from '@/components/ComingSoonPage'

export default function MentorshipHubPage() {
  return (
    <ComingSoonPage
      title="Mentorship Hub"
      description="Connect with mentors and build meaningful professional relationships"
      icon="👨‍🏫"
      estimatedLaunch="Q1 2025"
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
          title: "Community Chat",
          description: "Connect with experienced physicians",
          icon: "💬",
          href: "https://t.me/+666ywZFkke5lMjQx"
        },
        {
          title: "Member Map",
          description: "Find mentors in your area",
          icon: "📍",
          href: "/map"
        },
        {
          title: "Specialty Explorer",
          description: "Learn about different specialties",
          icon: "🎓",
          href: "/specialties"
        }
      ]}
    />
  )
}