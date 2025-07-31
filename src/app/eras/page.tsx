import ComingSoonPage from '@/components/ComingSoonPage'

export default function ERASManagerPage() {
  return (
    <ComingSoonPage
      title="ERAS Manager"
      description="Streamline your ERAS application process with intelligent management tools"
      icon="💼"
      estimatedLaunch="Q3 2025"
      requiresAuth={true}
      requiresPaid={true}
      features={[
        "ERAS application timeline and deadline tracking",
        "Personal statement editor with specialty-specific templates",
        "CV builder optimized for residency applications",
        "Letter of recommendation tracking and management",
        "Program selection and filtering tools",
        "Application fee calculator and budget tracker",
        "Document upload and organization system",
        "Application status monitoring and updates"
      ]}
      currentAlternatives={[
        {
          title: "Application Timeline",
          description: "Track application deadlines",
          icon: "📅",
          href: "/tools/application-timeline"
        },
        {
          title: "Program Comparator",
          description: "Research programs to apply to",
          icon: "🏥",
          href: "/compare"
        },
        {
          title: "Profile",
          description: "Manage your academic profile",
          icon: "👤",
          href: "/profile"
        }
      ]}
    />
  )
}