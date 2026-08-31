import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBrochureLead,
  type BrochureEnquiryResponse,
} from "../services/propertyService";
import { propertyKeys, enquiryKeys } from "../keys/propertyKeys";

/**
 * Logs a brochure download/view lead for a property.
 * Returns brochure URL and broker details.
 */
export const useCreateBrochureLead = () => {
  const queryClient = useQueryClient();
  return useMutation<BrochureEnquiryResponse, Error, string>({
    mutationFn: (propertyId: string) => createBrochureLead(propertyId),
    onSuccess: (data, propertyId) => {
      queryClient.invalidateQueries({ queryKey: enquiryKeys.all });
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(propertyId) });
    },
  });
};
