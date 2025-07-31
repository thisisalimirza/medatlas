import ComingSoonPage from '@/components/ComingSoonPage'

export default function InterviewTrackerPage() {
  return (
    <ComingSoonPage
      title="Interview Tracker"
      description="Manage residency interviews and track your application progress"
      icon="📝"
      estimatedLaunch="Q3 2025"
      requiresAuth={true}
      requiresPaid={true}
      features={[
        "Complete interview schedule management",
        "Interview preparation resources and questions",
        "Post-interview notes and impressions",
        "Travel planning and expense tracking",
        "Thank you note templates and tracking",
        "Program comparison and ranking integration",
        "Interview feedback and self-assessment",
        "Timeline and deadline management"
      ]}
      currentAlternatives={[
        {
          title: "Timeline Tools",
          description: "Plan interview season",
          icon: "🗓️",
          href: "/tools/premed-timeline"
        },
        {
          title: "Program Comparator",
          description: "Compare programs you're interviewing at",
          icon: "🏥",
          href: "/compare"
        },
        {
          title: "Community",
          description: "Share interview experiences",
          icon: "💬",
          href: "https://t.me/+666ywZFkke5lMjQx"
        }
      ]}
    />
  )
}