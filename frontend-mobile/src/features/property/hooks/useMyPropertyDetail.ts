import { useApiQuery } from "@/hooks/useApiQuery";
import {
  normalizePropertyDetail,
  type PropertyDetailResponse,
} from "@/features/property/services/propertyService";
import { useMemo } from "react";
import { myPropertyKeys } from "@/features/property/keys/propertyKeys";

export const useMyPropertyDetail = (id?: string, enabled = true) => {
  const query = useApiQuery<PropertyDetailResponse>(
    myPropertyKeys.detail(id),
    `/properties/me/${id}`,
    undefined,
    Boolean(id) && enabled,
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
