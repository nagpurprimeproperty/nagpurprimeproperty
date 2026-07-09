// hooks/property/index.ts
//
// Barrel that re-exports every individual hook so consumers can import
// from "@/hooks/property" instead of deep-importing individual files.
// Tree-shaking still works because modern bundlers (Metro, esbuild, webpack)
// respect named exports even through barrel files.

export { useProperties } from "./useProperties";
export { usePropertyDetail } from "./usePropertyDetail";
export { useSimilarProperties } from "./useSimilarProperties";
export { useTogglePropertySave } from "./useTogglePropertySave";
export { useCreatePropertyEnquiry } from "./useCreatePropertyEnquiry";
export { useCreateCallEnquiry } from "./useCreateCallEnquiry";
export { useSearchSuggestions } from "./useSearchSuggestions";
export { useMyProperties } from "./useMyProperties";
export { useMyPropertyDetail } from "./useMyPropertyDetail";
export {
  useDeleteMyProperty,
  useToggleFeaturedMyProperty,
  useCreateMyProperty,
  useUpdateMyProperty,
  useUpdateMyPropertyStatus,
} from "./useMyPropertyMutations";
