import { useApiQuery } from "@/hooks/useApiQuery";
import {
  normalizePropertyItem,
  type PropertyApiItem,
  type PropertyListResponse,
} from "@/features/property/services/propertyService";
import { useMemo } from "react";
import { propertyKeys } from "@/features/property/keys/propertyKeys";

export const useSimilarProperties = (
  id?: string,
  params?: Record<string, unknown>,
  enabled = true,
) => {
  const query = useApiQuery<PropertyListResponse>(
    propertyKeys.similar(id, params),
    `/properties/${id}/similar-properties`,
    { params },
    Boolean(id) && enabled,
    { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 },
  );

  const normalizedData = useMemo(() => {
    return (query.data?.data ?? []).map((item: PropertyApiItem) =>
      normalizePropertyItem(item),
    );
  }, [query.data]);

  return {
    ...query,
    data: normalizedData,
  };
};
