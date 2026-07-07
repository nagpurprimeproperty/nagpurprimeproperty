import { useApiQuery } from "@/hooks/useApiQuery";
import type { PopularLocalityApiResponse } from "@/services/localtyService";

export const usePopularLocalities = (enabled = true) => {
  return useApiQuery<PopularLocalityApiResponse>(
    ["popular-localities"],
    "/properties/get-popular-localities-count",
    undefined,
    enabled
  );
};
