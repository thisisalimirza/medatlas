import ComingSoonPage from '@/components/ComingSoonPage'

export default function ClinicalSkillsPage() {
  return (
    <ComingSoonPage
      title="Clinical Skills"
      description="Master clinical skills with interactive training modules"
      icon="🩺"
      estimatedLaunch="Q3 2025"
      requiresAuth={true}
      requiresPaid={true}
      features={[
        "Interactive clinical examination simulations",
        "Physical diagnosis training modules",
        "Procedure skill videos and checklists",
        "Patient communication scenarios",
        "OSCE preparation and practice cases",
        "Clinical reasoning development exercises",
        "Differential diagnosis trainers",
        "Progress tracking and skill assessments"
      ]}
      currentAlternatives={[
        {
          title: "Summer Programs",
          description: "Clinical research opportunities",
          icon: "🏥",
          href: "/tools/summer-programs"
        },
        {
          title: "Community",
          description: "Connect with clinical students",
          icon: "💬",
          href: "https://t.me/+666ywZFkke5lMjQx"
        }
      ]}
    />
  )
}