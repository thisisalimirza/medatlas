import ComingSoonPage from '@/components/ComingSoonPage'

export default function IMGResourcesPage() {
  return (
    <ComingSoonPage
      title="IMG Resources"
      description="Comprehensive resources and guidance for International Medical Graduates"
      icon="🌍"
      estimatedLaunch="Q2 2025"
      requiresAuth={true}
      requiresPaid={false}
      features={[
        "Step 1, 2CK, and 2CS preparation guides for IMGs",
        "ECFMG certification process walkthrough",
        "Visa and immigration guidance (J-1, H-1B)",
        "IMG-friendly residency program database",
        "Observership and research opportunity finder",
        "USCE (US Clinical Experience) coordinator",
        "IMG success stories and mentorship network",
        "Financial aid and scholarship resources"
      ]}
      currentAlternatives={[
        {
          title: "Community",
          description: "Connect with other IMGs",
          icon: "💬",
          href: "https://t.me/+666ywZFkke5lMjQx"
        },
        {
          title: "Summer Programs",
          description: "Research opportunities in the US",
          icon: "🏥",
          href: "/tools/summer-programs"
        },
        {
          title: "Program Comparator",
          description: "Find IMG-friendly programs",
          icon: "🏥",
          href: "/compare"
        }
      ]}
    />
  )
}