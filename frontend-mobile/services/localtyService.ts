import { apiClient } from "@/api/apiClient";

export interface PopularLocalityItem {
  locality: string;
  count: number;
  latitude?: number;
  longitude?: number;
}

export interface PopularLocalityApiResponse {
  success: boolean;
  data: PopularLocalityItem[];
}

export const fetchPopularLocalitiesCount = async () => {
  const response = await apiClient.get<PopularLocalityApiResponse>(
    "/properties/get-popular-localities-count",
  );

  return response.data;
};
