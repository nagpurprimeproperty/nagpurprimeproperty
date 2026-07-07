import { useApiQuery } from "@/hooks/useApiQuery";
import type {
  EnquiryDetailResponse,
  EnquiryListResponse,
} from "@/services/enquiryService";

export const useEnquiries = (
  page = 1,
  limit = 10,
  enabled = true,
) => {
  return useApiQuery<EnquiryListResponse>(
    ["enquiries", page, limit],
    "/enquiries",
    {
      params: { page, limit },
    },
    enabled,
  );
};

export const useEnquiry = (id?: string, enabled = true) => {
  return useApiQuery<EnquiryDetailResponse>(
    ["enquiry", id],
    id ? `/enquiries/${id}` : "",
    undefined,
    enabled && Boolean(id),
  );
};