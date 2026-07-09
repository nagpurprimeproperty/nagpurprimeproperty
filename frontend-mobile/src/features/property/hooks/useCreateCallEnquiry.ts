import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCallEnquiry,
  type CallEnquiryResponse,
} from "@/features/property/services/propertyService";
import { propertyKeys, enquiryKeys } from "@/features/property/keys/propertyKeys";

/**
 * Logs a call/WhatsApp enquiry for a property.
 * Returns broker details (including mobile) from the API response.
 */
export const useCreateCallEnquiry = () => {
  const queryClient = useQueryClient();
  return useMutation<CallEnquiryResponse, Error, string>({
    mutationFn: (propertyId: string) => createCallEnquiry(propertyId),
    onSuccess: (data, propertyId) => {
      queryClient.invalidateQueries({ queryKey: enquiryKeys.all });
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(propertyId) });
    },
  });
};
