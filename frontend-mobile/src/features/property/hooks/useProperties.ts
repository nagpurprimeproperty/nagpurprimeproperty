import { useApiQuery } from "@/hooks/useApiQuery";
import {
  normalizePropertyItem,
  type PropertyApiItem,
  type PropertyListResponse,
} from "@/features/property/services/propertyService";
import { useMemo } from "react";
import { propertyKeys } from "@/features/property/keys/propertyKeys";

export const useProperties = (params?: Record<string, unknown>, enabled = true) => {
  const query = useApiQuery<PropertyListResponse>(
    propertyKeys.list(params),
    "/properties",
    { params },
    params !== undefined && enabled,
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
    total: query.data?.total,
    page: query.data?.page,
    limit: query.data?.limit,
    totalPages: query.data?.totalPages,
  };
};
