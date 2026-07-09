/**
 * src/features/property/index.ts
 *
 * Public API for the property feature slice.
 * External code should import from "@/features/property" rather than
 * deep-linking into components/, hooks/, services/, keys/, or types/.
 */

// ─── Components ──────────────────────────────────────────────────────────────
// All three use `export default` so we re-export as named for a clean public API.
export { default as PropertyCard } from './components/PropertyCard';
export { default as PropertyList } from './components/PropertyList';
export { default as PropertyImageCarousel } from './components/PropertyImageCarousel';

// ─── Hooks ───────────────────────────────────────────────────────────────────
export { useProperties } from './hooks/useProperties';
export { usePropertyDetail } from './hooks/usePropertyDetail';
export { useSimilarProperties } from './hooks/useSimilarProperties';
export { useTogglePropertySave } from './hooks/useTogglePropertySave';
export { useCreatePropertyEnquiry } from './hooks/useCreatePropertyEnquiry';
export { useCreateCallEnquiry } from './hooks/useCreateCallEnquiry';
export { useSearchSuggestions } from './hooks/useSearchSuggestions';
export { useMyProperties } from './hooks/useMyProperties';
export { useMyPropertyDetail } from './hooks/useMyPropertyDetail';
export {
  useDeleteMyProperty,
  useToggleFeaturedMyProperty,
  useCreateMyProperty,
  useUpdateMyProperty,
  useUpdateMyPropertyStatus,
} from './hooks/useMyPropertyMutations';

// ─── Keys ────────────────────────────────────────────────────────────────────
export { propertyKeys, myPropertyKeys, enquiryKeys } from './keys/propertyKeys';

// ─── Types ───────────────────────────────────────────────────────────────────
export type {
  PropertyCardItem,
  PropertyBrokerInfo,
  PropertyDetailsInfo,
  PropertyPricingInfo,
} from './types/property.types';
export type { SearchSuggestion } from './services/propertyService';
