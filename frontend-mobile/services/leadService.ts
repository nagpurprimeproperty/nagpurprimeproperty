import { apiClient } from "@/api/apiClient";
import type { AxiosRequestConfig } from "axios";

export interface LeadItem {
  _id: string;
  id?: string;
  customerName: string;
  name?: string;
  propertyName?: string;
  propertyType?: string;
  status?: string;
  createdAt?: string;
  phone?: string | null;
  isNew?: boolean;
  notes?: string;
  listingCategory?: string;
  totalPrice?: string;
}

export interface LeadListResponse {
  success: boolean;
  data: {
    data: LeadItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LeadDetailResponse {
  success: boolean;
  data: LeadItem;
}

export interface UpdateStatusPayload {
  status: string;
}

export const getLeads = async (
  page = 1,
  limit = 10,
  config?: AxiosRequestConfig,
): Promise<LeadListResponse> => {
  const response = await apiClient.get<LeadListResponse>("/leads", {
    params: { page, limit },
    ...config,
  });

  return response.data;
};

export const getLeadById = async (
  id: string,
  config?: AxiosRequestConfig,
): Promise<LeadDetailResponse> => {
  const response = await apiClient.get<LeadDetailResponse>(`/leads/${id}`, config);
  return response.data;
};

export const updateLeadStatus = async (
  id: string,
  payload: UpdateStatusPayload,
  config?: AxiosRequestConfig,
) => {
  const response = await apiClient.patch(`/leads/${id}/update-status`, payload, config);
  return response.data;
};
