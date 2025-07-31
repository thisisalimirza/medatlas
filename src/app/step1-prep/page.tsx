import ComingSoonPage from '@/components/ComingSoonPage'

export default function Step1PrepPage() {
  return (
    <ComingSoonPage
      title="Step 1 Prep"
      description="Comprehensive USMLE Step 1 preparation tools and resources"
      icon="📖"
      estimatedLaunch="Q2 2025"
      requiresAuth={true}
      requiresPaid={true}
      features={[
        "Comprehensive question bank with detailed explanations",
        "Adaptive learning algorithm based on your performance",
        "Topic-wise practice tests and assessments",
        "Performance analytics and weakness identification",
        "Study schedule generator with spaced repetition",
        "Peer comparison and ranking system",
        "First Aid integration and note-taking",
        "Video explanations for complex concepts"
      ]}
      currentAlternatives={[
        {
          title: "Timeline Tools",
          description: "Plan your Step 1 study schedule",
          icon: "🗓️",
          href: "/tools/premed-timeline"
        },
        {
          title: "Community",
          description: "Connect with other Step 1 students",
          icon: "💬",
          href: "https://t.me/+666ywZFkke5lMjQx"
        },
        {
          title: "Summer Programs",
          description: "Research opportunities for med students",
          icon: "🏥",
          href: "/tools/summer-programs"
        }
      ]}
    />
  )
}