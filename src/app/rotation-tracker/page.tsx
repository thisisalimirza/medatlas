import ComingSoonPage from '@/components/ComingSoonPage'

export default function RotationTrackerPage() {
  return (
    <ComingSoonPage
      title="Rotation Tracker"
      description="Track and manage your clinical rotations with ease"
      icon="🧾"
      estimatedLaunch="Q2 2025"
      requiresAuth={true}
      requiresPaid={true}
      features={[
        "Complete rotation schedule management",
        "Attendance and hour tracking",
        "Evaluation and feedback collection",
        "Learning objectives progress tracking",
        "Case log and patient encounter recording",
        "Supervisor and mentor contact management",
        "Rotation site reviews and ratings",
        "Portfolio and CV builder integration"
      ]}
      currentAlternatives={[
        {
          title: "Summer Programs",
          description: "Research clinical opportunities",
          icon: "🏥",
          href: "/tools/summer-programs"
        },
        {
          title: "Profile",
          description: "Track your medical education progress",
          icon: "👤",
          href: "/profile"
        },
        {
          title: "Community",
          description: "Share rotation experiences",
          icon: "💬",
          href: "https://t.me/+666ywZFkke5lMjQx"
        }
      ]}
    />
  )
}