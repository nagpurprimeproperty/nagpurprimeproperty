import { useApiQuery } from "@/hooks/useApiQuery";
import { type SearchSuggestion } from "@/features/property/services/propertyService";
import { propertyKeys } from "@/features/property/keys/propertyKeys";

export const useSearchSuggestions = (query: string, enabled = true) => {
  return useApiQuery<{ success: boolean; data: SearchSuggestion[] }>(
    propertyKeys.suggestions(query),
    "/properties/search/suggestions",
    { params: { query } },
    enabled,
    { staleTime: 10 * 60 * 1000, gcTime: 15 * 60 * 1000 },
  );
};
