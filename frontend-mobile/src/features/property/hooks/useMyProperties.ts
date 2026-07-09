import { useApiQuery } from "@/hooks/useApiQuery";
import {
  normalizePropertyItem,
  type PropertyApiItem,
  type PropertyListResponse,
} from "@/features/property/services/propertyService";
import { useMemo } from "react";
import { myPropertyKeys } from "@/features/property/keys/propertyKeys";

export const useMyProperties = (params?: Record<string, unknown>, enabled = true) => {
  const query = useApiQuery<PropertyListResponse>(
    myPropertyKeys.list(params),
    "/properties/me",
    { params },
    enabled,
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
