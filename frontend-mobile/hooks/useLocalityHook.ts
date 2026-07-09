import { useApiQuery } from "@/hooks/useApiQuery";
import type { PopularLocalityApiResponse } from "@/services/localityService";
import { localityKeys } from "@/api/keys/localityKeys";

export const usePopularLocalities = (enabled = true) => {
  return useApiQuery<PopularLocalityApiResponse>(
    localityKeys.popularLocalities(),
    "/properties/get-popular-localities-count",
    undefined,
    enabled
  );
};
