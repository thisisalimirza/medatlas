import ComingSoonPage from '@/components/ComingSoonPage'

export default function StudyGroupsPage() {
  return (
    <ComingSoonPage
      title="Study Groups"
      description="Form and join study groups with fellow medical students"
      icon="📱"
      estimatedLaunch="Q2 2025"
      requiresAuth={true}
      requiresPaid={false}
      features={[
        "Create and join study groups by subject or exam",
        "Schedule group study sessions and meetings",
        "Share study materials and resources",
        "Group chat and communication tools",
        "Study progress tracking as a group",
        "Virtual study room integration",
        "Peer teaching and explanation features",
        "Study group performance analytics"
      ]}
      currentAlternatives={[
        {
          title: "Study Partners",
          description: "Find individual study partners",
          icon: "🧑‍🤝‍🧑",
          href: "/study-partners"
        },
        {
          title: "Timeline Tools",
          description: "Plan group study schedules",
          icon: "🗓️",
          href: "/tools/premed-timeline"
        },
        {
          title: "Board Exam Prep",
          description: "Study resources for boards",
          icon: "📖",
          href: "/step1-prep"
        }
      ]}
    />
  )
}