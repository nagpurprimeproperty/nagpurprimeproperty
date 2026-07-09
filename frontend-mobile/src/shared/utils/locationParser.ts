/**
 * shared/utils/locationParser.ts
 *
 * Centralises the location-string extraction pattern that previously
 * appeared inline in PropertyCard, PropertyList, search.tsx, and
 * propertyDetail/[id].tsx, each with a slightly different cast.
 *
 * The PropertyCardItem type allows location to be a plain string
 * (legacy data) or an object with a name field (current API shape).
 */
export function getLocationString(
  location: string | { name?: string; [key: string]: unknown } | undefined | null,
  fallback = 'Nagpur'
): string {
  if (typeof location === 'string') return location || fallback;
  if (location && typeof location === 'object' && 'name' in location) {
    return String(location.name || fallback);
  }
  return fallback;
}
