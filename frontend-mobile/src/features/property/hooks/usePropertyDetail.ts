import { useApiQuery } from "@/hooks/useApiQuery";
import {
  normalizePropertyDetail,
  type PropertyDetailResponse,
} from "@/features/property/services/propertyService";
import { useMemo } from "react";
import { propertyKeys } from "@/features/property/keys/propertyKeys";

export const usePropertyDetail = (id?: string, enabled = true) => {
  const query = useApiQuery<PropertyDetailResponse>(
    propertyKeys.detail(id),
    `/properties/${id}`,
    undefined,
    Boolean(id) && enabled,
    {
      // staleTime: 0 — always refetch when the query is invalidated (e.g. after
      // the owner edits the property). The old 60 s staleTime caused the detail
      // page to serve cached data for up to a minute after a successful update.
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
    },
  );

  const property = useMemo(() => {
    if (!query.data?.data) return undefined;
    return normalizePropertyDetail(query.data.data);
  }, [query.data]);

  return {
    ...query,
    data: property,
  };
};
