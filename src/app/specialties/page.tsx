import ComingSoonPage from '@/components/ComingSoonPage'

export default function SpecialtyExplorerPage() {
  return (
    <ComingSoonPage
      title="Specialty Explorer"
      description="Discover and explore medical specialties to find your perfect match"
      icon="🎓"
      estimatedLaunch="Q1 2025"
      requiresAuth={true}
      requiresPaid={false}
      features={[
        "Comprehensive specialty database with detailed descriptions",
        "Interactive specialty matching quiz",
        "Lifestyle and work-life balance comparisons",
        "Salary and career outlook information",
        "Residency competitiveness and requirements",
        "Day-in-the-life videos and testimonials",
        "Subspecialty exploration and pathways",
        "Mentorship connections with specialists"
      ]}
      currentAlternatives={[
        {
          title: "School Explorer",
          description: "Research medical schools",
          icon: "🏫",
          href: "/explore"
        },
        {
          title: "Community",
          description: "Ask about specialties",
          icon: "💬",
          href: "https://t.me/+666ywZFkke5lMjQx"
        },
        {
          title: "Summer Programs",
          description: "Specialty research opportunities",
          icon: "🏥",
          href: "/tools/summer-programs"
        }
      ]}
    />
  )
}