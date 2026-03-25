// Generates comparison page pairs for programmatic SEO
// Top 30 schools by rank = 435 unique pairs, each targeting "School A vs School B" keywords

export interface ComparisonPair {
  slug: string
  schoolA: string  // slug of first school
  schoolB: string  // slug of second school
}

// Generate a deterministic comparison slug from two school slugs
// Always alphabetically ordered so there's only one canonical URL per pair
export function makeComparisonSlug(slugA: string, slugB: string): string {
  const [first, second] = [slugA, slugB].sort()
  return `${first}-vs-${second}`
}

// Parse a comparison slug back into two school slugs
export function parseComparisonSlug(slug: string): { schoolA: string; schoolB: string } | null {
  const vsIndex = slug.indexOf('-vs-')
  if (vsIndex === -1) return null

  // Try all possible split points (since school slugs can contain "-vs-" theoretically)
  // The canonical form is alphabetically sorted, so first < second
  const schoolA = slug.substring(0, vsIndex)
  const schoolB = slug.substring(vsIndex + 4)

  if (!schoolA || !schoolB) return null
  return { schoolA, schoolB }
}
