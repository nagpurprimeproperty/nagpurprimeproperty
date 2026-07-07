import { apiClient } from "@/api/apiClient";
import type { AxiosRequestConfig } from "axios";

export interface EnquiryItem {
  _id: string;
  propertyName: string;
  totalPrice: string;
  listingCategory: string;
  status: string;
  brokerName: string;
  enquired: string;
  propertyType?: string;
  area?: string;
  budget?: string;
  notes?: string;
  photos?: string[];
}

export interface EnquiryListResponse {
  success: boolean;
  data: EnquiryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EnquiryDetailResponse {
  success: boolean;
  data: EnquiryItem;
}

export const getEnquiries = async (
  page = 1,
  limit = 10,
  config?: AxiosRequestConfig,
): Promise<EnquiryListResponse> => {
  const response = await apiClient.get<EnquiryListResponse>("/enquiries", {
    params: { page, limit },
    ...config,
  });

  return response.data;
};

export const getEnquiryById = async (
  id: string,
  config?: AxiosRequestConfig,
): Promise<EnquiryDetailResponse> => {
  const response = await apiClient.get<EnquiryDetailResponse>(`/enquiries/${id}`, config);
  return response.data;
};