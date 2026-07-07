import { AxiosRequestConfig } from "axios";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";

const fetcher = async <T>(url: string, config?: AxiosRequestConfig) => {
  const response = await apiClient.get<T>(url, config);
  return response.data;
};

export const useApiQuery = <T,>(
  key: QueryKey,
  url: string,
  config?: AxiosRequestConfig,
  enabled = true,
  options?: {
    staleTime?: number;
    gcTime?: number;
  }
) => {
  return useQuery<T, Error>({
    queryKey: key,
    queryFn: () => fetcher<T>(url, config),
    enabled,
    ...options,
  });
};

export const useApiMutation = <TData = unknown, TVariables = unknown>(
  url: string,
  method: AxiosRequestConfig["method"] = "post",
  queryKeyToInvalidate?: QueryKey | QueryKey[],
) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const response = await apiClient.request<TData>({
        url,
        method,
        data: variables,
      });
      return response.data;
    },
    onSuccess: () => {
      if (!queryKeyToInvalidate) return;

      const keys =
        Array.isArray(queryKeyToInvalidate) &&
        queryKeyToInvalidate.some((item) => Array.isArray(item))
          ? (queryKeyToInvalidate as QueryKey[])
          : [queryKeyToInvalidate as QueryKey];

      keys.forEach((queryKey) => {
        queryClient.invalidateQueries({
          queryKey,
          exact: false,
          refetchType: "active",
        });
      });
    },
  });
};
